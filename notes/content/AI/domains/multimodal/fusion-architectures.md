---
title: 图文融合：双编码器、Cross-Attention 与视觉 Token
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 融合发生在哪里

图文模型先分别得到视觉表示 $V\in\mathbb R^{N\times L_v\times d_v}$ 和文本表示 $T\in\mathbb R^{N\times L_t\times d_t}$。架构差异主要在两种模态何时、以什么粒度交互。

| 结构 | 交互位置 | 优点 | 主要限制 |
| --- | --- | --- | --- |
| 双编码器 | 最终全局向量 | 候选可缓存，检索高效 | 缺少细粒度 Token 交互 |
| Cross-Encoder | 多层 Cross-Attention | 图文 Token 深度交互 | 每个候选对都需重新计算 |
| 视觉前缀 | 视觉特征投影为 LLM Token | 直接复用语言模型生成 | 视觉序列占用上下文 |
| 查询瓶颈 | 固定数量 Query 读取视觉特征 | 压缩可变长视觉序列 | Query 数量限制信息带宽 |

[CLIP](clip.md) 是双编码器；BLIP 同时使用对比、匹配与生成路径；BLIP-2 使用 Q-Former；LLaVA 把投影后的视觉特征作为语言模型输入 Token。

## 双编码器

双编码器把图像和文本各自压缩成一个向量，再计算余弦相似度。图文只在相似度矩阵处交互，因此一百万张候选图像可以提前编码并建立向量索引。

它适合召回，但仅凭一个全局向量难以精确比较“左边的杯子是什么颜色”等局部关系。常见系统先用双编码器召回少量候选，再用融合模型重排。

## Cross-Attention

文本读取图像时，文本状态作为 Query，视觉 Token 作为 Key 和 Value：

$$
Q=TW_Q,\qquad K=VW_K,\qquad V'=VW_V.
$$

输出长度跟随文本，每个文本 Token 可得到不同的视觉加权结果。

```python
import torch

torch.manual_seed(42)
text = torch.randn(2, 5, 16)
vision = torch.randn(2, 12, 16)
attention = torch.nn.MultiheadAttention(16, 4, batch_first=True, dropout=0.0)
fused, weights = attention(text, vision, vision, average_attn_weights=False)
print(fused.shape)
print(weights.shape)
```

融合输出为 `(2,5,16)`，权重为 `(2,4,5,12)`。若图像包含补齐 Patch，还需传视觉 Key Padding Mask。

Cross-Attention 可以是单向文本读图，也可以交替让视觉读文本。双向并不自动更好，它增加计算量并改变各模态表示。

## 视觉 Token 前缀

视觉编码器输出经 Projector 映射到 LLM 宽度：

$$
Z_v=g(V),\qquad Z_v\in\mathbb R^{N\times L_v\times d_{\mathrm{llm}}}.
$$

然后与文本 Embedding 拼接为 `[视觉 Token, 文本 Token]`，共同送入因果语言模型。文本位置可以读取此前视觉 Token；视觉前缀内部的可见性由具体 Attention Mask 决定。

```python
import torch

torch.manual_seed(42)
vision = torch.randn(2, 16, 24)
text = torch.randn(2, 7, 32)
projector = torch.nn.Linear(24, 32)
inputs = torch.cat((projector(vision), text), dim=1)
labels = torch.full((2, 23), -100)
labels[:, 16:] = torch.arange(7)
print(inputs.shape)
print(labels.shape, (labels != -100).sum(dim=1))
```

输入含 16 个视觉和 7 个文本 Token。示例只在 7 个文本位置计算损失；真实 Next-Token 标签还需向左错开，不能直接把位置编号当标签。

## 查询瓶颈

查询瓶颈使用 $M$ 个可学习 Query $Q_0$ 通过 Cross-Attention 读取 $L_v$ 个视觉 Token：

$$
Q'=\operatorname{Attention}(Q_0,V,V),\qquad
Q'\in\mathbb R^{N\times M\times d}.
$$

无论视觉编码器输出多少 Patch，送给语言模型的视觉表示数量固定为 $M$。

```python
import torch

torch.manual_seed(42)
vision = torch.randn(3, 64, 32)
queries = torch.randn(1, 8, 32).expand(len(vision), -1, -1)
attention = torch.nn.MultiheadAttention(32, 4, batch_first=True, dropout=0.0)
compressed, _ = attention(queries, vision, vision, need_weights=False)
print(compressed.shape)
```

64 个视觉 Token 被读取为 8 个查询输出。它是学习到的条件压缩，不等同于每 8 个 Patch 做一次平均池化。

## 选择结构

- 大规模图文检索优先双编码器召回。
- 需要细粒度配对判断时使用 Cross-Encoder 或 Cross-Attention 重排。
- 复用已有 LLM 进行生成时使用视觉前缀或查询瓶颈。
- 多图、高分辨率和视频必须计算视觉 Token 数与 LLM 上下文预算。

“冻结视觉编码器和 LLM”只说明参数不更新，前向计算与激活仍然存在。训练资源还取决于 Token 数、是否保存梯度通过冻结模块，以及 Projector/Q-Former 的结构。

## 参考资料

- [CLIP](https://arxiv.org/abs/2103.00020)
- [BLIP-2](https://arxiv.org/abs/2301.12597)
- [Visual Instruction Tuning](https://arxiv.org/abs/2304.08485)
