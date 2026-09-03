---
title: Circles and Polygons 圆、矩形与多边形
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Computational Geometry
---

# 圆

圆心为 $O=(x_0,y_0)$、半径为 $r$ 的圆由以下方程表示：

$$
(x-x_0)^2+(y-y_0)^2=r^2
$$

设点 $P=(x,y)$ 到圆心的距离平方为 $d^2=(x-x_0)^2+(y-y_0)^2$。不必计算平方根，只需比较 $d^2$ 与 $r^2$：

$$
P\text{ 的位置}=
\begin{cases}
\text{圆内}, & d^2<r^2 \\
\text{圆上}, & d^2=r^2 \\
\text{圆外}, & d^2>r^2
\end{cases}
$$

使用距离平方既避免了开方，也避免了浮点误差。

```cpp
long long dx = x - x0;
long long dy = y - y0;
long long distanceSquared = dx * dx + dy * dy;

if (distanceSquared < 1LL * radius * radius) {
    // 点在圆内
} else if (distanceSquared == 1LL * radius * radius) {
    // 点在圆上
} else {
    // 点在圆外
}
```

# 轴对齐矩形的重叠面积

**轴对齐矩形**是四条边分别平行于 $x$ 轴或 $y$ 轴的矩形，也就是没有发生旋转的矩形。它可以由左下角 $(x_1,y_1)$ 和右上角 $(x_2,y_2)$ 唯一确定，其中 $x_1<x_2$、$y_1<y_2$。矩形表示为 $R=[x_1,x_2]\times[y_1,y_2]$。

点 $(x,y)$ 位于矩形内部或边界上，当且仅当 $x_1\le x\le x_2$ 且 $y_1\le y\le y_2$。

设两个轴对齐矩形分别为 $R_1=[x_1,x_2]\times[y_1,y_2]$ 和 $R_2=[x_3,x_4]\times[y_3,y_4]$。它们在横轴上的重叠长度为：

$$
\max\left(0,\min(x_2,x_4)-\max(x_1,x_3)\right)
$$

纵轴上的重叠长度为：

$$
\max\left(0,\min(y_2,y_4)-\max(y_1,y_3)\right)
$$

两者相乘就是重叠面积。若其中一个重叠长度为 `0`，两个矩形至多在边或顶点处接触，重叠面积为 `0`。

```cpp
long long overlapWidth = max(0LL, min(x2, x4) - max(x1, x3));
long long overlapHeight = max(0LL, min(y2, y4) - max(y1, y3));
long long overlapArea = overlapWidth * overlapHeight;
```

# 圆与矩形相交

给定圆心 $O=(x_0,y_0)$、半径 $r$，以及轴对齐矩形 $R=[x_1,x_2]\times[y_1,y_2]$，需要判断圆盘与矩形是否至少有一个公共点。圆与矩形相切也算相交。

问题可以转化为：求矩形中距离圆心最近的点 $Q=(x',y')$，再判断 $Q$ 是否位于圆内或圆上。

对于横坐标：

- 若圆心在矩形左侧，最近的横坐标是左边界 $x_1$。
- 若圆心的横坐标落在矩形范围内，最近的横坐标就是 $x_0$。
- 若圆心在矩形右侧，最近的横坐标是右边界 $x_2$。

因此：

$$
x'=\begin{cases}
x_1, & x_0<x_1 \\
x_0, & x_1\le x_0\le x_2 \\
x_2, & x_0>x_2
\end{cases}
$$

这也可以写成 $x'=\min(\max(x_0,x_1),x_2)$。纵坐标同理：

$$
y'=\begin{cases}
y_1, & y_0<y_1 \\
y_0, & y_1\le y_0\le y_2 \\
y_2, & y_0>y_2
\end{cases}
$$

这样得到的 $Q$ 可能位于矩形内部、某条边上或某个顶点上，覆盖了圆心在矩形内部、圆靠近矩形边和圆靠近矩形顶点的全部情况。

圆与矩形相交当且仅当：

$$
(x'-x_0)^2+(y'-y_0)^2\le r^2
$$

使用严格小于号会漏掉相切的情况，因此这里必须使用 $\le$。

```cpp
long long closestX = min(max(x0, x1), x2);
long long closestY = min(max(y0, y1), y2);
long long dx = closestX - x0;
long long dy = closestY - y0;
bool intersects = dx * dx + dy * dy <= 1LL * radius * radius;
```

# 简单多边形面积

一个多边形如果它的任意两条不相邻边都不相交，并且相邻边只在它们的公共端点处相交，那么它就是**简单多边形**。
设它的顶点 $P_0,P_1,\ldots,P_{n-1}$ 按边界顺序排列，不能是任意顺序；令 $P_i=(x_i,y_i)$，并约定 $P_n=P_0$。

我们有鞋带公式：

$$
2S_{\mathrm{signed}}
=\sum_{i=0}^{n-1}(x_i y_{i+1}-y_i x_{i+1})
$$

即有符号面积的2倍等于相邻点坐标的叉积求和。

