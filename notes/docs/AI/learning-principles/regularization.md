---
title: 正则化：L1、L2、Dropout 与数据增强
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 正则化目标

正则化通过约束参数、改变训练数据或限制训练过程，减少模型对训练样本偶然细节的依赖。显式参数惩罚常写成 $J(\mathbf w)=L(\mathbf w)+\lambda\Omega(\mathbf w)$，其中 $L$ 为数据损失，$\lambda\geq0$ 控制惩罚强度。

它不是免费的性能提升：太强会妨碍模型学习有效关系，导致欠拟合。强度通过验证数据选择，不使用测试集反复调节。

## L2 正则化

取 $\Omega(\mathbf w)=\frac12\|\mathbf w\|_2^2$，目标和梯度为：

$$
J=L+\frac\lambda2\sum_jw_j^2,
\qquad
\nabla J=\nabla L+\lambda\mathbf w.
$$

L2 对大权重惩罚更强，一般使权重整体收缩，但不通常产生精确的零。具有相同预测作用的高度相关特征，也可能分摊权重。

### 示例：一个参数的收缩

设数据损失为 $L(w)=\frac12(w-3)^2$。没有正则时最优参数为 3；加入 L2 后，令导数 $w-3+\lambda w=0$，得到 $w^*=3/(1+\lambda)$。

当 $\lambda=1$ 时，最优值为 1.5。正则化允许拟合误差增大，以换取较小的参数。

## L1 正则化

L1 使用 $\Omega(\mathbf w)=\|\mathbf w\|_1=\sum_j|w_j|$。对非零权重，惩罚项的导数为 $\lambda\operatorname{sign}(w_j)$；零处不可导，可以使用次梯度或近端方法。

与 L2 不同，L1 能使某些权重精确为零，得到稀疏解。仍以 $\frac12(w-3)^2$ 为数据损失，L1 最优解为 $w^*=\max(3-\lambda,0)$，因此 $\lambda\geq3$ 时解为零。

近端梯度先对数据损失更新 $u=w-\eta\nabla L(w)$，再执行软阈值：

$$
w\leftarrow\operatorname{sign}(u)\max(|u|-\eta\lambda,0).
$$

下面比较一组参数的 L1 近端结果与 L2 闭式解。取 $L(\mathbf w)=\frac12\|\mathbf w-\mathbf a\|_2^2$，L1 更新的学习率取 1，所以先得到 $\mathbf u=\mathbf a$。

```python
import numpy as np

a = np.array([-3.0, -0.5, 0.5, 3.0])
strength = 1.0
l1_solution = np.sign(a) * np.maximum(np.abs(a) - strength, 0)
l2_solution = a / (1 + strength)
print(l1_solution)
print(l2_solution)
```

输出分别为 `[-2, 0, 0, 2]` 和 `[-1.5, -0.25, 0.25, 1.5]`。直接使用普通梯度下降处理 L1，并不保证数值上自动出现精确零。

特征尺度会影响参数惩罚的意义：同一特征换单位后，所需权重大小改变。因此表格模型常先标准化，统计量只由训练集拟合。

## L2 与权重衰减

对没有动量的普通 SGD，将 L2 梯度加入更新：

$$
\mathbf w_{t+1}=\mathbf w_t-\eta(\mathbf g_t+\lambda\mathbf w_t)
=(1-\eta\lambda)\mathbf w_t-\eta\mathbf g_t.
$$

这等价于在更新中按 $1-\eta\lambda$ 缩小权重，因此常称权重衰减。但对 Adam，加入的 L2 梯度也会进入动量和自适应缩放，不能再当作同一个均匀收缩操作。

AdamW 把衰减与自适应梯度更新分开。它们的具体更新见[优化器](optimizers.md)。不要同时手工加 L2，又启用优化器的同类惩罚而没有计算总强度。

偏置和归一化参数常被排除在权重衰减之外，这是模型训练配方中的选择，不是所有模型必须遵循的数学规则。

## Dropout

Dropout 在训练时随机屏蔽部分激活，减少后续单元对某个固定激活组合的依赖。它屏蔽的是这次前向计算的激活值，不是永久删除参数。

采用 Inverted Dropout，丢弃概率为 $p\in[0,1)$，保留掩码 $m_j\sim\operatorname{Bernoulli}(1-p)$：

$$
\tilde h_j=\frac{m_jh_j}{1-p},
\qquad
\mathbb E[\tilde h_j\mid h_j]=\frac{(1-p)h_j}{1-p}=h_j.
$$

保留值乘以 $1/(1-p)$，使激活的条件期望不变。推理时直接使用 $h_j$，不再随机丢弃，也不额外乘以保留概率。期望保持只针对这里的激活，不能推出后续任意非线性网络的输出期望也完全相同。

### 示例：掩码与缩放

- 输入：$\mathbf h=[2,4,6,8]$，$p=0.5$。
- 一次可能的掩码：$[1,0,1,0]$。
- 训练输出：$[4,0,12,0]$。
- 推理输出：$[2,4,6,8]$。

```python
import numpy as np

h = np.array([2.0, 4.0, 6.0, 8.0])
p = 0.5
mask = np.array([1, 0, 1, 0])
print(mask * h / (1 - p))
rng = np.random.default_rng(42)
masks = rng.random((100000, len(h))) >= p
print((masks * h / (1 - p)).mean(axis=0))
```

第一行是指定掩码的精确结果；第二行用大量独立掩码估计期望，应接近原始激活。

```python
import torch

torch.manual_seed(42)
dropout = torch.nn.Dropout(p=0.5)
h = torch.tensor([2.0, 4.0, 6.0, 8.0])
dropout.train()
print(dropout(h))
dropout.eval()
print(dropout(h))
```

训练输出每个元素要么为零，要么为原值的两倍；具体掩码依赖随机数实现。验证和推理必须切换 `eval()`。线性模型不一定需要 Dropout，各种网络使用的位置和强度也不同。

## 数据增强

数据增强（Data Augmentation）通过对训练样本作合理变换，表达任务应具有的某种不变性或等变性。

图像分类中，适度裁剪、颜色扰动或水平翻转可能保持类别。但数字 6 旋转后可能改变含义，医学影像左右翻转可能破坏位置语义，不能默认所有变换都保持标签。

目标检测裁剪图像后需要同步更新边界框；分割变换图像后需要同步变换掩码；文本删除一个“不”可能直接改变情感或事实含义。

训练时对已划分好的训练集做增强。验证和测试采用固定、可复现的预处理。不能把同一原图的不同增强版本分别放进训练和测试。

## 早停

早停（Early Stopping）根据验证表现选择训练终点：训练损失可以继续下降，但验证表现长期不改善时停止，并恢复验证最优时的参数。

它通过限制训练过程起到正则化作用。需要规定监测指标、最小改善幅度和容忍次数；停止时刻通常晚于最佳时刻，所以不能直接把最后一轮参数当最佳参数。示例见[学习率与训练曲线](learning-rate-and-training.md)。

## 参考资料

- [Dive into Deep Learning：Weight Decay](https://d2l.ai/chapter_linear-regression/weight-decay.html)
- [Dive into Deep Learning：Dropout](https://d2l.ai/chapter_multilayer-perceptrons/dropout.html)
- [Decoupled Weight Decay Regularization](https://arxiv.org/abs/1711.05101)
