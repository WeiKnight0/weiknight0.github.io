---
title: 多臂老虎机：估计、探索与 UCB
date: 2026-09-10T00:00:00
lang: zh-cn
---

## $k$ 臂老虎机

多臂老虎机有 $k$ 个动作。每一步选择 $A_t$ 后立即得到奖励 $R_t$，动作不影响下一状态，因为问题中没有状态转移。

动作 $a$ 的真实价值为：

$$
q_*(a)=\mathbb E[R_t\mid A_t=a].
$$

智能体不知道 $q_*(a)$，只能通过采样维护估计 $Q_t(a)$。Bandit 集中研究探索与利用；当动作还会影响未来状态时，问题才进入完整 MDP。

## 样本平均与增量更新

动作 $a$ 被选择 $N_t(a)$ 次、奖励为 $R_1^a,\ldots,R_{N_t(a)}^a$ 时，样本平均估计为：

$$
Q_t(a)=\frac1{N_t(a)}\sum_{i=1}^{N_t(a)}R_i^a.
$$

新奖励到来后不必保存历史：

$$
Q_{n+1}=Q_n+\frac1n(R_n-Q_n).
$$

```python
import torch

rewards = torch.tensor([1.0, 0.0, 2.0, 1.0])
estimate = 0.0
for count, reward in enumerate(rewards, start=1):
    estimate += (reward.item() - estimate) / count
print(estimate, rewards.mean().item())
```

增量结果与直接平均相同，都是 1。$R_n-Q_n$ 称为估计误差，步长 $1/n$ 使所有历史样本权重相同。

## Greedy 与 $\epsilon$-Greedy

Greedy 总选当前估计最大的动作：

$$
A_t=\arg\max_a Q_t(a).
$$

早期随机奖励可能让次优动作暂时领先，纯 Greedy 此后不再尝试其他动作。$\epsilon$-greedy 以 $1-\epsilon$ 概率选 Greedy 动作，以 $\epsilon$ 概率在全部动作中均匀随机选择。

因此最优动作也可能由随机分支选中，其总概率不是简单的 $1-\epsilon$。并列最大值应随机打破，否则固定取最小索引会引入动作编号偏差。

```python
import numpy as np

rng = np.random.default_rng(42)
true_values = np.array([0.0, 0.4, 1.0])
estimates = np.zeros(3)
counts = np.zeros(3, dtype=int)
actions = []
for _ in range(2000):
    if rng.random() < 0.1:
        action = rng.integers(3)
    else:
        best = np.flatnonzero(estimates == estimates.max())
        action = rng.choice(best)
    reward = rng.normal(true_values[action], 1.0)
    counts[action] += 1
    estimates[action] += (reward - estimates[action]) / counts[action]
    actions.append(action)
print(estimates)
print(counts)
print(np.mean(np.array(actions[-500:]) == 2))
```

所有动作都会被采样，后 500 步大部分选择真实最优动作 2。一次随机运行不能代表期望性能，正式比较应对多个独立 Bandit 和随机种子取平均。

## 乐观初值

把初始 $Q_1(a)$ 设得高于可能的真实价值，Greedy 在某动作采样后会降低其估计，从而转向尚未尝试的动作。这产生早期探索。

乐观初值只在估计仍受初值影响时有效。样本平均最终会淡化初值；非平稳任务中若使用固定步长，初值影响也会指数衰减。它需要知道合理奖励尺度，并不适合所有问题。

## UCB

Upper Confidence Bound 同时考虑当前估计与不确定性：

$$
A_t=\arg\max_a\left[
Q_t(a)+c\sqrt{\frac{\ln t}{N_t(a)}}
\right].
$$

第二项是探索奖励。动作选择次数越少，不确定性项越大；总时间增加而某动作长期未选时，该动作会重新获得探索机会。$c>0$ 控制探索强度。

在使用公式前先让每个动作至少执行一次，避免 $N_t(a)=0$。

```python
import numpy as np

rng = np.random.default_rng(42)
true_values = np.array([0.0, 0.4, 1.0])
estimates = np.zeros(3)
counts = np.zeros(3, dtype=int)
for step in range(1, 1001):
    if step <= 3:
        action = step - 1
    else:
        bonus = 1.5 * np.sqrt(np.log(step) / counts)
        action = np.argmax(estimates + bonus)
    reward = rng.normal(true_values[action], 1.0)
    counts[action] += 1
    estimates[action] += (reward - estimates[action]) / counts[action]
print(estimates)
print(counts)
```

UCB 是根据不确定性确定性选动作，不是 $\epsilon$-greedy 的随机探索。上述公式基于平稳、独立奖励等条件；不能直接视为任意强化学习任务的置信上界。

## 非平稳 Bandit

若真实动作价值随时间变化，样本平均把很久以前的数据与当前数据等权处理，跟踪过慢。固定步长更新为：

$$
Q_{t+1}(a)=Q_t(a)+\alpha(R_t-Q_t(a)),\qquad0<\alpha\le1.
$$

最近奖励权重较大，旧数据权重按 $(1-\alpha)^k$ 衰减。$\alpha$ 大则适应快、估计噪声也大。

```python
rewards = [0.0] * 5 + [1.0] * 5
sample_average = 0.0
constant_step = 0.0
for count, reward in enumerate(rewards, start=1):
    sample_average += (reward - sample_average) / count
    constant_step += 0.2 * (reward - constant_step)
print(sample_average, constant_step)
```

环境后半段价值变为 1 后，样本平均只有 0.5，固定步长估计更偏向最近奖励。

## Regret

累计伪遗憾衡量与始终选择最优动作相比损失的期望价值：

$$
\operatorname{Regret}(T)=
\sum_{t=1}^{T}\left[q_*(a^*)-q_*(A_t)\right].
$$

实际单次奖励有噪声，不能把“最优均值减实际奖励”直接当作每步伪遗憾。实验还常报告平均奖励与最优动作选择率，三者含义不同。

Contextual Bandit 在每步选择前还给出上下文，但动作仍只影响即时奖励；若动作改变后续上下文分布，就需要 MDP 建模。

## 参考资料

- [Reinforcement Learning: An Introduction, Chapter 2](http://incompleteideas.net/book/the-book-2nd.html)
