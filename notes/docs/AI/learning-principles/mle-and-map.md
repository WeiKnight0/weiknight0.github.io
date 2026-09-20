---
title: 参数估计：最大似然与最大后验
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 概率与似然

设硬币正面概率为 $\theta$。已知 $\theta=0.5$，问某个抛掷序列出现的概率，是把参数固定、观察数据的不确定性。已经观察到序列，比较不同 $\theta$ 对它的解释能力，则是把数据固定、将表达式看成参数的函数，称为**似然（Likelihood）**。

记数据为 $\mathcal D$，似然为 $L(\theta;\mathcal D)=p(\mathcal D\mid\theta)$。它不是参数的概率分布，不要求对 $\theta$ 积分或求和为 1。连续观测使用概率密度构造似然，密度值可以大于 1。

## 最大似然估计

最大似然估计（Maximum Likelihood Estimation，MLE）选择使已观察数据的似然最大的参数：

$$
\hat\theta_{\mathrm{MLE}}\in\operatorname*{arg\,max}_{\theta}p(\mathcal D\mid\theta).
$$

对于独立同分布样本，$p(\mathcal D\mid\theta)=\prod_{i=1}^np(x_i\mid\theta)$。连乘容易下溢，且不便求导，因此通常最大化对数似然：

$$
\log L(\theta)=\sum_{i=1}^{n}\log p(x_i\mid\theta).
$$

对数严格单调递增，所以不改变最优参数。取负号后，就得到训练中常最小化的负对数似然（NLL）。监督学习可对给定输入的条件概率 $p(y_i\mid\mathbf x_i,\boldsymbol\theta)$ 作相同处理。

### 示例：估计硬币的正面概率

独立抛掷 $n$ 次，正面 $k$ 次。给定具体序列的似然为 $L(\theta)=\theta^k(1-\theta)^{n-k}$。如果只记录正面次数，会多出与参数无关的组合数，不影响这里的最优解。

当 $0<k<n$ 时，对数似然的导数为：

$$
\frac{\mathrm d\log L}{\mathrm d\theta}
=\frac k\theta-\frac{n-k}{1-\theta}=0
\quad\Longrightarrow\quad
\hat\theta_{\mathrm{MLE}}=\frac kn.
$$

二阶导数为 $-k/\theta^2-(n-k)/(1-\theta)^2<0$，因此内部驻点为最大值。若没有正面，最大值在边界 0；全为正面则在边界 1。

- 输入：10 次抛掷，8 次正面。
- 输出：$\hat\theta_{\mathrm{MLE}}=0.8$。
- 解释：它最符合这 10 次观测，但没有表达“小样本估计仍然不确定”。

## 最大后验估计

最大后验估计（Maximum A Posteriori，MAP）还考虑参数的先验分布 $p(\theta)$。Bayes 公式给出：

$$
p(\theta\mid\mathcal D)
=\frac{p(\mathcal D\mid\theta)p(\theta)}{p(\mathcal D)}.
$$

分母与待优化参数无关，因此：

$$
\hat\theta_{\mathrm{MAP}}\in\operatorname*{arg\,min}_{\theta}
\left[-\log p(\mathcal D\mid\theta)-\log p(\theta)\right].
$$

第一项要求解释数据，第二项体现先验偏好。MLE 只使用似然；MAP 使用似然与先验；完整 Bayesian 推断保留后验分布，而不是只取一个最高点。

### 示例：同一枚硬币加入先验

选择 Beta 先验 $p(\theta)\propto\theta^{\alpha-1}(1-\theta)^{\beta-1}$，其中 $\alpha,\beta>0$。乘以似然后，后验为 $\operatorname{Beta}(k+\alpha,n-k+\beta)$。

当后验两个形状参数都大于 1 时，后验众数位于内部：

$$
\hat\theta_{\mathrm{MAP}}=\frac{k+\alpha-1}{n+\alpha+\beta-2}.
$$

取 $\alpha=\beta=2$，先验偏向中间概率。对 8 次正面、2 次反面，MAP 为 $9/12=0.75$。相比 MLE 的 0.8，结果向 0.5 收缩。

后验均值为 $(k+\alpha)/(n+\alpha+\beta)=10/14\approx0.7143$，**不是 MAP**。内部众数公式也不能直接用于后验形状参数不大于 1 的边界情况。

```python
import numpy as np

n, k = 10, 8
alpha, beta = 2.0, 2.0
mle = k / n
map_estimate = (k + alpha - 1) / (n + alpha + beta - 2)
posterior_mean = (k + alpha) / (n + alpha + beta)
theta = np.linspace(0.001, 0.999, 999)
log_likelihood = k * np.log(theta) + (n - k) * np.log1p(-theta)
log_posterior = log_likelihood + (alpha - 1) * np.log(theta) + (beta - 1) * np.log1p(-theta)
print(mle, map_estimate, posterior_mean)
print(theta[log_likelihood.argmax()], theta[log_posterior.argmax()])
```

输出约为 `0.8 0.75 0.714286`，网格搜索的两个最大位置为 `0.8 0.75`。网格只用于核验这个一维例子。

## 平方误差从哪里来

假设回归目标满足 $y_i=f_{\boldsymbol\theta}(\mathbf x_i)+\varepsilon_i$，噪声独立、服从均值 0 且方差相同的 Gaussian 分布 $\mathcal N(0,\sigma^2)$，并固定 $\sigma^2>0$。则：

$$
-\log p(\mathbf y\mid X,\boldsymbol\theta)
=\frac n2\log(2\pi\sigma^2)
+\frac1{2\sigma^2}\sum_{i=1}^{n}\left(y_i-f_{\boldsymbol\theta}(\mathbf x_i)\right)^2.
$$

第一项不依赖模型参数，第二项与平方误差和成正比。因此，在这些假设下，MLE 等价于最小二乘。若噪声采用 Laplace 分布，会得到绝对误差形式；损失选择对应不同的建模假设。

分类的 Bernoulli/Categorical 条件模型对应交叉熵，推导见[逻辑回归与 Softmax](../models/logistic-and-softmax-regression.md)。

## Gaussian 先验与 L2 正则化

假设权重先验为 $\mathbf w\sim\mathcal N(\mathbf0,\tau^2I)$，偏置不作惩罚。忽略与权重无关的常数，负对数先验为 $\|\mathbf w\|_2^2/(2\tau^2)$。

结合上面的 Gaussian 噪声模型，再把整个 MAP 目标乘以 $\sigma^2/n$，得到：

$$
J(\mathbf w,b)=\frac1{2n}\sum_i(\hat y_i-y_i)^2
+\frac\lambda2\|\mathbf w\|_2^2,
\qquad \lambda=\frac{\sigma^2}{n\tau^2}.
$$

先验方差越小，参数越集中在零附近，惩罚越强。这个 $\lambda$ 关系依赖此处的损失缩放约定，不能脱离“求和还是平均”直接套用。L1 则可以由独立 Laplace 权重先验得到。

MAP 给出一个点估计，不自动提供预测不确定性；换参数化方式后，连续密度的众数也可能改变。实际模型中正则化系数通常通过验证集选择，未必显式指定一个真实先验方差。

后续：[正则化](regularization.md)。

## 参考资料

- [Dive into Deep Learning：Maximum Likelihood](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/maximum-likelihood.html)
- [Dive into Deep Learning：Weight Decay](https://d2l.ai/chapter_linear-regression/weight-decay.html)
