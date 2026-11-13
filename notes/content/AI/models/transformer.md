---
title: Transformer：层结构、Encoder 与 Decoder
date: 2026-09-10T00:00:00
lang: zh-cn
---

## Transformer 处理序列的方式

Transformer 用 [Attention](attention.md) 建立任意位置之间的信息通路，不依赖 RNN 的逐步状态传递。输入 Token 先变为宽度为 $d_{\text{model}}$ 的表示，再经过若干结构相同的层。

Self-Attention 本身不识别 Token 的先后顺序，因此输入还必须含有[位置信息](positional-encoding.md)。

## 前馈网络

Attention 负责位置之间的信息交换；前馈网络（Feed-Forward Network，FFN）对每个位置独立使用同一组参数：

$$
\operatorname{FFN}(X)
=\phi(XW_1+\mathbf b_1)W_2+\mathbf b_2.
$$

通常先从 $d_{\text{model}}$ 扩张到 $d_{\text{ff}}$，经过 ReLU、GELU 等非线性，再投影回 $d_{\text{model}}$。它不会直接混合不同 Token，位置交互由 Attention 完成。

```python
import torch

torch.manual_seed(42)
ffn = torch.nn.Sequential(
    torch.nn.Linear(8, 32),
    torch.nn.GELU(),
    torch.nn.Linear(32, 8),
)
X = torch.randn(2, 5, 8)
output = ffn(X)
print(output.shape)
```

序列长度保持为 5，每个位置都执行相同的 `8 → 32 → 8` 变换。

## 残差、归一化与 Dropout

Attention 和 FFN 都包在残差路径中。原始 Transformer 使用 Post-Norm：

$$
Y=\operatorname{LayerNorm}(X+\operatorname{Attention}(X)),
$$

$$
Z=\operatorname{LayerNorm}(Y+\operatorname{FFN}(Y)).
$$

现代深层模型常使用 Pre-Norm：

$$
Y=X+\operatorname{Attention}(\operatorname{LayerNorm}(X)),
$$

$$
Z=Y+\operatorname{FFN}(\operatorname{LayerNorm}(Y)).
$$

两者不能只凭“都有 LayerNorm”视为相同。Post-Norm 的归一化位于残差相加之后；Pre-Norm 保留更直接的恒等梯度路径，通常更容易训练深层网络。Dropout 一般作用于子层输出后、残差相加前，并在推理时关闭。

## Transformer Encoder Layer

Encoder Layer 包含双向 Self-Attention 和 FFN。这里的“双向”表示任意有效位置都能读取其前后 Token，不表示使用双向 RNN。

下面是最小 Pre-Norm Encoder Layer。`key_padding_mask=True` 表示 `MultiheadAttention` 不读取该 Key 位置。

```python
import torch
from torch import nn

class EncoderLayer(nn.Module):
    def __init__(self, model_dim, heads, ff_dim, dropout=0.0):
        super().__init__()
        self.norm1 = nn.LayerNorm(model_dim)
        self.attention = nn.MultiheadAttention(
            model_dim, heads, dropout=dropout, batch_first=True
        )
        self.norm2 = nn.LayerNorm(model_dim)
        self.ffn = nn.Sequential(
            nn.Linear(model_dim, ff_dim),
            nn.GELU(),
            nn.Linear(ff_dim, model_dim),
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, X, padding_mask=None):
        normalized = self.norm1(X)
        attended, _ = self.attention(
            normalized,
            normalized,
            normalized,
            key_padding_mask=padding_mask,
            need_weights=False,
        )
        X = X + self.dropout(attended)
        return X + self.dropout(self.ffn(self.norm2(X)))

torch.manual_seed(42)
layer = EncoderLayer(model_dim=16, heads=4, ff_dim=64)
X = torch.randn(2, 6, 16)
padding_mask = torch.tensor([
    [False, False, False, False, False, False],
    [False, False, False, True, True, True],
])
output = layer(X, padding_mask)
print(output.shape)
```

