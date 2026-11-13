---
title: 循环神经网络：RNN、LSTM、GRU 与 BPTT
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 序列与隐藏状态

序列中的当前位置通常依赖此前内容。例如判断一句话的含义，当前词需要结合前文。循环神经网络（Recurrent Neural Network，RNN）按时间步读取输入，并把隐藏状态传给下一步。

设批量大小为 $N$、序列长度为 $T$、输入维度为 $d$、隐藏维度为 $h$。输入 $X\in\mathbb R^{N\times T\times d}$，第 $t$ 步的切片 $X_t$ 为 $(N,d)$。

一个基本 RNN 为：

$$
H_t=\tanh(X_tW_{xh}+H_{t-1}W_{hh}+\mathbf b_h),
\qquad
O_t=H_tW_{ho}+\mathbf b_o.
$$

$W_{xh}$ 为 $(d,h)$，$W_{hh}$ 为 $(h,h)$。所有时间步共享同一组参数；不是为每个位置建立一个新层。$H_t$ 汇总截至第 $t$ 步的状态，输出 $O_t$ 是否在每一步使用取决于任务。

## 手写基本 RNN

下面固定权重，逐时间步计算。输入形状为 `(1,3,2)`，输出序列形状为 `(1,3,2)`，最后状态为 `(1,2)`。

```python
import torch

X = torch.tensor([[[1., 0.], [0., 1.], [1., 1.]]])
W_xh = torch.tensor([[0.5, -0.5], [1.0, 0.5]])
W_hh = torch.tensor([[0.2, 0.0], [0.0, 0.2]])
b_h = torch.zeros(2)
state = torch.zeros(1, 2)
outputs = []
for step in X.unbind(dim=1):
    state = torch.tanh(step @ W_xh + state @ W_hh + b_h)
    outputs.append(state)
outputs = torch.stack(outputs, dim=1)
print(outputs)
print(outputs.shape, state.shape)
```

第二步不仅由 `[0,1]` 决定，还使用第一步状态。若把状态每一步重新置零，就变成对各位置独立使用同一个前馈层。

## PyTorch RNN 的形状

`nn.RNN(input_size=d, hidden_size=h, batch_first=True)` 接收 `(N,T,d)`，返回：

- `output`：每个时间步最后一层的隐藏状态，形状 `(N,T,Dh)`。
- `h_n`：每层、每个方向的最终隐藏状态，形状 `(D\times L,N,h)`。

$L$ 是层数，$D$ 是方向数；单向时 $D=1$，双向时 $D=2$。`batch_first=True` 只改变输入输出的批量轴，不改变隐藏状态轴顺序。

```python
import torch

torch.manual_seed(42)
X = torch.randn(4, 5, 3)
rnn = torch.nn.RNN(3, 7, num_layers=2, batch_first=True)
output, h_n = rnn(X)
print(output.shape, h_n.shape)
print(torch.allclose(output[:, -1], h_n[-1]))
```

输出形状为 `(4,5,7)` 和 `(2,4,7)`；单向网络最后时间步输出等于最后一层最终状态，比较为 `True`。

## 多层与双向 RNN

多层 RNN 将第 $l$ 层在各时间步的输出作为第 $l+1$ 层输入。`num_layers=2` 不是把序列长度变为两倍。

双向 RNN 同时有正向和反向状态。输出最后一维通常拼接两个方向，宽度为 $2h$。它可以利用左右上下文，适合整段输入已知的编码任务；自回归生成时，当前位置不能读取未来 Token，因此不能把普通双向编码直接当成因果生成器。

```python
import torch

torch.manual_seed(42)
X = torch.randn(4, 5, 3)
rnn = torch.nn.RNN(3, 7, bidirectional=True, batch_first=True)
output, h_n = rnn(X)
forward_last = output[:, -1, :7]
backward_first = output[:, 0, 7:]
print(output.shape, h_n.shape)
print(torch.allclose(forward_last, h_n[0]))
print(torch.allclose(backward_first, h_n[1]))
```

