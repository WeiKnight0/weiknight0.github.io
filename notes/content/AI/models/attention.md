---
title: Attention：Q/K/V、掩码与多头注意力
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 从查询到加权读取

Attention 根据一个查询（Query）从若干键值对（Key–Value）中读取信息。Query 与 Key 决定“关注哪里”，Value 决定“取回什么”。对一个批次：

- $Q\in\mathbb R^{N\times T_q\times d_k}$：$T_q$ 个查询；
- $K\in\mathbb R^{N\times T_k\times d_k}$：$T_k$ 个键；
- $V\in\mathbb R^{N\times T_k\times d_v}$：与每个键对应的值。

Query 和 Key 的最后一维必须相同，才能计算相似度；Key 与 Value 的序列长度必须相同，才能用对 Key 的权重加权 Value。输出形状为 $(N,T_q,d_v)$。

## 缩放点积注意力

缩放点积注意力（Scaled Dot-Product Attention）为：

$$
S=\frac{QK^\mathsf T}{\sqrt{d_k}},\qquad
A=\operatorname{softmax}(S),\qquad
O=AV.
$$

$S_{ij}$ 是第 $i$ 个 Query 与第 $j$ 个 Key 的分数。Softmax 沿 Key 维计算，因此 $\sum_j A_{ij}=1$；输出 $O_i$ 是所有 Value 的加权和。

若 $Q$、$K$ 各分量独立、均值为 0、方差为 1，则点积方差约为 $d_k$。除以 $\sqrt{d_k}$ 可把分数尺度稳定在约为 1 的量级，减少 Softmax 过早饱和。

### 手算示例

两个 Query 分别只匹配两个 Key：

```python
import math
import torch

Q = torch.tensor([[[1., 0.], [0., 1.]]])
K = torch.tensor([[[1., 0.], [0., 1.]]])
V = torch.tensor([[[10., 0.], [0., 20.]]])
scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))
weights = scores.softmax(dim=-1)
output = weights @ V
print(scores)
print(weights)
print(output)
```

第一个 Query 对第一个 Key 的权重较大，因此输出更靠近 `[10,0]`；第二个 Query 同理更靠近 `[0,20]`。权重通常不是 0 或 1，而是连续分配。

## Attention Mask

Mask 在 Softmax 前把禁止位置的分数设为 $-\infty$：

$$
A_{ij}=\frac{\exp(S_{ij})}{\sum_{k\in\mathcal V_i}\exp(S_{ik})},qquad j\in\mathcal V_i,
$$

其中 $\mathcal V_i$ 是第 $i$ 个 Query 可以读取的 Key 集合。被屏蔽位置的权重为 0。

### Padding Mask

Padding Mask 禁止读取补齐 Token。假设 Key 有效性为 `[True, True, False]`，需要扩展为可广播到分数矩阵的 `(N,1,T_k)`：

```python
import math
import torch

Q = torch.tensor([[[1., 0.], [0., 1.]]])
K = torch.tensor([[[1., 0.], [0., 1.], [9., 9.]]])
V = torch.tensor([[[10., 0.], [0., 20.], [999., 999.]]])
valid_keys = torch.tensor([[True, True, False]])
scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))
scores = scores.masked_fill(~valid_keys[:, None, :], float('-inf'))
weights = scores.softmax(dim=-1)
output = weights @ V
print(weights)
print(output)
```

最后一个 Value 数值很大，但其权重仍为 0。Padding Mask 屏蔽的是 Key；若补齐的 Query 也不应参与损失，还要在输出或损失处另行屏蔽。

### Causal Mask

自回归 Decoder 的第 $i$ 个位置只能读取不晚于自己的位置，因而保留下三角区域：

$$
M_{ij}=\begin{cases}
0,&j\le i,\\
-\infty,&j>i.
\end{cases}
$$

```python
import torch

length = 4
causal = torch.tril(torch.ones(length, length, dtype=torch.bool))
scores = torch.zeros(length, length).masked_fill(~causal, float('-inf'))
weights = scores.softmax(dim=-1)
print(causal)
print(weights)
```

第 0 行只能读取位置 0；第 3 行可以读取位置 0 至 3。训练时即使整段目标同时输入，未来 Token 也不会泄漏。

