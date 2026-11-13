---
title: 模型评估：回归、分类与检索
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 回归指标

对 $n$ 个样本，真实值为 $y_i$，预测值为 $\hat y_i$。

| 指标 | 定义 | 含义 |
| --- | --- | --- |
| MAE | $\frac1n\sum_i\lvert\hat y_i-y_i\rvert$ | 平均绝对误差，与目标同单位 |
| MSE | $\frac1n\sum_i(\hat y_i-y_i)^2$ | 放大较大的误差，单位为目标单位的平方 |
| RMSE | $\sqrt{\operatorname{MSE}}$ | 回到目标原单位，仍强调大误差 |

决定系数 $R^2$ 把模型与“始终预测评估集真实值均值”的误差基准比较：

$$
R^2=1-\frac{\sum_i(y_i-\hat y_i)^2}{\sum_i(y_i-\bar y)^2},
\qquad \bar y=\frac1n\sum_i y_i.
$$

完美预测时 $R^2=1$；与这个均值基准误差相同则为 0；更差时可以为负。这里使用评估集均值定义指标，不是建议部署时使用未知的评估标签作预测。

若所有 $y_i$ 都相同，分母为零，上式没有普通的有限定义，需要说明所用工具的处理约定。

### 示例：回归误差

- 输入：真实值 `[1, 2, 3]`，预测值 `[1, 2, 4]`。
- MAE：$1/3$。
- MSE：$1/3$，RMSE：$\sqrt{1/3}\approx0.5774$。
- $R^2$：真实均值为 2，总离差平方和为 2，所以 $R^2=1-1/2=0.5$。

## 二分类混淆矩阵

先明确哪个类别叫正类。例如垃圾邮件检测中，以“垃圾邮件”为正类。

| 真实类别 / 预测类别 | 预测为正 | 预测为负 |
| --- | --- | --- |
| 真实为正 | TP：正确检出 | FN：漏检 |
| 真实为负 | FP：误报 | TN：正确排除 |

由此得到：

$$
\operatorname{Accuracy}=\frac{TP+TN}{TP+TN+FP+FN},
\qquad
\operatorname{Precision}=\frac{TP}{TP+FP},
\qquad
\operatorname{Recall}=\frac{TP}{TP+FN}.
$$

Precision 回答“判为正的样本中，有多少是真的”；Recall 回答“所有真正的正样本中，找到了多少”。两者的分母不同。

F1 是 Precision 与 Recall 的调和平均，在分母有效时可化为：

$$
F_1=\frac{2PR}{P+R}=\frac{2TP}{2TP+FP+FN}.
$$

### 示例：垃圾邮件检测

100 封邮件里有 20 封垃圾邮件。模型标出 15 封，其中 12 封确实是垃圾邮件。

- TP 为 12，FP 为 3，FN 为 8，TN 为 77。
- Accuracy 为 $89/100=0.89$。
- Precision 为 $12/15=0.8$。
- Recall 为 $12/20=0.6$。
- F1 为 $24/35\approx0.6857$。

```python
tp, fp, fn, tn = 12, 3, 8, 77
accuracy = (tp + tn) / (tp + fp + fn + tn)
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * tp / (2 * tp + fp + fn)
print(accuracy, precision, recall, f1)
```

这组数据各分母非零。真实评估中若没有预测正类，Precision 的分母为零；若没有真实正类，Recall 的分母为零。应明确采用“未定义”还是工具指定的数值约定，同时报告对应类别的样本数。

## 类别不平衡与阈值

若 1000 个样本中只有 10 个正类，全部预测为负也有 99% Accuracy，但 Recall 为 0。只报告正确率会掩盖模型完全没有检出正类的问题。

分类模型先输出概率，再使用阈值。降低正类阈值会使预测正类集合扩大，因此 Recall 不会下降，但 Precision 不保证单调变化。阈值应按误报、漏报代价在验证集选择。

ROC 曲线以假正率 $FP/(FP+TN)$ 为横轴、真正率 Recall 为纵轴，考察不同阈值。ROC-AUC 衡量排序区分能力，不等于正确率，也不保证概率校准。

PR 曲线展示不同阈值下的 Precision 与 Recall。正类稀少且关注检出质量时，通常还应观察 PR 曲线及 Average Precision；Average Precision 与某些工具用梯形积分计算的 PR-AUC 不是完全相同的定义。

## 多分类汇总

可以把每一类分别视为正类，其余类别视为负类，计算各类 Precision、Recall、F1。

- **Macro**：先计算每一类指标，再直接平均，各类别权重相同。
- **Weighted**：按每类真实样本数加权平均，常见类别权重更大。
- **Micro**：先汇总各类 TP、FP、FN，再计算指标。

Macro-F1 是各类 F1 的平均，不是先算 Macro-Precision 和 Macro-Recall 再求 F1。在单标签、覆盖所有类别的普通多分类中，Micro-Precision、Micro-Recall、Micro-F1 都等于 Accuracy；多标签任务不满足这个结论。

## 检索指标

检索返回一个排序列表。设某个查询的相关结果集合为 $G$，前 $K$ 个结果集合为 $T_K$，且 $G$ 非空。

$$
\operatorname{Precision@K}=\frac{|T_K\cap G|}{K},
\qquad
\operatorname{Recall@K}=\frac{|T_K\cap G|}{|G|}.
$$

前者衡量前 $K$ 个结果有多少相关，后者衡量所有相关结果找回多少。这里假设候选数量至少为 $K$，并且结果不重复。

若每个查询恰好只有一个正确匹配，Recall@K 就等于“是否在前 K 个中命中”；对全部查询求平均，得到命中比例。部分图文检索基准即使存在多个匹配，也把“前 K 中至少命中一个”的比例称为 R@K，阅读论文时必须核对定义。

MRR 关注第一个相关结果的位置。若第 $q$ 个查询的首个相关结果排名为 $r_q$，则：

$$
\operatorname{MRR}=\frac1Q\sum_{q=1}^{Q}\frac1{r_q}.
$$

在规定的检索范围内没有相关结果时，该查询贡献记为 0，并注明是否使用截断范围。

### 示例：同样命中，排序不同

查询有两个相关结果 A、B，返回顺序为 `[C, A, D, B]`，取 $K=3$。

- Precision@3 为 $1/3$。
- Recall@3 为 $1/2$。
- 第一个相关结果在第 2 位，倒数排名为 $1/2$。

若把 A 放到第一位，Precision@3 与 Recall@3 不变，但倒数排名提高到 1。

## 如何报告结果

首先说明[数据划分](data-splitting.md)和测试对象，再报告与任务对应的指标、样本数和汇总方式。比较两个模型时使用相同划分与评估流程。

对受随机初始化影响的训练，记录多次运行的均值和波动；不能只挑最好的一次。损失下降而任务指标下降时，检查阈值、类别不平衡、校准和分布变化，不要只看一个数字。

## 参考资料

- [scikit-learn：Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html)
