---
title: 卷积神经网络：卷积、步幅、填充与池化
date: 2026-09-10T00:00:00
lang: zh-cn
---

## 为什么图像使用卷积

将一张 $H\times W$ 图像展平后送入全连接层，会丢失二维邻接关系，而且参数量随图像尺寸迅速增长。卷积层使用两个约束：

- **局部连接**：一个输出位置只读取附近的一小块输入。
- **参数共享**：同一个卷积核在所有空间位置重复使用。

因此同一种局部模式可以在不同位置被检测。参数共享带来平移等变性：忽略边界和步幅影响，输入平移后，特征图也相应平移。等变不是不变；分类网络通常还需池化、下采样或全局聚合，才会降低输出对位置变化的敏感度。

## 二维互相关

深度学习框架通常把“卷积”实现成互相关（Cross-correlation）：卷积核不翻转。对单通道输入 $X$ 和核 $K$，步幅 1、无填充时：

$$
Y_{i,j}=\sum_{u=0}^{k_h-1}\sum_{v=0}^{k_w-1}X_{i+u,j+v}K_{u,v}+b.
$$

严格数学卷积会翻转核，但核本身是可学习参数，使用互相关不降低可表示性。本组笔记沿用框架习惯，后文“卷积”均指该运算。

### 示例：手算一个边缘核

输入和卷积核为：

$$
X=\begin{bmatrix}1&2&3\\4&5&6\\7&8&9\end{bmatrix},
\qquad
K=\begin{bmatrix}1&0\\0&-1\end{bmatrix}.
$$

左上角输出为 $1\times1+2\times0+4\times0+5\times(-1)=-4$。四个滑动窗口都得到 $-4$，所以输出为 $2\times2$ 矩阵。

```python
import torch
import torch.nn.functional as F

X = torch.tensor([[[[1., 2., 3.], [4., 5., 6.], [7., 8., 9.]]]])
K = torch.tensor([[[[1., 0.], [0., -1.]]]])
Y = F.conv2d(X, K)
print(Y)
```

PyTorch 图像张量采用 `(N,C,H,W)`，卷积核采用 `(C_out,C_in,k_h,k_w)`。输出是 `[[[[-4,-4],[-4,-4]]]]`。

## 输出尺寸

输入高度 $H$、核高度 $K_h$、两侧总共补 $2P_h$ 行、步幅 $S_h$、膨胀 $D_h$ 时，有效核高度为 $D_h(K_h-1)+1$。输出高度为：

$$
H_{\mathrm{out}}=
\left\lfloor\frac{H+2P_h-D_h(K_h-1)-1}{S_h}\right\rfloor+1.
$$

宽度同理。若窗口无法完整放入剩余区域，末尾位置会被丢弃。

### 填充

Padding 在边界外补值，常见的是补零。核为奇数、步幅为 1、膨胀为 1 时，取 $P_h=(K_h-1)/2$、$P_w=(K_w-1)/2$ 可保持空间尺寸。

“Same”需要结合步幅理解：步幅大于 1 时，即使称为 Same，输出通常也约为输入尺寸除以步幅，不是原尺寸。

边界输出会读取补充值，因此与内部位置的统计条件不同。零填充也不是唯一选择，反射和复制填充适合某些任务。

### 步幅

Stride 控制窗口每次移动距离。步幅 2 通常让空间尺寸约减半，同时跳过一部分窗口。下采样减少计算和存储，也可能丢失细节。

```python
import torch

x = torch.randn(2, 3, 32, 40)
conv = torch.nn.Conv2d(3, 16, kernel_size=3, stride=2, padding=1)
y = conv(x)
print(y.shape)
```

高度为 $\lfloor(32+2-2-1)/2\rfloor+1=16$，宽度为 20，输出形状是 `(2,16,16,20)`。

## 多输入通道与多输出通道

彩色图像有多个输入通道。每个输出通道拥有一组覆盖全部输入通道的卷积核：

$$
Y_{n,o,i,j}=b_o+
\sum_{c=0}^{C_{\mathrm{in}}-1}
\sum_{u=0}^{K_h-1}\sum_{v=0}^{K_w-1}
X_{n,c,i+u,j+v}W_{o,c,u,v}.
$$

输入通道的结果先求和，得到一个输出通道；使用 $C_{\mathrm{out}}$ 组核就得到 $C_{\mathrm{out}}$ 张特征图。普通卷积参数量为：

$$
C_{\mathrm{out}}C_{\mathrm{in}}K_hK_w+C_{\mathrm{out}},
$$

最后一项是启用偏置时的参数。它与输入的 $H,W$ 无关。

### 示例：两个输入通道求和

令两个输入通道分别为全 1 和全 2，两个 $2\times2$ 核分别为全 1 和全 3。每个窗口输出为 $4\times1+4\times2\times3=28$。

```python
import torch
import torch.nn.functional as F

x = torch.stack((torch.ones(3, 3), torch.full((3, 3), 2.0))).unsqueeze(0)
weight = torch.stack((torch.ones(2, 2), torch.full((2, 2), 3.0))).unsqueeze(0)
y = F.conv2d(x, weight)
print(y)
```