输出仍为 `(2,6,16)`。Mask 阻止其他位置读取补齐 Key，但补齐 Query 仍会产生输出；这些位置需要在池化或损失阶段排除。

## Transformer Decoder Layer

经典 Encoder–Decoder Transformer 的 Decoder Layer 依次包含：

1. 带 Causal Mask 的目标序列 Self-Attention；
2. 以目标状态为 Query、Encoder 输出为 Key/Value 的 Cross-Attention；
3. 逐位置 FFN。

训练时目标序列整体并行输入，但 Causal Mask 保证位置 $t$ 只能读取 $\le t$ 的目标位置。Cross-Attention 不使用目标因果 Mask，因为每个目标位置都可以读取完整源序列；它只需要屏蔽源序列 PAD。

```python
import torch

torch.manual_seed(42)
decoder_layer = torch.nn.TransformerDecoderLayer(
    d_model=16,
    nhead=4,
    dim_feedforward=64,
    dropout=0.0,
    batch_first=True,
    norm_first=True,
)
target = torch.randn(2, 4, 16)
memory = torch.randn(2, 6, 16)
causal_mask = torch.triu(torch.ones(4, 4, dtype=torch.bool), diagonal=1)
output = decoder_layer(target, memory, tgt_mask=causal_mask)
print(output.shape)
```

在该接口中，`tgt_mask=True` 表示禁止 Attention，因此使用严格上三角矩阵屏蔽未来位置。输出长度跟随目标序列，为 `(2,4,16)`。

## 三类常见架构

### Encoder-Only

只堆叠 Encoder Layer，每个 Token 可以读取两侧上下文。常用于序列分类、Token 分类和表征学习。BERT 属于这一类；分类时可以读取特殊分类 Token，或对有效 Token 池化。

### Decoder-Only

只堆叠带 Causal Mask 的 Self-Attention Layer，每个位置预测下一 Token：

$$
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t}).
$$

GPT 类语言模型属于这一类。训练可以并行计算各位置 Logit，生成仍需按 Token 自回归进行；KV Cache 可以避免每一步重复计算旧 Token 的 Key 和 Value。

### Encoder–Decoder

Encoder 双向读取源序列；Decoder 通过因果 Self-Attention 读取已生成目标，并通过 Cross-Attention 读取源表示。它适合输入、输出均为序列且长度不同的条件生成任务，例如翻译与摘要。

三类架构的区别首先在信息可见范围，而不是名称。给 Encoder Self-Attention 加因果 Mask 后，其行为已不再是通常所说的双向 Encoder。

## 训练与生成

语言模型训练仍使用 [Seq2Seq](sequence-to-sequence.md) 中的目标右移：输入 `[BOS,y_1,...,y_{T-1}]`，监督目标为 `[y_1,...,y_T]`。Causal Mask 防止每个位置读取右侧真实 Token，Padding Mask 排除补齐位置，两者解决不同问题。

推理时每一步产生下一个 Token，再追加到输入。普通实现会重新计算整个前缀；Decoder-Only 模型中，第 $t$ 步的旧 Key/Value 不会因新 Token 改变，可以缓存并只计算新位置。KV Cache 降低重复计算，但缓存随层数、序列长度、批量和 KV 头数增长。

## 计算量

设序列长度为 $T$，宽度为 $d$，FFN 宽度为 $d_{\text{ff}}$。一层主要计算量为：

$$
O(T^2d)+O(Td^2)+O(Tdd_{\text{ff}}).
$$

$T^2d$ 来自 Attention 的分数与加权，线性投影和 FFN 对宽度呈二次或乘积增长。短序列大宽度与长序列小宽度的瓶颈可能不同，不能只看到 Attention 的平方项。

## 参考资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [PyTorch：TransformerEncoderLayer](https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerEncoderLayer.html)
- [PyTorch：TransformerDecoderLayer](https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerDecoderLayer.html)
