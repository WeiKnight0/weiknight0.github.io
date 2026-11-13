---
title: 损失函数、经验风险与期望风险
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 损失函数

损失函数 $\ell(\hat y,y)$ 衡量一次预测与目标的差异。损失通常越小越好，但不同损失强调的错误不同。

### 回归损失

令误差 $e=\hat y-y$。平方损失为 $e^2$，绝对值损失为 $|e|$。对 $n$ 个样本取平均，分别得到均方误差 MSE 和平均绝对误差 MAE：

$$
\operatorname{MSE}=\frac1n\sum_{i=1}^{n}(\hat y_i-y_i)^2,
\qquad
\operatorname{MAE}=\frac1n\sum_{i=1}^{n}|\hat y_i-y_i|.
$$

误差从 1 变为 10 时，平方损失从 1 变为 100，而绝对值损失从 1 变为 10。因此 MSE 对大误差更敏感，异常值也更容易影响拟合结果。

平方损失有时写成 $\frac12e^2$，便于求导时消去系数 2。这个常数不改变不带其他项的最小化问题的最优解，但会改变梯度大小；如果还有正则项，改变损失缩放也会改变两项的相对权重。

### 分类损失

二分类标签 $y\in\{0,1\}$，模型预测正类概率 $p\in(0,1)$。二元交叉熵为：

$$
\ell(p,y)=-y\log p-(1-y)\log(1-p).
$$

当 $y=1$ 时，损失为 $-\log p$；当 $y=0$ 时，损失为 $-\log(1-p)$。使用自然对数。

例如真实类别为 1，预测概率为 0.9 时，损失约为 0.105；预测为 0.1 时，损失约为 2.303。错误且非常自信的预测会受到更大的惩罚。

对互斥的 $C$ 类分类，模型输出概率 $p_0,\ldots,p_{C-1}$，真实类别编号为 $y$，交叉熵为 $-\log p_y$。不能只看预测类别是否正确：真实类别概率为 0.51 和 0.99 时，二分类决策可能相同，但损失明显不同。

概率如何由模型输出得到，见[逻辑回归与 Softmax](../models/logistic-and-softmax-regression.md)。

## 经验风险

对已经收集到的数据取平均损失，称为经验风险（Empirical Risk）：

$$
\hat R_{\mathcal D}(\boldsymbol\theta)=\frac1n\sum_{i=1}^{n}\ell\bigl(f_{\boldsymbol\theta}(\mathbf x_i),y_i\bigr).
$$

它可以直接计算。不同数据集对应不同经验风险，因此必须区分训练损失、验证损失和测试损失。

### 示例：相同总绝对误差，不同平方误差

真实值为 $[2,4]$。模型 A 预测 $[3,5]$，模型 B 预测 $[2,6]$。

| 模型 | 两个样本的误差 | MAE | MSE |
| --- | --- | --- | --- |
| A | $1,1$ | $1$ | $1$ |
| B | $0,2$ | $1$ | $2$ |

MAE 对这两个模型给出相同结果，MSE 更偏好错误分布均匀的 A。

```python
import numpy as np

y = np.array([2.0, 4.0])
predictions = np.array([[3.0, 5.0], [2.0, 6.0]])
errors = predictions - y
print(np.abs(errors).mean(axis=1))
print((errors ** 2).mean(axis=1))
```

输出分别为 `[1. 1.]` 和 `[1. 2.]`。第 0 维区分模型，第 1 维区分样本，所以沿 `axis=1` 对样本求平均。

## 期望风险

实际部署时，模型面对的是数据分布中的新样本。对这个分布求平均，得到期望风险（Expected Risk）：

$$
R(\boldsymbol\theta)=\mathbb E_{(\mathbf x,y)\sim P}
\left[\ell\bigl(f_{\boldsymbol\theta}(\mathbf x),y\bigr)\right].
$$

$P$ 表示希望模型服务的数据分布，$\mathbb E$ 表示按发生概率加权平均。通常不知道完整的 $P$，只能用独立且有代表性的数据估计。

设新样本只有两类情况：90% 的情况下某模型损失为 0，10% 的情况下损失为 10，则期望风险为 $0.9\times0+0.1\times10=1$。某个很小的训练集可能恰好没有出现后一种情况，其经验风险为 0，也不能说明期望风险为 0。

独立同分布（i.i.d.）是常用分析假设：样本之间独立，且来自相同分布。真实数据中的同一用户重复记录、时间变化和医院差异等，都可能使简单随机划分无法模拟部署情形。

## 泛化差距与正则化目标

期望风险与训练经验风险的差 $R(\boldsymbol\theta)-\hat R_{\mathrm{train}}(\boldsymbol\theta)$ 称为一种泛化差距定义。实际常观察验证损失与训练损失的差作为线索，但它不是期望风险的精确值。

为限制拟合方式，训练目标可以加入正则项：

$$
J(\boldsymbol\theta)=\hat R_{\mathrm{train}}(\boldsymbol\theta)+\lambda\Omega(\boldsymbol\theta),
\qquad \lambda\geq0.
$$

例如 $\Omega(\mathbf w)=\frac12\|\mathbf w\|_2^2$ 惩罚大的权重。第一项要求拟合数据，第二项约束参数。$J$ 是训练用的完整目标，不要把含正则项的训练目标直接与不含正则项的验证损失比较。

## 损失与评估指标

训练损失需要便于优化，评估指标需要反映任务目标，两者不一定相同。分类常用交叉熵训练、Accuracy 或 F1 评估；检索训练可以使用对比损失，但最终关注相关结果能否排在前面。

分类正确率在许多参数区域保持不变，无法像平滑损失一样提供有用梯度。交叉熵则能区分“正确类别概率还不够高”和“已经非常确信”的预测。

应同时记录损失与任务指标。详见[模型评估](evaluation.md)。

## 参考资料

- [Dive into Deep Learning：Generalization](https://d2l.ai/chapter_linear-regression/generalization.html)
- [scikit-learn：Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html)
