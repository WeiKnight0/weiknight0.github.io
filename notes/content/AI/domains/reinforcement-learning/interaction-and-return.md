---
title: Agent–Environment 交互、轨迹与回报
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 强化学习解决什么问题

强化学习研究智能体如何通过与环境反复交互，选择动作以最大化长期累计奖励。训练数据不是预先固定的独立样本：智能体选择的动作会改变之后到达的状态，也会改变后续收集到的数据。

监督学习通常给出输入和目标标签；强化学习只从环境得到奖励，奖励可能延迟出现。智能体需要处理当前收益与长期结果、探索未知动作与利用已知好动作之间的关系。

## Agent 与 Environment

在时间步 $t$：

1. 环境处于状态 $S_t$，智能体收到观测 $O_t$；
2. 智能体按策略选择动作 $A_t$；
3. 环境执行动作，产生奖励 $R_{t+1}$；
4. 环境转移到 $S_{t+1}$，智能体收到 $O_{t+1}$。

索引写成 $R_{t+1}$ 是因为奖励由在 $S_t$ 执行 $A_t$ 后的转移产生。部分资料把同一奖励记为 $r_t$，阅读公式时必须先确认约定。

环境包括智能体无法直接控制的一切。机器人电机命令是动作，传感器读数是观测；游戏中按键是动作，屏幕或内部变量是观测。

## State 与 Observation

State 是足以描述环境当前情况、用于决定未来演化的信息。Observation 是智能体实际收到的信息：

$$
O_t\sim O(\cdot\mid S_t).
$$

完全可观测时可以令 $O_t=S_t$。部分可观测时，同一个观测可能对应多个真实状态，例如单张图像无法给出物体速度。此时策略可能需要观测历史、循环状态或信念状态，不能直接把观测当作完整环境状态。

## Action 与 Reward

Action 是智能体在当前时间步可选择的控制量。动作空间可以是离散的，如上下左右；也可以是连续的，如转向角和力矩。

Reward 是环境在一次转移后给出的标量反馈。它定义“希望优化什么”，不是对动作逐步提供正确答案。奖励设计错误时，智能体可能最大化代理指标却违背真实目标。

奖励的数值尺度会影响优化稳定性，但把全部奖励乘正常数通常不改变有限 MDP 的最优策略。加入依赖状态或动作的额外奖励则可能改变最优策略，不能只称为数值归一化。

## Policy

Policy 描述智能体在给定信息下如何选择动作。随机策略为：

$$
\pi(a\mid s)=\Pr(A_t=a\mid S_t=s),
$$

且对每个状态有 $\sum_a\pi(a\mid s)=1$。确定性策略写作 $A_t=\mu(S_t)$。

策略可以是表格、线性函数或神经网络。策略的输入若实际是观测，应写作 $\pi(a\mid o)$；不能因为算法代码把变量命名为 `state`，就认为环境完全可观测。

## Trajectory 与 Episode

一条轨迹（Trajectory）记录交互序列：

$$
\tau=(S_0,A_0,R_1,S_1,A_1,R_2,\ldots).
$$

Episode 是从初始状态到一次任务结束的有限轨迹，例如一局游戏。任务结束的状态称为 Terminal State。Episode 长度可以随机，不一定等于固定 Horizon。

有限时域问题规定最大决策步数 $H$。无限时域表示理论上持续交互，不是程序真的运行无限久。Continuing Task 可通过折扣、平均奖励或其他目标定义长期性能。

## Return 与 Discount

奖励是单步反馈，回报（Return）是从时间 $t$ 开始的累计未来奖励：

$$
G_t=R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots,
$$

其中 $0\le\gamma\le1$ 是折扣因子。它满足递推关系：

$$
G_t=R_{t+1}+\gamma G_{t+1}.
$$

$\gamma$ 越小越强调近期奖励，越接近 1 越重视长期结果。折扣也能让有界奖励的无限和收敛；它不是“未来奖励一定不重要”的固定事实，而是任务目标的一部分。

```python
import torch

rewards = torch.tensor([1.0, 2.0, 3.0])
gamma = 0.5
returns = torch.empty_like(rewards)
future_return = 0.0
for step in range(len(rewards) - 1, -1, -1):
    future_return = rewards[step] + gamma * future_return
    returns[step] = future_return
print(returns)
```

结果为 `[2.75, 3.5, 3.0]`。在最后一步之后没有更多奖励，所以最后回报就是 3。

## 一个完整交互循环

下面的环境从位置 0 出发，动作 1 向右移动，到达位置 3 获得奖励 1 并终止。

```python
position = 0
trajectory = []
terminated = False
while not terminated:
    observation = position
    action = 1
    next_position = position + action
    reward = 1.0 if next_position == 3 else 0.0
    terminated = next_position == 3
    trajectory.append((observation, action, reward, next_position))
    position = next_position
print(trajectory)
```

轨迹包含三次转移，奖励序列为 `[0,0,1]`。策略在这里固定向右，因此没有发生学习；强化学习算法要利用这些转移改进后续策略。

## Termination 与 Truncation

Termination 表示任务在 MDP 意义下进入终止状态，如到达目标或失败。Truncation 表示任务因 MDP 外部限制提前停止，常见是时间上限。

两者都要求重置环境，但对 Bootstrap 的处理不同：真正终止后不存在后续任务价值，目标不加 $\gamma V(S_{t+1})$；仅因时间限制截断时，底层状态可能仍有后续价值，通常应 Bootstrap。把二者合成一个 `done` 会造成错误目标。

Gymnasium 的 `step` 返回 `(observation, reward, terminated, truncated, info)`，正是为了区分这两种结束原因。

## 参考资料

- [Reinforcement Learning: An Introduction, 2nd Edition](http://incompleteideas.net/book/the-book-2nd.html)
- [Gymnasium Env API](https://gymnasium.farama.org/api/env/)
