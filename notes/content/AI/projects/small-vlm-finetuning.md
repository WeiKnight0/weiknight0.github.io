---
title: 小规模视觉语言模型微调项目
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 项目目标

在单机资源受限环境中，让预训练视觉编码器与小型因果语言模型完成领域图像问答。第一阶段只训练 Projector，第二阶段再按验证结果选择对 LLM 使用 [LoRA](../domains/nlp/pretraining-sft-lora.md#lora)。

项目不是从零训练 VLM。冻结视觉编码器和大部分语言模型参数，把显存用于视觉 Token、语言激活和小型可训练模块。

## 数据契约

每行保存图片与完整对话：

```text
{"id":"sample-001","image":"images/001.jpg","messages":[{"role":"user","content":"<image>\n图中有什么？"},{"role":"assistant","content":"桌上有一个红色杯子。"}],"split":"train"}
```

入口检查：图片存在且可解码、恰有一个 `<image>` 对应一张图、角色顺序合法、Assistant 回答非空、Tokenize 后没有截掉全部回答。坏样本不静默跳过。

划分按原始图像和来源分组。相同图片的不同问题不能跨训练与测试；近重复裁剪图也要去重。

## 模型接口

数据流为：

$$
I\xrightarrow{\text{Vision Encoder}}Z_v
\xrightarrow{\text{Projector}}H_v,
$$

$$
[H_{\text{text-before}},H_v,H_{\text{text-after}}]
\xrightarrow{\text{Causal LLM}}\text{Logits}.
$$

视觉编码器输出宽度与 LLM Embedding 宽度通常不同，Projector 负责映射。它不负责 Tokenize 文本，也不自动压缩视觉 Token 数。

```python
import torch
from torch import nn

class VisualProjector(nn.Module):
    def __init__(self, vision_dim, language_dim):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(vision_dim, language_dim * 2),
            nn.GELU(),
            nn.Linear(language_dim * 2, language_dim),
        )

    def forward(self, vision_features):
        return self.layers(vision_features)

torch.manual_seed(42)
projector = VisualProjector(24, 32)
visual_tokens = projector(torch.randn(2, 16, 24))
print(visual_tokens.shape)
```

## 构造输入与标签

视觉 Token 替换文本中的 `<image>` 占位符。系统、用户和视觉位置用于条件输入，语言建模损失只覆盖 Assistant 目标。

```python
import torch

system_user = torch.randn(2, 6, 32)
visual_tokens = torch.randn(2, 16, 32)
assistant = torch.randn(2, 5, 32)
inputs = torch.cat((system_user, visual_tokens, assistant), dim=1)
labels = torch.full((2, 27), -100)
assistant_token_ids = torch.tensor([[11, 12, 13, 14, 2], [21, 22, 23, 24, 2]])
labels[:, 22:] = assistant_token_ids
print(inputs.shape)
print((labels != -100).sum(dim=1))
```

示例表示监督范围，真实因果语言模型通常由训练接口在内部移位，或由数据管线显式构造 `input_ids[:-1]` 与 `labels[1:]`。只能选择一种，重复移位会错一位。

Padding 位置同样设为 `-100`。若一个批次回答长度不同，先根据 Assistant 范围生成标签，再 Padding，不能按固定尾部长度猜测回答位置。

## 阶段一：只训练 Projector

冻结视觉编码器和 LLM，仅训练 Projector。目标是确认视觉特征能通过 LLM 产生与图片相关的回答。

```python
import torch

vision_encoder = torch.nn.Linear(12, 24)
language_head = torch.nn.Linear(32, 40)
vision_encoder.requires_grad_(False)
language_head.requires_grad_(False)
projector = VisualProjector(24, 32)

images = torch.randn(4, 8, 12)
targets = torch.randint(0, 40, (4, 8))
features = vision_encoder(images)
logits = language_head(projector(features))
loss = torch.nn.functional.cross_entropy(logits.transpose(1, 2), targets)
loss.backward()
print(vision_encoder.weight.grad, language_head.weight.grad)
print(projector.layers[0].weight.grad.norm())
```

两个冻结模块没有梯度，Projector 有梯度。真实训练仍需经过完整 LLM；这里用线性头验证参数冻结与梯度路径。

这一阶段先做小数据过拟合：几十条样本的训练损失应明显下降，并能区分不同图像。如果完全不能过拟合，优先检查占位符、标签 Mask、视觉特征层和梯度，而不是扩大数据。

## 阶段二：LoRA 指令微调

Projector 对齐稳定后，在 LLM Attention 投影上加入 LoRA。初始选择较小秩，明确目标模块、$r$、$\alpha$、Dropout 和可训练 Bias。视觉编码器继续冻结，Projector 与 LoRA 一起训练。

显存估算要包含基础权重、可训练参数、梯度、优化器状态、激活与 KV/Attention 中间量。LoRA 主要减少可训练权重和优化器状态，不会消除基础模型与长序列激活。

可采用梯度累积获得较大有效批量：

$$
B_{\mathrm{effective}}=B_{\mathrm{device}}\times
N_{\mathrm{accumulation}}\times N_{\mathrm{devices}}.
$$

日志中的 Step 必须区分 Micro-batch 与 Optimizer Step，学习率调度按实际 Optimizer Step 计算。

## 训练配置

第一轮保持简单：固定图像分辨率、固定最大文本长度、确定性验证集解码、按有效回答 Token 平均损失。记录：

- 基础视觉模型、LLM 和 Tokenizer 精确版本；
- 图像归一化、特征层与视觉 Token 数；
- Chat Template 与 Assistant Mask 规则；
- Projector、LoRA 和可训练参数量；
- 学习率、有效批量、最大长度、随机种子；
- 每轮训练/验证 Token 损失与任务指标。

Checkpoint 保存 Projector、LoRA、优化器、调度器、训练步数和配置。恢复训练时先核对基础模型与数据版本，不兼容就立即停止。

## 评估

建立固定小测试集，至少覆盖对象、属性、关系、计数、OCR、否定问题和无法判断问题。除答案正确率外，按[多模态幻觉](../domains/multimodal/hallucination-evaluation.md)分别统计错误。

必须做三组对照：

1. 正确图像与问题；
2. 同一问题换成无关图像；
3. 移除图像或用零视觉特征。

若三组输出接近，模型没有充分利用视觉条件。还要与未微调基础模型比较，防止目标任务提高但通用能力严重退化。

生成评估固定 Greedy 或固定采样种子；人工示例只能辅助解释，不能替代完整测试集结果。

## 验收顺序

1. 单样本前向的 Token 数、标签范围和 Logit 形状正确；
2. 冻结模块无梯度，Projector/LoRA 有梯度；
3. 小数据能够过拟合；
4. 验证损失与目标任务指标优于基础模型；
5. 换图对照能引起符合证据的答案变化；
6. 保存后重新加载，固定输入输出一致；
7. 输出数据版本、配置和误差分析报告。

只有这些环节通过后，再扩大数据、分辨率、上下文或解冻更多参数。

## 参考资料

- [Visual Instruction Tuning](https://arxiv.org/abs/2304.08485)
- [BLIP-2](https://arxiv.org/abs/2301.12597)
- [LoRA](https://arxiv.org/abs/2106.09685)