输出形状为 `(4,5,14)` 和 `(2,4,7)`。正向最终状态位于最后时间位置，反向最终状态位于原序列的第一个位置；不能简单取 `output[:, -1]` 同时获得两个方向的最终状态。

## 通过时间反向传播

训练时将共享参数在时间上展开，通过时间反向传播（Backpropagation Through Time，BPTT）把各时间步对参数的贡献相加。

忽略输入和偏置，设标量状态为 $h_t=\tanh(wh_{t-1})$。最终损失只依赖 $h_T$ 时：

$$
\frac{\partial h_T}{\partial h_t}
=\prod_{k=t+1}^{T}w\left(1-h_k^2\right).
$$

这是一串 Jacobian 因子的乘积。若因子幅度长期小于 1，早期梯度衰减；长期大于 1，则可能爆炸。Tanh 饱和时 $1-h_k^2$ 接近零。

### 示例：不同递归权重的梯度

使用线性递归 $h_t=wh_{t-1}$，$h_0=1$，损失 $L=h_T$，则 $\partial L/\partial h_0=w^T$。

```python
import torch

for weight in (0.5, 1.0, 1.5):
    h = torch.tensor(1.0, requires_grad=True)
    first = h
    for _ in range(10):
        h = weight * h
    h.backward()
    print(weight, first.grad.item())
```

输出约为 `0.0009765625`、`1.0`、`57.665`。真实门控网络更复杂，但仍需要沿时间传播梯度。

截断 BPTT 将长序列分段，只在有限步数内反向。分段间可以传递 `state.detach()` 作为下一段初始状态，同时切断更早计算图。这降低内存和计算，也使优化忽略超过截断长度的梯度路径。

## LSTM

长短期记忆网络（Long Short-Term Memory，LSTM）维护隐藏状态 $H_t$ 和细胞状态 $C_t$。给定拼接输入 $[X_t,H_{t-1}]$，常见公式为：

$$
I_t=\sigma([X_t,H_{t-1}]W_i+\mathbf b_i),
\qquad
F_t=\sigma([X_t,H_{t-1}]W_f+\mathbf b_f),
$$

$$
O_t=\sigma([X_t,H_{t-1}]W_o+\mathbf b_o),
\qquad
\widetilde C_t=\tanh([X_t,H_{t-1}]W_c+\mathbf b_c).
$$

三个 Sigmoid 门取值在 $(0,1)$：输入门 $I_t$ 控制写入多少候选记忆，遗忘门 $F_t$ 控制保留多少旧记忆，输出门 $O_t$ 控制细胞状态暴露多少。

$$
C_t=F_t\odot C_{t-1}+I_t\odot\widetilde C_t,
\qquad
H_t=O_t\odot\tanh(C_t).
$$

细胞状态通过加法更新，提供比普通 RNN 更直接的跨步路径。若忽略门本身对早期状态的间接依赖，沿直接路径有 $\partial C_t/\partial C_{t-1}=F_t$；当遗忘门接近 1 时，记忆和梯度更容易保留。这不保证任意长序列都不会梯度消失。

### 示例：门如何更新记忆

设标量旧记忆 $C_{t-1}=2$，遗忘门 0.8，输入门 0.25，候选记忆 0.4，输出门 0.5：

$$
C_t=0.8\times2+0.25\times0.4=1.7,
\qquad
H_t=0.5\tanh(1.7)\approx0.4677.
$$

```python
import torch

old_cell = torch.tensor([2.0])
forget_gate = torch.tensor([0.8])
input_gate = torch.tensor([0.25])
candidate = torch.tensor([0.4])
output_gate = torch.tensor([0.5])
cell = forget_gate * old_cell + input_gate * candidate
hidden = output_gate * torch.tanh(cell)
print(cell, hidden)
```

PyTorch LSTM 返回 `(output, (h_n, c_n))`。隐藏和细胞状态形状相同，但含义不同。

