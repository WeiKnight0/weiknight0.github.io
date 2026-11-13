---
title: 图文任务：配对数据与评估
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 图像和文本之间要解决什么

图文学习不是单一任务。模型输出、训练目标和评估指标取决于最终问题：

| 任务 | 输入 | 输出 | 常见形式 |
| --- | --- | --- | --- |
| 图文检索 | 图像或文本 | 另一模态的排序列表 | 双编码器相似度 |
| 图像描述 | 图像 | 一段文本 | 条件自回归生成 |
| 视觉问答 | 图像与问题 | 答案 | 分类或生成 |
| 零样本分类 | 图像与类别文本 | 类别 | 图文相似度 |
| 图文匹配 | 一对图文 | 是否匹配 | 二分类或匹配分数 |

双编码器适合预先计算候选表示并进行大规模检索，但图像与文本只在最终向量处交互。Cross-Encoder 或融合模型让两侧 Token 深度交互，通常表达能力更强，却难以离线缓存全部候选。

## 图文配对数据

一个样本通常写为 $(I_i,T_i)$，表示文本 $T_i$ 描述图像 $I_i$。这种对应关系可能来自人工标注、网页邻近文本、标题或替代文本，质量并不相同。

需要区分以下情况：

- 一张图像有多条正确描述；同一批中的这些文本都是正样本，不能强行只认一条。
- 不同图像可能表达相同语义，把它们一概视为负样本会产生假负样本。
- 文本可能只描述图中一部分，图像与文字相关不等于两者信息完全相同。
- 网页配对可能包含错误、重复、水印文字、隐私信息与社会偏差，需要清洗和数据治理。

训练、验证和测试应按原始对象或来源去重后划分。同一图片的缩放版、裁剪版或重复 URL 若跨越划分，会让检索指标虚高。

## 批处理与正样本矩阵

只有一一配对时，批内正样本矩阵是单位阵。存在多条描述时，应显式构造布尔正样本矩阵 $P$，其中 $P_{ij}=1$ 表示图像 $i$ 与文本 $j$ 匹配。

```python
import torch

image_ids = torch.tensor([10, 20, 30])
text_image_ids = torch.tensor([10, 10, 20, 30, 30])
positive = image_ids[:, None] == text_image_ids[None, :]
print(positive)
print(positive.sum(dim=1))
```

三张图像分别有 2、1、2 条正文本。此时直接使用“对角线是唯一正样本”的交叉熵并不适用，需要多正样本对比损失或按一一对应方式采样。

图像和文本预处理也属于模型接口。图像侧包括颜色通道、缩放、裁剪和归一化；文本侧包括 Tokenizer、大小写、截断、BOS/EOS 与 Padding。训练与评估必须使用与权重一致的处理规则。

## 图文检索

文本检索图像（Text-to-Image）把每条文本作为 Query，对所有图像排序；图像检索文本（Image-to-Text）方向相反。两个方向候选数和一对多关系可能不同，必须分别报告。

Recall@$K$ 表示至少一个正确候选出现在前 $K$ 名的 Query 比例：

$$
R@K=\frac1Q\sum_{q=1}^{Q}
\mathbf 1\left[\min_{j\in\mathcal P_q}\operatorname{rank}_q(j)\le K\right].
$$

$\mathcal P_q$ 是 Query $q$ 的全部正确候选。若一张图有五条描述，命中其中任意一条就算该 Query 在 $K$ 内召回。

### 示例：计算 Recall@K

```python
import torch

similarity = torch.tensor([
    [0.9, 0.2, 0.1, 0.0],
    [0.3, 0.8, 0.7, 0.1],
    [0.6, 0.5, 0.4, 0.9],
])
positive = torch.tensor([
    [True, False, False, False],
    [False, False, True, False],
    [False, True, False, False],
])
ranking = similarity.argsort(dim=1, descending=True)
ranked_positive = positive.gather(1, ranking)
recall_at_1 = ranked_positive[:, :1].any(dim=1).float().mean()
recall_at_2 = ranked_positive[:, :2].any(dim=1).float().mean()
print(ranking)
print(recall_at_1.item(), recall_at_2.item())
```

第 0 条 Query 的正确候选排第 1，第 1 条排第 2，第 2 条排第 3，因此 `R@1 = 1/3`，`R@2 = 2/3`。Recall@$K$ 随 $K$ 增大不会下降。

Median Rank 是每条 Query 的最佳正确候选名次的中位数，越小越好。Mean Reciprocal Rank 使用最佳正确候选名次倒数的平均：

$$
MRR=\frac1Q\sum_{q=1}^{Q}\frac1{r_q}.
$$

报告指标时还需说明候选池范围。只在一个小批次内检索通常远比在完整测试集检索容易，二者数值不可直接比较。

## 零样本分类

零样本图像分类把每个类别写成文本，例如 `a photo of a {class}`，再选择与图像表示最相似的类别文本。它不使用该数据集的训练图像更新模型参数，但仍会受到预训练数据重合、类别名称和 Prompt 设计影响。

类别词可能含歧义。“crane” 可以表示鹤或起重机，只有裸类别名时上下文不足。Prompt 模板和类别描述应根据任务语义确定，并在固定验证规则下选择，不能用测试标签逐项调 Prompt。

## 图像描述与生成指标

图像描述是生成任务，同一图像可以有多种正确说法。Token 级交叉熵用于训练，不等同于生成质量。

BLEU 侧重 $n$-gram 精确率，ROUGE-L 利用最长公共子序列，CIDEr 根据多参考描述中的 TF-IDF 加权 $n$-gram 一致性，SPICE 更关注语义命题。它们各自只覆盖质量的一部分；还应检查事实错误、遗漏、重复和语言流畅度。

生成指标必须使用统一的分词、大小写和标点处理，并报告参考描述数量。不同评估实现的预处理差异会改变结果。

## 评估边界

- 检索前应对表示进行与训练一致的归一化。
- 候选库必须固定；动态删去“困难候选”会改变任务。
- 一对多数据必须保留完整正样本集合。
- 数据重复和训练集泄漏应单独检测，不能由高 Recall 自动排除。
- 除总体指标外，应按文本长度、图像类型、语言和困难样本分析误差。

下一篇：[CLIP](clip.md)。

## 参考资料

- [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020)
- [Microsoft COCO: Common Objects in Context](https://arxiv.org/abs/1405.0312)
- [COCO Caption Evaluation](https://cocodataset.org/#captions-eval)
