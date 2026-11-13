---
title: 动态规划：策略评估、策略迭代与价值迭代
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 使用条件

强化学习中的动态规划（Dynamic Programming，DP）假设有限 MDP 的转移概率和期望奖励已知。它使用完整模型计算期望，不需要从环境采样轨迹。

DP 适合解释 Bellman 方程和最优控制，但大状态空间下遍历全部状态、动作和下一状态代价很高；未知模型时也不能直接使用。

下面统一使用两个非终止状态和一个隐式终止状态：

- 状态 0：动作 0 终止且奖励 0；动作 1 到状态 1，奖励 0；
- 状态 1：动作 0 到状态 0，奖励 0；动作 1 终止且奖励 1。

`P[s,a,s2]` 只保存转移到非终止状态的概率，因此终止转移对应行和为 0。

```python
import numpy as np

P = np.zeros((2, 2, 2))
R = np.zeros((2, 2))
P[0, 1, 1] = 1.0
P[1, 0, 0] = 1.0
R[1, 1] = 1.0
gamma = 0.9
policy = np.full((2, 2), 0.5)
```

## 迭代策略评估

固定策略 $\pi$，反复应用 Bellman Expectation Backup：

$$
V_{k+1}(s)=\sum_a\pi(a\mid s)
\sum_{s',r}p(s',r\mid s,a)[r+\gamma V_k(s')].
$$

同步更新使用完整旧 $V_k$ 计算新数组；原地更新会立即使用本轮新值，仍可能收敛但迭代轨迹不同。停止条件常用最大变化量 $\max_s|V_{k+1}(s)-V_k(s)|<\theta$。

```python
value = np.zeros(2)
while True:
    action_values = R + gamma * np.einsum('sat,t->sa', P, value)
    updated = (policy * action_values).sum(axis=1)
    if np.max(np.abs(updated - value)) < 1e-10:
        value = updated
        break
    value = updated
print(value)
```

均匀策略的价值约为 `[0.2821, 0.6270]`。状态 1 更有价值，因为一半概率立即选择奖励为 1 的终止动作。

## 策略改进

已知 $V^\pi$ 后，对每个状态计算一步前瞻：

$$
q_\pi(s,a)=\sum_{s',r}p(s',r\mid s,a)
[r+\gamma V^\pi(s')].
$$

选择最大动作得到 Greedy 策略。如果新策略与旧策略相同，则策略已经稳定；有限 MDP 下可得到最优策略。

```python
action_values = R + gamma * np.einsum('sat,t->sa', P, value)
greedy_actions = action_values.argmax(axis=1)
improved_policy = np.eye(2)[greedy_actions]
print(action_values)
print(greedy_actions)
```

两个状态都选择动作 1：状态 0 先前往状态 1，状态 1 再获得奖励并终止。

并列最大动作可以任选，也可以在最大动作之间均匀随机。用浮点数判断策略是否稳定时，应比较选中的动作集合或容差，不依赖两个计算路径完全逐位相等。

## 策略迭代

策略迭代交替执行：

1. Policy Evaluation：求当前策略价值；
2. Policy Improvement：对该价值变为 Greedy；
3. 策略稳定则停止，否则继续。

评估不一定每次都精确收敛；Modified Policy Iteration 只执行有限次评估 Backup，再做改进，连接了策略迭代与价值迭代。

```python
policy = np.full((2, 2), 0.5)
for _ in range(10):
    value = np.zeros(2)
    for _ in range(1000):
        action_values = R + gamma * np.einsum('sat,t->sa', P, value)
        updated = (policy * action_values).sum(axis=1)
        if np.max(np.abs(updated - value)) < 1e-10:
            break
        value = updated
    greedy_actions = action_values.argmax(axis=1)
    new_policy = np.eye(2)[greedy_actions]
    if np.array_equal(new_policy, policy):
        break
    policy = new_policy
print(value)
print(policy)
```

最优策略在两状态都选动作 1，最优价值为 `[0.9,1.0]`。

## 价值迭代

价值迭代直接应用 Bellman Optimality Backup：

$$
V_{k+1}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)
[r+\gamma V_k(s')].
$$

收敛后再对 $V^*$ 取 Greedy 动作得到最优策略。

```python
value = np.zeros(2)
while True:
    action_values = R + gamma * np.einsum('sat,t->sa', P, value)
    updated = action_values.max(axis=1)
    if np.max(np.abs(updated - value)) < 1e-10:
        value = updated
        break
    value = updated
optimal_actions = (R + gamma * np.einsum('sat,t->sa', P, value)).argmax(axis=1)
print(value)
print(optimal_actions)
```

结果同样为价值 `[0.9,1.0]`、动作 `[1,1]`。价值迭代中的中间价值通常不是某个当前策略的精确价值，不应把每轮 `argmax` 的性能当作已完成策略评估。

## Backup 与计算量

一个状态的完整 Backup 要枚举动作和可能下一状态。稠密有限 MDP 每轮约为 $O(|\mathcal S|^2|\mathcal A|)$；转移稀疏时应只遍历非零后继。

终止转移不 Bootstrap。仅因时间限制截断的状态若底层任务未终止，则不应机械设下一价值为 0。

## 参考资料

- [Reinforcement Learning: An Introduction, Chapter 4](http://incompleteideas.net/book/the-book-2nd.html)
- [MDP、价值函数与 Bellman 方程](mdp-and-value.md)