在通常的平面直角坐标系中：

- 顶点按逆时针排列时，有向面积为正。
- 顶点按顺时针排列时，有向面积为负。
- 实际面积取绝对值：$S=|S_{\mathrm{signed}}|$。

例如矩形顶点按逆时针排列为 $(0,0),(4,0),(4,3),(0,3)$，则：

$$
2S=(0\times0-0\times4)+(4\times3-0\times4)
+(4\times3-3\times0)+(0\times0-3\times0)=24
$$

所以 $S=24/2=12$。

```cpp
struct Point {
    long long x, y;
};

// 计算多边形面积的两倍
long long doubledArea(const vector<Point>& polygon) {
    long long area = 0;
    for (size_t i = 0; i < polygon.size(); i++) {
        const Point& current = polygon[i];
        const Point& next = polygon[(i + 1) % polygon.size()];
        area += current.x * next.y - current.y * next.x;
    }
    return std::abs(area);
}
```

计算步骤是：依次枚举每条边，累加 `x[i] * y[i + 1] - y[i] * x[i + 1]`，最后取绝对值。代码直接返回两倍面积，可以避免面积为半整数时使用浮点数；需要实际面积时再除以 `2.0`。

鞋带公式要求顶点沿多边形边界排列。对于自相交多边形，它得到的是带符号区域互相抵消后的代数面积，不是图形覆盖面积。

# 例题

## 1401. 圆和矩形是否有重叠

题目来源：[1401. 圆和矩形是否有重叠](https://leetcode.cn/problems/circle-and-rectangle-overlapping/)

题目描述：给定圆的半径 `radius`、圆心 `(xCenter,yCenter)`，以及轴对齐矩形的左下角 `(x1,y1)` 和右上角 `(x2,y2)`，判断圆盘与矩形是否至少有一个公共点。边界相切也返回 `true`。

约束：$1\le radius\le2000$，坐标绝对值不超过 $10^4$，且 $x_1<x_2$、$y_1<y_2$。

**示例 1：**

- 输入：`radius = 1, xCenter = 0, yCenter = 0, x1 = 1, y1 = -1, x2 = 3, y2 = 1`

- 输出：`true`

- 解释：圆与矩形左边界在点 `(1,0)` 相切。

**示例 2：**

- 输入：`radius = 1, xCenter = 0, yCenter = 0, x1 = 2, y1 = 2, x2 = 3, y2 = 3`

- 输出：`false`

思路：分别把圆心横纵坐标限制在矩形对应区间内，得到矩形中距离圆心最近的点。若最近点到圆心的距离平方不超过半径平方，圆盘与矩形相交；否则矩形中的所有点都在圆外。

```cpp
class Solution {
public:
    bool checkOverlap(int radius, int xCenter, int yCenter,
                      int x1, int y1, int x2, int y2) {
        long long closestX = clamp(xCenter, x1, x2);
        long long closestY = clamp(yCenter, y1, y2);
        long long dx = closestX - xCenter;
        long long dy = closestY - yCenter;
        return dx * dx + dy * dy <= 1LL * radius * radius;
    }
};
```

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

## 223. 矩形面积

题目来源：[223. 矩形面积](https://leetcode.cn/problems/rectangle-area/)

题目描述：给定二维平面上的两个轴对齐矩形。第一个矩形由左下角 `(ax1,ay1)` 和右上角 `(ax2,ay2)` 确定，第二个矩形由 `(bx1,by1)` 和 `(bx2,by2)` 确定。计算两个矩形覆盖区域的总面积，重叠部分只能计算一次。

约束：所有坐标均在 $[-10^4,10^4]$ 内，每个矩形的左下角坐标不大于对应的右上角坐标。

**示例 1：**

- 输入：`ax1 = -3, ay1 = 0, ax2 = 3, ay2 = 4, bx1 = 0, by1 = -1, bx2 = 9, by2 = 2`

- 输出：`45`

**示例 2：**

- 输入：`ax1 = -2, ay1 = -2, ax2 = 2, ay2 = 2, bx1 = -2, by1 = -2, bx2 = 2, by2 = 2`

- 输出：`16`

- 解释：两个矩形完全重合，覆盖总面积仍为 `16`。

思路：先分别计算两个矩形面积，再求横轴和纵轴上的重叠长度。总面积等于两个矩形面积之和减去重叠面积。横向或纵向没有公共区间时，对应重叠长度取 `0`，相乘后重叠面积自然为 `0`。

```cpp
class Solution {
public:
    int computeArea(int ax1, int ay1, int ax2, int ay2,
                    int bx1, int by1, int bx2, int by2) {
        long long first = 1LL * (ax2 - ax1) * (ay2 - ay1);
        long long second = 1LL * (bx2 - bx1) * (by2 - by1);
        long long width = max(0, min(ax2, bx2) - max(ax1, bx1));
        long long height = max(0, min(ay2, by2) - max(ay1, by1));
        return first + second - width * height;
    }
};
```

时间复杂度 $O(1)$，空间复杂度 $O(1)$。
