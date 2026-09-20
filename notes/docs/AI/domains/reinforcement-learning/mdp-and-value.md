---
title: MDP、价值函数与 Bellman 方程
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 马尔可夫性

若给定当前状态后，下一状态和奖励的分布不再依赖更早历史，则状态满足马尔可夫性：

$$
\Pr(S_{t+1},R_{t+1}\mid S_t,A_t,S_{t-1},A_{t-1},\ldots)
=\Pr(S_{t+1},R_{t+1}\mid S_t,A_t).
$$

马尔可夫性是对状态表示的要求，不是说现实没有历史影响。合格的状态已经把预测未来所需的历史信息编码进去。若遗漏速度、剩余资源等信息，同一表面观测下的未来分布仍依赖历史，就不是马尔可夫状态。

## MDP

马尔可夫决策过程（Markov Decision Process，MDP）通常写为 $(\mathcal S,\mathcal A,p,\gamma)$。其联合转移与奖励模型为：

$$
p(s',r\mid s,a)
=\Pr(S_{t+1}=s',R_{t+1}=r\mid S_t=s,A_t=a).
$$

由它可得到状态转移概率 $p(s'\mid s,a)$ 和期望即时奖励：

$$
r(s,a)=\mathbb E[R_{t+1}\mid S_t=s,A_t=a].
$$

环境可以是随机的：相同状态和动作不必总得到相同结果。策略也可以随机，因此轨迹概率同时由初始状态分布、策略和环境转移决定。

## POMDP

部分可观测马尔可夫决策过程（POMDP）在隐藏状态 $S_t$ 外增加观测 $O_t$ 及观测模型。智能体只看到 $O_t$，单个观测通常不满足马尔可夫性。

一种理论处理是维护信念状态 $b_t(s)=\Pr(S_t=s\mid O_{0:t},A_{0:t-1})$。实践中也可用帧堆叠、RNN 或 Transformer 汇总历史，但这些方法不保证得到精确信念状态。

## 状态价值函数

策略 $\pi$ 下，状态价值是从状态 $s$ 开始并继续遵循 $\pi$ 的期望回报：

$$
V^\pi(s)=\mathbb E_\pi[G_t\mid S_t=s].
$$

它不是一次轨迹的实际回报，而是对策略和环境随机性的期望。同一状态的单次 $G_t$ 可以高于或低于 $V^\pi(s)$。

## 动作价值函数

动作价值固定第一步执行 $a$，之后遵循 $\pi$：

$$
Q^\pi(s,a)=\mathbb E_\pi[G_t\mid S_t=s,A_t=a].
$$

二者关系为：

$$
V^\pi(s)=\sum_a\pi(a\mid s)Q^\pi(s,a).
$$

Advantage 比较某动作与策略在该状态的平均水平：

$$
A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s).
$$

因此 $\sum_a\pi(a\mid s)A^\pi(s,a)=0$。正 Advantage 表示该动作优于当前策略平均动作，不代表即时奖励一定为正。

## Bellman Expectation Equation

利用 $G_t=R_{t+1}+\gamma G_{t+1}$，状态价值满足：

$$
V^\pi(s)=\sum_a\pi(a\mid s)
\sum_{s',r}p(s',r\mid s,a)
\left[r+\gamma V^\pi(s')\right].
$$

动作价值满足：

$$
Q^\pi(s,a)=\sum_{s',r}p(s',r\mid s,a)
\left[r+\gamma\sum_{a'}\pi(a'\mid s')Q^\pi(s',a')\right].
$$

Bellman 方程不是一种单独算法，而是价值函数必须满足的递推关系。动态规划、TD 和 Q-learning 会用不同方式逼近或利用它。

### 两状态示例

策略确定后，状态 A 总是转移到 B 并得到 1，状态 B 总是留在 B 并得到 2，$\gamma=0.5$：

$$
V(B)=2+0.5V(B)=4,
$$

$$
V(A)=1+0.5V(B)=3.
$$

```python
import numpy as np

transition = np.array([[0.0, 1.0], [0.0, 1.0]])
reward = np.array([1.0, 2.0])
gamma = 0.5
value = np.linalg.solve(np.eye(2) - gamma * transition, reward)
bellman_target = reward + gamma * transition @ value
print(value)
print(bellman_target)
```

线性方程解与 Bellman 右侧都为 `[3,4]`。

## 最优价值与 Bellman Optimality Equation

最优状态价值是在所有策略中可获得的最大期望回报：

$$
V^*(s)=\max_\pi V^\pi(s).
$$

最优动作价值满足：

$$
Q^*(s,a)=\sum_{s',r}p(s',r\mid s,a)
\left[r+\gamma\max_{a'}Q^*(s',a')\right].
$$

并有：

$$
V^*(s)=\max_a Q^*(s,a).
$$

若已知精确 $Q^*$，在每个状态选择任一最大动作即可得到最优确定性策略。学习过程尚未得到 $Q^*$ 时，总选当前最大估计会缺少探索。

## Terminal State 的价值

终止状态后的回报定义为 0，因此导致终止的转移目标为 $r$，不再加下一状态价值。奖励可以在进入终止状态的转移上给出；“终止状态价值为 0”不表示成功终止没有奖励。

时间限制 Truncation 不等于终止状态，详见[交互与回报](interaction-and-return.md#termination-与-truncation)。

## 参考资料

- [Reinforcement Learning: An Introduction, 2nd Edition](http://incompleteideas.net/book/the-book-2nd.html)
- [OpenAI Spinning Up: Introduction to RL](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html)
