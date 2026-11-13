---
title: NumPy 与 PyTorch：张量、梯度与训练
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 数组与张量形状

NumPy 的 `ndarray` 和 PyTorch 的 `Tensor` 都能表示多维数值数组。PyTorch 还支持自动微分、神经网络模块和 GPU 计算。

**形状（Shape）**记录每个维度有多少元素。张量的维数指有多少个轴，不是总元素数，也不是矩阵的秩。

| 数据 | 常用形状 | 各轴含义 |
| --- | --- | --- |
| 一个标量 | `()` | 没有轴 |
| 一个特征向量 | `(d,)` | 特征 |
| 一批表格样本 | `(n, d)` | 样本、特征 |
| 一批分类分数 | `(n, C)` | 样本、类别 |
| 一批图像 | `(n, C, H, W)` | 样本、通道、高、宽 |
| 一批序列表示 | `(n, L, d)` | 样本、序列位置、表示维度 |

图像和序列的轴顺序取决于具体接口，不能仅凭元素总数相同就交换使用。

## 矩阵乘法与逐元素乘法

`*` 表示逐元素乘法，`@` 表示矩阵乘法或相应的矩阵—向量运算。

```python
import numpy as np

X = np.array([[1.0, 2.0], [3.0, 4.0]])
w = np.array([2.0, -1.0])
print(X * w)
print(X @ w)
```

`X * w` 得到 `[[2, -2], [6, -4]]`；`X @ w` 得到 `[0, 2]`，后者计算每一行与权重向量的内积。

批量线性模型 $X\mathbf w+b$ 的形状变化为 $(n,d)@(d,)\rightarrow(n,)$，标量偏置随后加到每个预测值上。

## 广播与维度陷阱

广播（Broadcasting）允许部分形状不同的数组进行逐元素运算。从末尾对齐各轴：长度相等，或其中一个为 1，就能兼容；缺失的前导轴按长度 1 处理。

例如 `(n, d)` 与 `(d,)` 相加，相当于给每一行加同一个向量。`(n, 1)` 与 `(1, d)` 相加，结果为 `(n, d)`。

### 示例：预测与标签形状不一致

```python
import numpy as np

prediction = np.array([[1.0], [2.0], [3.0]])
target = np.array([1.0, 2.0, 3.0])
print((prediction - target).shape)
print(prediction - target[:, None])
```

第一行输出 `(3, 3)`，因为 `(3,1)` 与 `(3,)` 广播成 `(3,3)`，每个预测都与所有标签相减。第二行把标签变为 `(3,1)`，结果才是三行零。

训练前检查预测和标签形状是否与损失定义一致。不能只因为运算没有报错，就认为比较的是同一个样本。

沿 `axis=0` 聚合一批表格数据，会消去样本轴；沿 `axis=1` 聚合分类概率，会消去类别轴。需要继续广播时使用 `keepdims=True` 保留长度为 1 的轴。

## PyTorch 自动微分

为浮点张量设置 `requires_grad=True` 后，PyTorch 会记录相关运算。对标量损失调用 `backward()`，梯度累积到参与求导的叶子张量的 `.grad` 中。

### 示例：手算与自动微分对照

设 $\hat y=wx$，$x=2,y=6,w=1$，损失为 $\frac12(\hat y-y)^2$。手算得到 $\partial\ell/\partial w=(wx-y)x=-8$。

```python
import torch

w = torch.tensor(1.0, requires_grad=True)
x = torch.tensor(2.0)
y = torch.tensor(6.0)
loss = 0.5 * (w * x - y) ** 2
loss.backward()
print(loss.item(), w.grad.item())
```

输出 `8.0 -8.0`。自动微分计算的是当前计算图中的导数，不会自动判断损失是否选对、输入维度是否具有正确含义。

默认情况下，多个 `backward()` 会累积梯度。因此每次独立更新前使用 `optimizer.zero_grad()`。若有意进行梯度累积，则在若干小批次后才更新并清空，并正确处理损失缩放。

## 一个完整的训练例子

下面拟合 $y=2x+1$。`nn.Linear(1, 1)` 对每个样本接收一个特征，输出一个数。输入和标签都为 `(3,1)`。

```python
import torch
from torch import nn

torch.manual_seed(42)
X = torch.tensor([[0.0], [1.0], [2.0]])
y = torch.tensor([[1.0], [3.0], [5.0]])
model = nn.Linear(1, 1)
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
criterion = nn.MSELoss()

model.train()
for _ in range(1000):
    optimizer.zero_grad()
    prediction = model(X)
    loss = criterion(prediction, y)
    loss.backward()
    optimizer.step()

model.eval()
with torch.no_grad():
    prediction = model(X)
    print(prediction.flatten())
    print(criterion(prediction, y).item())
```

预测接近 `[1, 3, 5]`，MSE 接近 0。这里使用 MSE，而[线性回归推导](../models/linear-regression.md)使用半 MSE，梯度相差系数 2，两种代码的学习率不能因此视为完全等价。

`model.train()` 与 `model.eval()` 控制 Dropout、BatchNorm 等层的行为；`torch.no_grad()` 控制是否记录梯度计算。`eval()` 不会自动关闭梯度，`no_grad()` 也不会自动切换这些层的工作模式。

## 数据类型、设备与复现

参数和连续特征通常用 `float32`；数值梯度检查可用 `float64` 降低舍入误差。`CrossEntropyLoss` 的类别编号标签使用 `torch.long`，不能把类别编号当成需要求导的连续变量。

模型与输入必须处于兼容的设备和数据类型。上述例子在 CPU 上运行，不需要 CUDA，也不需要下载模型或数据集。

在独立的 Python 虚拟环境中安装 NumPy 和 CPU 版 PyTorch 即可运行这些例子。GPU 安装命令随平台和驱动条件变化，按 [PyTorch 安装页](https://pytorch.org/get-started/locally/)选择，不把示例依赖加进网站后端或容器。

实验应记录 Python、NumPy、PyTorch 版本。固定随机种子有助于重复实验，但不能保证跨设备、跨版本的浮点结果完全一致。

本组基础笔记的代码已在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 上验证。注明接续上一段的代码需按页面顺序执行。

## 参考资料

- [NumPy：Broadcasting](https://numpy.org/doc/stable/user/basics.broadcasting.html)
- [PyTorch：Quickstart](https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html)
