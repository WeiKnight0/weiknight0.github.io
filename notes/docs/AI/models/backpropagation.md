---
title: 计算图、链式法则与反向传播
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 前向与反向

前向传播按照依赖顺序计算中间值和损失。反向传播从标量损失开始，沿计算图反向使用链式法则，得到损失对各参数的导数。

反向传播负责求梯度，[优化器](../learning-principles/optimizers.md)负责使用梯度更新参数。`loss.backward()` 不会自动执行梯度下降，`optimizer.step()` 才会更新参数。

反向传播是反向模式自动微分在网络计算图上的应用，不是通过不断扰动每个参数来近似导数，也不是符号化展开一个庞大的总公式。

## 链式法则与分支累加

若 $u=g(w)$、$L=f(u)$，则 $\partial L/\partial w=(\partial L/\partial u)(\partial u/\partial w)$。

若参数通过多个分支影响损失，各分支的导数贡献要相加。例如 $L=wx+w^2$，则 $\partial L/\partial w=x+2w$。不能只沿其中一条路径传播。

```python
import torch

w = torch.tensor(2.0, requires_grad=True)
x = torch.tensor(3.0)
loss = w * x + w ** 2
loss.backward()
print(loss.item(), w.grad.item())
```

输出 `10.0 7.0`。两个分支分别贡献 3 和 4，自动微分把它们相加。

## 一个隐藏单元的手算

考虑 $a=wx+b$、$h=\operatorname{ReLU}(a)$、$z=vh+c$，损失 $L=\frac12(z-y)^2$。

取 $x=2,y=1,w=1,b=1,v=2,c=0$。前向依次得到 $a=3,h=3,z=6,L=12.5$。

从损失向前倒推：

1. $\partial L/\partial z=z-y=5$。
2. $\partial L/\partial v=5h=15$，$\partial L/\partial c=5$。
3. $\partial L/\partial h=5v=10$。
4. 因为 $a>0$，ReLU 导数为 1，所以 $\partial L/\partial a=10$。
5. $\partial L/\partial w=10x=20$，$\partial L/\partial b=10$。

每步都使用前向阶段的参数和中间值。全部梯度计算完成之后再更新参数，否则前后不再对应同一次前向。

## 批量两层网络的梯度

沿用 [MLP](mlp.md) 的行样本约定，单输出回归网络为：

$$
A=XW_1+\mathbf b_1,\qquad H=\operatorname{ReLU}(A),\qquad Z=HW_2+\mathbf b_2,
\qquad L=\frac1{2n}\sum_i(Z_i-y_i)^2.
$$

$X$ 为 $(n,d)$，$W_1$ 为 $(d,h)$，$H$ 为 $(n,h)$，$W_2$ 为 $(h,1)$，$Z,Y$ 为 $(n,1)$。记 $G_Z=\partial L/\partial Z$，按相反顺序计算：

$$
G_Z=(Z-Y)/n,
\qquad
G_{W_2}=H^\mathsf T G_Z,
\qquad
G_{\mathbf b_2}=\sum_i(G_Z)_{i,:}.
$$

$$
G_H=G_ZW_2^\mathsf T,
\qquad
G_A=G_H\odot\mathbf1[A>0],
\qquad
G_{W_1}=X^\mathsf T G_A,
\qquad
G_{\mathbf b_1}=\sum_i(G_A)_{i,:}.
$$

$\odot$ 表示逐元素乘法。偏置在所有样本上复用，因此它的梯度沿样本轴求和。平均损失的 $1/n$ 已进入 $G_Z$，后面不能再次除以 $n$。

若是多输出并对所有元素求平均，起始梯度还需除以输出维数；若是分类，则换成对应的 Logit 梯度，其余链式传播结构不变。

## NumPy 手写与 PyTorch 对照

下面用固定的两样本网络计算所有参数梯度。输入在 ReLU 折点之外，便于数值核验。

