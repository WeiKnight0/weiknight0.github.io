---
title: 对比学习：正负样本、温度与 InfoNCE
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 正样本与负样本

对比学习训练表示，使相关样本之间的相似度高于不相关候选。

以图像为例，同一原图经过两次增强得到两个视图，可以构成正样本对。其他原图的视图作为负样本候选。这里的“正”表示希望建立关联，不是分类任务中的类别编号 1。

通常先用编码器 $f_\theta$ 得到表示 $\mathbf h=f_\theta(\mathbf x)$，有时再经过投影头 $g_\phi$ 得到用于计算对比损失的 $\mathbf z$。下游任务使用哪一层表示取决于方法，不能把投影头的输出一概当成最终特征。

正样本关系可以来自同一对象的不同视图、相邻时间片、同类标签或图文配对。增强方式决定哪些变化被视为不影响语义，需要与任务匹配。

## 相似度与温度

对非零表示做 L2 归一化 $\bar{\mathbf z}=\mathbf z/\|\mathbf z\|_2$，则两个归一化向量的内积就是余弦相似度。

设锚点为 $\mathbf q$，候选为 $\mathbf k_j$，定义相似度 $s_j=\bar{\mathbf q}^\mathsf T\bar{\mathbf k}_j$。将 $s_j/\tau$ 作为分类分数，$\tau>0$ 称为温度。

温度较小，候选之间相同的相似度差会变成更大的分数差，Softmax 更集中；温度较大，分布更平缓。降低温度不保证学习更好，它也可能放大难负样本和错误配对的影响。

## InfoNCE 形式

假设一个锚点有一个正候选，其编号为 $j^+$，其余为负候选。一种常用损失为：

$$
\ell=-\log\frac{\exp(s_{j^+}/\tau)}{\sum_j\exp(s_j/\tau)}.
$$

分母包含正候选和全部负候选。它相当于在候选集合中进行分类，要求识别真正的正样本。负候选不只是让向量“远一点”，它们还决定了识别任务有多难。

令 $p_j=\operatorname{softmax}(\mathbf s/\tau)_j$，对相似度的导数为：

$$
\frac{\partial\ell}{\partial s_j}=\frac{p_j-\mathbf1[j=j^+]}{\tau}.
$$

正候选梯度不大于零，负候选梯度不小于零；沿负梯度更新会提高正候选相似度、降低负候选相似度。完整参数梯度还要继续经过内积、归一化与编码器，不能停在这个公式。

### 示例：从三个候选中找匹配

- 输入：余弦相似度为 `[1, 0, -1]`，正候选为第 0 个，$\tau=0.5$。
- 分类分数：`[2, 0, -2]`。
- 概率：约为 `[0.8668, 0.1173, 0.0159]`。
- 损失：约为 `0.142932`。

```python
import numpy as np

similarities = np.array([1.0, 0.0, -1.0])
temperature = 0.5
logits = similarities / temperature
shifted = logits - logits.max()
log_p = shifted - np.log(np.exp(shifted).sum())
probabilities = np.exp(log_p)
loss = -log_p[0]
gradient = (probabilities - np.array([1.0, 0.0, 0.0])) / temperature
print(probabilities, loss)
print(gradient)
```

梯度约为 `[-0.2664, 0.2346, 0.0318]`，更像正样本的那个负候选受到更大惩罚。若交换标签，把相似度最低的候选指定为正，损失会变为约 `4.142932`。

## 批内负样本

一批有 $N$ 对匹配数据，第一侧表示矩阵为 $Q\in\mathbb R^{N\times d}$，第二侧为 $K\in\mathbb R^{N\times d}$。每行归一化后计算 $S=QK^\mathsf T/\tau$，形状为 $(N,N)$。

假设第 $i$ 行只与第二侧第 $i$ 行匹配，那么对角线是正样本，非对角线是负候选。每行的目标类别就是行号。

```python
import torch
import torch.nn.functional as F

q = torch.tensor([[1.0, 0.0], [0.0, 1.0]], requires_grad=True)
k = torch.tensor([[1.0, 0.0], [0.0, 1.0]], requires_grad=True)
logits = F.normalize(q, dim=1) @ F.normalize(k, dim=1).T / 0.5
targets = torch.arange(len(q))
row_loss = F.cross_entropy(logits, targets)
column_loss = F.cross_entropy(logits.T, targets)
loss = (row_loss + column_loss) / 2
loss.backward()
print(logits.detach())
print(loss.item())
print(q.grad)
```

分数矩阵为 `[[2, 0], [0, 2]]`，平均双向损失约为 `0.126928`。转置后逐行分类表示反过来从第二侧检索第一侧；这演示了配对式双向目标，完整 CLIP 的结构与训练安排留在多模态模块。

这里向量均非零。`F.normalize` 还通过一个很小的分母下限处理数值情况，但零向量不能据此解释为具有定义良好的余弦方向。

## SimCLR 的两视图结构

对 $N$ 张原图各生成两个视图，共有 $2N$ 个表示。对每个锚点，同一原图的另一视图为正样本，其余原图的 $2N-2$ 个视图为负样本；锚点自身从分母排除。因此每个锚点实际比较 $2N-1$ 个候选。

若表示排列为 `[视图A的N个, 视图B的N个]`，第 $i$ 个锚点的正样本编号为 $(i+N)\bmod 2N$。

```python
import torch
import torch.nn.functional as F

z = torch.tensor([[1.0, 0.0], [0.0, 1.0], [0.9, 0.1], [0.1, 0.9]], requires_grad=True)
normalized = F.normalize(z, dim=1)
scores = normalized @ normalized.T / 0.5
self_mask = torch.eye(len(z), dtype=torch.bool)
scores = scores.masked_fill(self_mask, float('-inf'))
targets = (torch.arange(len(z)) + len(z) // 2) % len(z)
loss = F.cross_entropy(scores, targets)
loss.backward()
print(targets)
print(loss.item())
```

目标编号为 `[2, 3, 0, 1]`，自身分数被屏蔽。不能直接把对角线当正样本，否则模型只需识别“自己与自己相同”。

## 负样本、坍塌与评估

如果所有表示都相同，各候选难以区分；对 $K$ 个等分数候选，单正样本损失为 $\log K$。对比目标要求建立差异，但不能因此声称任何优化过程都不会停在坍塌状态。

同一批中的其他样本可能实际语义相同，此时把它当负样本会形成假负样本。多正样本任务需要重新定义标签与损失，不能继续假设只有对角线正确。

更大的候选集合提供更多比较，也消耗更多内存。计算全部两两相似度需要约 $O(N^2d)$ 时间、$O(N^2)$ 分数存储；它还可能引入更多假负样本。

训练对比损失下降不自动等于下游质量提高，应检查冻结特征的分类效果或实际检索指标。InfoNCE 与互信息下界的联系还依赖采样和分布假设，不能把任意批内对比损失值直接报告为真实互信息。

## 参考资料

- [Contrastive Predictive Coding](https://arxiv.org/abs/1807.03748)
- [SimCLR](https://arxiv.org/abs/2002.05709)
- [CLIP](https://arxiv.org/abs/2103.00020)