输出为形状 `(1,1,2,2)` 的全 28 张量。两个输入通道没有各自产生独立输出，因为这里只有一个输出通道。

## $1\times1$ 卷积

$1\times1$ 卷积不聚合相邻空间位置，但会在每个位置混合输入通道。对固定像素位置，它相当于对通道向量使用同一个线性层。

它常用于改变通道数、构造瓶颈结构或对齐残差捷径。参数量为 $C_{\mathrm{in}}C_{\mathrm{out}}+C_{\mathrm{out}}$，并非“没有计算”。

```python
import torch

x = torch.randn(4, 64, 16, 16)
pointwise = torch.nn.Conv2d(64, 16, kernel_size=1)
print(pointwise(x).shape)
```

输出形状为 `(4,16,16,16)`：空间尺寸不变，通道从 64 降到 16。

## 分组卷积与深度可分离卷积

`groups=g` 将输入和输出通道分成 $g$ 组，各组独立卷积。要求输入、输出通道数都能被 $g$ 整除。权重形状为 $(C_{\mathrm{out}},C_{\mathrm{in}}/g,K_h,K_w)$。

当 `groups=C_in` 且每个输入通道对应一个输出通道时，称为 Depthwise 卷积，只在各通道内部聚合空间。随后用 $1\times1$ Pointwise 卷积混合通道，构成深度可分离卷积。

普通 $K\times K$ 卷积的乘法规模与 $K^2C_{\mathrm{in}}C_{\mathrm{out}}$ 成正比；Depthwise 加 Pointwise 约为 $K^2C_{\mathrm{in}}+C_{\mathrm{in}}C_{\mathrm{out}}$。减少计算的同时也改变了层的结构约束。

## 池化

最大池化在每个窗口取最大值，平均池化取平均值。它们通常没有可学习权重，并对每个通道独立处理。

$$
Y_{c,i,j}=\max_{(u,v)\in\mathcal W}X_{c,i+u,j+v}
$$

最大池化保留局部最强响应；平均池化保留局部平均。池化并不保证对任意平移完全不变，尤其当目标跨过窗口边界时。

```python
import torch
import torch.nn.functional as F

x = torch.tensor([[[[1., 3., 2., 0.], [4., 6., 5., 1.], [0., 2., 7., 8.], [1., 3., 9., 4.]]]])
print(F.max_pool2d(x, kernel_size=2, stride=2))
print(F.avg_pool2d(x, kernel_size=2, stride=2))
```

最大池化输出 `[[6,5],[3,9]]`，平均池化输出 `[[3.5,2],[1.5,7]]`。

全局平均池化把每个通道的全部空间位置取平均，将 `(N,C,H,W)` 变为 `(N,C)`。它使分类头不必依赖固定的展平空间大小，但输入还需满足此前各层的尺寸约束。

## 感受野

某层一个特征所依赖的原始输入区域称为理论感受野。按一个空间维计算，设第 $l$ 层核大小为 $k_l$、步幅为 $s_l$、膨胀为 $d_l$；$j_l$ 表示相邻特征在原图上的间隔，$r_l$ 表示感受野大小：

$$
j_l=j_{l-1}s_l,
\qquad
r_l=r_{l-1}+(k_l-1)d_lj_{l-1},
$$

初始 $j_0=r_0=1$。两个步幅 1 的 $3\times3$ 卷积得到 $5\times5$ 感受野，而一个 $5\times5$ 卷积也是 $5\times5$；前者中间多一次非线性，若通道数相同，参数量为 $18C^2$，后者为 $25C^2$，均忽略偏置。

### 示例：卷积、池化、卷积

第一层为 $3\times3$、步幅 1；第二层为 $2\times2$ 池化、步幅 2；第三层为 $3\times3$、步幅 1：

- 第一层：$j_1=1,r_1=3$。
- 池化层：$j_2=2,r_2=4$。
- 第三层：$j_3=2,r_3=8$。

第三层一个位置理论上覆盖原图的 $8\times8$ 区域。实际有效影响往往集中在理论感受野的一部分，不能只用理论大小判断模型已充分利用全部区域。

## 一个小型分类网络

```python
import torch
from torch import nn

class SmallCNN(nn.Module):
    def __init__(self, classes):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(32, classes)

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x.flatten(1))

model = SmallCNN(classes=10)
print(model(torch.randn(4, 3, 32, 32)).shape)
```

输出 `(4,10)`，是 4 个样本的原始分类 Logit。训练时交给 `CrossEntropyLoss`，不在 `forward` 内先做 Softmax。

下一篇：[ResNet](resnet.md)。

## 参考资料

- [Dive into Deep Learning：Convolutions for Images](https://d2l.ai/chapter_convolutional-neural-networks/conv-layer.html)
- [Dive into Deep Learning：Padding and Stride](https://d2l.ai/chapter_convolutional-neural-networks/padding-and-strides.html)
- [Dive into Deep Learning：Channels](https://d2l.ai/chapter_convolutional-neural-networks/channels.html)
- [Dive into Deep Learning：Pooling](https://d2l.ai/chapter_convolutional-neural-networks/pooling.html)
