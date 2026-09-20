---
title: 学习率、批量大小与训练曲线
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 学习率与收敛

学习率 $\eta$ 控制每次沿优化器给出的方向移动多少。过小会使收敛缓慢，过大可能振荡或发散；“每步损失都下降”也不是小批次随机训练必须满足的条件。

对一维目标 $L(w)=\frac12aw^2$，其中 $a>0$，梯度下降为：

$$
w_{t+1}=w_t-\eta aw_t=(1-\eta a)w_t.
$$

要求迭代趋向零，需要 $|1-\eta a|<1$，即 $0<\eta<2/a$。当 $0<\eta a<1$ 时参数同号收缩；当 $1<\eta a<2$ 时符号交替但幅度缩小；$\eta a=2$ 时等幅振荡；大于 2 则通常发散。

这个结论针对固定曲率的一维二次函数。真实神经网络的曲率随参数改变，不能用同一个数直接推出通用学习率。

### 示例：同一目标的三种步长

```python
import numpy as np

learning_rates = np.array([0.1, 1.5, 2.1])
w = np.ones(3)
for _ in range(5):
    w -= learning_rates * w
print(w)
```

这里 $a=1,w_0=1$。输出约为 `[0.59049, -0.03125, -1.61051]`：第一种缓慢收缩，第二种振荡收缩，第三种振荡发散。

## 批量大小与更新次数

批量大小决定一次梯度估计使用多少样本。增大批量通常降低采样噪声，并可能提高硬件利用率，但也增加单次显存需求；超过硬件有效范围后，吞吐不一定继续提高。

有 $n$ 个样本，批量大小为 $B$，保留最后不足一批时，一个 Epoch 的更新数为 $\lceil n/B\rceil$。例如 1000 个样本，$B=100$ 时每轮 10 步，$B=250$ 时每轮 4 步。

因此固定 Epoch 数比较两个批量大小，实际更新次数不同。梯度累积也需要区分小批次前向次数和真正执行 `optimizer.step()` 的次数，学习率调度通常跟随后者。

增大批量时按比例增大学习率是一种特定条件下的经验配方，不是恒成立的等价变换。应观察验证结果、梯度尺度和训练稳定性。

## 学习率调度

### 分段与指数衰减

分段衰减在指定时刻乘以 $\gamma\in(0,1)$，例如第 30、60 轮各缩小一次。指数衰减每隔固定单位持续缩小，写成 $\eta_t=\eta_0\gamma^t$。

必须说明 $t$ 的单位是 Epoch 还是参数更新次数。同样的衰减因子按 Step 执行和按 Epoch 执行差别很大。

### 余弦衰减

设衰减进度 $u\in[0,1]$，从最大学习率 $\eta_{\max}$ 平滑降低到 $\eta_{\min}$：

$$
\eta(u)=\eta_{\min}+\frac12(\eta_{\max}-\eta_{\min})(1+\cos(\pi u)).
$$

开始时为最大值，中间为两端平均，结束时为最小值。这里没有重启；带重启的余弦调度需要额外定义周期。

### Warmup

Warmup 在训练初期逐渐增大学习率，用于缓和初始参数和优化器状态尚未稳定时的更新。它不保证解决所有不稳定，也并非所有模型必需。

下面先线性 Warmup，再余弦衰减。总共 $T$ 次更新，其中 $W$ 次 Warmup，设 $1\leq W<T$，更新序号 $t$ 从 0 到 $T-1$。前 $W$ 次的学习率为 $\eta_{\max}(t+1)/W$；之后令 $u=(t-W+1)/(T-W)$。

```python
import numpy as np

total_steps, warmup_steps = 10, 2
peak_lr, min_lr = 0.1, 0.01
steps = np.arange(total_steps)
warmup = peak_lr * (steps + 1) / warmup_steps
progress = np.clip((steps - warmup_steps + 1) / (total_steps - warmup_steps), 0, 1)
cosine = min_lr + 0.5 * (peak_lr - min_lr) * (1 + np.cos(np.pi * progress))
schedule = np.where(steps < warmup_steps, warmup, cosine)
print(np.round(schedule, 6))
```

前两次为 `0.05, 0.1`，第三次约为 `0.096575`，最后一次为 `0.01`。实际循环中，在第 $t$ 次参数更新前将优化器学习率设为 `schedule[t]`，使公式和使用时机一致。

### 根据验证表现降低

`ReduceLROnPlateau` 在监测指标若干次未改善后降低学习率。它接收实际验证指标，与按固定 Step 计算的调度器不同。降低学习率和早停可以配合，但应给降低后的模型一定改善机会。

使用框架调度器时核对调用单位和顺序。通常先执行优化器更新，再推进调度器；按验证指标调度则在计算出该轮验证结果后调用。

## 训练曲线如何比较

每个 Epoch 记录训练损失、验证损失、主要任务指标与学习率。样本级损失取平均时，各批次按样本数加权，不能把每批平均值直接再平均，除非各批大小相同。

例如两批分别有 4 和 1 个样本，平均损失分别为 1 和 5，则整轮平均为 $(4\times1+1\times5)/5=1.8$，不是 3。

| 观察 | 先检查什么 |
| --- | --- |
| 训练与验证都长期较差 | 数据/标签、损失与维度、优化是否生效、模型能力 |
| 训练下降，验证先降后升 | 过拟合、正则化强度与早停时机 |
| 两者剧烈振荡或出现非有限值 | 学习率、数值稳定性、异常样本与梯度 |
| 验证损失低于训练损失 | Dropout、增强、正则项、训练/评估模式差异 |
| 损失降低但业务指标变差 | 阈值、类别比例、概率校准与指标定义 |

这些是排查方向，不是仅凭曲线就能确定的原因。尤其不要把分布差异误判为单纯过拟合。

## 早停与最佳模型

规定验证损失下降超过 `min_delta` 才算改善，连续 `patience` 次验证没有改善则停止。每次改善保存当前模型，结束后恢复最佳模型。

下面用预先给出的验证损失演示选择过程，不进行真实训练。`min_delta=0.01`，`patience=2`；为清晰起见，使用差异远离浮点边界的数值。

```python
validation_losses = [0.9, 0.7, 0.705, 0.71, 0.6]
best_loss = float('inf')
best_epoch = -1
bad_epochs = 0
patience, min_delta = 2, 0.01

for epoch, val_loss in enumerate(validation_losses):
    if val_loss < best_loss - min_delta:
        best_loss = val_loss
        best_epoch = epoch
        bad_epochs = 0
    else:
        bad_epochs += 1
    if bad_epochs >= patience:
        break

print(best_epoch + 1, epoch + 1, best_loss)
```

输出 `2 4 0.7`：最佳轮为第 2 轮，第 4 轮停止。后面的 0.6 不会被看到，说明早停可能错过后续改善，因此容忍次数应考虑调度周期和验证噪声。

真正训练时，可在改善分支中用 `copy.deepcopy(model.state_dict())` 保存内存快照，结束后 `model.load_state_dict(best_state)`。直接把 `model.state_dict()` 长期放在变量中可能仍引用参数存储，后续训练会改变它，不能当成独立快照。

只做推理恢复时通常只需要模型参数；要准确继续训练，还需保存优化器、调度器、训练步数和必要的随机状态。最终性能在方案确定后用独立测试集评估。

## 参考资料

- [Dive into Deep Learning：Learning Rate Scheduling](https://d2l.ai/chapter_optimization/lr-scheduler.html)
- [PyTorch：ReduceLROnPlateau](https://docs.pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.ReduceLROnPlateau.html)
- [PyTorch：Saving and Loading Models](https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html)
