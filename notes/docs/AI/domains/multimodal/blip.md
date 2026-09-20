---
title: BLIP 与 BLIP-2：统一图文预训练和 Q-Former
date: 2026-09-10T00:00:00
lang: zh-cn
---

## BLIP 的三个目标

BLIP 以视觉编码器和具有不同 Attention 配置的文本 Transformer 支持理解与生成，联合使用三类目标。

### Image–Text Contrastive Learning

ITC 将图像、文本全局表示对齐，形式与 [CLIP 对比损失](clip.md#对称对比损失)相近。它适合学习可独立编码、可用于检索的表示。

### Image–Text Matching

ITM 输入完整图文对，通过跨模态交互判断是否匹配。负样本不是只看余弦距离，而是让融合表示学习细粒度对应。训练可从相似但不匹配的候选中采 Hard Negative。

```python
import torch
import torch.nn.functional as F

matching_logits = torch.tensor([[0.2, 2.1], [1.8, 0.1], [0.4, 1.5]])
labels = torch.tensor([1, 0, 1])
loss = F.cross_entropy(matching_logits, labels)
print(loss.item())
print(matching_logits.argmax(dim=1))
```

类别 1 表示匹配，三条样本均分类正确。ITM 是二分类，ITC 是批内多候选对比，两者不能互换。

### Image-Conditioned Language Modeling

LM 让文本 Decoder 在图像条件下自回归预测描述：

$$
L_{\mathrm{LM}}=-\sum_t\log p(y_t\mid y_{<t},I).
$$

它训练图像到文本的生成能力。Causal Mask 只作用于目标文本的未来位置，视觉条件本身应可被每个目标位置读取。

## CapFilt

BLIP 的 Captioning and Filtering（CapFilt）先训练 Captioner 和 Filter。Captioner 为网页图像生成合成描述，Filter 判断原始或合成图文是否匹配，再用筛选后的数据训练模型。

这不是无条件相信模型生成数据。Captioner 增加描述多样性，Filter 删除部分噪声；两者也可能引入自己的偏差和错误，最终仍需下游验证。

## BLIP-2 为什么加入 Q-Former

BLIP-2 冻结预训练图像编码器和大语言模型，用 Querying Transformer（Q-Former）连接二者。固定数量的可学习 Query 通过 Cross-Attention 从冻结视觉特征中提取与文本相关的信息。

Q-Former 包含图像 Transformer 与文本 Transformer，它们共享 Self-Attention 参数；图像分支中的 Query 通过间隔插入的 Cross-Attention 读取冻结图像编码器输出。不同预训练任务使用不同 Self-Attention Mask 控制 Query 和文本的信息流。

```python
import torch

torch.manual_seed(42)
image_features = torch.randn(2, 49, 64)
query_tokens = torch.randn(1, 8, 32).expand(2, -1, -1)
keys = torch.nn.Linear(64, 32)(image_features)
values = torch.nn.Linear(64, 32)(image_features)
attention = torch.nn.MultiheadAttention(32, 4, batch_first=True, dropout=0.0)
query_output, weights = attention(query_tokens, keys, values)
print(query_output.shape, weights.shape)
```

49 个图像特征被 8 个 Query 读取，输出 `(2,8,32)`。这是结构示意；真实 Q-Former 还会在多层中交替执行 Query Self-Attention 和视觉 Cross-Attention。

## BLIP-2 两阶段预训练

第一阶段连接冻结图像编码器，训练 Q-Former 学习图文表示，包含：

- Image–Text Contrastive：对齐 Query 表示与文本表示；
- Image–Text Matching：通过双向交互判断图文匹配；
- Image-Grounded Text Generation：让文本在视觉 Query 条件下生成。

第二阶段连接冻结 LLM，把 Q-Former 输出经全连接层投影到 LLM Embedding 宽度，作为视觉软提示，训练图像到文本生成。

```python
import torch

query_output = torch.randn(2, 8, 32)
projector = torch.nn.Linear(32, 128)
visual_prompt = projector(query_output)
text_embeddings = torch.randn(2, 12, 128)
llm_inputs = torch.cat((visual_prompt, text_embeddings), dim=1)
print(llm_inputs.shape)
```

LLM 接收 8 个视觉提示和 12 个文本 Token，共 20 个输入位置。冻结 LLM 不等于不需要通过其输出计算语言建模损失。

## BLIP 与 BLIP-2 的区别

| | BLIP | BLIP-2 |
| --- | --- | --- |
| 重点 | 统一理解与生成、清洗网页配对 | 连接冻结视觉编码器与冻结 LLM |
| 桥接 | 多模态 Encoder/Decoder 配置 | 固定 Query 的 Q-Former 加投影 |
| 训练 | ITC、ITM、LM 与 CapFilt | 表示学习阶段、生成学习阶段 |
| LLM | 不是核心冻结组件 | 作为冻结语言生成端 |

BLIP-2 不是简单地在 BLIP 后添加更大的语言模型；其核心变化是用两阶段训练的 Q-Former 缩小模态与参数规模之间的接口问题。

## 参考资料

- [BLIP](https://arxiv.org/abs/2201.12086)
- [BLIP-2](https://arxiv.org/abs/2301.12597)
