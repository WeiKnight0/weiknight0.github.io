---
title: 无模型预测：Monte Carlo 与 TD(0)
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 固定策略预测

本页只解决 Prediction：给定策略 $\pi$，用实际交互估计 $V^\pi(s)$。环境转移模型未知，因此不能像动态规划那样枚举所有后继。

Monte Carlo（MC）和 Temporal-Difference（TD）都从经验学习：MC 等 Episode 结束得到完整回报；TD 使用下一状态当前估计进行 Bootstrap。

以下使用 Random Walk：非终止状态为 1 至 5，每步等概率向左或向右；到达 0 终止奖励 0，到达 6 终止奖励 1。固定随机策略下真实价值为 $V(s)=s/6$。

```python
import numpy as np

rng = np.random.default_rng(42)

def generate_episode():
    state = 3
    episode = []
    while 0 < state < 6:
        next_state = state + rng.choice((-1, 1))
        reward = float(next_state == 6)
        episode.append((state, reward, next_state))
        state = next_state
    return episode

episode = generate_episode()
print(episode)
```

## Monte Carlo Prediction

MC 对访问过的状态使用实际回报：

$$
V(S_t)\leftarrow V(S_t)+\alpha[G_t-V(S_t)].
$$

$G_t$ 在 Episode 结束后才能完整计算，因此 MC 不 Bootstrap，也不需要环境模型。

First-Visit MC 每个 Episode 只更新状态第一次出现的位置；Every-Visit MC 更新每次出现。一个 Episode 中状态可能反复出现，两者的有限样本结果不同，但在适当条件下都可收敛到同一价值。

```python
mc_value = np.zeros(7)
returns_sum = np.zeros(7)
returns_count = np.zeros(7, dtype=int)
for _ in range(5000):
    episode = generate_episode()
    visited = set()
    final_return = episode[-1][1]
    for state, _, _ in episode:
        if state in visited:
            continue
        visited.add(state)
        returns_sum[state] += final_return
        returns_count[state] += 1
        mc_value[state] = returns_sum[state] / returns_count[state]
print(mc_value[1:6])
```

这里 $\gamma=1$，且只有终止转移可能得到奖励 1，所以每个状态的回报就是最终是否从右端终止。估计应接近 `[1/6,2/6,3/6,4/6,5/6]`。

## TD(0) Prediction

TD(0) 每次转移后立即使用一步目标：

$$
Y_t=R_{t+1}+\gamma V(S_{t+1}),
$$

$$
V(S_t)\leftarrow V(S_t)+\alpha[Y_t-V(S_t)].
$$

$\delta_t=Y_t-V(S_t)$ 称为 TD Error。若下一状态真正终止，Bootstrap 项为 0。

```python
td_value = np.zeros(7)
alpha = 0.05
for _ in range(5000):
    for state, reward, next_state in generate_episode():
        continuation = 0.0 if next_state in (0, 6) else td_value[next_state]
        td_error = reward + continuation - td_value[state]
        td_value[state] += alpha * td_error
print(td_value[1:6])
```

TD 不等待整局结束，奖励为 0 的中间转移也能借助下一状态价值传播信息。固定步长使最终估计仍在随机波动；不能要求一次运行精确等于解析值。

## MC 与 TD 的区别

| | Monte Carlo | TD(0) |
| --- | --- | --- |
| 目标 | 完整实际回报 $G_t$ | $R_{t+1}+\gamma V(S_{t+1})$ |
| 是否 Bootstrap | 否 | 是 |
| 何时更新 | 通常 Episode 结束后 | 每次转移后 |
| 是否适合 Continuing Task | 需切分或改造 | 可以在线更新 |
| 目标特点 | 通常高方差 | 通常较低方差但含估计偏差 |

“MC 无偏、TD 有偏”需要结合采样方式、初始化、有限数据和函数逼近具体说明，不能据此断言 MC 总是更准确。TD 的 Bootstrap 可以更快传播信息，也会传播当前估计误差。

## Batch 与 Online

Online TD 每得到一条转移就更新，后续目标会使用新参数。Batch 方法收集固定数据集并反复更新到收敛。即使公式相同，数据复用和更新时机也会改变结果。

MC 必须知道从访问点到 Episode 末尾的奖励；TD(0) 只需要单步转移，适合持续任务和长 Episode。

## Truncation

真正 Termination 后下一状态价值为 0。时间上限造成 Truncation 时，若观测仍对应底层非终止状态，TD 目标通常保留 $\gamma V(S_{t+1})$。MC 若把截断当完整 Episode 末尾，会丢掉尚未发生的回报，需要 Bootstrap 或专门处理。

## 评估

比较预测算法时固定策略和环境交互预算，使用多个随机种子。若已知小型环境真值，可报告状态加权均方误差：

$$
\operatorname{VE}=\sum_s\mu(s)[V(s)-V^\pi(s)]^2,
$$

其中 $\mu(s)$ 是明确选择的状态权重。只对常访问状态和对所有状态均匀平均是不同指标。

下一阶段将在预测基础上进入 SARSA、Expected SARSA 和 Q-learning 控制。

## 参考资料

- [Reinforcement Learning: An Introduction, Chapters 5–6](http://incompleteideas.net/book/the-book-2nd.html)
- [强化学习问题分类与探索](problem-settings.md)
