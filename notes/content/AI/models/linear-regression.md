---
title: 线性回归：最小二乘与梯度下降
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 模型与数据形状

线性回归用输入特征的加权和预测连续数值。对 $d$ 个特征：

$$
\hat y=\mathbf x^\mathsf T\mathbf w+b=\sum_{j=1}^{d}x_jw_j+b.
$$

$\mathbf w\in\mathbb R^d$ 是权重，$b\in\mathbb R$ 是偏置。例如使用面积和房龄预测房价时，两个权重分别控制两种特征对预测值的影响。

将 $n$ 个样本逐行排列为 $X\in\mathbb R^{n\times d}$，所有预测为 $\hat{\mathbf y}=X\mathbf w+b\mathbf1$。代码可以使用 `(n,)` 表示目标和预测，也可以使用 `(n, 1)`，但两者必须一致。

这里的“线性”指对参数线性。$w_1x+w_2x^2+b$ 对原始输入是曲线，但以 $x,x^2$ 为特征后，仍是对参数线性的回归模型。

## 最小二乘目标

采用半均方误差：

$$
J(\mathbf w,b)=\frac1{2n}\sum_{i=1}^{n}(\mathbf x_i^\mathsf T\mathbf w+b-y_i)^2.
$$

平方误差越大的样本，对目标的影响越大。它适合关注较大预测误差的情况，但也容易受异常值影响。

令 $e_i=\mathbf x_i^\mathsf T\mathbf w+b-y_i$。对每个参数求导：

$$
\frac{\partial J}{\partial w_j}=\frac1n\sum_{i=1}^{n}e_ix_{ij},
\qquad
\frac{\partial J}{\partial b}=\frac1n\sum_{i=1}^{n}e_i.
$$

平方项的导数产生 $2e_i$，前面的 $1/2$ 消去 2；预测对 $w_j$ 的导数为 $x_{ij}$，对偏置的导数为 1。因此矩阵形式为 $\nabla_{\mathbf w}J=X^\mathsf T\mathbf e/n$。

## 梯度下降

1. 使用当前权重和偏置计算所有预测。
2. 计算残差 $\mathbf e=\hat{\mathbf y}-\mathbf y$。
3. 由同一组残差计算权重梯度与偏置梯度。
4. 同时按负梯度更新权重和偏置，重复以上过程。

“同时”指两组梯度都基于更新前的参数。不能先改变权重，再用新权重重新计算残差来更新偏置。

### 示例：拟合一条直线

- 输入：$x=[0,1,2]$，$y=[1,3,5]$。
- 目标：拟合 $\hat y=wx+b$。
- 初始参数：$w=b=0$，学习率 $\eta=0.1$。

初始残差为 $[-1,-3,-5]$，所以 $\partial J/\partial w=(-3-10)/3=-13/3$，$\partial J/\partial b=-3$。第一次更新后 $w=13/30\approx0.4333$，$b=0.3$。

继续迭代可以接近 $w=2,b=1$。下面使用完整批量梯度下降，不依赖封装的回归模型：

```python
import numpy as np

X = np.array([[0.0], [1.0], [2.0]])
y = np.array([1.0, 3.0, 5.0])
w = np.zeros(X.shape[1])
b = 0.0
learning_rate = 0.1

for _ in range(1000):
    error = X @ w + b - y
    grad_w = X.T @ error / len(y)
    grad_b = error.mean()
    w -= learning_rate * grad_w
    b -= learning_rate * grad_b

print(w, b)
print(X @ w + b)
```

输出近似为权重 `[2.]`、偏置 `1.0`、预测 `[1. 3. 5.]`。这个无噪声小数据用来验证计算过程，不能代替独立测试。

单次更新需要处理 $n\times d$ 个特征，时间为 $O(nd)$；除数据之外，保存权重、梯度和残差的空间为 $O(d+n)$。

## 正规方程与直接求解

在 $X$ 右侧添加一列 1，得到 $\tilde X\in\mathbb R^{n\times(d+1)}$，令 $\boldsymbol\theta=(w_1,\ldots,w_d,b)^\mathsf T$。目标变成 $J=\|\tilde X\boldsymbol\theta-\mathbf y\|_2^2/(2n)$。

令梯度为零：

$$
\tilde X^\mathsf T(\tilde X\boldsymbol\theta-\mathbf y)=\mathbf0
\quad\Longrightarrow\quad
\tilde X^\mathsf T\tilde X\boldsymbol\theta=\tilde X^\mathsf T\mathbf y.
$$

这就是正规方程。若 $\tilde X$ 列满秩，则解唯一，可以在数学上写成 $\boldsymbol\theta=(\tilde X^\mathsf T\tilde X)^{-1}\tilde X^\mathsf T\mathbf y$。

实现中不直接求逆：特征相关时矩阵可能不可逆，且形成 $\tilde X^\mathsf T\tilde X$ 会加剧条件数问题。使用最小二乘求解器；秩不足时，下面的接口返回最小范数的最小二乘解。

```python
import numpy as np

X = np.array([[0.0], [1.0], [2.0]])
y = np.array([1.0, 3.0, 5.0])
design = np.column_stack((X, np.ones(len(y))))
theta = np.linalg.lstsq(design, y, rcond=None)[0]
print(theta)
```

输出约为 `[2. 1.]`，最后一个元素是偏置。直接求解适合中小规模问题；大数据或在线更新可采用梯度方法。

## 特征尺度与使用条件

面积可能是几百，房龄可能是几十。尺度差距很大时，各参数方向的曲率可能差别明显，单一学习率会使梯度下降收敛缓慢或振荡。标准化通常有助于优化，但均值和标准差必须只由训练集估计。

线性回归不能自动表达任意复杂关系；可以添加有意义的特征，也可以换模型。增加特征并不保证测试误差下降。对训练范围之外的数据作外推时，即使训练拟合很好，也需要检查线性关系是否仍然成立。

前置：[损失与风险](../learning-principles/loss-and-risk.md)。后续：[逻辑回归](logistic-and-softmax-regression.md)、[模型评估](../learning-principles/evaluation.md)。

## 参考资料

- [Dive into Deep Learning：Linear Regression](https://d2l.ai/chapter_linear-regression/linear-regression.html)
- [NumPy：numpy.linalg.lstsq](https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html)
