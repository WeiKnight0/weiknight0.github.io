---
title: 优化器：SGD、Momentum、Adam 与 AdamW
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 批量梯度与随机梯度

设训练目标为 $L(\boldsymbol\theta)=\frac1n\sum_i\ell_i(\boldsymbol\theta)$。完整批量梯度每次使用全部 $n$ 个样本；随机梯度下降严格说每次使用一个样本；实际训练常使用一个小批次 $B_t$：

$$
\mathbf g_t=\frac1{|B_t|}\sum_{i\in B_t}\nabla\ell_i(\boldsymbol\theta_{t-1}),
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}-\eta_t\mathbf g_t.
$$

小批次梯度降低一次更新的计算量，也带来采样噪声。在固定参数处均匀抽取样本时，它是完整梯度的无偏估计。每轮随机打乱、无放回分批与每次独立抽样并非完全相同的随机过程。

下面的平方、平方根与除法均按参数元素计算；$t$ 从 1 开始，$\eta_t$ 是当前学习率。优化器保存的状态与模型参数是不同的量。

## SGD

SGD 直接沿当前梯度的反方向走一步。设 $L(w)=\frac12w^2$，初始 $w_0=2$，学习率 0.1，则梯度为 2，更新后 $w_1=1.8$。

优点是状态少、更新直观；缺点是不同参数方向尺度相差很大时，可能在陡峭方向来回振荡，同时沿平缓方向前进很慢。

```python
import numpy as np

w = np.array([2.0, -1.0])
learning_rate = 0.1
gradient = w.copy()
w -= learning_rate * gradient
print(w)
```

输出 `[1.8, -0.9]`，对应目标 $L(\mathbf w)=\frac12\|\mathbf w\|_2^2$ 的一步更新。

## Momentum

动量法累积近期梯度方向。这里使用以下约定，初始 $\mathbf v_0=\mathbf0$：

$$
\mathbf v_t=\beta\mathbf v_{t-1}+\mathbf g_t,
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}-\eta_t\mathbf v_t.
$$

若梯度长期同向，动量累积；若某个方向交替振荡，历史项可以部分抵消这种变化。$\beta\in[0,1)$ 决定历史保留程度。

有些资料写成 $\mathbf v_t=\beta\mathbf v_{t-1}+(1-\beta)\mathbf g_t$，那是另一种缩放约定；比较时必须同时考虑学习率。这里对应无 dampening、无 Nesterov 的常用 SGD 动量形式。

### 示例：连续两步

仍用 $L(w)=\frac12w^2$，$w_0=2$，$\eta=0.1$，$\beta=0.9$。

- 第一步：$g_1=2$，$v_1=2$，$w_1=1.8$。
- 第二步：$g_2=1.8$，$v_2=0.9\times2+1.8=3.6$，$w_2=1.44$。

```python
import numpy as np

w = np.array([2.0])
velocity = np.zeros_like(w)
for _ in range(2):
    gradient = w.copy()
    velocity = 0.9 * velocity + gradient
    w -= 0.1 * velocity
print(w)
```

动量不保证每次都更接近最优点，学习率太大仍然可能越过最小值并发散。

## AdaGrad

AdaGrad 为每个参数累计历史平方梯度，$\mathbf s_0=\mathbf0$：

$$
\mathbf s_t=\mathbf s_{t-1}+\mathbf g_t^2,
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}
-\eta\frac{\mathbf g_t}{\sqrt{\mathbf s_t}+\epsilon}.
$$

经常出现大梯度的坐标，分母增大，后续步长减小；不常更新的坐标衰减较少，因此适合某些稀疏特征场景。但平方和持续增长，长时间训练后步长可能过小。

## RMSProp

RMSProp 用指数移动平均替代无限累积：

$$
\mathbf s_t=\rho\mathbf s_{t-1}+(1-\rho)\mathbf g_t^2,
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}
-\eta\frac{\mathbf g_t}{\sqrt{\mathbf s_t}+\epsilon}.
$$

历史影响逐渐衰减，使分母反映近期梯度尺度。这里是无动量、非 centered 的形式，$\mathbf s_0=\mathbf0$。$\epsilon>0$ 防止零分母，也会影响非常小梯度时的数值行为。

下面对 $L(w)=\frac12w^2$ 各执行一步，注意两者的初始分母不同。

```python
import numpy as np

learning_rate, epsilon = 0.1, 1e-8
w_adagrad = np.array([2.0])
w_rmsprop = np.array([2.0])
g_adagrad = w_adagrad.copy()
g_rmsprop = w_rmsprop.copy()
sum_squared = g_adagrad ** 2
mean_squared = 0.1 * g_rmsprop ** 2
w_adagrad -= learning_rate * g_adagrad / (np.sqrt(sum_squared) + epsilon)
w_rmsprop -= learning_rate * g_rmsprop / (np.sqrt(mean_squared) + epsilon)
print(w_adagrad, w_rmsprop)
```

