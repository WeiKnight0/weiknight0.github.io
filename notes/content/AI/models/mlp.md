---
title: 多层感知机：线性层、激活与前向传播
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 为什么加入隐藏层

线性分类器只能在当前特征空间中形成线性边界。例如 XOR：输入 `(0,0)` 和 `(1,1)` 属于类别 0，`(0,1)` 和 `(1,0)` 属于类别 1，无法用一条直线分开。

多层感知机（Multilayer Perceptron，MLP）通过线性层和非线性激活逐层变换表示，再由输出层完成任务。输入与输出之间的层称为隐藏层，其表示通常由训练得到，没有逐元素人工标签。

## 线性层与矩阵形状

本组笔记将样本按行排列。输入 $X\in\mathbb R^{n\times d}$，隐藏宽度为 $h$，输出维度为 $C$。一个隐藏层的网络为：

$$
A=XW_1+\mathbf b_1,\qquad
H=\phi(A),\qquad
Z=HW_2+\mathbf b_2.
$$

| 数量 | 形状 | 含义 |
| --- | --- | --- |
| $W_1$ | $(d,h)$ | 输入到隐藏层权重 |
| $\mathbf b_1$ | $(h,)$ | 隐藏偏置，对样本轴广播 |
| $A,H$ | $(n,h)$ | 激活前、激活后的隐藏表示 |
| $W_2$ | $(h,C)$ | 隐藏到输出权重 |
| $\mathbf b_2$ | $(C,)$ | 输出偏置 |
| $Z$ | $(n,C)$ | 每个样本的输出 |

参数总数为 $dh+h+hC+C$，与批量大小 $n$ 无关。前向的两次矩阵乘法大约需要 $O(ndh+nhC)$ 时间。

PyTorch 的 `nn.Linear(d, h)` 内部将权重保存为 `(h,d)`，执行 $XW^\mathsf T+\mathbf b$。这是存储约定不同；把手写矩阵复制进模块时要转置。

## 激活函数

如果两层之间没有非线性：$(XW_1+\mathbf b_1)W_2+\mathbf b_2=X(W_1W_2)+(\mathbf b_1W_2+\mathbf b_2)$，仍然只是一层仿射变换。因此仅叠加线性层不能获得一般的非线性边界。

### ReLU

ReLU 定义为 $\phi(a)=\max(0,a)$。正输入保持原值，负输入输出零。除零点外，导数为：

$$
\phi'(a)=\begin{cases}1,&a>0,\\0,&a<0.\end{cases}
$$

零点不可导，实现通常选择一个约定值，PyTorch 取 0。若某单元对所有训练输入长期处于负区间，它的梯度可能持续为零，形成“死亡 ReLU”。

### Sigmoid、Tanh 与 GELU

Sigmoid 为 $\sigma(a)=1/(1+e^{-a})$，输出在 $(0,1)$，适合表达二分类概率。导数 $\sigma(a)(1-\sigma(a))$ 在输入绝对值很大时很小，多层连乘可能削弱梯度。

Tanh 输出在 $(-1,1)$，导数为 $1-\tanh^2(a)$，同样存在饱和区。GELU 常写为 $a\Phi(a)$，其中 $\Phi$ 为标准正态分布的累积分布函数；它平滑地调整输入，在 Transformer 中常见。

激活选择依赖结构。不能因为某函数更平滑就断言一定优于 ReLU，也不要把所有层都强制映射到概率范围。

## 输出层与任务

- 连续回归通常直接输出数值，再计算 MSE 等损失。
- 二分类输出一个 Logit，交给 `BCEWithLogitsLoss`。
- 互斥多分类输出 $C$ 个 Logit，交给 `CrossEntropyLoss`。

隐藏层激活与输出概率变换作用不同。训练多分类时不必先 Softmax 再送进 `CrossEntropyLoss`，详见[分类损失接口](logistic-and-softmax-regression.md)。

## 示例：手工构造 XOR

设两个隐藏单元为 $h_1=\operatorname{ReLU}(x_1+x_2)$，$h_2=\operatorname{ReLU}(x_1+x_2-1)$，输出 $z=h_1-2h_2$。

| 输入 | $h_1$ | $h_2$ | $z$ |
| --- | --- | --- | --- |
| $(0,0)$ | 0 | 0 | 0 |
| $(0,1)$ | 1 | 0 | 1 |
| $(1,0)$ | 1 | 0 | 1 |
| $(1,1)$ | 2 | 1 | 0 |

```python
import numpy as np

X = np.array([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
W1 = np.array([[1., 1.], [1., 1.]])
b1 = np.array([0., -1.])
W2 = np.array([[1.], [-2.]])
b2 = np.array([0.])
A = X @ W1 + b1
H = np.maximum(A, 0)
Z = H @ W2 + b2
print(Z.ravel())
```

输出 `[0, 1, 1, 0]`。这组权重是人为构造，用来证明网络可以表示 XOR，不是训练过程。这里的 $z$ 是直接构造的数值输出，不把它误当成经过 Sigmoid 的概率。

## 用训练学习 XOR

下面用更宽的 Tanh 隐藏层训练二分类器，避免手工指定上述权重。输入和标签都采用浮点数，输出与标签形状均为 `(4,1)`。

```python
import torch
from torch import nn

torch.manual_seed(42)
X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
y = torch.tensor([[0.], [1.], [1.], [0.]])
model = nn.Sequential(nn.Linear(2, 8), nn.Tanh(), nn.Linear(8, 1))
optimizer = torch.optim.Adam(model.parameters(), lr=0.05)
criterion = nn.BCEWithLogitsLoss()
for _ in range(1000):
    optimizer.zero_grad()
    logits = model(X)
    loss = criterion(logits, y)
    loss.backward()
    optimizer.step()
model.eval()
with torch.no_grad():
    logits = model(X)
    print((logits >= 0).int().flatten())
    print(criterion(logits, y).item())
```

预测应为 `[0, 1, 1, 0]`。这是只有四种输入的计算演示，不能据此评价大型网络的泛化能力。

网络训练时，损失如何影响前面各层参数，见[计算图与反向传播](backpropagation.md)。

## 参考资料

- [Dive into Deep Learning：Multilayer Perceptrons](https://d2l.ai/chapter_multilayer-perceptrons/mlp.html)
