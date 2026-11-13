---
title: 表格型控制：SARSA、Expected SARSA 与 Q-learning
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 从预测到控制

MC 与 TD(0) 解决的是固定策略下的价值预测。控制问题还要根据价值改进策略，最终寻找最优策略。状态和动作均为有限集合时，可以用表格保存每个状态—动作对的估计 $Q(s,a)$。

三种一步 TD 控制算法都使用

$$
Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha[Y_t-Q(S_t,A_t)],
$$

区别只在目标 $Y_t$ 如何处理下一状态。若 $S_{t+1}$ 真正终止，三个目标都只有 $R_{t+1}$，不再使用下一状态的 $Q$ 值。

训练时通常采用 $\epsilon$-greedy 行为策略：以概率 $1-\epsilon$ 选择当前最优动作，以概率 $\epsilon$ 在全部动作中均匀随机选择。并列最优动作应随机打破平局，否则动作编号会引入无意义的偏好。

```python
import numpy as np

rng = np.random.default_rng(42)

def epsilon_greedy(q_row, epsilon):
    if rng.random() < epsilon:
        return int(rng.integers(len(q_row)))
    best = np.flatnonzero(q_row == q_row.max())
    return int(rng.choice(best))

q_row = np.array([1.0, 2.0, 2.0, 0.0])
actions = [epsilon_greedy(q_row, 0.1) for _ in range(20)]
print(actions)
```

## SARSA

SARSA 的名字来自一次更新使用的五元组 $(S_t,A_t,R_{t+1},S_{t+1},A_{t+1})$。下一动作 $A_{t+1}$ 由当前行为策略实际选出：

$$
Y_t^{\text{SARSA}}=R_{t+1}+\gamma Q(S_{t+1},A_{t+1}).
$$

它评估并改进正在采样数据的 $\epsilon$-greedy 策略，因此是 On-Policy。只要训练期间仍有探索，价值中就会考虑未来探索动作可能造成的后果。

一次非终止转移的更新如下：

```python
q = np.array([[0.2, 0.8], [1.0, 0.4]])
state, action = 0, 1
reward, next_state, next_action = -0.1, 1, 0
alpha, gamma = 0.5, 0.9

target = reward + gamma * q[next_state, next_action]
q[state, action] += alpha * (target - q[state, action])
print(target, q[state, action])
```

## Expected SARSA

Expected SARSA 不采样单个 $A_{t+1}$，而是对目标策略的所有下一动作取期望：

$$
Y_t^{\text{Expected SARSA}}
=R_{t+1}+\gamma\sum_a\pi(a\mid S_{t+1})Q(S_{t+1},a).
$$

设动作数为 $k$，$\epsilon$-greedy 策略有 $g$ 个并列最优动作，则每个动作先得到 $\epsilon/k$；每个最优动作再得到 $(1-\epsilon)/g$。不能把全部贪心概率只给第一个最大值。

```python
def epsilon_greedy_probabilities(q_row, epsilon):
    probabilities = np.full(len(q_row), epsilon / len(q_row))
    best = np.flatnonzero(q_row == q_row.max())
    probabilities[best] += (1.0 - epsilon) / len(best)
    return probabilities

next_q = np.array([1.0, 3.0, 3.0, 2.0])
probabilities = epsilon_greedy_probabilities(next_q, 0.2)
expected_value = probabilities @ next_q
print(probabilities, expected_value)
```

对下一动作求期望消除了这一步动作采样造成的方差，但每次更新要读取全部动作。目标策略和行为策略相同时，它是 On-Policy；若期望按另一目标策略计算，也可构造 Off-Policy 版本。

## Q-learning

Q-learning 直接用下一状态的最大动作价值作为目标：

$$
Y_t^{\text{Q-learning}}
=R_{t+1}+\gamma\max_a Q(S_{t+1},a).
$$

行为策略仍可用 $\epsilon$-greedy 探索，但更新目标假定下一步选择贪心动作，因此它是 Off-Policy。表格型 Q-learning 在有限 MDP 中需要持续访问所有状态—动作对，并使用满足收敛条件的步长；“公式中有最大值”并不保证有限训练后已经得到最优策略。

