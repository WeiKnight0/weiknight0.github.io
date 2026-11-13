---
title: 生成建模与判别建模
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 建模对象

判别建模关注给定输入后如何作出判断，例如学习 $p(y\mid\mathbf x)$，或者直接学习决策函数。逻辑回归估计类别概率，SVM 则可以直接学习分类边界而不显式给出概率。

生成建模关注数据的生成分布，例如 $p(\mathbf x)$、联合分布 $p(\mathbf x,y)$，或在条件 $c$ 下生成复杂输出的分布 $p(\mathbf x\mid c)$。模型可以显式计算密度，也可以通过采样过程定义分布。

“监督/自监督”区分训练信号来源，“生成/判别”区分建模目标，它们是不同维度。例如语言模型可以通过自监督训练学习生成分布；带类别标注的朴素 Bayes 也是生成式分类模型。

## 生成式分类

假设要根据邮件特征 $\mathbf x$ 判断是否为垃圾邮件 $y$。生成式分类先估计类别先验 $p(y)$ 和各类别下的特征分布 $p(\mathbf x\mid y)$，然后通过 Bayes 公式分类：

$$
p(y\mid\mathbf x)=\frac{p(\mathbf x\mid y)p(y)}{\sum_c p(\mathbf x\mid c)p(c)}.
$$

比较类别时，分母对所有类别相同，可以只比较分子。朴素 Bayes 进一步假设给定类别后各特征条件独立，从而把类条件分布拆成乘积。

### 示例：一个词能说明什么

令 $x=1$ 表示邮件中出现“中奖”。假设：

- 垃圾邮件先验 $p(y=1)=0.2$，普通邮件先验为 0.8。
- $p(x=1\mid y=1)=0.6$，$p(x=1\mid y=0)=0.05$。

看到“中奖”后的垃圾邮件概率为：

$$
p(y=1\mid x=1)=\frac{0.6\times0.2}{0.6\times0.2+0.05\times0.8}=0.75.
$$

不能把 $p(x=1\mid y=1)=0.6$ 直接当成 $p(y=1\mid x=1)$，两者条件方向不同。

```python
import numpy as np

prior = np.array([0.8, 0.2])
likelihood = np.array([0.05, 0.6])
joint = prior * likelihood
posterior = joint / joint.sum()
print(posterior)
```

输出 `[0.25, 0.75]`。这是已知概率下的分类计算，学习这些概率还需要训练数据。

## 判别式分类

逻辑回归直接用输入计算 $p(y=1\mid\mathbf x)=\sigma(\mathbf x^\mathsf T\mathbf w+b)$，不需要显式解释邮件特征本身如何产生。

因此生成式分类需要同时拟合类别与输入分布，判别式分类直接针对类别决策。但哪种更好取决于数据量、模型假设和任务，不能简单得出生成式必然差或必然更强。

“判别式”也不意味着不能输出概率；“生成式”也不意味着不能分类。具体例子见[逻辑回归](../models/logistic-and-softmax-regression.md)。

## 自回归生成

对序列，概率链式法则给出：

$$
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t}).
$$

生成时先抽取第一个元素，再将已生成前缀作为条件抽取下一个元素，直到结束标记或达到长度上限。每一步输出类别概率，但整体任务是生成一个序列。

下面用手工给定的转移概率演示按条件采样。只有前一个词参与条件，是一阶 Markov 简化，不是完整语言模型。

```python
import numpy as np

rng = np.random.default_rng(42)
words = np.array(['我', '学习', '休息', '<EOS>'])
transition = np.array([
    [0.0, 0.8, 0.2, 0.0],
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
])
current = 0
sequence = [words[current]]
for _ in range(3):
    current = rng.choice(len(words), p=transition[current])
    if current == 3:
        break
    sequence.append(words[current])
print(' '.join(sequence))
```

可能输出“我 学习”或“我 休息”，其概率分别为 0.8 和 0.2。始终选最大概率的贪心解码与按概率采样不同，后者能够得到不同结果。

## 条件生成与其他生成机制

翻译、根据文字生成图像、看图回答问题，都可以视为在条件输入下生成输出。输入是条件，输出本身可能是长序列或高维图像。

模型并非只有自回归一种生成方式。VAE 通过潜变量和解码器建模；GAN 学习从噪声到数据的采样映射；扩散模型通过逐步去噪生成数据。这些模型的训练目标和采样过程不同，不能都写成普通分类交叉熵。

在经典分类语境中，“生成式/判别式”常指联合分布与条件决策的区别；在现代生成任务中，“条件生成模型”也建模条件分布。判断时应结合它生成的对象与任务，而不是只看公式中有没有条件竖线。

## 参考资料

- [Ng、Jordan：On Discriminative vs. Generative Classifiers](https://papers.nips.cc/paper/2001/hash/7b7a53e239400a13bd6be6c91c4f6c4e-Abstract.html)
- [Dive into Deep Learning：Language Models](https://d2l.ai/chapter_recurrent-neural-networks/language-model.html)
