---
title: BERT 与 GPT：双向编码和因果生成
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 相同基础，不同可见范围

BERT 和 GPT 都建立在 [Transformer](../../models/transformer.md) 上。主要区别不是“一个理解、一个生成”，而是 Attention 可见范围和预训练目标。

| 模型 | 主体 | Attention | 典型预训练目标 | 每个位置可见内容 |
| --- | --- | --- | --- | --- |
| BERT | Encoder-Only | 双向 | Masked Language Modeling | 全部非 PAD 位置 |
| GPT | Decoder-Only | 因果 | Next-Token Prediction | 当前及左侧位置 |

BERT 的同一层中，位置可以同时读取左右上下文；GPT 的位置 $t$ 不能读取 $t$ 之后的 Token。两者都要屏蔽 PAD，但只有 GPT 还需要 Causal Mask。

```python
import torch

length = 5
bert_visible = torch.ones(length, length, dtype=torch.bool)
gpt_visible = torch.tril(torch.ones(length, length, dtype=torch.bool))
print(bert_visible)
print(gpt_visible)
```

## BERT 输入

BERT 输入表示由 Token、位置和句段 Embedding 相加：

$$
H_i=E_{\mathrm{token}}[x_i]+E_{\mathrm{position}}[i]+E_{\mathrm{segment}}[s_i].
$$

句对可组织为 `[CLS] A [SEP] B [SEP]`，句段 ID 区分 A、B。单句通常全部使用同一句段 ID。最终 `[CLS]` 表示可送入分类头，Token 级任务则使用各位置输出。

`[CLS]` 只是约定的可学习 Token；它是否包含适合某个任务的信息取决于预训练和微调，不能把它当作天然句向量。

## Masked Language Modeling

Masked Language Modeling（MLM）选取一部分位置作为预测目标，模型利用左右上下文恢复原 Token。原始 BERT 对选中的位置采用：80% 换成 `[MASK]`，10% 换成随机 Token，10% 保持不变；损失只计算这些选中位置。

```python
import torch

input_ids = torch.tensor([[101, 2054, 2003, 2026, 2171, 102]])
selected = torch.tensor([[False, True, False, True, False, False]])
labels = input_ids.clone()
labels[~selected] = -100
masked_input = input_ids.clone()
masked_input[0, 1] = 103
masked_input[0, 3] = 103
print(masked_input)
print(labels)
```

这里为了固定示例，把两个选中位置都替换为 `[MASK]`。真正的 80/10/10 是随机过程；标签始终保存替换前 Token。不能对所有未选中位置也计算损失，否则任务变成大部分位置复制输入。

原始 BERT 还使用 Next Sentence Prediction（NSP）判断句段 B 是否接在 A 后。后续 Encoder 预训练方法可能删除或替换 NSP，因此“BERT 类模型”不保证都具有这个目标。

## GPT 的因果语言建模

GPT 使用[自回归语言建模](language-modeling.md)：输入整个前缀并在每个位置预测下一 Token。训练时所有位置并行计算，Causal Mask 保证不看未来；生成时新 Token 未知，只能逐步追加。

```python
import torch
import torch.nn.functional as F

tokens = torch.tensor([[1, 4, 7, 9, 2]])
input_ids = tokens[:, :-1]
labels = tokens[:, 1:]
logits = torch.zeros(1, 4, 10)
logits.scatter_(2, labels.unsqueeze(-1), 3.0)
loss = F.cross_entropy(logits.transpose(1, 2), labels)
print(input_ids)
print(labels)
print(loss.item())
```

GPT 训练目标可以覆盖普通文本、代码或格式化对话；区别在数据序列如何构造，不在交叉熵公式本身。

## 下游使用方式

BERT 常在预训练 Encoder 上添加小型任务头：

- 文本分类：读取 `[CLS]` 或池化表示；
- Token 分类：对每个 Token 输出标签；
- 抽取式问答：分别预测答案起点和终点；
- 句对任务：共同输入两个句段并分类。

GPT 把任务写成上下文到续写：Prompt、示例和待回答内容构成前缀，答案作为后续 Token。微调时仍可只对答案部分计算损失。

双向 BERT 不适合直接逐 Token 生成任意长度文本，因为它没有按前缀训练下一 Token 分布；因果 GPT 可以生成，但每个位置缺少右侧上下文。选择架构应按所需信息流，而不是笼统比较谁更先进。

## 参数共享与输出头

语言模型输出层把隐藏状态映射到词表 Logit，权重形状为 $(|V|,d)$。它可与输入 Token Embedding 共享：

```python
import torch

embedding = torch.nn.Embedding(100, 16)
lm_head = torch.nn.Linear(16, 100, bias=False)
lm_head.weight = embedding.weight
hidden = torch.randn(2, 5, 16)
logits = lm_head(hidden)
print(logits.shape)
print(lm_head.weight.data_ptr() == embedding.weight.data_ptr())
```

共享后两处引用同一个参数，不是初始化成相同数值后各自更新。输出仍为每位置 100 个词表 Logit。

## 参考资料

- [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805)
- [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)
