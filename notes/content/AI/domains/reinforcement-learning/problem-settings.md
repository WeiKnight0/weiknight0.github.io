---
title: 强化学习问题分类与探索
date: 2026-09-10T00:00:00
lang: zh-cn
---

## Prediction 与 Control

Prediction 固定策略 $\pi$，估计 $V^\pi$ 或 $Q^\pi$。问题是“这套策略有多好”。

Control 寻找能最大化回报的策略。控制通常交替进行价值估计与策略改进，但策略梯度也可以直接优化参数化策略。

策略评估属于 Prediction；策略迭代、Q-learning、DQN 和策略梯度属于 Control。评估算法收敛不表示已找到最优策略，因为它可能只准确评估一个很差的策略。

## Model-Based 与 Model-Free

Model 指环境的转移和奖励规律，例如 $p(s',r\mid s,a)$。

Model-Based 方法已知或学习 Model，并用它规划未来。动态规划使用已知模型；模型预测控制与世界模型则从数据学习近似模型。

Model-Free 方法不显式学习完整环境模型，直接学习价值或策略。Q-learning 和策略梯度属于 Model-Free。Model-Free 不表示没有神经网络，也不表示不预测任何量；区别在于是否显式建立可用于规划的环境转移模型。

学习模型可能提高数据利用率，也会受到模型误差累积影响。真实环境交互昂贵时，模型带来的模拟数据价值更大。

## On-Policy 与 Off-Policy

行为策略 $b$ 负责收集数据，目标策略 $\pi$ 是要评估或改进的策略。

- On-Policy：用当前目标策略自身产生的数据学习它；
- Off-Policy：使用与目标策略不同的行为策略数据学习目标策略。

若 $b(a\mid s)=0$ 而 $\pi(a\mid s)>0$，数据永远不会出现目标策略需要的该动作，通常无法仅靠这批数据完成无偏校正。重要性采样比率为：

$$
\rho_t=\frac{\pi(A_t\mid S_t)}{b(A_t\mid S_t)}.
$$

```python
import torch

behavior = torch.tensor([0.8, 0.2])
target = torch.tensor([0.1, 0.9])
sampled_action = 1
reward = torch.tensor(2.0)
ratio = target[sampled_action] / behavior[sampled_action]
weighted_reward = ratio * reward
print(ratio.item(), weighted_reward.item())
```

行为策略以 0.2 概率选择动作 1，目标策略概率为 0.9，比率是 4.5。大比率会放大估计方差；Off-Policy 并不等于可以无代价使用任意旧数据。

SARSA 使用实际由行为策略选择的下一动作更新，通常是 On-Policy；Q-learning 的目标使用下一状态最大 $Q$ 动作，与探索行为可不同，因此是 Off-Policy。

## 探索与利用

利用（Exploitation）选择当前估计最好的动作；探索（Exploration）尝试信息不足的动作，以便发现更优选择。只利用可能永久错过真实最优动作，只随机探索又无法充分获得已知收益。

常见探索方式包括 $\epsilon$-greedy、UCB、Softmax/Boltzmann、参数噪声和熵奖励。它们使用的信息与适用假设不同，不能只用一个“随机程度”概括。

训练时的探索策略与部署策略可以不同。例如训练使用 $\epsilon$-greedy，评估使用 Greedy。报告结果时必须关闭或固定探索随机性，否则无法区分策略质量和采样波动。

## Episodic 与 Continuing

Episodic Task 有自然终点，如一局游戏；Continuing Task 持续运行，如服务器资源调度。Episodic 回报可在终止处截断，Continuing Task 常使用折扣回报或平均奖励。

人为时间上限只产生 Truncation，不一定改变底层任务为 Episodic。训练目标是否 Bootstrap 应依据终止含义，而不是数组是否到达最大长度。

## 离散与连续空间

表格方法要求有限或可枚举的状态—动作表示。连续状态通常用函数逼近；连续动作无法直接枚举所有动作取 `max`，因此常使用参数化 Actor、优化器或动作采样。

DQN 适合有限离散动作，不因神经网络输入能接收连续状态就自动支持连续动作。DDPG、TD3 和 SAC 会在后续连续控制中处理这一问题。

## Bootstrap 与完整回报

Monte Carlo 等待 Episode 结束，用实际完整回报作为目标，不从当前价值估计 Bootstrap。TD 方法用 $R_{t+1}+\gamma V(S_{t+1})$ 更新，较早学习但目标含当前估计误差。

这是 Bias–Variance 的来源之一：完整回报通常方差较大、Bootstrap 目标偏差可能较大。$n$-step 与 $\lambda$ 方法在两端之间组合，后续单独讲解。

## Reward、Objective 与 Metric

Reward 是训练交互中的标量，Objective 是算法实际优化的量，Metric 是外部评估指标。三者可以不同。

例如机器人训练 Reward 包含前进、能耗与摔倒惩罚，优化器最小化策略损失，最终 Metric 报告成功率和能耗。只报告训练 Reward 无法判断策略是否满足真实要求。

## 实验协议

强化学习结果对环境随机性、初始化和数据顺序敏感。至少固定环境版本、终止/截断规则、观测与动作处理、训练交互步数、评估策略，并使用多个随机种子报告均值与离散程度。

训练 Episode 数不是公平预算：不同策略的 Episode 长度可能不同。通常同时记录环境交互步数、梯度更新数和实际运行时间。

下一阶段从基础算法的多臂老虎机开始。

## 参考资料

- [Reinforcement Learning: An Introduction, 2nd Edition](http://incompleteideas.net/book/the-book-2nd.html)
- [OpenAI Spinning Up: Key Concepts in RL](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html)
