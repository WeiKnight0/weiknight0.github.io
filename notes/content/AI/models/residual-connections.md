---
title: 残差连接：恒等路径、投影与归一化位置
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 残差分支与捷径

普通模块直接计算 $\mathbf y=F(\mathbf x)$；残差模块计算：

$$
\mathbf y=\mathbf x+F(\mathbf x).
$$

输入通过一条恒等捷径直接参与输出，分支 $F$ 学习需要增加的修正。例如希望整个模块保持输入时，只需让分支输出接近零，而不必让若干非线性层共同拟合恒等函数。

这里的残差指模块学习的修正，不是监督损失中的预测误差 $\hat y-y$。分支也不一定比输入数值小。

## 梯度为什么能经过捷径

若 $J_F$ 表示分支对输入的 Jacobian，则残差相加节点的 Jacobian 为 $I+J_F$。使用列向量梯度：

$$
\nabla_{\mathbf x}L=(I+J_F)^\mathsf T\nabla_{\mathbf y}L
=\nabla_{\mathbf y}L+J_F^\mathsf T\nabla_{\mathbf y}L.
$$

一项从恒等路径直接传播，另一项经过分支。两项需要相加，与[计算图的分支累加](backpropagation.md)相同。

残差不是“不经过求导”，也不保证梯度永远不消失：两项可能抵消，其他层的归一化、激活和缩放也会影响梯度。

### 示例：两个方向的梯度

设 $F(\mathbf x)=\mathbf x\odot[0.1,0.2]$，输入 $[2,3]$，输出为 `[2.2,3.6]`。取损失为输出分量之和，输入梯度应为 `[1.1,1.2]`。

```python
import torch

x = torch.tensor([2., 3.], requires_grad=True)
y = x + x * torch.tensor([0.1, 0.2])
y.sum().backward()
print(y.detach())
print(x.grad)
```

若分支完全关闭，输出为输入、输入梯度直接通过；若改成 $F(\mathbf x)=-\mathbf x$，输出与梯度都为零，说明恒等项也可能被抵消。

## 形状必须匹配

逐元素相加要求两条路径有相同的目标形状。若输入通道、特征宽度或空间尺寸改变，捷径可以用投影 $P$ 对齐：$\mathbf y=P(\mathbf x)+F(\mathbf x)$。

全连接投影可用线性层，卷积网络常用具有适当步幅的 $1\times1$ 卷积。此时捷径不再是严格恒等，其梯度也要经过投影。

```python
import torch
from torch import nn

torch.manual_seed(42)
x = torch.randn(4, 3)
projection = nn.Linear(3, 5, bias=False)
branch = nn.Sequential(nn.Linear(3, 5), nn.ReLU(), nn.Linear(5, 5))
y = projection(x) + branch(x)
print(y.shape)
```

输出 `(4,5)`。不要靠意外广播让 `(4,1)` 与 `(4,5)` 相加来“修复”维度，那会改变模块含义。

## Pre-Norm 与 Post-Norm

在 Transformer 风格的残差子层中，两种常见顺序为：

- Pre-Norm：$\mathbf y=\mathbf x+F(\operatorname{Norm}(\mathbf x))$。
- Post-Norm：$\mathbf y=\operatorname{Norm}(\mathbf x+F(\mathbf x))$。

Pre-Norm 的相加输出保留一条直接恒等路径；Post-Norm 的输出还经过归一化，反向时必须经过其 Jacobian。它们的训练行为和所需配方不同，不能只调整代码位置却声称模型完全等价。

```python
import torch
from torch import nn

torch.manual_seed(42)
x = torch.randn(2, 4)
norm = nn.LayerNorm(4)
branch = nn.Sequential(nn.Linear(4, 8), nn.GELU(), nn.Linear(8, 4))
pre_norm = x + branch(norm(x))
post_norm = norm(x + branch(x))
print(pre_norm.shape, post_norm.shape)
print(torch.allclose(pre_norm, post_norm))
```

两者形状均为 `(2,4)`，值一般不同。这里只比较顺序，完整注意力模块还包含掩码、多头与其他结构。

## 相加后的激活

某些 ResNet 模块在相加后再使用 ReLU：$\mathbf y=\operatorname{ReLU}(\mathbf x+F(\mathbf x))$。此时输出不是未经处理的恒等相加，负区间的梯度还会受 ReLU 阻断。

阅读结构图时应区分“相加节点前的恒等路径”和“整个模块对输入的导数”。ResNet 的基本块与瓶颈块将在 CNN 章节展开。

## 参考资料

- [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)
- [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745)
