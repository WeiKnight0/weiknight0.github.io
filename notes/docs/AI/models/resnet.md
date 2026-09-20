---
title: ResNet：残差块、阶段结构与下采样
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 从残差连接到卷积网络

[残差连接](residual-connections.md)计算 $\mathbf y=\mathbf x+F(\mathbf x)$，使信息和梯度可以沿捷径传播。ResNet 将这种结构用于深层卷积网络。

更深的网络理论上可以把新增层设成恒等映射，从而不比浅网络差，但普通深层网络在训练中可能出现退化：训练误差反而更高。残差块把目标改写为学习相对输入的修正，使恒等情况更容易表达。这与训练集表现很好、验证集变差的过拟合不是同一个现象。

## BasicBlock

ResNet-18 和 ResNet-34 使用 BasicBlock。主分支包含两个 $3\times3$ 卷积：

$$
F(X)=\operatorname{BN}_2\left(\operatorname{Conv}_{3\times3,2}\left(
\operatorname{ReLU}(\operatorname{BN}_1(\operatorname{Conv}_{3\times3,1}(X)))
\right)\right).
$$

原始 ResNet v1 在相加后再使用 ReLU：$Y=\operatorname{ReLU}(S(X)+F(X))$。当形状相同时，$S(X)=X$；否则用投影对齐。

```python
import torch
from torch import nn

class BasicBlock(nn.Module):
    expansion = 1

    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, 1, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.shortcut = nn.Identity()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        residual = torch.relu(self.bn1(self.conv1(x)))
        residual = self.bn2(self.conv2(residual))
        return torch.relu(self.shortcut(x) + residual)

same = BasicBlock(64, 64)
down = BasicBlock(64, 128, stride=2)
print(same(torch.randn(2, 64, 32, 32)).shape)
print(down(torch.randn(2, 64, 32, 32)).shape)
```

输出分别是 `(2,64,32,32)` 和 `(2,128,16,16)`。第一种捷径为恒等映射；第二种用步幅 2 的 $1\times1$ 卷积同时减小空间尺寸、增加通道。

投影条件是结构的一部分，应在构造时决定。前向中不能临时创建卷积层，否则参数不会作为稳定的模型参数被正确训练和保存。

## Bottleneck

ResNet-50、101、152 使用 Bottleneck。主分支依次为：

1. $1\times1$ 卷积把通道降到内部宽度 $C$。
2. $3\times3$ 卷积处理空间邻域。
3. $1\times1$ 卷积将通道扩展到 $4C$。

“瓶颈”指中间通道比输出通道窄，不是让输入信息只能通过一个标量。扩展倍数在经典 ResNet Bottleneck 中为 4。

```python
import torch
from torch import nn

class Bottleneck(nn.Module):
    expansion = 4

    def __init__(self, in_channels, channels, stride=1):
        super().__init__()
        out_channels = channels * self.expansion
        self.conv1 = nn.Conv2d(in_channels, channels, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, stride, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)
        self.conv3 = nn.Conv2d(channels, out_channels, 1, bias=False)
        self.bn3 = nn.BatchNorm2d(out_channels)
        self.shortcut = nn.Identity()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        residual = torch.relu(self.bn1(self.conv1(x)))
        residual = torch.relu(self.bn2(self.conv2(residual)))
        residual = self.bn3(self.conv3(residual))
        return torch.relu(self.shortcut(x) + residual)

block = Bottleneck(64, 64)
print(block(torch.randn(2, 64, 32, 32)).shape)
```

输出 `(2,256,32,32)`。因为输入 64 通道与输出 256 通道不一致，捷径必须投影。

若输入、内部宽度和输出都直接使用 256 通道，三个卷积的无偏置参数约为 $256^2+9\times256^2+256^2$；瓶颈的相应参数约为 $256\times64+9\times64^2+64\times256$，明显更少。具体网络还包含归一化参数和投影层。

## Stage 如何组成

