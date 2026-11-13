---
title: 语言建模：下一个 Token 与困惑度
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 自回归语言模型

给定 Token 序列 $x_1,\ldots,x_T$，自回归语言模型用概率链式法则分解联合概率：

$$
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t}).
$$

模型在每个位置输出词表上的 Logit。Causal Mask 保证位置 $t$ 的隐藏状态只读取 $x_{\le t}$，该位置 Logit 用于预测 $x_{t+1}$。

设输入为 `[BOS, 我, 爱, 猫]`，标签为 `[我, 爱, 猫, EOS]`。这是同一序列错开一位，不是在当前位置复述已经看到的 Token。

```python
import torch

tokens = torch.tensor([[1, 5, 8, 9, 2]])
input_ids = tokens[:, :-1]
labels = tokens[:, 1:]
print(input_ids)
print(labels)
```

## 负对数似然与交叉熵

对有效预测位置集合 $\mathcal V$，Token 平均负对数似然为：

$$
L=-\frac1{|\mathcal V|}\sum_{t\in\mathcal V}
\log p(x_t\mid x_{<t}).
$$

训练使用原始 Logit 交给交叉熵函数；不先手动 Softmax。数值稳定实现内部使用 Log-Sum-Exp。

```python
import math
import torch
import torch.nn.functional as F

logits = torch.tensor([[[2., 0., 0.], [0., 2., 0.], [0., 0., 2.]]])
labels = torch.tensor([[0, 1, 2]])
loss = F.cross_entropy(logits.transpose(1, 2), labels)
perplexity = loss.exp()
expected = math.log(math.exp(2) + 2) - 2
print(loss.item(), expected)
print(perplexity.item())
```

三个位置正确类别结构相同，平均损失约为 `0.239545`，困惑度约为 `1.270671`。

## 困惑度

困惑度（Perplexity，PPL）是平均负对数似然的指数：

$$
\operatorname{PPL}=\exp(L).
$$

若所有位置都在 $K$ 个 Token 上均匀分布，则 $L=\log K$，PPL 为 $K$。PPL 越低表示模型给真实序列分配的平均概率越高，但它不直接衡量事实性、推理能力或生成偏好。

PPL 依赖 Tokenizer。把一个词拆成不同数量 Token 会改变平均单位，因此使用不同词表或规范化的模型，其 Token 级 PPL 通常不能直接比较。若使用自然对数，指数为 $e^L$；使用以 2 为底的平均负对数时则为 $2^L$。

## Padding 与损失屏蔽

PAD 不是真实文本，不应进入损失平均。常用做法把 PAD 标签改为 `ignore_index`，输入 ID 仍保留 PAD 供模型执行批处理。

```python
import torch
import torch.nn.functional as F

logits = torch.tensor([
    [[3., 0., 0.], [0., 3., 0.], [0., 0., 3.]],
    [[3., 0., 0.], [0., 3., 0.], [9., 0., 0.]],
])
labels = torch.tensor([[0, 1, 2], [0, 1, -100]])
loss = F.cross_entropy(logits.transpose(1, 2), labels, ignore_index=-100)
print(loss.item(), loss.exp().item())
```

第二条序列最后一个 Logit 即使很极端，也不影响结果。Attention 的 Padding Mask 与损失忽略仍是两处独立操作。

## 从连续文本制作训练样本

长 Token 流可切成长度为 $L+1$ 的窗口，前 $L$ 个作输入，后 $L$ 个作标签。窗口之间可以不重叠、部分重叠，或使用文档打包。

```python
import torch

stream = torch.arange(13)
context, stride = 4, 3
windows = [stream[start:start + context + 1] for start in range(0, len(stream) - context, stride)]
inputs = torch.stack([window[:-1] for window in windows])
labels = torch.stack([window[1:] for window in windows])
print(inputs)
print(labels)
```

重叠窗口会让部分 Token 多次计入训练。评估 PPL 时也要避免重复计数；若用滑窗提供更长左上下文，应只累计每个窗口中新引入位置的损失。

不同文档拼接时应插入 EOS 或设置边界 Mask。否则模型会学习前一文档末尾直接预测下一篇无关文档开头的人工关系。

## 一个最小因果 Transformer LM

```python
import torch
from torch import nn

class CausalLanguageModel(nn.Module):
    def __init__(self, vocabulary, model_dim, heads, layers, max_length):
        super().__init__()
        self.token_embedding = nn.Embedding(vocabulary, model_dim)
        self.position = nn.Parameter(torch.zeros(1, max_length, model_dim))
        layer = nn.TransformerEncoderLayer(
            model_dim, heads, model_dim * 4, dropout=0.0, batch_first=True, norm_first=True
        )
        self.transformer = nn.TransformerEncoder(layer, layers)
        self.norm = nn.LayerNorm(model_dim)
        self.output = nn.Linear(model_dim, vocabulary, bias=False)

    def forward(self, input_ids):
        length = input_ids.size(1)
        X = self.token_embedding(input_ids) + self.position[:, :length]
        causal = torch.triu(torch.ones(length, length, dtype=torch.bool), diagonal=1)
        return self.output(self.norm(self.transformer(X, mask=causal)))

torch.manual_seed(42)
model = CausalLanguageModel(20, 16, heads=4, layers=2, max_length=32)
input_ids = torch.tensor([[1, 4, 7, 2], [1, 3, 2, 0]])
logits = model(input_ids)
print(logits.shape)
```

输出 `(2,4,20)`，每个位置对应下一 Token 的词表分数。训练时还需错开标签并屏蔽 PAD；示例没有把两者藏进模型内部。

## 评估规则

- 在固定 Tokenizer、数据顺序和上下文长度下比较 PPL。
- 只累计真实且首次评估的 Token，不计 PAD 和人工补齐。
- 明确 BOS、EOS 是否计入损失。
- 验证集必须与预训练语料去重；低 PPL 不能排除记忆或泄漏。
- 同时报告任务指标和生成检查，不能用 PPL 代替全部能力评估。

下一篇：[BERT 与 GPT](bert-and-gpt.md)。

## 参考资料

- [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
