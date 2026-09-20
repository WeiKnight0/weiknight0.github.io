---
title: 初始化与梯度传播：Xavier、He 与梯度裁剪
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 为什么不能把所有权重设为零

同一隐藏层的单元如果具有相同输入权重、偏置和对称的输出连接，就会得到相同激活和相同梯度，更新后仍然相同。增加这些单元相当于重复同一个特征，没有发挥隐藏宽度的作用。

随机初始化用于打破这种对称性。偏置常可以设为零，因为不同的随机权重已经使单元不同；逻辑回归等没有多个对称隐藏单元的模型，也可以从零权重开始。不能把“隐藏层全部零初始化有问题”推广成“任何参数都不能为零”。

## 梯度消失与爆炸

多层网络反向传播需要连乘各层的局部导数或 Jacobian。许多因子反复缩小某个方向，就可能出现梯度消失；反复放大则可能出现梯度爆炸。

例如标量链 $h_l=ah_{l-1}$，共 $L$ 层，则 $\partial h_L/\partial h_0=a^L$。取 $L=20$，$a=0.5$ 时约为 $9.54\times10^{-7}$，$a=2$ 时为 $1048576$。

```python
import numpy as np

factors = np.array([0.5, 1.0, 2.0])
print(factors ** 20)
```

真实网络中不同方向的缩放不同，不能只看每层一个权重的大小。Sigmoid 饱和、ReLU 失活、网络深度和权重尺度都会影响梯度，合适的初始化只是其中一环。

## fan-in 与 fan-out

对一个全连接层，输入宽度 $d_{\mathrm{in}}$ 是 fan-in，输出宽度 $d_{\mathrm{out}}$ 是 fan-out。它们不是批量大小。

假设权重独立、均值为零、方差为 $s^2$，输入各分量与权重独立且二阶矩相同。对 $a_j=\sum_iw_{ij}x_i$，交叉项期望消失，得到：

$$
\mathbb E[a_j^2]=d_{\mathrm{in}}s^2\mathbb E[x_i^2].
$$

若希望前向二阶矩不逐层放大或缩小，线性层需要大致满足 $d_{\mathrm{in}}s^2=1$。反向传播作类似分析会涉及 fan-out。

这些独立性和分布假设主要用于初始化时的近似分析，训练后通常不再严格成立。

## Xavier 初始化

Xavier 在前向与反向尺度之间折中，常用 gain 为 1 的形式为：

$$
\operatorname{Var}(w)=\frac{2}{d_{\mathrm{in}}+d_{\mathrm{out}}}.
$$

Gaussian 版本使用均值 0、上述方差；均匀分布 $U(-a,a)$ 的方差是 $a^2/3$，因此：

$$
a=\sqrt{\frac{6}{d_{\mathrm{in}}+d_{\mathrm{out}}}}.
$$

它适合作为近似线性或某些对称激活网络的尺度起点。实际库允许通过 gain 调整激活相关缩放，不能把同一 gain 无条件用于所有激活。

## He 初始化

ReLU 将负半轴置零。若激活前分布关于零对称，则：

$$
\mathbb E[\operatorname{ReLU}(a)^2]=\frac12\mathbb E[a^2].
$$

为了抵消这一步的二阶矩缩小，He 的 fan-in 形式使用：

$$
\operatorname{Var}(w)=\frac{2}{d_{\mathrm{in}}},
\qquad
\operatorname{Std}(w)=\sqrt{\frac{2}{d_{\mathrm{in}}}}.
$$

这里保持的是近似二阶矩，并非严格保持 ReLU 输出的方差：ReLU 输出均值通常不为零，方差还要减去均值平方。

对负半轴斜率为 $a$ 的 Leaky ReLU，对应方差尺度为 $2/[(1+a^2)d_{\mathrm{in}}]$。也可以选择 fan-out 形式侧重反向尺度。

### 示例：256 输入、128 输出

Xavier 的标准差为 $\sqrt{2/384}\approx0.07217$，He 的标准差为 $\sqrt{2/256}\approx0.08839$。

```python
import numpy as np

rng = np.random.default_rng(42)
fan_in, fan_out = 256, 128
xavier_std = np.sqrt(2 / (fan_in + fan_out))
he_std = np.sqrt(2 / fan_in)
W_xavier = rng.normal(0, xavier_std, (fan_in, fan_out))
W_he = rng.normal(0, he_std, (fan_in, fan_out))
print(xavier_std, he_std)
print(W_xavier.std(), W_he.std())
```

采样标准差应接近理论值，不要求精确相等。

```python
import torch

torch.manual_seed(42)
layer = torch.nn.Linear(256, 128)
torch.nn.init.kaiming_normal_(layer.weight, mode='fan_in', nonlinearity='relu')
torch.nn.init.zeros_(layer.bias)
print(layer.weight.shape)
print(layer.weight.std(unbiased=False).item())
```

权重形状为 `(128,256)`，标准差接近 `0.08839`。PyTorch 按输出在前、输入在后的权重约定计算 fan；若自己保存的是用于 `X @ W` 的 `(输入,输出)` 矩阵，应核对是否需要向初始化函数传入转置。

## 梯度裁剪

梯度裁剪用于限制一次更新所使用的梯度大小，不负责修复错误损失或保证梯度不会消失。

全局范数裁剪把所有参数梯度看作一个向量 $\mathbf g$，阈值为 $c>0$：若 $\|\mathbf g\|_2>c$，替换为 $c\mathbf g/\|\mathbf g\|_2$，否则不变。它保留整组梯度方向；逐元素截断则可能改变方向，两者不同。

```python
import torch

parameter = torch.tensor([0.0, 0.0], requires_grad=True)
parameter.grad = torch.tensor([3.0, 4.0])
before_norm = torch.nn.utils.clip_grad_norm_([parameter], max_norm=1.0)
print(before_norm.item(), parameter.grad)
```

返回裁剪前范数 `5.0`，梯度约为 `[0.6,0.8]`。调用位置是 `backward()` 之后、优化器更新之前。混合精度下应先解除梯度缩放，再按真实尺度裁剪；非有限梯度也不能靠有限阈值变回正确梯度。

后续：[归一化](normalization.md)、[残差连接](residual-connections.md)。

## 参考资料

- [Glorot、Bengio：Understanding the difficulty of training deep feedforward neural networks](https://proceedings.mlr.press/v9/glorot10a.html)
- [He 等：Delving Deep into Rectifiers](https://arxiv.org/abs/1502.01852)
