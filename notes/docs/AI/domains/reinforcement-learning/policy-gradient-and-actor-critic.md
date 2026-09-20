---
title: 策略梯度：REINFORCE 与 Actor–Critic
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 直接参数化策略

价值方法先学习动作价值，再通过 $\arg\max_aQ(s,a)$ 间接得到策略。策略梯度直接学习带参数的概率分布 $\pi_\theta(a\mid s)$，优化期望回报

$$
J(\theta)=\mathbb E_{\tau\sim\pi_\theta}[G_0].
$$

离散动作可由网络输出 Categorical 分布的 Logit；连续动作可输出高斯分布参数。随机策略天然表达探索，也能处理多个动作同样合理的情况。

```python
import torch
from torch import nn

torch.manual_seed(42)

class PolicyNetwork(nn.Module):
    def __init__(self, observation_dim, action_count):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(observation_dim, 32),
            nn.Tanh(),
            nn.Linear(32, action_count),
        )

    def forward(self, observations):
        return self.layers(observations)

policy = PolicyNetwork(4, 2)
distribution = torch.distributions.Categorical(logits=policy(torch.randn(3, 4)))
actions = distribution.sample()
log_probabilities = distribution.log_prob(actions)
print(actions.shape, log_probabilities.shape)
```

Logit 不需要先手动 Softmax；`Categorical(logits=...)` 会稳定地完成归一化。训练时必须保存被采样动作的对数概率，而不是对动作编号本身求梯度。

## Policy Gradient Theorem

策略梯度可写为

$$
\nabla_\theta J(\theta)
=\mathbb E_{\pi_\theta}\left[
\nabla_\theta\log\pi_\theta(A_t\mid S_t)Q^{\pi_\theta}(S_t,A_t)
\right].
$$

直观上，若一次动作之后的回报较高，就提高该动作在相应状态下的对数概率；回报较低则降低。对数导数把轨迹概率的乘积转成求和，使未知环境转移不需要求导。

策略梯度是梯度上升。深度学习框架默认最小化损失，因此实现中使用负号：

$$
L_{\text{policy}}=-\mathbb E[\log\pi_\theta(A_t\mid S_t)\widehat Q_t].
$$

## REINFORCE

REINFORCE 用完整的 Monte Carlo 回报 $G_t$ 估计 $Q^pi(S_t,A_t)$：

$$
G_t=R_{t+1}+\gamma R_{t+2}+\cdots,
$$

$$
L=-\sum_t\log\pi_\theta(A_t\mid S_t)G_t.
$$

它必须等 Episode 结束后才能更新，估计无须 Bootstrap，但方差通常较大。

```python
def discounted_returns(rewards, gamma):
    returns = []
    running_return = 0.0
    for reward in reversed(rewards):
        running_return = reward + gamma * running_return
        returns.append(running_return)
    return torch.tensor(list(reversed(returns)))

rewards = [0.0, 0.0, 1.0]
returns = discounted_returns(rewards, gamma=0.9)
print(returns)
```

一个 Episode 的更新核心如下。`returns` 来自实际采样轨迹，不能通过它反向传播到环境。

```python
observations = torch.randn(4, 4)
episode_actions = torch.tensor([0, 1, 1, 0])
episode_rewards = [0.0, 0.0, 0.0, 1.0]

distribution = torch.distributions.Categorical(logits=policy(observations))
log_probabilities = distribution.log_prob(episode_actions)
returns = discounted_returns(episode_rewards, gamma=0.99)
loss = -(log_probabilities * returns).sum()

optimizer = torch.optim.Adam(policy.parameters(), lr=1e-3)
optimizer.zero_grad()
loss.backward()
optimizer.step()
print(loss.item())
```

## Baseline 与 Advantage

从 $G_t$ 中减去只依赖状态、不依赖当前动作的 Baseline，不改变策略梯度的期望，却可降低方差。常用 Baseline 是状态价值 $V_\phi(S_t)$：

$$
\widehat A_t=G_t-V_\phi(S_t),
$$

$$
L_{\text{policy}}=-\sum_t\log\pi_\theta(A_t\mid S_t)\widehat A_t.
$$

$\widehat A_t>0$ 表示该动作结果优于当前状态下的平均水平，应提高概率；小于 0 则降低概率。更新 Actor 时通常对 Advantage 停止梯度，价值网络由自己的回归损失训练。