```python
q = np.array([[0.2, 0.8], [1.0, 0.4]])
state, action = 0, 1
reward, next_state = -0.1, 1
alpha, gamma = 0.5, 0.9

target = reward + gamma * q[next_state].max()
q[state, action] += alpha * (target - q[state, action])
print(target, q[state, action])
```

## 悬崖行走中的差别

考虑 $4\times12$ 网格：起点在左下角，终点在右下角，中间十格是悬崖。普通移动奖励为 $-1$；掉下悬崖奖励为 $-100$ 并回到起点。动作越界时留在原地。

```python
ROWS, COLS = 4, 12
START = (3, 0)
GOAL = (3, 11)
ACTIONS = ((-1, 0), (0, 1), (1, 0), (0, -1))

def state_id(position):
    return position[0] * COLS + position[1]

def step(position, action):
    dr, dc = ACTIONS[action]
    row = min(max(position[0] + dr, 0), ROWS - 1)
    col = min(max(position[1] + dc, 0), COLS - 1)
    next_position = (row, col)
    if row == 3 and 1 <= col <= 10:
        return START, -100.0, False
    return next_position, -1.0, next_position == GOAL
```

下面只改变 TD 目标，其余训练条件相同。每局设置步数上限是为了使错误实现也能快速暴露；达到上限属于截断，不应在真实任务中自动当作终止状态。

```python
def train_control(method, episodes=500, alpha=0.5, gamma=1.0, epsilon=0.1):
    q = np.zeros((ROWS * COLS, len(ACTIONS)))
    returns = []
    for _ in range(episodes):
        position = START
        action = epsilon_greedy(q[state_id(position)], epsilon)
        total_reward = 0.0
        for _ in range(1000):
            next_position, reward, terminated = step(position, action)
            total_reward += reward
            current = state_id(position)
            if terminated:
                target = reward
                q[current, action] += alpha * (target - q[current, action])
                break

            following = state_id(next_position)
            next_action = epsilon_greedy(q[following], epsilon)
            if method == "sarsa":
                continuation = q[following, next_action]
            elif method == "expected-sarsa":
                continuation = epsilon_greedy_probabilities(
                    q[following], epsilon
                ) @ q[following]
            elif method == "q-learning":
                continuation = q[following].max()
            else:
                raise ValueError(f"unknown method: {method}")
            target = reward + gamma * continuation
            q[current, action] += alpha * (target - q[current, action])
            position, action = next_position, next_action
        returns.append(total_reward)
    return q, np.asarray(returns)

results = {
    method: train_control(method)
    for method in ("sarsa", "expected-sarsa", "q-learning")
}
for method, (_, returns) in results.items():
    print(method, returns[-100:].mean())
```

持续使用 $\epsilon$-greedy 时，SARSA 会把靠近悬崖后仍可能随机踏入悬崖的风险纳入目标，往往学到更安全的路线。Q-learning 学的是贪心目标策略，往往靠近悬崖走最短路线；训练回报却仍由带探索的行为策略产生，因此可能更差。关闭探索进行评估时，两者的比较可能改变。

## 如何选择

| 算法 | 下一状态目标 | 典型关系 | 特点 |
| --- | --- | --- | --- |
| SARSA | 实际采样的 $Q(S',A')$ | On-Policy | 目标也包含探索后果 |
| Expected SARSA | $\sum_a\pi(a\mid S')Q(S',a)$ | 通常 On-Policy | 下一动作采样方差较小 |
| Q-learning | $\max_aQ(S',a)$ | Off-Policy | 直接逼近贪心策略价值 |

三者都只适用于状态—动作表能够存储并被充分访问的场景。状态巨大或连续时，不能简单建立无限大的表，需要使用函数逼近；DQN 就是用神经网络近似离散动作的 $Q$ 函数。

## 参考资料

- [Reinforcement Learning: An Introduction, Chapter 6](http://incompleteideas.net/book/the-book-2nd.html)
- [无模型预测：Monte Carlo 与 TD(0)](monte-carlo-and-td.md)
- [DQN：经验回放与目标网络](dqn.md)
