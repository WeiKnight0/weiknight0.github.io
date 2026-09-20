---
title: Encoder–Decoder 与 Seq2Seq：训练、掩码与生成
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 输入序列到输出序列

序列到序列（Sequence-to-Sequence，Seq2Seq）任务的输入、输出长度可以不同。例如把“我爱你”翻译成 “I love you”，模型需要先读取源序列，再按顺序生成目标序列。

Encoder 将源序列 $\mathbf x=(x_1,\ldots,x_S)$ 编码成状态；Decoder 在该状态和此前目标 Token 的条件下，预测下一个 Token：

$$
p(\mathbf y\mid\mathbf x)
=\prod_{t=1}^{T}p(y_t\mid y_{<t},\mathbf x).
$$

训练目标通常是目标序列各有效位置的负对数似然。目标中需要明确开始标记 BOS 和结束标记 EOS：BOS 用作第一次 Decoder 输入，EOS 告诉模型何时停止。

## 经典 RNN Encoder–Decoder

Encoder 逐步读取源 Token 的 Embedding，最终隐藏状态作为源序列的固定长度表示。Decoder 用该状态初始化，再逐步生成。

对单层 GRU：

$$
H_t^{\mathrm{enc}}=\operatorname{GRU}_{\mathrm{enc}}(E_x[x_t],H_{t-1}^{\mathrm{enc}}),
$$

$$
H_t^{\mathrm{dec}}=\operatorname{GRU}_{\mathrm{dec}}(E_y[y_{t-1}],H_{t-1}^{\mathrm{dec}}),
\qquad
Z_t=H_t^{\mathrm{dec}}W_o+\mathbf b_o.
$$

经典形式令 $H_0^{\mathrm{dec}}=H_S^{\mathrm{enc}}$。如果 Encoder 与 Decoder 的层数、方向数或隐藏宽度不同，需要一个明确的桥接变换，不能直接假设状态形状相等。

固定向量必须承载整个源序列，长序列可能形成信息瓶颈。Attention 允许 Decoder 在各步读取全部 Encoder 输出，后续单独展开。

## Decoder 输入与目标错位

设目标 Token 为 `[BOS, I, love, you, EOS]`。训练时：

- Decoder 输入：`[BOS, I, love, you]`。
- 预测目标：`[I, love, you, EOS]`。

第 $t$ 个输出预测输入序列中的下一个 Token。不能把同一个位置的目标同时放进 Decoder 输入并让模型无掩码地直接看到答案。

```python
import torch

target = torch.tensor([[1, 4, 5, 6, 2]])
decoder_input = target[:, :-1]
labels = target[:, 1:]
print(decoder_input)
print(labels)
```

输出分别为 `[[1,4,5,6]]` 与 `[[4,5,6,2]]`。

## Teacher Forcing

训练时把真实的上一 Token 输入 Decoder，称为 Teacher Forcing。这样每个位置可以并行准备输入，且不会因模型早期错误立刻破坏后续上下文。

推理时没有真实未来目标，只能把模型自己生成的 Token 输入下一步。这造成训练条件与生成条件不完全一致，常称为 Exposure Bias。它不是把标签泄漏给同一位置：训练输入只包含该位置之前的真实 Token。

Scheduled Sampling 等方法尝试在训练中混入模型预测，但会改变优化问题，也不能自动保证生成更好。应先正确实现普通 Teacher Forcing。

## Padding 与序列损失

同批序列通常补齐到相同长度。PAD 位置不属于真实目标，不应参与平均损失。

设每个位置的交叉熵为 $\ell_{n,t}$，有效掩码 $m_{n,t}\in\{0,1\}$，则 Token 平均损失为：

$$
L=\frac{\sum_{n,t}m_{n,t}\ell_{n,t}}{\sum_{n,t}m_{n,t}}.
$$

它让每个有效 Token 权重相同。若先对每条序列平均再对样本平均，则短序列和长序列总权重相同，是另一种目标；必须明确使用哪一种。

### 示例：忽略 PAD

词表大小为 4，PAD 编号为 0。第二条序列只有前两个目标有效：

```python
import torch
import torch.nn.functional as F

logits = torch.tensor([
    [[0., 2., 0., 0.], [0., 0., 2., 0.], [0., 0., 0., 2.]],
    [[0., 2., 0., 0.], [0., 0., 2., 0.], [2., 0., 0., 0.]],
])
labels = torch.tensor([[1, 2, 3], [1, 2, 0]])
loss = F.cross_entropy(logits.reshape(-1, 4), labels.reshape(-1), ignore_index=0)
per_token = F.cross_entropy(logits.transpose(1, 2), labels, reduction='none')
mask = labels != 0
manual = (per_token * mask).sum() / mask.sum()
print(loss.item(), manual.item())
print(torch.allclose(loss, manual))
```

