---
title: 迁移学习：预训练、冻结与微调
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 预训练与下游任务

迁移学习利用一个任务或数据域中学到的参数、表示，帮助另一个任务。例如先在大量图像上学习通用视觉特征，再用少量花卉图片训练品种分类器。

预训练（Pretraining）是获得初始模型的阶段；下游任务是随后实际需要解决的任务。预训练可以使用监督、自监督等方式，微调也不限定必须使用人工类别标签。

将模型写成 $\hat{\mathbf y}=g_\phi(f_\theta(\mathbf x))$。$f_\theta$ 是特征提取器或主干，$g_\phi$ 是任务头。迁移时可以保留主干，替换不匹配的输出头。

## 三种常见训练方式

| 方式 | 更新哪些参数 | 适用考虑 |
| --- | --- | --- |
| 冻结特征、训练任务头 | 只更新 $\phi$ | 数据少、资源有限，先检验特征是否有用 |
| 部分微调 | 更新任务头及主干的一部分 | 兼顾适应性与训练成本 |
| 全量微调 | 更新全部 $\theta,\phi$ | 希望主干也适应目标数据，但更易过拟合或遗忘 |

Linear Probe 特指冻结表示后训练线性预测头；若训练的是复杂非线性头，就不应简单称为线性探测。微调通常给预训练主干更小的学习率，但具体大小仍需验证。

从零训练提供一个重要基线：若迁移后反而更差，可能存在负迁移，即来源模型的知识或归纳偏好不适合目标任务。

## 冻结参数与评估模式

设置 `requires_grad=False` 使参数不参与梯度求解，但不会自动把 Dropout 或 BatchNorm 切到评估模式。

若要求主干完全固定，还应根据模型结构控制 `eval()`：BatchNorm 的运行均值和方差属于状态，即使不更新可训练参数，也可能在训练模式中改变。冻结参数与冻结运行状态是两个操作。

下面使用已明确设定权重的小型主干演示接口。它不是从外部下载的预训练模型，不用于证明迁移效果。

```python
import torch
from torch import nn

torch.manual_seed(42)
backbone = nn.Linear(2, 2)
with torch.no_grad():
    backbone.weight.copy_(torch.eye(2))
    backbone.bias.zero_()
backbone.requires_grad_(False)
backbone.eval()
head = nn.Linear(2, 2)
optimizer = torch.optim.SGD(head.parameters(), lr=0.1)
X = torch.tensor([[-1.0, 0.0], [1.0, 0.0]])
y = torch.tensor([0, 1])
before = backbone.weight.detach().clone()

with torch.no_grad():
    features = backbone(X)
head.train()
for _ in range(100):
    optimizer.zero_grad()
    loss = nn.functional.cross_entropy(head(features), y)
    loss.backward()
    optimizer.step()
print(torch.equal(before, backbone.weight))
print(head(features).argmax(dim=1))
```

输出 `True` 和类别 `[0, 1]`。主干固定且本例没有随机增强，可以提前缓存特征；若每轮输入视图变化或准备更新主干，则不能复用这份缓存。

## 解冻后继续微调

解冻后需要让优化器包含新加入训练的参数，并重新计算主干输出。仅设置 `requires_grad=True` 不会把参数自动加入一个只管理任务头的优化器。

下面接续上一段，显式新建优化器，主干学习率低于任务头。这里新建意味着优化器历史状态也重新开始。

```python
backbone.requires_grad_(True)
backbone.train()
head.train()
optimizer = torch.optim.SGD([
    {'params': backbone.parameters(), 'lr': 0.01},
    {'params': head.parameters(), 'lr': 0.1},
])
optimizer.zero_grad()
logits = head(backbone(X))
loss = nn.functional.cross_entropy(logits, y)
loss.backward()
optimizer.step()
print(backbone.weight.grad is not None)
```

输出 `True`。此时主干前向不能放在 `no_grad()` 中，否则它的参数梯度会被切断。若冻结模块之前存在需要训练的输入模块，同样要考虑梯度是否必须穿过这个冻结模块；冻结权重不总意味着整个前向都能关闭梯度。

## 数据与任务匹配

迁移时核对输入尺寸、归一化、通道顺序、词表和特殊 Token。已有权重学习的是特定输入约定，错误预处理会破坏表示。

替换分类头时核对类别数与编号映射。类别名称相似也不意味着来源模型的第 0 类就是目标任务的第 0 类。

模型在新任务上更新后，可能损失原任务能力，称为灾难性遗忘。保留原能力有要求时，需要同时评估原任务和新任务，而不是只看微调集上的提升。

参数高效微调只训练少量新增或选定参数，例如 Adapter、LoRA。它减少需要更新和保存的参数，但不意味着主干前向和激活内存全部消失；具体结构留在语言模型微调章节。

## 评估迁移效果

使用相同目标数据划分，比较从零训练、冻结特征和微调。分别调整合理的训练配置，记录训练参数量、资源与验证表现。若用测试集决定冻结哪些层，测试集已经参与模型选择。

本节训练状态操作依赖[自动微分基础](../systems/numpy-and-pytorch.md)，模型头的计算见[MLP](../models/mlp.md)。

## 参考资料

- [PyTorch：Transfer Learning for Computer Vision](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)
