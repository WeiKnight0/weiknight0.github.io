---
title: Vision Transformer：图像分块与编码
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 图像变成 Token 序列

Vision Transformer（ViT）把图像切成互不重叠的 Patch，将每个 Patch 映射为一个 Token，再交给 [Transformer Encoder](../../models/transformer.md)。

输入图像形状为 $(N,C,H,W)$，正方形 Patch 边长为 $P$，且 $H,W$ 能被 $P$ 整除，则 Patch 数量为：

$$
L=\frac HP\frac WP.
$$

每个 Patch 展平后有 $CP^2$ 个值，通过线性层投影到 $d_{\text{model}}$。对每个不重叠 Patch 使用核大小和步幅都为 $P$ 的卷积，与“切块、展平、再使用同一个线性层”等价。

```python
import torch

torch.manual_seed(42)
images = torch.randn(2, 3, 32, 48)
patch_size, model_dim = 8, 64
projection = torch.nn.Conv2d(
    3, model_dim, kernel_size=patch_size, stride=patch_size
)
feature_map = projection(images)
tokens = feature_map.flatten(2).transpose(1, 2)
print(feature_map.shape)
print(tokens.shape)
```

特征图为 `(2,64,4,6)`，按行优先展平空间位置后得到 24 个 Token，形状为 `(2,24,64)`。

如果高或宽不能整除 Patch 大小，普通卷积会舍弃末尾不足一个核的区域。预处理必须明确缩放、裁剪或补齐规则，不能让边缘像素无意消失。

## 分类 Token 与位置 Embedding

原始 ViT 在 Patch Token 前添加一个可学习的分类 Token，记作 `[CLS]`，并给整段序列加可学习位置 Embedding：

$$
Z_0=[x_{\mathrm{cls}};x_p^1;\ldots;x_p^L]+E_{\mathrm{pos}}.
$$

经过所有 Encoder Layer 后，分类头读取最终 `[CLS]` 表示。它不是某个图像 Patch，而是一个通过 Self-Attention 汇聚全图信息的可学习位置。其他视觉 Transformer 也可以使用有效 Patch 的平均池化，不能把 `[CLS]` 当作 Transformer 的必需结构。

```python
import torch

torch.manual_seed(42)
patch_tokens = torch.randn(2, 24, 64)
cls_token = torch.nn.Parameter(torch.zeros(1, 1, 64))
position = torch.nn.Parameter(torch.randn(1, 25, 64) * 0.02)
sequence = torch.cat((cls_token.expand(len(patch_tokens), -1, -1), patch_tokens), dim=1)
sequence = sequence + position
print(sequence.shape)
```

序列长度从 24 变为 25，位置表也必须有 25 个位置。

## 最小 ViT

下面只保留 ViT 的核心路径：Patch Projection、`[CLS]`、位置 Embedding、Pre-Norm Transformer Encoder 和分类头。

```python
import torch
from torch import nn

class VisionTransformer(nn.Module):
    def __init__(self, image_size, patch_size, classes, model_dim, heads, layers):
        super().__init__()
        patch_count = (image_size // patch_size) ** 2
        self.patch_projection = nn.Conv2d(
            3, model_dim, kernel_size=patch_size, stride=patch_size
        )
        self.cls_token = nn.Parameter(torch.zeros(1, 1, model_dim))
        self.position = nn.Parameter(torch.randn(1, patch_count + 1, model_dim) * 0.02)
        encoder_layer = nn.TransformerEncoderLayer(
            model_dim,
            heads,
            dim_feedforward=model_dim * 4,
            dropout=0.0,
            batch_first=True,
            norm_first=True,
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, layers)
        self.norm = nn.LayerNorm(model_dim)
        self.classifier = nn.Linear(model_dim, classes)

    def forward(self, images):
        tokens = self.patch_projection(images).flatten(2).transpose(1, 2)
        cls = self.cls_token.expand(len(images), -1, -1)
        tokens = torch.cat((cls, tokens), dim=1) + self.position
        return self.classifier(self.norm(self.encoder(tokens)[:, 0]))

torch.manual_seed(42)
model = VisionTransformer(32, 8, classes=10, model_dim=64, heads=4, layers=2)
logits = model(torch.randn(2, 3, 32, 32))
print(logits.shape)
```

输出 `(2,10)` 是分类 Logit。示例固定输入为 $32\times32$；若传入其他尺寸，Patch 数量与位置表长度不再匹配，应立即报错或显式插值位置参数。

## 输入分辨率与位置插值

从 $H/P\times W/P$ 的 Patch 网格微调到新分辨率时，可把 `[CLS]` 位置向量保留，把 Patch 位置向量恢复成二维网格后插值。不能直接对包含 `[CLS]` 的一维序列整体插值，因为 `[CLS]` 不属于空间网格。

```python
import torch
import torch.nn.functional as F

position = torch.randn(1, 17, 8)
cls_position = position[:, :1]
patch_position = position[:, 1:].reshape(1, 4, 4, 8).permute(0, 3, 1, 2)
patch_position = F.interpolate(
    patch_position, size=(6, 6), mode='bicubic', align_corners=False
)
patch_position = patch_position.permute(0, 2, 3, 1).reshape(1, 36, 8)
resized_position = torch.cat((cls_position, patch_position), dim=1)
print(resized_position.shape)
```

从 $4\times4$ Patch 网格变为 $6\times6$，最终位置表含一个 `[CLS]` 和 36 个 Patch，形状为 `(1,37,8)`。

## Patch 大小的影响

Patch 越小，局部细节越完整，但 Token 数量越多。固定图像尺寸时，Patch 边长减半会让 Token 数约变为 4 倍，标准 Self-Attention 的 $L^2$ 分数矩阵约变为 16 倍。

ViT 的 Patch Projection 具有局部感受野，但标准 Encoder 从第一层起即可连接任意 Patch。与 CNN 相比，它较少显式使用局部连接和平移等变先验，因此数据规模、增强和预训练方式对效果很重要。

## 训练与迁移

图像分类训练仍对分类 Logit使用交叉熵。预训练模型迁移到新任务时，需要保持其图像归一化、Patch 大小、位置处理和分类表示方式一致；只复制 Encoder 权重而忽略预处理会造成输入分布不匹配。

作为 [CLIP](../multimodal/clip.md) 的图像编码器时，ViT 输出先经过投影头映射到共享图文空间，再进行 L2 归一化，而不是直接使用分类 Softmax 概率。

## 参考资料

- [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
