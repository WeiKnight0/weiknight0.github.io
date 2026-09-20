---
title: 学习目标：数据、模型与训练
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 数据与任务

假设要根据房屋面积预测价格。一条已成交记录包含输入“面积”和目标“价格”；许多这样的记录构成训练数据。模型需要从这些记录中学习关系，再对未见过的房屋作出预测。

在监督学习中，将数据集写成 $\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{n}$。

| 符号 | 含义 | 房价例子 |
| --- | --- | --- |
| $n$ | 样本数 | 已成交房屋数量 |
| $\mathbf x_i\in\mathbb R^d$ | 第 $i$ 个样本的特征向量 | 面积、房龄等 $d$ 个特征 |
| $y_i$ | 目标值或标签 | 成交价格 |
| $\hat y_i$ | 模型预测值 | 预测价格 |

**回归（Regression）**预测连续数值，例如价格、温度；**分类（Classification）**预测离散类别，例如是否为垃圾邮件。分类模型常先输出类别概率，再根据概率作出决策。

输入并不总是人工整理的表格。图片可以表示为像素张量，文本可以表示为 Token 编号序列。但 Token 编号只是索引，编号大小本身不表示词语语义的大小。

## 模型、参数与超参数

模型记作 $\hat y=f_{\boldsymbol\theta}(\mathbf x)$，其中 $\boldsymbol\theta$ 是需要从数据中学习的参数。

只有面积一个特征时，可以先使用 $\hat y=wx+b$：$w$ 决定面积变化对预测价格的影响，$b$ 是截距。选择这条直线形式是建模；根据训练数据确定 $w,b$ 是训练。

**参数（Parameter）**由训练过程更新，例如权重和偏置。**超参数（Hyperparameter）**控制模型或训练过程，例如学习率、正则化强度、网络层数。超参数通常借助验证集选择，不能反复查看测试结果来选择。

| 项目 | 在线性回归中的例子 |
| --- | --- |
| 输入 | 面积 $x$ |
| 模型 | $wx+b$ |
| 参数 | $w,b$ |
| 损失 | 预测值与真实值的平方误差 |
| 优化方法 | 梯度下降 |
| 超参数 | 学习率、迭代次数 |

## 学习目标

单个样本的预测好坏由损失函数 $\ell(\hat y,y)$ 衡量。对训练集取平均，得到训练目标的一种基本形式：

$$
J(\boldsymbol\theta)=\frac1n\sum_{i=1}^{n}\ell\bigl(f_{\boldsymbol\theta}(\mathbf x_i),y_i\bigr),
\qquad
\boldsymbol\theta^*\in\operatorname*{arg\,min}_{\boldsymbol\theta}J(\boldsymbol\theta).
$$

$\operatorname*{arg\,min}$ 表示使目标取得最小值的参数，而不是最小损失值本身。这里写成集合形式，是因为最优参数不一定唯一。

模型形式、损失函数和优化方法是三个不同的选择。同一个线性模型可以使用平方损失，也可以使用绝对值损失；同一个目标可以用梯度下降，也可能存在直接求解方法。

训练损失低不等于新样本上表现好。真正关心的是模型对未见数据的**泛化（Generalization）**能力，详见[损失与风险](loss-and-risk.md)。

## 一次训练更新

梯度 $\nabla_{\boldsymbol\theta}J$ 表示目标对各参数的局部变化率。梯度下降沿负梯度更新：

$$
\boldsymbol\theta\leftarrow\boldsymbol\theta-\eta\nabla_{\boldsymbol\theta}J,
$$

其中 $\eta>0$ 是学习率。它控制每次更新走多远，并不保证任意大小都能使损失下降。

对一批数据，训练依次执行：

1. 将输入送入模型，计算预测值。
2. 比较预测与标签，计算损失。
3. 求损失对参数的梯度。
4. 使用梯度更新参数。
5. 使用更新后的参数处理下一批数据。

一次参数更新叫一个 **Step**；完整使用一遍训练集叫一个 **Epoch**；一次更新使用的样本集合叫一个 **Batch**。例如 1000 个样本、批量大小 128、保留最后不足一批的数据，一个 Epoch 包含 8 次更新。

### 示例：手算一次更新

设模型为 $\hat y=wx$，一个样本为 $x=2,y=6$，损失取 $\ell=\frac12(wx-y)^2$。

- 输入：初始参数 $w=1$，学习率 $\eta=0.1$。
- 初始预测：$\hat y=2$，损失为 $\frac12(2-6)^2=8$。
- 梯度：$\frac{\partial\ell}{\partial w}=(wx-y)x=-8$。
- 更新：$w=1-0.1\times(-8)=1.8$。
- 新预测：$\hat y=3.6$，新损失为 $2.88$。

```python
x, y = 2.0, 6.0
w, learning_rate = 1.0, 0.1
prediction = w * x
loss_before = 0.5 * (prediction - y) ** 2
gradient = (prediction - y) * x
w -= learning_rate * gradient
loss_after = 0.5 * (w * x - y) ** 2
print(w, loss_before, loss_after)
```

输出约为 `1.8 8.0 2.88`。这里使用一个样本演示更新，不足以评估模型能否泛化。

## 训练与推理

**训练（Training）**利用数据与目标更新参数；**推理（Inference）**使用已经确定的参数计算输出，通常不需要标签，也不更新参数。

验证阶段同样进行前向计算，还会使用标签计算评估结果，但不通过这些标签反向传播更新参数。验证结果可以影响学习率、早停和模型选择，因此验证集也参与了开发决策，不能替代最终测试集。

后续阅读：[线性回归](../models/linear-regression.md)、[数据划分](data-splitting.md)。

## 参考资料

- [Dive into Deep Learning：Linear Regression](https://d2l.ai/chapter_linear-regression/linear-regression.html)
- [PyTorch：Quickstart](https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html)