输出约为 `[1.9] [1.683772]`，RMSProp 使用 $\rho=0.9$。同样的名义学习率不意味着各优化器具有相同步长。

## Adam

Adam 同时估计梯度的一阶矩和二阶原点矩。$\mathbf m_0=\mathbf v_0=\mathbf0$：

$$
\mathbf m_t=\beta_1\mathbf m_{t-1}+(1-\beta_1)\mathbf g_t,
\qquad
\mathbf v_t=\beta_2\mathbf v_{t-1}+(1-\beta_2)\mathbf g_t^2.
$$

这里 $\mathbf v_t$ 估计的是平方梯度的平均，不是减去均值后的方差。由于从零初始化，早期估计偏小，需要偏差修正：

$$
\hat{\mathbf m}_t=\frac{\mathbf m_t}{1-\beta_1^t},
\qquad
\hat{\mathbf v}_t=\frac{\mathbf v_t}{1-\beta_2^t},
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}
-\eta_t\frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t}+\epsilon}.
$$

为什么除以 $1-\beta^t$？假设梯度均值固定为 $\boldsymbol\mu$，则 $\mathbb E[\mathbf m_t]=(1-\beta_1)\sum_{k=0}^{t-1}\beta_1^k\boldsymbol\mu=(1-\beta_1^t)\boldsymbol\mu$。修正消除了这种零初始化偏差，并不消除采样噪声或训练中的分布变化。

### 示例：Adam 第一步

设 $g_1=2$，$\beta_1=0.9$，$\beta_2=0.999$。则 $m_1=0.2$，$v_1=0.004$，修正后 $\hat m_1=2$、$\hat v_1=4$。忽略很小的 $\epsilon$，更新量为 $\eta\times2/2=\eta$。

```python
import numpy as np

w = np.array([2.0])
m = np.zeros_like(w)
v = np.zeros_like(w)
beta1, beta2 = 0.9, 0.999
learning_rate, epsilon = 0.1, 1e-8
for t in range(1, 3):
    gradient = w.copy()
    m = beta1 * m + (1 - beta1) * gradient
    v = beta2 * v + (1 - beta2) * gradient ** 2
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    w -= learning_rate * m_hat / (np.sqrt(v_hat) + epsilon)
print(w)
```

两步后约为 `[1.800166]`。它只是更新过程的算例，不能用这个单一目标判断哪种优化器在真实任务上最好。

## AdamW

把 L2 梯度 $\lambda\boldsymbol\theta$ 加入 Adam，会使它参与 $\mathbf m_t,\mathbf v_t$ 的估计。AdamW 改为只用数据梯度更新矩，再单独衰减权重：

$$
\boldsymbol\theta_t=(1-\eta_t\lambda)\boldsymbol\theta_{t-1}
-\eta_t\frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t}+\epsilon}.
$$

例如初始 $w=2$、数据梯度为 2、$\eta=0.1$、$\lambda=0.01$，第一步约为 $2\times0.999-0.1=1.898$。

```python
import torch

w = torch.tensor([2.0], dtype=torch.float64, requires_grad=True)
optimizer = torch.optim.AdamW([w], lr=0.1, weight_decay=0.01)
optimizer.zero_grad()
loss = 0.5 * (w ** 2).sum()
loss.backward()
optimizer.step()
print(w.detach())
```

输出约为 `tensor([1.8980], dtype=torch.float64)`。调整学习率同时也会改变每步的衰减量，因此衰减效果还与更新次数有关。

## 状态与选择

| 方法 | 除参数和当前梯度外的主要状态 | 每次更新的关注点 |
| --- | --- | --- |
| SGD | 无 | 当前梯度 |
| Momentum | 一组动量 | 历史方向 |
| AdaGrad | 一组平方和 | 累积坐标尺度 |
| RMSProp | 一组平方移动平均 | 近期坐标尺度 |
| Adam / AdamW | 两组移动平均及步数 | 方向与尺度 |

每种方法对 $d$ 个参数的更新通常为 $O(d)$，但实际训练还要保存激活、梯度等，表中的状态不是总显存。

比较优化器时，应分别调整学习率并使用相同数据与评估流程；不能把某个优化器的学习率原样套给所有方法。恢复训练时，除模型权重外还需恢复优化器状态和步数，否则后续更新不会延续原过程。

## 参考资料

- [Dive into Deep Learning：Adam](https://d2l.ai/chapter_optimization/adam.html)
- [Decoupled Weight Decay Regularization](https://arxiv.org/abs/1711.05101)
- [PyTorch：AdamW](https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html)