```python
values = torch.tensor([0.2, 0.3, 0.5], requires_grad=True)
returns = torch.tensor([0.4, 0.1, 1.0])
log_probabilities = torch.tensor([-0.8, -0.4, -1.2], requires_grad=True)

advantages = returns - values.detach()
actor_loss = -(log_probabilities * advantages).mean()
critic_loss = nn.functional.mse_loss(values, returns)
total_loss = actor_loss + 0.5 * critic_loss
total_loss.backward()
print(advantages, actor_loss.item(), critic_loss.item())
```

在一个 Batch 内标准化 Advantage 常能改善数值尺度，但它会改变有限 Batch 的更新；这不是策略梯度公式本身不可缺少的一步。

## Actor–Critic

Actor 表示策略 $\pi_\theta$，Critic 估计 $V_\phi$ 或 $Q_\phi$。一步 Actor–Critic 用 TD Error 近似 Advantage：

$$
\delta_t=R_{t+1}+\gamma(1-d)V_\phi(S_{t+1})-V_\phi(S_t).
$$

Actor 使用 $\delta_t$ 调整动作概率，Critic 拟合 TD 目标。它不必等待整局结束，方差通常低于 REINFORCE，但 Bootstrap 引入了 Critic 估计偏差。

```python
class ActorCritic(nn.Module):
    def __init__(self, observation_dim, action_count):
        super().__init__()
        self.body = nn.Sequential(nn.Linear(observation_dim, 64), nn.Tanh())
        self.actor = nn.Linear(64, action_count)
        self.critic = nn.Linear(64, 1)

    def forward(self, observations):
        features = self.body(observations)
        return self.actor(features), self.critic(features).squeeze(-1)

model = ActorCritic(4, 2)
observations = torch.randn(8, 4)
next_observations = torch.randn(8, 4)
actions = torch.tensor([0, 1, 0, 1, 1, 0, 0, 1])
rewards = torch.tensor([0.0, 1.0, 0.0, -1.0, 0.5, 0.0, 1.0, 0.0])
terminated = torch.tensor([False, True, False, False, False, False, True, False])

logits, values = model(observations)
with torch.no_grad():
    _, next_values = model(next_observations)
    targets = rewards + 0.99 * (~terminated).float() * next_values
advantages = targets - values

distribution = torch.distributions.Categorical(logits=logits)
actor_loss = -(distribution.log_prob(actions) * advantages.detach()).mean()
critic_loss = advantages.square().mean()
entropy = distribution.entropy().mean()
loss = actor_loss + 0.5 * critic_loss - 0.01 * entropy
print(actor_loss.item(), critic_loss.item(), entropy.item())
```

若共享特征网络，总损失会同时更新共享层；`advantages.detach()` 只阻止 Actor Loss 借 Critic 数值反向更新价值头。Critic Loss 仍会更新共享表示和价值头。

## Entropy Bonus

策略过早接近确定性时，未选择动作几乎收不到数据。离散策略的熵为

$$
\mathcal H(\pi(\cdot\mid s))=-\sum_a\pi(a\mid s)\log\pi(a\mid s).
$$

最大化熵可鼓励探索。使用最小化损失时写作 $L=L_{\text{actor}}+c_vL_{\text{critic}}-c_e\mathcal H$。熵系数过大会让策略长期接近随机，不能替代任务奖励或正确的探索设计。

## REINFORCE 与 Actor–Critic 的区别

| | REINFORCE | 一步 Actor–Critic |
| --- | --- | --- |
| 策略权重 | 完整回报 $G_t$ | TD Error $\delta_t$ |
| Bootstrap | 否 | 是 |
| 更新时机 | Episode 结束后 | 每步或短批次 |
| 估计特点 | 高方差、较少估计偏差 | 较低方差、依赖 Critic 准确性 |
| 学习对象 | Actor，可加 Baseline | Actor 与 Critic |

策略梯度对奖励尺度、学习率和采样方差敏感。训练报告至少应区分采样策略的训练回报与独立评估回报，并给出多个随机种子结果。PPO 会在 Actor–Critic 基础上限制一次策略更新幅度；GAE 会在多步尺度上构造 Advantage。

## 参考资料

- [Reinforcement Learning: An Introduction, Chapter 13](http://incompleteideas.net/book/the-book-2nd.html)
- [OpenAI Spinning Up: Policy Optimization](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)
- [MDP、价值函数与 Bellman 方程](mdp-and-value.md)
- [DQN：经验回放与目标网络](dqn.md)
