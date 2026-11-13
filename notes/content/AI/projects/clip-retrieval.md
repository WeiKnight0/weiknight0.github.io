---
title: CLIP 图文检索项目
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 项目目标

建立一个本地图文检索系统，支持：

- 输入文本，返回最相关的图片；
- 输入图片，返回最相关的文本；
- 在固定测试集上计算两个方向的 Recall@$K$；
- 增量替换模型或索引时，仍能复现实验结果。

第一版使用冻结的预训练 [CLIP](../domains/multimodal/clip.md)，不训练模型。这样先验证数据、预处理、索引与评估链路，再决定是否微调。

## 数据契约

使用 JSON Lines，每行一条图文关系：

```text
{"image_id":"000001","image_path":"images/000001.jpg","caption_id":"000001-0","text":"一只猫坐在窗边","split":"train"}
{"image_id":"000001","image_path":"images/000001.jpg","caption_id":"000001-1","text":"窗户旁边有一只猫","split":"train"}
```

`image_id` 标识原始图片，`caption_id` 唯一标识描述。同一图片允许多条描述。划分必须按 `image_id` 进行，不能让同图的不同 Caption 分布在训练集和测试集。

加载时一次检查外部边界：必需字段存在、ID 非空、图片路径位于数据根目录内且文件可读。内部流程不再用默认空字符串或跳过坏样本掩盖问题；发现坏数据立即报告行号并停止。

## 目录

```text
clip-retrieval/
├── data/
│   ├── images/
│   └── pairs.jsonl
├── artifacts/
│   ├── image-embeddings.pt
│   ├── text-embeddings.pt
│   └── metadata.json
├── src/
│   ├── dataset.py
│   ├── encode.py
│   ├── search.py
│   └── evaluate.py
└── config.yaml
```

`artifacts` 必须记录模型标识、权重版本、Tokenizer、图像预处理、Embedding 维度、数据哈希和生成时间。Embedding 与元数据顺序必须一一对应。

## 编码与归一化

图像和文本分别分批编码，最终表示沿最后一维 L2 归一化。推理时使用 `eval()` 并关闭梯度。

```python
import torch
import torch.nn.functional as F

def encode_batches(batches, encoder):
    encoder.eval()
    outputs = []
    with torch.inference_mode():
        for batch in batches:
            outputs.append(F.normalize(encoder(batch), dim=-1))
    return torch.cat(outputs)

torch.manual_seed(42)
encoder = torch.nn.Linear(6, 4)
batches = [torch.randn(3, 6), torch.randn(2, 6)]
embeddings = encode_batches(batches, encoder)
print(embeddings.shape)
print(embeddings.norm(dim=1))
```

输出形状为 `(5,4)`，每行范数为 1。不能把图像用新权重编码、文本仍沿用旧缓存；模型或预处理配置变化时，两侧缓存同时失效。

保存前将 Embedding 移到 CPU，并连同 ID 顺序写入元数据。读取时检查行数、维度和配置哈希，不满足就重新构建。

## 精确检索

候选规模较小时直接矩阵乘法。查询 $Q\in\mathbb R^{B\times d}$、候选 $C\in\mathbb R^{M\times d}$ 均已归一化，则 $QC^\mathsf T$ 是余弦相似度。

```python
import torch
import torch.nn.functional as F

queries = F.normalize(torch.tensor([[1., 0.], [0., 1.]]), dim=1)
candidates = F.normalize(torch.tensor([
    [0.9, 0.1], [0.1, 0.9], [-0.8, 0.2],
]), dim=1)
similarity = queries @ candidates.T
scores, indices = similarity.topk(2, dim=1)
print(indices)
print(scores)
```

文本检图与图片检文只需交换 Query 和候选矩阵。只做排序时无需乘 CLIP 温度，因为正缩放不改变名次。

候选较大时将 Query 分块，避免一次创建完整 $B\times M$ 分数矩阵。再大时可使用近似最近邻索引，但必须同时保留精确检索子集，测量召回损失和延迟收益。

## 一对多评估

每个 Query 保存全部正确候选 ID。Recall@$K$ 只要前 $K$ 中出现任一正确候选就命中。

```python
import torch

def recall_at_k(similarity, positive, k):
    ranking = similarity.topk(k, dim=1).indices
    return positive.gather(1, ranking).any(dim=1).float().mean()

similarity = torch.tensor([
    [0.9, 0.8, 0.1, 0.0],
    [0.4, 0.7, 0.8, 0.2],
    [0.5, 0.4, 0.3, 0.9],
])
positive = torch.tensor([
    [True, True, False, False],
    [False, True, False, False],
    [False, False, True, False],
])
print(recall_at_k(similarity, positive, 1))
print(recall_at_k(similarity, positive, 2))
```

结果为 $1/3$ 和 $2/3$。必须分别计算 Text-to-Image 与 Image-to-Text；不能对一个方向的矩阵算完就复制数字。

## 查询接口

检索结果至少返回候选 ID、路径或文本、相似度和名次。接口只接收一种 Query 模态；空文本、损坏图片、非法 `top_k` 在入口直接返回明确错误。

不要把相似度当作校准概率。不同查询的最高余弦值不可直接用统一阈值解释为“可信度”，除非在目标数据上单独校准。

## 验收

1. 同一配置重复编码，ID 顺序和 Embedding 一致；
2. 随机抽样检查图片与所有正 Caption 对应正确；
3. 报告双向 R@1、R@5、R@10、Median Rank 和测试候选数；
4. 比较批量大小对吞吐的影响，结果排序保持一致；
5. 近似索引与精确检索比较 Recall 和 P95 延迟；
6. 保存配置、依赖版本、数据哈希和评估输出。

检索错误按细粒度属性、文字、计数、同类对象和数据配对错误分类。先修数据与预处理，再判断是否需要微调。

## 参考资料

- [CLIP](https://arxiv.org/abs/2103.00020)
- [图文任务：配对数据与评估](../domains/multimodal/image-text-tasks.md)