不同 PyTorch 接口对布尔 Mask 的含义并不统一。例如 `scaled_dot_product_attention` 的布尔 `attn_mask=True` 表示允许参与，而 `MultiheadAttention` 的二值 `attn_mask=True` 表示禁止参与。调用前必须核对所用接口，不能仅凭变量名判断。

## Self-Attention 与 Cross-Attention

Self-Attention 的 $Q$、$K$、$V$ 来自同一序列。它让每个位置读取同一序列的其他位置：

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V.
$$

Cross-Attention 的 Query 与 Key/Value 来源不同。在 Encoder–Decoder Transformer 中：

$$
Q=H^{\mathrm{dec}}W_Q,\qquad
K=H^{\mathrm{enc}}W_K,\qquad
V=H^{\mathrm{enc}}W_V.
$$

输出长度跟随 Query，因此 Decoder 的每个目标位置可以读取全部源位置。

```python
import torch
import torch.nn.functional as F

torch.manual_seed(42)
decoder = torch.randn(2, 4, 8)
encoder = torch.randn(2, 6, 8)
cross_output = F.scaled_dot_product_attention(decoder, encoder, encoder)
print(cross_output.shape)
```

输出为 `(2,4,8)`，目标长度为 4，源长度为 6。

## 多头注意力

单头只在一个投影空间中计算相似度。多头注意力将表示投影为 $h$ 组，每头宽度通常为 $d_h=d_{\text{model}}/h$：

$$
\operatorname{head}_i=operatorname{Attention}(QW_i^Q,KW_i^K,VW_i^V),
$$

$$
\operatorname{MHA}(Q,K,V)
=\operatorname{Concat}(\operatorname{head}_1,\ldots,\operatorname{head}_h)W^O.
$$

“多头”不是把同一份单头结果复制多次：每头有不同投影参数，可以学习不同的匹配关系。$d_{\text{model}}$ 必须能被头数整除，才能均匀拆分。

### 手写多头形状变换

```python
import torch
import torch.nn.functional as F

torch.manual_seed(42)
batch, length, model_dim, heads = 2, 5, 12, 3
head_dim = model_dim // heads
X = torch.randn(batch, length, model_dim)
Wq = torch.randn(model_dim, model_dim)
Wk = torch.randn(model_dim, model_dim)
Wv = torch.randn(model_dim, model_dim)

Q = (X @ Wq).view(batch, length, heads, head_dim).transpose(1, 2)
K = (X @ Wk).view(batch, length, heads, head_dim).transpose(1, 2)
V = (X @ Wv).view(batch, length, heads, head_dim).transpose(1, 2)
heads_output = F.scaled_dot_product_attention(Q, K, V)
output = heads_output.transpose(1, 2).contiguous().view(batch, length, model_dim)
print(Q.shape, heads_output.shape, output.shape)
```

内部形状为 `(N,h,T,d_h)`。合并时先把序列维移回头维之前，再 `contiguous().view(...)`；否则转置后的内存布局可能不支持直接 `view`。

### PyTorch 接口

```python
import torch

torch.manual_seed(42)
attention = torch.nn.MultiheadAttention(12, 3, batch_first=True, dropout=0.0)
X = torch.randn(2, 5, 12)
output, weights = attention(X, X, X, need_weights=True, average_attn_weights=False)
print(output.shape)
print(weights.shape)
print(weights.sum(dim=-1))
```

输出为 `(2,5,12)`，权重为 `(2,3,5,5)`，分别对应批次、头、Query 和 Key。最后一维权重和为 1。

## 复杂度与边界

长度为 $T$、表示宽度为 $d$ 时，标准 Self-Attention 的分数矩阵含 $T^2$ 个元素，核心计算量为 $O(T^2d)$，分数与权重的额外内存为 $O(T^2)$。长序列的主要压力来自长度的平方，而不是 Q/K/V 名称本身。

若某一行所有 Key 都被屏蔽，手写 `softmax([-inf,...,-inf])` 没有有效概率分布，可能产生 `NaN`。数据和 Mask 应保证每个参与计算的 Query 至少存在一个有效 Key；补齐 Query 则在后续屏蔽。

Attention 权重描述模型本次前向的加权读取，并不自动构成人类可依赖的因果解释。

## 参考资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [PyTorch：scaled_dot_product_attention](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html)
- [PyTorch：MultiheadAttention](https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html)
