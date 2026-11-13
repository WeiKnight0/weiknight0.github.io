---
title: 泛化、欠拟合与偏差—方差
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 欠拟合与过拟合

**欠拟合（Underfitting）**指模型没有充分学到任务中的有效规律，训练集上表现就不好。可能是模型表达能力不足、特征不合适、正则化过强，也可能是训练尚未收敛。不能一看到训练损失高就直接增加网络规模。

**过拟合（Overfitting）**指模型过度适应训练数据中的偶然细节，训练表现明显优于未见数据。例如用高次多项式穿过所有带噪声的观测点，却在点与点之间剧烈振荡。

判断时比较同一损失定义、同一评估模式下的训练与验证结果。训练时启用 Dropout、数据增强或将正则项计入损失，可能使记录的训练损失高于验证损失，这本身不表示发生异常。

## 偏差与方差指什么

设固定位置 $x$ 的真实目标为 $y=f(x)+\varepsilon$，其中 $\mathbb E[\varepsilon\mid x]=0$，$\operatorname{Var}(\varepsilon\mid x)=\sigma^2(x)$。

从同一数据分布重复抽取训练集 $\mathcal D$，每次重新训练，得到 $\hat f_{\mathcal D}(x)$。令平均预测 $\bar f(x)=\mathbb E_{\mathcal D}[\hat f_{\mathcal D}(x)]$。

- **偏差（Bias）**：$\bar f(x)-f(x)$，表示平均预测系统性偏离真实关系多少。
- **方差（Variance）**：$\mathbb E_{\mathcal D}[(\hat f_{\mathcal D}(x)-\bar f(x))^2]$，表示更换训练集后，同一位置的预测波动多少。
- **不可约噪声**：$\sigma^2(x)$，表示给定当前输入仍然存在的目标随机性。

这里的偏差不是线性层的偏置参数 $b$，方差也不是一批输入特征的方差。一次训练不能直接测出上述期望，需要重复训练或作额外估计。

## 平方损失的偏差—方差分解

假设测试目标噪声与训练过程独立。固定 $x$，把预测误差拆开：

$$
\hat f_{\mathcal D}(x)-y
=\underbrace{\hat f_{\mathcal D}(x)-\bar f(x)}_{A}
+\underbrace{\bar f(x)-f(x)}_{B}-\varepsilon.
$$

平方展开为 $A^2+B^2+\varepsilon^2+2AB-2A\varepsilon-2B\varepsilon$。由于 $\mathbb E[A]=0$、$\mathbb E[\varepsilon]=0$，以及噪声独立，三个交叉项的期望均为零，得到：

$$
\mathbb E_{\mathcal D,\varepsilon}\left[(\hat f_{\mathcal D}(x)-y)^2\right]
=\underbrace{(\bar f(x)-f(x))^2}_{\text{偏差平方}}
+\underbrace{\mathbb E_{\mathcal D}[(\hat f_{\mathcal D}(x)-\bar f(x))^2]}_{\text{方差}}
+\underbrace{\sigma^2(x)}_{\text{噪声}}.
$$

再对 $x$ 的分布平均，可得到整体预测误差的相应分解。这是平方损失下的结果，不能直接当成 Accuracy、F1 或交叉熵的同一分解公式。

### 示例：同一位置的三次预测

假设 $f(x)=2$，三个等概率训练结果分别预测 1、2、3，测试噪声以相同概率取 $-1$ 和 $1$，且独立于训练结果。

- 平均预测为 2，偏差平方为 0。
- 预测方差为 $(1+0+1)/3=2/3$。
- 噪声方差为 1。
- 期望平方误差为 $0+2/3+1=5/3$。

```python
import numpy as np

predictions = np.array([1.0, 2.0, 3.0])
truth = 2.0
noise = np.array([-1.0, 1.0])
bias_squared = (predictions.mean() - truth) ** 2
variance = predictions.var()
noise_variance = noise.var()
expected_error = ((predictions[:, None] - (truth + noise)) ** 2).mean()
print(bias_squared, variance, noise_variance)
print(expected_error, bias_squared + variance + noise_variance)
```

最后一行两者均约为 `1.666667`。这里枚举全部 6 种等概率组合；`var()` 使用总体平均平方偏差，与此例的离散分布定义一致。

## 模型复杂度与数据量

简单模型可能无法表达真实关系，偏差较大；复杂模型可以拟合更多关系，也可能更敏感于训练样本，方差较大。这是理解很多传统模型的常见模式，但不是“参数增加必然使方差单调增加”的定律。

正则化通常通过增加一定偏差来降低波动。更多有代表性的训练数据有助于减少估计波动，但无法修复错误标签、缺失关键特征或错误评估流程。

训练误差下降而验证误差持续上升，是过拟合线索。训练和验证误差都高，先确认代码能否拟合一个很小的数据子集，再检查模型、输入和优化设置；训练失败也可能表现得像欠拟合。

## 学习曲线

学习曲线有两种常见横轴，含义不同：

| 横轴 | 观察什么 | 常见用途 |
| --- | --- | --- |
| 训练样本数 | 用不同规模训练集重新训练后的误差 | 判断增加数据是否可能有帮助 |
| Step / Epoch | 同一次训练过程中的误差变化 | 判断收敛、振荡、过拟合与早停 |

按训练集大小作曲线时，模型和训练预算应具有可比性，验证集固定。按 Epoch 作曲线时，记录样本加权的平均损失，避免最后一批较小的数据获得过高权重。

## 泛化与分布变化

即使在独立测试集上表现好，部署分布改变后也可能失效。例如训练照片清晰，部署摄像头模糊；训练文本来自新闻，部署文本来自口语聊天。

需要区分“在当前分布上过拟合”和“训练与部署分布不同”。单纯提高正则化不能保证解决分布变化，应重新检查数据覆盖、标签规则和目标场景。

前置：[损失与风险](loss-and-risk.md)、[数据划分](data-splitting.md)。后续：[正则化](regularization.md)、[学习率与训练曲线](learning-rate-and-training.md)。

## 参考资料

- [scikit-learn：Bias-variance decomposition](https://scikit-learn.org/stable/auto_examples/ensemble/plot_bias_variance.html)
- [Dive into Deep Learning：Generalization](https://d2l.ai/chapter_linear-regression/generalization.html)
