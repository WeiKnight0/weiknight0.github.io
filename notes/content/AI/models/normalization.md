---
title: 归一化：BatchNorm、LayerNorm 与 RMSNorm
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 归一化哪些数

神经网络中的归一化层对选定的一组激活计算统计量，再做缩放。一般形式为：

$$
\hat x_i=\frac{x_i-\mu}{\sqrt{v+\epsilon}},
\qquad y_i=\gamma_i\hat x_i+\beta_i.
$$

$\epsilon>0$ 用于数值稳定，$\gamma,\beta$ 是可学习的缩放与平移。不同方法的关键区别是：哪些元素一起计算 $\mu,v$，参数在哪些位置共享，训练与推理用什么统计量。

它与输入数据预处理中的标准化不是同一操作。归一化发生在模型内部，不能代替正确的数据划分与预处理。

## BatchNorm

对表格激活 $X\in\mathbb R^{N\times C}$，BatchNorm 对每个通道独立，沿样本轴计算：

$$
\mu_c=\frac1N\sum_iX_{ic},
\qquad v_c=\frac1N\sum_i(X_{ic}-\mu_c)^2.
$$

通道各有一个 $\gamma_c,\beta_c$。图像的 `BatchNorm2d` 输入为 $(N,C,H,W)$，每个通道沿 $N,H,W$ 三个轴聚合，不把不同通道混在一起。

### 示例：同一通道的两个样本

取 $X=[[1,2],[3,6]]$，每行是一个样本。两个通道均值分别为 2、4，方差分别为 1、4。忽略很小的 $\epsilon$ 且 $\gamma=1,\beta=0$，归一化结果为 `[[-1,-1],[1,1]]`。

```python
import torch

X = torch.tensor([[1., 2.], [3., 6.]], dtype=torch.float64)
mean = X.mean(dim=0)
variance = X.var(dim=0, unbiased=False)
manual_bn = (X - mean) / torch.sqrt(variance + 1e-5)
bn = torch.nn.BatchNorm1d(2, affine=False, momentum=0.1).double()
bn.train()
actual_bn = bn(X)
print(torch.allclose(manual_bn, actual_bn))
print(actual_bn)
```

输出 `True`，其余数值接近上面的手算。

## BatchNorm 的训练与推理

默认启用运行统计量时，训练前向使用当前批次统计量，同时维护 running mean/variance；`eval()` 使用累积的运行统计量，不再根据当前批次重新估计。

PyTorch 的更新形式为 $r_{\mathrm{new}}=(1-m)r_{\mathrm{old}}+m r_{\mathrm{batch}}$，这个 momentum 的含义与优化器动量不同。

一个细节是：训练前向使用除以元素数的方差，而更新运行方差使用无偏方差估计。对刚才的两样本，前向方差为 `[1,4]`，无偏估计为 `[2,8]`；默认运行方差初始为 1，因此更新一次后为 `[1.1,1.7]`。

下面接续上段：

```python
print(bn.running_mean)
print(bn.running_var)
bn.eval()
with torch.no_grad():
    inference = bn(X)
print(inference)
```

运行均值为 `[0.2,0.4]`。只经过一批后，运行统计量尚不能代表总体，因此推理输出不等于刚才训练输出。

小批量会使统计估计不稳定。对每个通道只有一个参与统计的元素时，训练版 BatchNorm 还会受接口限制。若关闭 `track_running_stats`，评估时也使用当前输入统计量，行为与默认情形不同。

## LayerNorm

LayerNorm 对每个样本内部的指定特征轴归一化，不使用其他样本。对序列张量 $(N,L,D)$，`LayerNorm(D)` 对每个样本、每个位置的 $D$ 个特征求均值和方差，统计量形状为 $(N,L,1)$。

对于同一个 $X=[[1,2],[3,6]]$，每行分别归一化，结果接近 `[[-1,1],[-1,1]]`。这与 BatchNorm 的列归一化不同。

```python
import torch

X = torch.tensor([[1., 2.], [3., 6.]], dtype=torch.float64)
manual_ln = (X - X.mean(dim=-1, keepdim=True)) / torch.sqrt(X.var(dim=-1, unbiased=False, keepdim=True) + 1e-5)
ln = torch.nn.LayerNorm(2, elementwise_affine=False).double()
actual_ln = ln(X)
print(torch.allclose(manual_ln, actual_ln))
print(actual_ln)
ln.eval()
print(torch.allclose(actual_ln, ln(X)))
```

两个比较都为 `True`。LayerNorm 不维护批次运行统计量，训练与评估都使用当前输入的同一套计算；整个模型仍可能因为 Dropout 等其他层而具有不同模式。

`LayerNorm((L,D))` 会同时归一化最后两个轴，与 `LayerNorm(D)` 不同，不能只因为输入总维数匹配就随意填写 `normalized_shape`。

## RMSNorm

RMSNorm 不减均值，只按均方根缩放。对一个位置的特征向量 $\mathbf x\in\mathbb R^D$：

$$
\operatorname{RMSNorm}(\mathbf x)_j
=\gamma_j\frac{x_j}{\sqrt{\frac1D\sum_kx_k^2+\epsilon}}.
$$

通常不含平移项。它不保证输出均值为零；与 LayerNorm 不能视为相同运算的更快实现。

```python
import torch

x = torch.tensor([[3., 4.]], dtype=torch.float64)
gamma = torch.ones(2, dtype=torch.float64)
rms_output = x * torch.rsqrt((x ** 2).mean(dim=-1, keepdim=True) + 1e-5) * gamma
print(rms_output)
```

输出约为 `[[0.848528,1.131370]]`，均值不为零，二阶矩接近 1。

## 对照与边界

| 方法 | 常见统计范围 | 推理统计量 | 依赖同批其他样本 |
| --- | --- | --- | --- |
| BatchNorm | 每通道跨样本，卷积时还跨空间 | 默认使用运行统计量 | 训练时是 |
| LayerNorm | 单样本/位置的指定特征轴 | 当前输入 | 否 |
| RMSNorm | 单样本/位置的指定特征轴，仅均方根 | 当前输入 | 否 |

归一化常能改善优化条件，但不能保证任意学习率稳定。BatchNorm 原论文使用“内部协变量偏移”解释动机，不应把这种解释当成唯一、已经充分证明的全部作用机制。

冻结主干时，要分别考虑参数和运行统计量，见[迁移学习](../learning-paradigms/transfer-learning.md)。归一化在残差分支前后的位置见[残差连接](residual-connections.md)。

## 参考资料

- [Batch Normalization](https://arxiv.org/abs/1502.03167)
- [Layer Normalization](https://arxiv.org/abs/1607.06450)
- [PyTorch：BatchNorm1d](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html)
- [Root Mean Square Layer Normalization](https://arxiv.org/abs/1910.07467)
