---
title: 逻辑回归与 Softmax 回归
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 从数值预测到类别概率

[线性回归](linear-regression.md)直接输出实数。二分类需要预测 $y\in\{0,1\}$，通常先估计正类概率，再使用阈值决定类别。

逻辑回归（Logistic Regression）先计算线性分数 $z=\mathbf x^\mathsf T\mathbf w+b$，再用 Sigmoid 将它映射到 $(0,1)$：

$$
p=P(y=1\mid\mathbf x)=\sigma(z)=\frac1{1+e^{-z}}.
$$

$z$ 称为 Logit，它不是概率。$z=0$ 时 $p=0.5$；$z$ 越大，正类概率越接近 1。反过来，$z=\log\frac p{1-p}$，即正类与负类概率比的对数。

默认以 0.5 为阈值时，$z\geq0$ 判为正类，决策边界为 $\mathbf x^\mathsf T\mathbf w+b=0$。虽然输出经过非线性的 Sigmoid，决策边界对当前特征仍是线性的。

## 二元交叉熵与梯度

对于标签 $y\in\{0,1\}$，模型给真实标签分配的概率可统一写成 $p^y(1-p)^{1-y}$。取负对数：

$$
\ell=-y\log p-(1-y)\log(1-p).
$$

对独立样本的条件概率取乘积、再取负对数，相当于把各样本的交叉熵相加。因此，在这个 Bernoulli 条件模型下，最小化交叉熵对应最大化条件似然。

梯度可以由链式法则求出：

$$
\frac{\partial\ell}{\partial p}=-\frac yp+\frac{1-y}{1-p},
\qquad
\frac{\partial p}{\partial z}=p(1-p),
\qquad
\frac{\partial\ell}{\partial z}=p-y.
$$

因为 $\partial z/\partial\mathbf w=\mathbf x$，所以单样本权重梯度为 $(p-y)\mathbf x$。整批数据的平均梯度为 $X^\mathsf T(\mathbf p-\mathbf y)/n$，偏置梯度为 $\operatorname{mean}(\mathbf p-\mathbf y)$。

### 示例：一次二分类更新

- 输入：$x=2,y=1$，初始 $w=b=0$，学习率 $\eta=0.1$。
- 初始输出：$z=0,p=0.5$，损失为 $\log2\approx0.6931$。
- 梯度：$\partial\ell/\partial w=(0.5-1)\times2=-1$，$\partial\ell/\partial b=-0.5$。
- 更新后：$w=0.1,b=0.05$，$z=0.25,p\approx0.5622$，正类概率提高。

## NumPy 二分类实现

下面使用一维可分数据演示训练，目标是验证分类过程。完全可分且没有正则化时，逻辑回归的参数可能持续增大，损失不断逼近下界；固定迭代次数不表示存在一个有限的最优参数。

```python
import numpy as np

X = np.array([[-2.0], [-1.0], [1.0], [2.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
w = np.zeros(1)
b = 0.0

for _ in range(1000):
    z = X @ w + b
    # logaddexp 避免直接计算很大的 exp(-z)。
    p = np.exp(-np.logaddexp(0, -z))
    error = p - y
    w -= 0.1 * (X.T @ error / len(y))
    b -= 0.1 * error.mean()

z = X @ w + b
loss = (np.maximum(z, 0) - y * z + np.log1p(np.exp(-np.abs(z)))).mean()
print((z >= 0).astype(int))
print(loss)
```

类别输出为 `[0 0 1 1]`。损失使用与交叉熵等价的稳定形式 $\max(z,0)-yz+\log(1+e^{-|z|})$，避免先得到恰好为 0 或 1 的浮点概率后再取对数。

## Softmax 多分类

对 $C$ 个互斥类别，输出一个分数向量 $\mathbf z\in\mathbb R^C$。令 $W\in\mathbb R^{d\times C}$、$\mathbf b\in\mathbb R^C$，一批样本的分数矩阵为 $Z=XW+\mathbf b$，形状为 $(n,C)$。

Softmax 沿每个样本的类别维归一化：

$$
p_j=\frac{e^{z_j}}{\sum_{k=0}^{C-1}e^{z_k}},
\qquad \sum_{j=0}^{C-1}p_j=1.
$$

