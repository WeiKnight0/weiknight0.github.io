---
title: Embedding：查表、梯度与表示空间
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 离散编号与向量

词、商品、用户等离散对象可以用整数编号表示，但编号大小通常没有距离含义。编号 20 不代表比编号 10“大两倍”，相邻编号也不表示语义接近。

Embedding 使用可学习矩阵 $E\in\mathbb R^{V\times d}$，其中 $V$ 为对象数量，$d$ 为表示维度。编号 $i$ 的向量为第 $i$ 行 $\mathbf e_i=E_{i,:}$。

输入编号为 $(N,L)$ 时，查表输出为 $(N,L,d)$；参数量为 $Vd$。长序列增加输出和激活内存，但不会增加这张表的参数量。

## 与 One-hot 乘法的关系

令 $\mathbf o_i$ 为长度 $V$ 的 One-hot 行向量，第 $i$ 个位置为 1，其余为 0。则 $\mathbf o_iE=E_{i,:}$。

数学上查表等价于 One-hot 乘矩阵，实现时直接取行，避免创建庞大的稀疏 One-hot 张量。Embedding 本身仍可能是很大的稠密参数表。

```python
import torch
import torch.nn.functional as F

E = torch.tensor([[0., 0.], [1., 2.], [3., 4.], [5., 6.]])
ids = torch.tensor([[1, 3, 1]])
lookup = E[ids]
one_hot_result = F.one_hot(ids, num_classes=4).float() @ E
print(lookup)
print(torch.equal(lookup, one_hot_result))
```

输出依次是 `[1,2]`、`[5,6]`、`[1,2]`，比较为 `True`。同一编号重复出现时会取到同一行参数。

## 查表如何训练

梯度针对被取出的浮点向量和矩阵权重，不针对整数编号求导。若编号 $i$ 在多个位置出现，这些位置传回的梯度累加到 $E$ 的同一行。

设损失为所有输出元素之和，编号 `[1,3,1]` 中第 1 行出现两次，第 3 行一次，因此这两行的梯度分别为 `[2,2]` 与 `[1,1]`。

```python
import torch

embedding = torch.nn.Embedding(4, 2)
ids = torch.tensor([1, 3, 1])
output = embedding(ids)
output.sum().backward()
print(embedding.weight.grad)
```

输出梯度矩阵为 `[[0,0],[2,2],[0,0],[1,1]]`。这个损失只演示累加规则，不能学习有意义的语义；实际梯度来自分类、语言建模或对比学习等目标。

未访问行在这次查表反向中没有数据梯度，但若存在权重衰减、优化器历史状态或其他共享用途，不能据此保证这些行在整个更新步骤中一定不变。

## Padding 与掩码

批量序列常用 PAD 补齐长度。`padding_idx` 可使对应行不接收该 Embedding 查表反向产生的梯度，新建模块默认把这行初始化为零。

它不会自动屏蔽注意力、自动忽略损失，或者自动使平均池化排除 PAD。预训练表中该行也可能被设为其他值。

```python
import torch

embedding = torch.nn.Embedding(4, 2, padding_idx=0)
with torch.no_grad():
    embedding.weight.copy_(torch.tensor([[0., 0.], [1., 2.], [3., 4.], [5., 6.]]))
ids = torch.tensor([[1, 3, 0]])
vectors = embedding(ids)
valid = ids != 0
pooled = (vectors * valid.unsqueeze(-1)).sum(dim=1) / valid.sum(dim=1, keepdim=True)
pooled.sum().backward()
print(pooled)
print(embedding.weight.grad[0])
```

输出平均向量为 `[[3,4]]`，PAD 行梯度为 `[0,0]`。若直接对三个位置取平均会得到 `[2, 8/3]`，错误地把补齐长度计入分母。本例保证每条序列至少有一个有效 Token；全 PAD 输入应在数据边界明确处理。

## 词表与表示空间

词表负责把输入转换为编号，Embedding 负责把编号转换为向量。未知词、子词切分、特殊标记属于词表和 Tokenization 设计，Embedding 不会自动推断一个超出范围的编号是什么意思。

随机初始化的向量没有天然语义。训练任务决定哪些对象需要相近、哪些差异需要保留。余弦接近常用于检索，但不等于任何场景下都含义相同。

静态查表给同一编号固定的初始表示；经过 Transformer 等上下文模型后，同一个词在不同句子里可以得到不同表示。因此“词向量”需要说明指查表结果还是上下文层输出。

## 位置表示与权重共享

单纯查表不包含序列位置：交换两个编号只会交换对应向量。序列模型需要通过递归结构、位置编码或其他机制表达顺序。

语言模型输出词表分数时，有时共享输入 Embedding 权重：若隐藏表示 $H$ 的末维为 $d$，可计算 $Z=HE^\mathsf T$，得到词表维 $V$ 的 Logit。此时 $E$ 同时参与输入查表和输出投影，梯度来自两条路径。

```python
import torch

E = torch.tensor([[0., 0.], [1., 2.], [3., 4.], [5., 6.]])
hidden = torch.tensor([[1., -1.]])
logits = hidden @ E.T
print(logits)
```

输出 `[[0,-1,-1,-1]]`，形状为 `(1,4)`。共享要求维度和模型设计匹配，并不适用于所有任务。

后续：[对比学习](../learning-paradigms/contrastive-learning.md)。

## 参考资料

- [PyTorch：Embedding](https://docs.pytorch.org/docs/stable/generated/torch.nn.Embedding.html)
- [Using the Output Embedding to Improve Language Models](https://arxiv.org/abs/1608.05859)
