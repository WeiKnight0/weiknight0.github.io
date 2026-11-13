---
title: DQN：经验回放与目标网络
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 从 Q 表到 Q 网络

表格型 Q-learning 为每个 $(s,a)$ 保存一个数。图像等高维状态无法逐项建表，DQN（Deep Q-Network）改用神经网络 $Q(s,a;\theta)$ 同时估计给定状态下所有离散动作的价值：

$$
Q(s,\cdot;\theta)=[Q(s,a_1;\theta),\ldots,Q(s,a_k;\theta)].
$$

执行动作时仍可使用 $\epsilon$-greedy。网络输出维数固定为动作数，因此标准 DQN 适合有限离散动作，不直接解决连续动作优化。

```python
import random
from collections import deque, namedtuple

import torch
from torch import nn

torch.manual_seed(42)
random.seed(42)

class QNetwork(nn.Module):
    def __init__(self, observation_dim, action_count):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(observation_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, action_count),
        )

    def forward(self, observations):
        return self.layers(observations)

online_network = QNetwork(4, 2)
values = online_network(torch.randn(3, 4))
print(values.shape)
```

## TD 目标与损失

对回放中的转移 $(s,a,r,s',d)$，DQN 使用目标网络参数 $\theta^-$ 计算

$$
y=r+\gamma(1-d)\max_{a'}Q(s',a';\theta^-),
$$

并最小化

$$
L(\theta)=\mathbb E\left[\ell\left(Q(s,a;\theta)-y\right)\right].
$$

$d=1$ 表示真正终止。目标 $y$ 必须停止梯度，因为这一步只更新在线网络。Huber Loss 在误差小时使用平方损失、误差大时近似绝对值损失，通常比纯 MSE 对异常 TD Error 更稳健。

```python
target_network = QNetwork(4, 2)
target_network.load_state_dict(online_network.state_dict())
optimizer = torch.optim.Adam(online_network.parameters(), lr=1e-3)

observations = torch.randn(8, 4)
actions = torch.tensor([0, 1, 0, 0, 1, 1, 0, 1])
rewards = torch.tensor([1.0, 0.0, -1.0, 0.5, 0.0, 1.0, 0.2, -0.2])
next_observations = torch.randn(8, 4)
terminated = torch.tensor([False, False, True, False, False, True, False, False])

predicted = online_network(observations).gather(1, actions[:, None]).squeeze(1)
with torch.no_grad():
    next_values = target_network(next_observations).max(dim=1).values
    targets = rewards + 0.99 * (~terminated).float() * next_values

loss = nn.functional.smooth_l1_loss(predicted, targets)
optimizer.zero_grad()
loss.backward()
optimizer.step()
print(loss.item())
```

`gather` 只取批次中实际执行动作对应的 $Q$ 值。不能对网络的全部动作输出都拟合这个 TD 目标，因为一条转移没有给出其他动作的监督信号。

## 经验回放

在线连续采样的转移高度相关，而且一条经验用过即丢会浪费数据。Replay Buffer 保存最近的转移，并随机抽取 Mini-batch 训练：

1. 降低同一批样本的时间相关性；
2. 让旧经验被重复使用；
3. 把数据收集频率与梯度更新频率分开。

```python
Transition = namedtuple(
    "Transition", "observation action reward next_observation terminated"
)
replay = deque(maxlen=10000)

for index in range(32):
    replay.append(Transition(
        torch.full((4,), float(index)),
        index % 2,
        float(index % 3 - 1),
        torch.full((4,), float(index + 1)),
        index % 11 == 0,
    ))

batch = random.sample(replay, 8)
batch_observations = torch.stack([item.observation for item in batch])
batch_actions = torch.tensor([item.action for item in batch])
print(batch_observations.shape, batch_actions.shape)
```

开始训练前通常先收集一定数量的转移。Replay Buffer 容量、每步更新次数和样本的新旧比例都会改变训练分布；它并不是越大越好，过旧数据也可能与当前行为策略差异很大。

## 目标网络

若预测值和 Bootstrap 目标都由同一个快速变化的网络产生，相当于一边移动目标一边拟合，训练容易震荡。DQN 保留较慢变化的目标网络：

- Hard Update：每隔 $C$ 次梯度更新复制一次在线网络参数；
- Soft Update：每次按 $\theta^-\leftarrow(1-\tau)\theta^-+\tau\theta$ 缓慢更新。

```python
def hard_update(target, online):
    target.load_state_dict(online.state_dict())

def soft_update(target, online, tau):
    with torch.no_grad():
        for target_parameter, online_parameter in zip(
            target.parameters(), online.parameters()
        ):
            target_parameter.lerp_(online_parameter, tau)

soft_update(target_network, online_network, tau=0.005)
```

目标网络不参与反向传播。它只稳定训练目标，不负责动作选择，也不能消除 Q-learning 中最大值带来的过估计偏差；Double DQN 会专门处理后一个问题。

## 一次完整训练更新

```python
def optimize_dqn(online, target, optimizer, batch, gamma=0.99):
    observations = torch.stack([item.observation for item in batch])
    actions = torch.tensor([item.action for item in batch])
    rewards = torch.tensor([item.reward for item in batch])
    next_observations = torch.stack([item.next_observation for item in batch])
    terminated = torch.tensor([item.terminated for item in batch])

    predictions = online(observations).gather(1, actions[:, None]).squeeze(1)
    with torch.no_grad():
        next_values = target(next_observations).max(dim=1).values
        targets = rewards + gamma * (~terminated).float() * next_values

    loss = nn.functional.smooth_l1_loss(predictions, targets)
    optimizer.zero_grad()
    loss.backward()
    nn.utils.clip_grad_norm_(online.parameters(), max_norm=10.0)
    optimizer.step()
    return float(loss.detach())

training_loss = optimize_dqn(
    online_network, target_network, optimizer, random.sample(replay, 8)
)
print(training_loss)
```

环境交互循环负责按 $\epsilon$-greedy 选动作、区分终止和截断、写入回放并按计划调用该更新函数。把所有职责塞入一个训练函数会掩盖这几个容易出错的边界。

## 训练流程

1. 初始化在线网络、同参数目标网络和 Replay Buffer；
2. 用行为策略与环境交互，把转移写入 Buffer；
3. Buffer 达到预热规模后随机采样 Mini-batch；
4. 用目标网络计算停止梯度的 TD 目标；
5. 更新在线网络，并按固定频率更新目标网络；
6. 逐渐衰减探索率，但保留足够探索；
7. 评估时关闭随机探索，使用独立 Episode 报告回报。

## 常见错误

- 把时间上限截断一律记作 `terminated=True`，错误删除本应保留的 Bootstrap 项；
- 忘记对目标网络输出停止梯度；
- 未预热 Buffer 就用极少且相邻的样本反复训练；
- 训练回报和贪心评估回报混为同一指标；
- 只看 Loss。TD Loss 下降不保证策略回报上升，因为数据分布与目标都在变化；
- 使用单个随机种子判断改进是否有效。

DQN 同时结合函数逼近、Bootstrap 和 Off-Policy 学习，三者组合可能造成不稳定。经验回放与目标网络缓解问题，却不是普遍的收敛保证。

## 参考资料

- [Playing Atari with Deep Reinforcement Learning](https://arxiv.org/abs/1312.5602)
- [Human-level control through deep reinforcement learning](https://www.nature.com/articles/nature14236)
- [表格型控制](tabular-control.md)
- [强化学习问题分类与探索](problem-settings.md)
