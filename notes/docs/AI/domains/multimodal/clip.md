---
title: CLIP：图文对齐、零样本分类与检索
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 双编码器结构

CLIP（Contrastive Language–Image Pre-training）使用图像编码器和文本编码器分别处理两种模态：

$$
v_i=f_{\mathrm{image}}(I_i),\qquad
t_i=f_{\mathrm{text}}(T_i).
$$

两侧输出再投影到相同维度并做 L2 归一化：

$$
\bar v_i=\frac{v_i}{\|v_i\|_2},\qquad
\bar t_i=\frac{t_i}{\|t_i\|_2}.
$$

图像编码器可以是 [ResNet](../../models/resnet.md) 或 [ViT](../computer-vision/vit.md)，文本编码器使用 Transformer。两侧不共享主干参数；“共享空间”指最终投影后的向量可以直接比较。

双编码器只需分别计算每个候选一次。图像库和文本库表示可以离线缓存，适合大规模检索；代价是编码阶段不能进行细粒度图文 Token 交互。

## 相似度矩阵与温度

一个批次有 $N$ 对图文，归一化表示矩阵为 $V,T\in\mathbb R^{N\times d}$。CLIP 计算全部批内图文相似度：

$$
S=\exp(s)VT^\mathsf T,
$$

其中 $s$ 是可学习标量 `logit_scale`，有效温度为 $\tau=\exp(-s)$。用指数参数化可保证缩放为正。原始 CLIP 将 `logit_scale` 初始化为 $\log(1/0.07)$，训练时限制最大缩放为 100。

```python
import math
import torch
import torch.nn.functional as F

image_features = torch.tensor([[1., 0.], [0., 1.]])
text_features = torch.tensor([[0.8, 0.2], [0.1, 0.9]])
images = F.normalize(image_features, dim=1)
texts = F.normalize(text_features, dim=1)
logit_scale = torch.tensor(math.log(1 / 0.07))
logits = logit_scale.exp().clamp(max=100) * images @ texts.T
print(logits)
print(logits.argmax(dim=1))
```

每行表示一张图像对所有文本的分类分数；每列则对应一个文本对所有图像。示例中两个正确配对都位于对角线。

归一化不能省略。若直接使用未归一化内积，模型可通过增大向量范数改变分数，距离不再只反映方向相似度。

## 对称对比损失

一一配对且批内没有重复正样本时，对角线 $(i,i)$ 是正确图文对。图像到文本损失把每一行视为 $N$ 类分类：

$$
L_{I\rightarrow T}=\frac1N\sum_{i=1}^{N}
-\log\frac{\exp(S_{ii})}{\sum_j\exp(S_{ij})}.
$$

文本到图像损失对每一列分类，即对 $S^\mathsf T$ 使用同一目标：

$$
L_{T\rightarrow I}=\frac1N\sum_{i=1}^{N}
-\log\frac{\exp(S_{ii})}{\sum_j\exp(S_{ji})}.
$$

最终损失为两者平均：

$$
L=\frac{L_{I\rightarrow T}+L_{T\rightarrow I}}2.
$$

```python
import torch
import torch.nn.functional as F

torch.manual_seed(42)
raw_images = torch.randn(4, 8, requires_grad=True)
raw_texts = raw_images.detach() + 0.1 * torch.randn(4, 8)
raw_texts.requires_grad_()
images = F.normalize(raw_images, dim=1)
texts = F.normalize(raw_texts, dim=1)
scale = torch.tensor(1 / 0.07)
logits = scale * images @ texts.T
targets = torch.arange(len(images))
image_loss = F.cross_entropy(logits, targets)
text_loss = F.cross_entropy(logits.T, targets)
loss = (image_loss + text_loss) / 2
loss.backward()
print(logits.shape, loss.item())
print(raw_images.grad.norm(), raw_texts.grad.norm())
```

两个方向都反向传播到两个编码器。只优化行损失也会更新两侧参数，但目标只保证图像在文本候选中分类正确，不能替代对称目标。

## 多正样本