```python
import numpy as np

X = np.array([[1., 2.], [-1., 1.]])
y = np.array([[1.], [0.]])
W1 = np.array([[0.5, -0.3], [0.2, 0.4]])
b1 = np.array([0.1, 0.2])
W2 = np.array([[0.7], [-0.5]])
b2 = np.array([0.1])
A = X @ W1 + b1
H = np.maximum(A, 0)
Z = H @ W2 + b2
loss = 0.5 * ((Z - y) ** 2).mean()
gZ = (Z - y) / len(X)
gW2 = H.T @ gZ
gb2 = gZ.sum(axis=0)
gA = (gZ @ W2.T) * (A > 0)
gW1 = X.T @ gA
gb1 = gA.sum(axis=0)
print(Z, loss)
print(gW1, gb1, gW2, gb2)
```

预测为 `[[0.45], [-0.35]]`，损失为 `0.10625`。第一层梯度为 `[[-0.1925, 0.05], [-0.385, 0.3625]]`，偏置梯度为 `[-0.1925, 0.225]`；第二层梯度为 `[[-0.275], [-0.35]]`，偏置梯度为 `[-0.45]`。

下面接续同一组 NumPy 数据，用 PyTorch 自动求导。两边都使用 `float64` 和完全相同的半 MSE。

```python
import torch

tX = torch.tensor(X, dtype=torch.float64)
ty = torch.tensor(y, dtype=torch.float64)
tW1 = torch.tensor(W1, dtype=torch.float64, requires_grad=True)
tb1 = torch.tensor(b1, dtype=torch.float64, requires_grad=True)
tW2 = torch.tensor(W2, dtype=torch.float64, requires_grad=True)
tb2 = torch.tensor(b2, dtype=torch.float64, requires_grad=True)
tZ = torch.relu(tX @ tW1 + tb1) @ tW2 + tb2
tloss = 0.5 * ((tZ - ty) ** 2).mean()
tloss.backward()
print(np.allclose(gW1, tW1.grad.numpy()))
print(np.allclose(gb1, tb1.grad.numpy()))
print(np.allclose(gW2, tW2.grad.numpy()))
print(np.allclose(gb2, tb2.grad.numpy()))
```

四行均为 `True`。这种对照有助于定位转置错误、广播错误，以及平均损失重复缩放。

## 数值梯度检查

有限差分使用 $\partial L/\partial w\approx[L(w+\epsilon)-L(w-\epsilon)]/(2\epsilon)$ 近似导数。它每个参数都要额外前向计算，适合小规模调试，不适合替代训练中的反向传播。

下面接续 NumPy 网络，只检查 $W_{1,0,0}$。扰动量取 $10^{-6}$，并恢复原值。

```python
epsilon = 1e-6
original = W1[0, 0]
W1[0, 0] = original + epsilon
plus = 0.5 * ((np.maximum(X @ W1 + b1, 0) @ W2 + b2 - y) ** 2).mean()
W1[0, 0] = original - epsilon
minus = 0.5 * ((np.maximum(X @ W1 + b1, 0) @ W2 + b2 - y) ** 2).mean()
W1[0, 0] = original
numeric = (plus - minus) / (2 * epsilon)
print(numeric, gW1[0, 0])
```

两者均约为 `-0.1925`。过小的扰动容易受舍入误差影响，过大则近似不准；ReLU 的不可导点附近还可能跨越不同分段，不能用对称差分强行验证框架选择的零点导数。

## 自动微分中的状态

每次前向会建立新的动态计算图。默认反向完成后会释放用于反向的中间缓存；通常下一次更新重新前向，不应为普通训练随意设置 `retain_graph=True`。

参数 `.grad` 默认累积，所以独立更新前清零。非叶子中间张量的梯度通常不会保存到 `.grad`，调试需要时调用 `retain_grad()`；这与保留整张计算图不是同一操作。

`detach()` 切断张量与此前计算图的梯度关系，`item()` 提取普通标量，均不能用于随后还需要沿原路径求导的损失计算。对反向所需的中间值进行原地修改也可能破坏梯度计算。

反向需要保存某些前向中间值，因此训练内存通常高于只做推理。检查点重计算可以用额外计算换内存，后续训练系统章节再展开。

## 参考资料

- [Dive into Deep Learning：Forward Propagation, Backward Propagation, and Computational Graphs](https://d2l.ai/chapter_multilayer-perceptrons/backprop.html)
- [PyTorch：Automatic Differentiation](https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html)