两个损失相等，比较为 `True`。第二条序列最后位置虽然产生了分数，但不影响目标；PAD Embedding 的处理与损失屏蔽仍是两个独立设置。

## 最小 GRU Seq2Seq 前向

下面建立一个单层模型，Encoder 和 Decoder 隐藏宽度相同，因此可直接传递最终状态。代码演示 Teacher Forcing 下的形状，不进行语料训练。

```python
import torch
from torch import nn

class GRUSeq2Seq(nn.Module):
    def __init__(self, source_vocab, target_vocab, embedding_dim, hidden_dim):
        super().__init__()
        self.source_embedding = nn.Embedding(source_vocab, embedding_dim, padding_idx=0)
        self.target_embedding = nn.Embedding(target_vocab, embedding_dim, padding_idx=0)
        self.encoder = nn.GRU(embedding_dim, hidden_dim, batch_first=True)
        self.decoder = nn.GRU(embedding_dim, hidden_dim, batch_first=True)
        self.output = nn.Linear(hidden_dim, target_vocab)

    def forward(self, source, decoder_input):
        _, state = self.encoder(self.source_embedding(source))
        decoder_output, _ = self.decoder(self.target_embedding(decoder_input), state)
        return self.output(decoder_output)

torch.manual_seed(42)
model = GRUSeq2Seq(source_vocab=20, target_vocab=30, embedding_dim=8, hidden_dim=16)
source = torch.tensor([[3, 4, 5], [7, 8, 0]])
decoder_input = torch.tensor([[1, 9, 10, 11], [1, 12, 13, 0]])
logits = model(source, decoder_input)
print(logits.shape)
```

输出 `(2,4,30)`。这里第二条源序列含 PAD，但普通 GRU 仍会处理该时间步，因此其最终状态已受到 PAD 输入影响。真实变长序列可用 `pack_padded_sequence`，或显式取得各自最后有效位置的状态；只设置 `padding_idx=0` 不会让 RNN 自动跳过时间步。

## 按长度打包源序列

序列长度必须表示真实非 PAD 长度。按长度降序排列或设置 `enforce_sorted=False`，打包后 RNN 不再处理补齐部分。

```python
import torch
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

source = torch.tensor([[3, 4, 5], [7, 8, 0]])
lengths = torch.tensor([3, 2])
embedded = model.source_embedding(source)
packed = pack_padded_sequence(embedded, lengths.cpu(), batch_first=True, enforce_sorted=False)
packed_output, state = model.encoder(packed)
output, output_lengths = pad_packed_sequence(packed_output, batch_first=True)
print(output.shape, output_lengths)
print(state.shape)
```

输出形状为 `(2,3,16)`、长度 `[3,2]`，最终状态形状为 `(1,2,16)`。解包后的 PAD 位置为填充值，后续若参与池化或 Attention 仍需要掩码。

## 自回归贪心生成

推理从 BOS 开始，每一步选择最大 Logit 对应的 Token，作为下一步输入；生成 EOS 后停止。批量中各样本结束时间不同，需要记录完成掩码。

下面用一个确定的假 Decoder 演示循环：当输入为 BOS 1 时输出 4，输入 4 时输出 5，输入 5 时输出 EOS 2。

```python
import torch

transition = torch.full((6, 6), -10.0)
transition[1, 4] = 10.0
transition[4, 5] = 10.0
transition[5, 2] = 10.0
token = torch.tensor([1])
generated = []
for _ in range(5):
    logits = transition[token]
    token = logits.argmax(dim=-1)
    if token.item() == 2:
        break
    generated.append(token.item())
print(generated)
```

输出 `[4,5]`，EOS 用于终止，不加入正文结果。真实模型还需要传递 Decoder 隐藏状态，并对已经完成的批量样本停止追加有效 Token。

贪心只选当前最可能 Token，不保证整个序列的联合概率最大。Beam Search 保留多个部分序列，但需要处理长度偏好、EOS 和批量状态，后续与语言模型解码一起讲解。

## Attention 之前的局限

固定长度状态要求最后隐藏向量压缩整个源序列，长句中的早期信息可能难以保留。Attention 让每个 Decoder 步骤根据当前状态选择性组合 Encoder 各位置输出，从而缩短信息路径，并能观察源位置权重。

注意力权重不自动等于可靠的人类解释，也不能代替 PAD 掩码。下一阶段先讲 Q/K/V 和缩放点积注意力，再回到带 Attention 的 Seq2Seq。

## 参考资料

- [Dive into Deep Learning：Encoder–Decoder](https://d2l.ai/chapter_recurrent-modern/encoder-decoder.html)
- [Dive into Deep Learning：Sequence-to-Sequence Learning](https://d2l.ai/chapter_recurrent-modern/seq2seq.html)