经典 ResNet 先用 Stem 提取低分辨率特征，再经过四个 Stage。一个 Stage 保持输出通道数一致；除第一个 Stage 外，首块通常使用步幅 2 下采样并增加通道，后续块使用步幅 1。

| 模型 | 块类型 | 四个 Stage 的块数 | 卷积层计数 |
| --- | --- | --- | --- |
| ResNet-18 | BasicBlock | `[2,2,2,2]` | $1+2(2+2+2+2)+1=18$ |
| ResNet-34 | BasicBlock | `[3,4,6,3]` | $1+2(3+4+6+3)+1=34$ |
| ResNet-50 | Bottleneck | `[3,4,6,3]` | $1+3(3+4+6+3)+1=50$ |
| ResNet-101 | Bottleneck | `[3,4,23,3]` | $1+3(3+4+23+3)+1=101$ |

计数包含 Stem 卷积和最终全连接层，不把投影捷径计入命名层数。因此不能仅统计代码里所有 `Conv2d` 实例来复现名字中的数字。

## 构建 ResNet-18

下面使用 ImageNet 风格 Stem：$7\times7$、步幅 2 的卷积后接 $3\times3$ 最大池化。输入 $224\times224$ 时，空间尺寸依次约为 112、56、56、28、14、7。

```python
import torch
from torch import nn

class ResNet(nn.Module):
    def __init__(self, block, blocks_per_stage, classes):
        super().__init__()
        self.in_channels = 64
        self.stem = nn.Sequential(
            nn.Conv2d(3, 64, 7, 2, 3, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(3, 2, 1),
        )
        self.stage1 = self.make_stage(block, 64, blocks_per_stage[0], 1)
        self.stage2 = self.make_stage(block, 128, blocks_per_stage[1], 2)
        self.stage3 = self.make_stage(block, 256, blocks_per_stage[2], 2)
        self.stage4 = self.make_stage(block, 512, blocks_per_stage[3], 2)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Linear(512 * block.expansion, classes)

    def make_stage(self, block, channels, blocks, stride):
        layers = [block(self.in_channels, channels, stride)]
        self.in_channels = channels * block.expansion
        layers.extend(block(self.in_channels, channels) for _ in range(1, blocks))
        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.stem(x)
        x = self.stage1(x)
        x = self.stage2(x)
        x = self.stage3(x)
        x = self.stage4(x)
        return self.classifier(self.pool(x).flatten(1))

model = ResNet(BasicBlock, [2, 2, 2, 2], classes=1000)
model.eval()
with torch.no_grad():
    logits = model(torch.randn(1, 3, 224, 224))
print(logits.shape)
```

输出 `(1,1000)`。`make_stage` 先建立可能下采样的首块，再更新当前通道数；生成器只用于建立其余同形块，不进行数据过滤或聚合。

对较小图像，常把 Stem 改成 $3\times3$、步幅 1，并去掉最大池化，避免过早丢失空间信息。网络结构应与输入分辨率和任务匹配。

## 参数初始化与最后一个归一化层

卷积常使用适合 ReLU 的 He 初始化，BatchNorm 的缩放初始为 1、偏置为 0。还有一种常用做法是把每个残差分支最后一个 BatchNorm 的缩放 $\gamma$ 初始化为 0，使分支初始输出接近零；这需要显式修改默认初始化。

这种初始化只改变训练起点，不会把分支永久关闭。采用其他残差结构或归一化顺序时，应重新检查对应位置。

## 训练与使用时的检查

- 输入归一化必须与预训练权重一致；迁移学习时替换最终分类头。
- BatchNorm 在训练和评估使用不同统计量，推理前调用 `eval()`。
- 下采样块同时核对主分支和捷径的空间尺寸与通道。
- 分类输出是 Logit，训练时直接交给交叉熵。
- 模型更深不保证目标数据上更好，仍需按[数据划分与评估](../learning-principles/data-splitting.md)比较。

## 参考资料

- [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)
- [Dive into Deep Learning：Residual Networks](https://d2l.ai/chapter_convolutional-modern/resnet.html)