原始对角线交叉熵假设批次内每张图只有一条正确文本。若同图多描述同时出现，把额外正确描述当负样本会产生矛盾。可以使用[正样本矩阵](image-text-tasks.md#批处理与正样本矩阵)定义多正样本目标：

$$
L_i=-\log\frac{\sum_{j:P_{ij}=1}\exp(S_{ij})}{\sum_j\exp(S_{ij})}.
$$

```python
import torch

logits = torch.tensor([[3., 2., 0.], [0., 1., 3.]])
positive = torch.tensor([[True, True, False], [False, False, True]])
log_numerator = torch.logsumexp(logits.masked_fill(~positive, float('-inf')), dim=1)
log_denominator = torch.logsumexp(logits, dim=1)
loss = (log_denominator - log_numerator).mean()
print(loss.item())
```

公式把同一 Query 的正样本概率质量相加。多正样本的图像到文本与文本到图像集合可能不同，需要分别构造，不能机械转置一个不完整标签表。

## 分布式批内负样本

批内其他样本构成负候选。多卡训练若只使用本卡表示，每个 Query 只能看到本地批次；通常先聚合各卡表示，再构造全局相似度矩阵。

聚合后标签必须使用全局索引。例如每卡批量 $B$、当前进程编号 $r$，本地第 $i$ 个样本的正样本列为 $rB+i$。若直接仍用 `0...B-1`，除第 0 张卡外标签都会错位。

相似度矩阵内存随全局批量平方增长。更大批量增加负候选，但也可能增加假负样本，不能只按批量大小推断表示质量。

## 零样本分类

对 $C$ 个类别分别生成文本 Prompt，经文本编码器得到归一化类别向量 $t_c$。图像向量为 $v$，类别概率为：

$$
p(y=c\mid I)=\operatorname{softmax}_c(\exp(s)\bar v^\mathsf T\bar t_c).
$$

```python
import torch
import torch.nn.functional as F

image = F.normalize(torch.tensor([[0.9, 0.1, 0.0]]), dim=1)
prompt_features = torch.tensor([
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0],
])
classes = F.normalize(prompt_features, dim=1)
logits = 10 * image @ classes.T
probabilities = logits.softmax(dim=1)
print(probabilities)
print(probabilities.argmax(dim=1))
```

预测为类别 0。真实使用时，类别名先放进模型训练时使用的自然语言模板；直接比较类别编号没有意义。

### Prompt Ensemble

可为一个类别生成多个模板，例如 `a photo of a dog` 与 `a blurry photo of a dog`。常见做法是分别编码、归一化，求均值后再次归一化，得到一个类别向量：

```python
import torch
import torch.nn.functional as F

prompt_features = torch.tensor([
    [1.0, 0.1, 0.0],
    [0.8, -0.1, 0.1],
    [0.9, 0.0, -0.1],
])
prompt_features = F.normalize(prompt_features, dim=1)
class_feature = F.normalize(prompt_features.mean(dim=0), dim=0)
print(class_feature)
print(class_feature.norm())
```

不能先把所有类别、所有模板混在一起平均；必须先在同一类别内部聚合。Prompt Ensemble 会改变分类器，应固定模板集合后再比较模型。

## 图文检索

检索时分别批量编码 Query 和候选库，归一化后计算矩阵乘法。缩放因子为正常数时不改变相似度排序，因此只做 Top-$K$ 排序可以省略温度；若还要输出 Softmax 概率，则温度会改变概率分布。

```python
import torch
import torch.nn.functional as F

queries = F.normalize(torch.tensor([[1., 0.], [0., 1.]]), dim=1)
candidates = F.normalize(torch.tensor([
    [0.9, 0.1], [0.2, 0.8], [-1.0, 0.0]
]), dim=1)
similarity = queries @ candidates.T
scores, indices = similarity.topk(k=2, dim=1)
print(indices)
print(scores)
```

图像检索文本与文本检索图像只是矩阵的两个方向，评估时仍要分别按完整正样本集合计算 [Recall@$K$](image-text-tasks.md#图文检索)。

## 能力边界

CLIP 学到的是配对数据支持的图文关联，不自动获得可靠的计数、空间关系、细粒度文字识别或因果判断。相似度高表示在模型空间中匹配，不表示描述在事实层面完整正确。

零样本不等于完全未见：模型不使用目标数据集的标注样本微调，但预训练网页数据可能包含相同或相近图像和文字。评估需要考虑数据重合与类别偏差。

## 参考资料

- [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020)
- [OpenAI CLIP 官方实现](https://github.com/openai/CLIP)
- [对比学习：正负样本、温度与 InfoNCE](../../learning-paradigms/contrastive-learning.md)