所有分数同时减去一个常数，不改变概率，因为分子分母同时乘以相同因子。通常减去该行最大值 $m=\max_jz_j$，使指数的输入不大于 0，避免上溢。

真实类别为 $y$ 时，交叉熵为：

$$
\ell=-\log p_y
=\log\sum_{k=0}^{C-1}e^{z_k}-z_y
=\log\sum_{k=0}^{C-1}e^{z_k-m}-(z_y-m).
$$

### 示例：三分类

- 输入：分数 $[2,1,0]$，真实类别为 0。
- 概率：约为 $[0.6652,0.2447,0.0900]$。
- 预测类别：0。
- 损失：$-\log0.6652\approx0.4076$。

分数 `[1002,1001,1000]` 应得到相同结果。下面直接从稳定的对数概率计算损失，不对很小的概率再次取对数。

```python
import numpy as np

Z = np.array([[2.0, 1.0, 0.0], [1002.0, 1001.0, 1000.0]])
y = np.array([0, 0])
shifted = Z - Z.max(axis=1, keepdims=True)
log_p = shifted - np.log(np.exp(shifted).sum(axis=1, keepdims=True))
print(np.exp(log_p))
print(-log_p[np.arange(len(y)), y])
```

两行概率相同，两行损失都约为 `0.407606`。`keepdims=True` 保留 `(n,1)` 形状，让每个样本只减去自己的最大值。

## Softmax 交叉熵梯度

对单样本损失 $\ell=\log\sum_ke^{z_k}-z_y$ 求导：

$$
\frac{\partial\ell}{\partial z_j}
=\frac{e^{z_j}}{\sum_ke^{z_k}}-\mathbf1[j=y]
=p_j-\mathbf1[j=y].
$$

$\mathbf1[j=y]$ 在第 $j$ 类为真实类别时取 1，否则取 0。对于刚才的例子，梯度约为 $[-0.3348,0.2447,0.0900]$。沿负梯度更新分数时，真实类别分数提高，其他类别分数降低。

下面的代码接续上一段，演示由分数梯度得到线性层参数梯度：

```python
X = np.array([[1.0, 0.0], [0.0, 1.0]])
grad_Z = np.exp(log_p)
grad_Z[np.arange(len(y)), y] -= 1
grad_Z /= len(y)
grad_W = X.T @ grad_Z
grad_b = grad_Z.sum(axis=0)
print(grad_W.shape, grad_b.shape)
```

输出 `(2, 3) (3,)`，分别与权重和偏置形状一致。除以样本数来自平均损失，不能再在后面的梯度中重复除一次。

## PyTorch 损失接口

| 任务 | 模型输出 | 标签 | 损失接口 |
| --- | --- | --- | --- |
| 二分类 | 每个样本一个原始 Logit | 同形状的浮点 0/1 | `BCEWithLogitsLoss` |
| 互斥多分类 | `(n, C)` 原始分数 | `(n,)`，`torch.long` 类别编号 | `CrossEntropyLoss` |
| 多标签分类 | `(n, C)`，每类独立 Logit | 同形状的浮点 0/1 | `BCEWithLogitsLoss` |

`CrossEntropyLoss` 接收原始分数，内部完成 LogSoftmax 与负对数似然，不要先调用 Softmax 再传进去。`BCEWithLogitsLoss` 同样不需要先调用 Sigmoid。

```python
import torch
from torch import nn

logits = torch.tensor([[2.0, 1.0, 0.0]], requires_grad=True)
target = torch.tensor([0], dtype=torch.long)
loss = nn.CrossEntropyLoss()(logits, target)
loss.backward()
print(loss.item())
print(logits.grad)
```

损失约为 `0.407606`，梯度约为 `[[-0.3348, 0.2447, 0.0900]]`。

“一张图片既有猫又有狗”是多标签问题，各类别可以同时成立，应分别判断；“图片属于猫、狗、鸟之一”才是这里的互斥多分类。

## 参考资料

- [Dive into Deep Learning：Softmax Regression](https://d2l.ai/chapter_linear-classification/softmax-regression.html)
- [PyTorch：CrossEntropyLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html)
- [PyTorch：BCEWithLogitsLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html)