```python
import torch

torch.manual_seed(42)
X = torch.randn(4, 5, 3)
lstm = torch.nn.LSTM(3, 7, num_layers=2, batch_first=True)
output, (h_n, c_n) = lstm(X)
print(output.shape, h_n.shape, c_n.shape)
print(torch.allclose(output[:, -1], h_n[-1]))
```

输出为 `(4,5,7)`、`(2,4,7)`、`(2,4,7)`。单向网络的最后输出等于最后一层最终隐藏状态，不等于细胞状态。

## GRU

门控循环单元（Gated Recurrent Unit，GRU）使用一个隐藏状态，不单独维护细胞状态。以下采用常见教材形式：

$$
R_t=\sigma(X_tW_{xr}+H_{t-1}W_{hr}+\mathbf b_r),
\qquad
Z_t=\sigma(X_tW_{xz}+H_{t-1}W_{hz}+\mathbf b_z),
$$

$$
\widetilde H_t=\tanh(X_tW_{xh}+(R_t\odot H_{t-1})W_{hh}+\mathbf b_h),
$$

$$
H_t=Z_t\odot H_{t-1}+(1-Z_t)\odot\widetilde H_t.
$$

重置门 $R_t$ 控制候选状态读取多少旧状态；更新门 $Z_t$ 在旧状态与候选状态之间插值。这里约定 $Z_t$ 越大越保留旧状态。有些资料交换两项并重新解释更新门，阅读时要以最终公式为准。

### 示例：更新门的两个极端

旧状态为 2，候选状态为 $-1$。当 $Z_t=0.9$ 时，新状态为 $1.7$，主要保留旧状态；当 $Z_t=0.1$ 时，新状态为 $-0.7$，主要使用候选状态。

```python
import torch

old = torch.tensor([2.0])
candidate = torch.tensor([-1.0])
for update_gate in (0.9, 0.1):
    hidden = update_gate * old + (1 - update_gate) * candidate
    print(hidden)
```

PyTorch 为提高计算效率，将 GRU 候选状态的重置门放在隐藏线性变换之后，其公式与上面的教材形式不完全相同；不能把手工权重逐项复制后期望数值严格一致。接口形状仍为：

```python
import torch

torch.manual_seed(42)
X = torch.randn(4, 5, 3)
gru = torch.nn.GRU(3, 7, num_layers=2, batch_first=True)
output, h_n = gru(X)
print(output.shape, h_n.shape)
print(torch.allclose(output[:, -1], h_n[-1]))
```

输出形状为 `(4,5,7)` 和 `(2,4,7)`，比较为 `True`。

## RNN、LSTM 与 GRU

| 模型 | 每层每方向的状态 | 核心结构 | 常见特点 |
| --- | --- | --- | --- |
| 基本 RNN | $H_t$ | 单次候选更新 | 简单，长程梯度更容易衰减或爆炸 |
| LSTM | $H_t,C_t$ | 输入、遗忘、输出门 | 状态更完整，参数和计算更多 |
| GRU | $H_t$ | 重置、更新门 | 比 LSTM 紧凑，效果依任务而定 |

门控结构不能替代正确的序列掩码、梯度裁剪和数据划分。哪一种更好需要在同一任务和训练预算下验证。

下一篇：[Encoder–Decoder 与 Seq2Seq](sequence-to-sequence.md)。

## 参考资料

- [Dive into Deep Learning：Recurrent Neural Networks](https://d2l.ai/chapter_recurrent-neural-networks/rnn.html)
- [Dive into Deep Learning：Backpropagation Through Time](https://d2l.ai/chapter_recurrent-neural-networks/bptt.html)
- [Dive into Deep Learning：LSTM](https://d2l.ai/chapter_recurrent-modern/lstm.html)
- [Dive into Deep Learning：GRU](https://d2l.ai/chapter_recurrent-modern/gru.html)
