---
title: 文本生成：Greedy、Beam Search 与采样
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 解码不是训练

语言模型给出条件分布 $p(x_t\mid x_{<t})$，解码策略决定怎样从该分布选择下一个 Token。改变解码不会改变模型参数，却会明显改变确定性、多样性和重复程度。

每步基本流程是：取得最后位置 Logit，应用禁止词、重复惩罚等规则，调整温度，截断候选，选择 Token，遇到 EOS 或长度上限停止。处理顺序会改变最终分布，应明确实现。

## Greedy Decoding

Greedy 每步选择当前概率最大的 Token：

$$
x_t=\arg\max_x p(x\mid x_{<t}).
$$

它确定且计算简单，但局部最优不保证整个序列概率最大。

```python
import torch

step_logits = [
    torch.tensor([0.0, 3.0, 1.0]),
    torch.tensor([0.0, 0.5, 2.0]),
]
generated = [logits.argmax().item() for logits in step_logits]
print(generated)
```

## Temperature

Temperature 在 Softmax 前缩放 Logit：

$$
p_i=\operatorname{softmax}\left(\frac{z_i}{\tau}\right).
$$

$0<\tau<1$ 使分布更尖锐，$\tau>1$ 更平缓。$\tau\to0$ 接近 Greedy，但实现不应直接除以 0。

```python
import torch

logits = torch.tensor([2.0, 1.0, 0.0])
sharp = (logits / 0.5).softmax(dim=0)
flat = (logits / 2.0).softmax(dim=0)
print(sharp)
print(flat)
```

温度不改变 Logit 排序，因此单独使用温度不会改变 Greedy 结果；它只影响采样概率。

## Top-$k$ Sampling

Top-$k$ 只保留当前概率最高的 $k$ 个 Token，重新归一化后采样。固定 $k$ 不考虑分布形状：分布很集中时可能保留无意义尾部，分布平坦时又可能丢掉大量合理候选。

```python
import torch

torch.manual_seed(42)
logits = torch.tensor([3.0, 2.0, 1.0, 0.0])
values, indices = logits.topk(2)
probabilities = values.softmax(dim=0)
sampled = indices[torch.multinomial(probabilities, 1)]
print(indices)
print(probabilities)
print(sampled.item())
```

## Top-$p$ / Nucleus Sampling

Top-$p$ 先按概率降序排列，保留累计概率首次达到阈值 $p$ 所需的最小候选集合，再归一化采样。候选数量随上下文分布变化。

```python
import torch

probabilities = torch.tensor([0.45, 0.30, 0.15, 0.07, 0.03])
sorted_probabilities, sorted_indices = probabilities.sort(descending=True)
cumulative = sorted_probabilities.cumsum(dim=0)
keep = cumulative - sorted_probabilities < 0.8
nucleus_probabilities = sorted_probabilities[keep]
nucleus_probabilities = nucleus_probabilities / nucleus_probabilities.sum()
print(sorted_indices[keep])
print(nucleus_probabilities)
```

阈值为 0.8 时保留前三项：前两项累计 0.75，必须再加入第三项才能达到阈值。表达式使用“加入当前项之前的累计值小于 $p$”，确保跨过阈值的第一个 Token 也被保留。

Top-$k$ 和 Top-$p$ 可以同时使用，此时候选集合是两种约束的交集；参数意义也随处理顺序而变化。

## Beam Search

Beam Search 每一步保留累计对数概率最高的 $B$ 条部分序列。扩展每条 Beam 后，从全部扩展中重新选前 $B$ 条，而不是每条各留一个。

```python
import math

transitions = {
    (): [(1, 0.6), (2, 0.4)],
    (1,): [(3, 0.5), (4, 0.5)],
    (2,): [(3, 0.9), (4, 0.1)],
}
beams = [((), 0.0)]
for _ in range(2):
    candidates = [
        (sequence + (token,), score + math.log(probability))
        for sequence, score in beams
        for token, probability in transitions[sequence]
    ]
    beams = sorted(candidates, key=lambda item: item[1], reverse=True)[:2]
print(beams)
```

第二步最佳序列是 `(2,3)`，联合概率为 $0.4\times0.9=0.36$；Greedy 会先选 1，最终最佳只能达到 $0.6\times0.5=0.30$。

累计对数概率天然偏向短序列，因为每追加一个概率不大于 1 的 Token，得分通常下降。实际 Beam Search 常使用长度归一化，并必须正确处理 EOS：结束序列进入完成集合，不再继续扩展普通 Token。

## 重复与停止

重复惩罚、频率惩罚和存在惩罚都会修改 Logit，但定义并不统一。禁止重复 $n$-gram 是硬约束，可能误伤列表、代码或固定短语。应先观察任务错误，再选择约束。

停止条件至少包括 EOS 和最大新 Token 数。字符串停止词可能跨越多个 Token，不能只检查最后一个 Token ID；解码后再删除停止字符串也可能留下多余前缀。

## 如何选择

- 分类式或要求可复现的短答案：Greedy 常作为基线。
- 翻译等条件生成：可比较 Beam Search 与 Greedy，并统一长度规则。
- 开放式生成：Temperature 配合 Top-$p$ 或 Top-$k$，用固定随机种子做实验复现。
- 评估模型概率：直接计算对数似然，不使用采样文本代替。

解码参数需要在独立验证集上确定。只展示最好的一次随机结果无法说明模型稳定性。

## 参考资料

- [The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751)
- [语言建模：下一个 Token 与困惑度](language-modeling.md)
