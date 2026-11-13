---
title: 多模态幻觉与评估
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 什么是多模态幻觉

模型输出与图像证据不一致时形成视觉幻觉。需要按可验证对象区分：

- 存在：声称图中有不存在的对象；
- 属性：对象存在，但颜色、材质、状态错误；
- 关系：对象之间的左右、遮挡、动作或从属关系错误；
- 计数：对象数量错误；
- OCR：读出不存在或错误的文字；
- 外部知识：图像无法支持却以确定语气补充身份、地点或原因。

回答遗漏不是幻觉，但同样会降低任务质量。评估必须同时看正确性和覆盖率，不能通过只回答极少内容取得表面低幻觉率。

## 二元问答评估

把问题写成“图中是否有自行车？”可以测存在性。对 `yes` 为正类，统计 TP、FP、FN、TN：

$$
\operatorname{Precision}=\frac{TP}{TP+FP},\qquad
\operatorname{Recall}=\frac{TP}{TP+FN},
$$

$$
F_1=\frac{2PR}{P+R}.
$$

```python
import torch

truth = torch.tensor([True, False, True, False, False, True])
prediction = torch.tensor([True, True, False, False, False, True])
tp = (truth & prediction).sum()
fp = (~truth & prediction).sum()
fn = (truth & ~prediction).sum()
tn = (~truth & ~prediction).sum()
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
yes_ratio = prediction.float().mean()
print(tp, fp, fn, tn)
print(precision.item(), recall.item(), f1.item(), yes_ratio.item())
```

结果为 `TP=2, FP=1, FN=1, TN=2`，Precision、Recall 和 F1 都为 $2/3$。`yes_ratio` 用于观察回答偏置：总回答 yes 或总回答 no 可能在不平衡数据上得到误导性的 Accuracy。

POPE 通过轮询式存在问题评估对象幻觉，并构造不同类型的负样本。它主要测对象存在性，不能代替属性、关系、OCR 和开放式描述评估。

## 开放式生成评估

开放回答先拆成可核验 Claim，再逐条对照图像和参考标注。例如“桌上有两个红杯子”至少包含对象存在、数量、颜色和位置关系。

可记录 $\text{Claim Precision}=\text{受图像支持的 Claim 数}/\text{输出的可核验 Claim 数}$。还需记录参考事实召回率，否则模型可以只说“这是一张图片”获得高 Precision。

自动 Claim 抽取或 LLM 裁判会引入解析和裁判误差，应抽样人工复核，并固定 Prompt、裁判版本和温度。传统 Caption 指标衡量与参考文本的重合，不专门测幻觉；参考描述没提到的对象可能真实存在，也可能是幻觉。

## 对照实验

视觉依赖可以通过成对干预检查：

1. 保持问题不变，换成内容不同的图像；
2. 保持图像不变，改动问题中的对象或属性；
3. 移除图像，比较输出与置信度；
4. 遮挡相关区域，观察答案是否按证据变化。

如果换图后答案仍固定，可能是语言先验、数据模板或解码偏置；但输出改变也不自动证明定位正确，还需核对变化方向。

## 评估矩阵

| 维度 | 示例 |
| --- | --- |
| 感知 | 对象、属性、关系、计数、OCR |
| 推理 | 空间、比较、多步条件 |
| 输入 | 单图、多图、高分辨率、图表 |
| 输出 | 短答案、描述、多轮对话 |
| 可靠性 | 幻觉、拒答、校准、提示敏感性 |

总体平均会掩盖短板。应报告各子集样本数和置信区间；同一测试集反复调 Prompt 会形成测试集过拟合。

## 数据与生成设置

评估前固定图像预处理、Prompt 模板、最大 Token、Temperature、Top-$p$ 和停止条件。Greedy 与采样结果不可混在同一数字中。

测试数据需检查训练重合、近重复图像和问题泄漏。合成评估题还要检查答案是否能从图像唯一确定，尤其是模糊文字、遮挡对象和主观描述。

降低幻觉可以从数据、视觉分辨率、融合结构、负样本指令、训练目标和解码约束入手，但每种方法都应在任务质量与拒答率上同时评估。让模型一律回答“不确定”不是完整解决方案。

## 参考资料

- [POPE](https://arxiv.org/abs/2305.10355)
- [AMBER](https://arxiv.org/abs/2311.07397)
- [Robust Instruction Tuning](https://arxiv.org/abs/2306.14565)
