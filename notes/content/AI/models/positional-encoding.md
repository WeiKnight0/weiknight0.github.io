---
title: 位置编码：绝对位置、正弦编码与 RoPE
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 为什么必须加入位置

不含位置特征的 Self-Attention 对输入排列等变：若用同一个排列同时重排输入，输出也只会按相同方式重排。模型能比较内容，却不能仅凭 Attention 区分“猫追狗”和“狗追猫”的顺序。

位置编码的目标是让表示或 Attention 分数依赖 Token 所在位置。常见方法包括可学习绝对位置、固定正弦位置、相对位置偏置和旋转位置编码（RoPE）。它们的注入位置和外推行为不同。

## 可学习绝对位置 Embedding

为每个位置分配可训练向量 $P_i$，与 Token Embedding 相加：

$$
H_i=E[x_i]+P_i.
$$

```python
import torch

torch.manual_seed(42)
tokens = torch.randn(2, 5, 8)
position_embedding = torch.nn.Embedding(16, 8)
positions = torch.arange(tokens.size(1))
output = tokens + position_embedding(positions)[None, :, :]
print(output.shape)
```

参数表最大长度为 16，直接使用时不能索引更长位置。扩展上下文需要重新训练、插值或采用专门的位置扩展方法，不能假设表会自动增长。

## 固定正弦位置编码

原始 Transformer 对位置 $p$ 和通道对 $2i,2i+1$ 使用：

$$
PE_{p,2i}=\sin\left(\frac{p}{10000^{2i/d}}\right),
$$

$$
PE_{p,2i+1}=\cos\left(\frac{p}{10000^{2i/d}}\right).
$$

不同通道具有不同频率，相邻的偶数、奇数通道构成一组正弦和余弦。编码无需训练，并可按公式生成训练长度以外的位置；这不等于模型在任意长度上一定可靠。

```python
import math
import torch

length, model_dim = 6, 8
position = torch.arange(length, dtype=torch.float32)[:, None]
frequency = torch.exp(
    torch.arange(0, model_dim, 2, dtype=torch.float32)
    * (-math.log(10000.0) / model_dim)
)
encoding = torch.zeros(length, model_dim)
encoding[:, 0::2] = torch.sin(position * frequency)
encoding[:, 1::2] = torch.cos(position * frequency)
print(encoding.shape)
print(encoding[0])
```

位置 0 的偶数通道为 0，奇数通道为 1。正弦位置编码通常加在输入表示上，因此后续线性投影同时混合内容与位置。

## 相对位置

绝对位置回答“Token 在第几个位置”，而 Attention 中经常更关心“Query 与 Key 相隔多远”。相对位置方法让分数显式依赖 $i-j$，例如加入可学习偏置：

$$
S_{ij}=\frac{Q_iK_j^\mathsf T}{\sqrt{d_k}}+b_{i-j}.
$$

偏置可按距离截断或分桶，使远距离共享参数。它直接改变 Attention Logit，而不是与 Token Embedding 相加。

## RoPE

旋转位置编码（Rotary Position Embedding，RoPE）把 Query 和 Key 的相邻通道两两组成二维向量，并按位置旋转。对某一通道对，位置 $m$ 的旋转为：

$$
R_{m,\theta}=
\begin{bmatrix}
\cos(m\theta)&-\sin(m\theta)\\
\sin(m\theta)&\cos(m\theta)
\end{bmatrix}.
$$

将 $q_m$、$k_n$ 分别旋转后：

$$
(R_{m,\theta}q_m)^\mathsf T(R_{n,\theta}k_n)
=q_m^\mathsf T R_{n-m,\theta}k_n.
$$

点积中的位置依赖只与相对距离 $n-m$ 有关。RoPE 通常应用于每层 Attention 的 Query 和 Key，不旋转 Value，也不是简单加到输入 Embedding 上。

不同通道对使用不同角频率。常见形式为 $\theta_i=10000^{-2i/d}$，要求被旋转的维度为偶数。

### 手写 RoPE

```python
import torch

def apply_rope(X, positions, base=10000.0):
    pair_count = X.size(-1) // 2
    frequency = base ** (
        -torch.arange(pair_count, dtype=X.dtype, device=X.device) / pair_count
    )
    angle = positions.to(X.dtype)[..., None] * frequency
    cos, sin = angle.cos(), angle.sin()
    even, odd = X[..., 0::2], X[..., 1::2]
    rotated = torch.stack((even * cos - odd * sin, even * sin + odd * cos), dim=-1)
    return rotated.flatten(-2)

X = torch.tensor([
    [[1., 0., 1., 0.], [1., 0., 1., 0.], [1., 0., 1., 0.]]
])
positions = torch.arange(3)[None, :]
rotated = apply_rope(X, positions)
print(rotated)
print(rotated.norm(dim=-1))
```

旋转改变方向但不改变每个二维通道对的长度，因此整体范数保持不变。

### 验证相对位置性质

把 Query 和 Key 同时平移相同位置，二者距离不变，旋转后的点积也不变：

```python
import torch

query = torch.tensor([[[1., 2., 3., 4.]]])
key = torch.tensor([[[2., -1., 1., 0.5]]])
score_2_5 = (apply_rope(query, torch.tensor([[2]])) * apply_rope(key, torch.tensor([[5]]))).sum()
score_7_10 = (apply_rope(query, torch.tensor([[7]])) * apply_rope(key, torch.tensor([[10]]))).sum()
print(score_2_5.item(), score_7_10.item())
print(torch.allclose(score_2_5, score_7_10, atol=1e-5))
```

两组位置差都为 3，因此结果相同。此性质说明 Attention 分数如何获得相对位置信息，不代表模型能无损外推到无限长度；训练分布、频率尺度和数值精度仍会限制长上下文表现。

## 方法对比

| 方法 | 注入位置 | 是否训练 | 主要位置信息 |
| --- | --- | --- | --- |
| 可学习绝对位置 | 与 Token 表示相加 | 是 | 绝对位置 |
| 固定正弦位置 | 与 Token 表示相加 | 否 | 绝对位置，可线性组合出相对关系 |
| 相对位置偏置 | 加入 Attention Logit | 通常是 | Query–Key 距离 |
| RoPE | 旋转 Query、Key | 否 | 点积中的相对距离 |

选用方法必须与模型实现和已有权重一致。改变位置编码不仅是换一张表，还会改变 Attention 分数的形成方式。

## 参考资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864)
