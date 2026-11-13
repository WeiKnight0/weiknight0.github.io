---
title: LLaVA：视觉 Projector 与多模态指令微调
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 数据流

LLaVA 连接预训练 CLIP 视觉编码器与因果语言模型。图像经过视觉编码器得到 Patch 特征 $Z_v$，再由 Projector $g$ 映射到 LLM 的 Embedding 宽度：

$$
H_v=g(Z_v).
$$

$H_v$ 作为一段视觉 Token 插入对话序列，文本 Token 使用 LLM 原有 Embedding。LLM 在视觉与文本前缀条件下自回归生成回答。

```python
import torch
from torch import nn

torch.manual_seed(42)
vision_features = torch.randn(2, 16, 24)
text_embeddings = torch.randn(2, 7, 32)
projector = nn.Sequential(nn.Linear(24, 64), nn.GELU(), nn.Linear(64, 32))
visual_tokens = projector(vision_features)
llm_inputs = torch.cat((visual_tokens, text_embeddings), dim=1)
print(visual_tokens.shape)
print(llm_inputs.shape)
```

Projector 改变特征维度，不改变 16 个视觉位置。视觉 Token 数由图像编码器分辨率、Patch 和特征选择决定，不是由 LLM 词表决定。

## 图像占位符

对话文本可包含一个图像占位符。Tokenize 后，在占位符位置用视觉 Token 序列替换，而不是把同一个图像 ID 重复若干次。

```python
import torch

before_image = torch.randn(2, 3, 32)
visual_tokens = torch.randn(2, 16, 32)
after_image = torch.randn(2, 5, 32)
inputs = torch.cat((before_image, visual_tokens, after_image), dim=1)
labels = torch.full((2, 24), -100)
labels[:, 19:] = torch.tensor([4, 7, 8, 9, 2])
print(inputs.shape)
print((labels != -100).sum(dim=1))
```

视觉位置和用户提示位置通常不计算语言建模损失，Assistant 回答位置才作为监督目标。实际实现还要按 Next-Token Prediction 向左错开标签，规则与普通 [SFT](../nlp/pretraining-sft-lora.md#sft-数据格式)相同。

## 两阶段训练

原始 LLaVA 先做特征对齐预训练，再做视觉指令微调。

### 特征对齐

冻结视觉编码器和 LLM，只训练 Projector。使用图像—描述数据，让投影后的视觉特征成为 LLM 可利用的条件。该阶段建立接口，不等于已经学会多轮指令遵循。

### 视觉指令微调

使用图像、指令和回答组成的对话数据训练。原始方案继续冻结视觉编码器，更新 Projector 与 LLM。其他实现可能冻结 LLM、使用 LoRA 或解冻视觉编码器；必须看具体配置，不能只凭“LLaVA”名称判断可训练参数。

训练数据覆盖对话、详细描述和复杂推理等格式。语言模型生成的合成指令仍以图像信息和已有标注为依据；若合成答案添加图中不存在的细节，模型会把错误当监督信号。

## 视觉 Token 与 Attention

当视觉 Token 位于用户问题之前，回答 Token 在因果 Attention 下可以读取全部视觉与问题前缀。视觉 Token 之间的 Mask、图像起止标记和位置 ID 由具体实现规定。

多图输入需要保持每个占位符与视觉 Token 段一一对应。只把多张图的特征全部拼在开头，却不保留边界，会让“第一张图”和“第二张图”的指代难以对应。

高分辨率方法可能切分图像或保留更多 Patch，从而增加视觉 Token。更高分辨率可改善 OCR 与小目标，也会增加 Attention 计算、显存和上下文占用。

## Projector 能做什么

线性 Projector 对每个视觉 Token 独立映射：$h_i=Wz_i+b$。MLP Projector 增加非线性，但仍不主动减少 Token 数。若要固定长度压缩，应使用池化、Resampler 或 [查询瓶颈](fusion-architectures.md#查询瓶颈)。

Projector 负责对齐接口维度与表示分布，不能补回视觉编码器已经丢失的文字、空间或细粒度信息。

## 数据检查

- 图像能否读取，方向和颜色是否正确；
- 占位符数量是否与图像数量一致；
- 回答是否确实可由图像与问题得到；
- Assistant Mask 是否覆盖完整回答而不覆盖用户文本；
- 截断后是否仍保留图像、问题和答案关键部分；
- 同图或近重复图是否跨训练与测试划分。

多模态 SFT 训练损失下降不能证明模型使用了图像。可加入“同一问题替换图像”的对照：若输出几乎不变，模型可能主要依赖语言先验。

## 参考资料

- [Visual Instruction Tuning](https://arxiv.org/abs/2304.08485)
- [LLaVA 官方实现](https://github.com/haotian-liu/LLaVA)
