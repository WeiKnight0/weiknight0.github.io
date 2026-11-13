---
title: Points, Vectors and Lines 点、向量与直线
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Computational Geometry
---

# 点与向量

二维点 $P=(x,y)$ 表示位置；两个点之差 $\overrightarrow{AB}=B-A$ 表示从 $A$ 指向 $B$ 的向量。代码中可以用同一个 `Point` 结构体存储它们：单独的 `Point` 表示坐标，两点相减的结果表示方向和长度。

```cpp
struct Point {
    long long x, y;
};

// 计算从from指向to的向量
Point vectorFrom(Point from, Point to) {
    return {to.x - from.x, to.y - from.y};
}
```

# 点积

向量 $\mathbf{a}=(x_1,y_1)$、$\mathbf{b}=(x_2,y_2)$ 的点积为：

$$
\mathbf{a}\cdot\mathbf{b}=x_1x_2+y_1y_2=|\mathbf{a}||\mathbf{b}|\cos\theta
$$

- $\mathbf{a}\cdot\mathbf{b}>0$：夹角为锐角。
- $\mathbf{a}\cdot\mathbf{b}=0$：两向量垂直。
- $\mathbf{a}\cdot\mathbf{b}<0$：夹角为钝角。

```cpp
// 计算点积
long long dot(Point a, Point b) {
    return a.x * b.x + a.y * b.y;
}
```

# 叉积

二维向量叉积取有向面积值：

$$
\mathbf{a}\times\mathbf{b}=x_1y_2-y_1x_2
$$

- $\mathbf{a}\times\mathbf{b}>0$：$\mathbf{b}$ 在 $\mathbf{a}$ 的逆时针方向。
- $\mathbf{a}\times\mathbf{b}=0$：两向量共线。
- $\mathbf{a}\times\mathbf{b}<0$：$\mathbf{b}$ 在 $\mathbf{a}$ 的顺时针方向。

三点 $A,B,C$ 的方向由 $(B-A)\times(C-A)$ 判断。其绝对值等于三角形 $ABC$ 面积的两倍。

```cpp
// 计算叉积
long long cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}

// 判断从AB转向C的方向
long long orientation(Point a, Point b, Point c) {
    return cross(vectorFrom(a, b), vectorFrom(a, c));
}
```

# 距离

两点欧几里得距离为：

$$
d(A,B)=\sqrt{(x_A-x_B)^2+(y_A-y_B)^2}
$$

只比较距离大小时应比较距离平方，避免开方和浮点误差。

曼哈顿距离与切比雪夫距离分别为：

$$
d_1(A,B)=|x_A-x_B|+|y_A-y_B|
$$

$$
d_\infty(A,B)=\max(|x_A-x_B|,|y_A-y_B|)
$$

欧几里得距离是直线距离；曼哈顿距离对应只能水平或竖直移动；切比雪夫距离对应每次横纵坐标都可同时移动一格。

```cpp
long long squaredDistance(Point a, Point b) {
    long long dx = a.x - b.x;
    long long dy = a.y - b.y;
    return dx * dx + dy * dy;
}

long long manhattanDistance(Point a, Point b) {
    return abs(a.x - b.x) + abs(a.y - b.y);
}

long long chebyshevDistance(Point a, Point b) {
    return max(abs(a.x - b.x), abs(a.y - b.y));
}
```

# 判断点在线段上

点 $P$ 在线段 $AB$ 上，当且仅当：

1. $A,B,P$ 共线。
2. $P$ 的两个坐标都位于端点对应坐标的闭区间内。

```cpp
// 判断p是否在线段ab上
bool onSegment(Point a, Point b, Point p) {
    if (orientation(a, b, p) != 0) return false;
    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x)
        && min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}
```

# 判断两线段相交

两条闭线段一般相交时，另一条线段的两个端点分别位于本线段所在直线两侧。还要单独包含端点接触和共线重叠。

```cpp
// 判断线段ab与cd是否相交
bool segmentsIntersect(Point a, Point b, Point c, Point d) {
    long long abc = orientation(a, b, c);
    long long abd = orientation(a, b, d);
    long long cda = orientation(c, d, a);
    long long cdb = orientation(c, d, b);

    if (abc == 0 && onSegment(a, b, c)) return true;
    if (abd == 0 && onSegment(a, b, d)) return true;
    if (cda == 0 && onSegment(c, d, a)) return true;
    if (cdb == 0 && onSegment(c, d, b)) return true;
    return (abc > 0) != (abd > 0) && (cda > 0) != (cdb > 0);
}
```

# 例题

## 1232. 缀点成线

题目来源：[1232. 缀点成线](https://leetcode.cn/problems/check-if-it-is-a-straight-line/)

题目描述：给定整数数组 `coordinates`，其中 `coordinates[i] = [xi, yi]` 表示一个平面点。所有点互不相同，判断它们是否位于同一条直线上。

约束：$2\le coordinates.length\le1000$，$-10^4\le x_i,y_i\le10^4$。

**示例 1：**

- 输入：`coordinates = [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]`

- 输出：`true`

**示例 2：**

- 输入：`coordinates = [[1,1],[2,2],[3,4],[4,5],[5,6],[7,7]]`

- 输出：`false`

<details class="note-solution">
<summary>查看解析</summary>

思路：以前两个点确定基准方向。从第三个点开始，每个点与第一个点形成的向量都应与基准向量共线，也就是叉积为 `0`。使用叉积而不是比较斜率，既不会对竖直线除以零，也不会引入浮点误差。

```cpp
class Solution {
public:
    bool checkStraightLine(vector<vector<int>>& coordinates) {
        long long dx = coordinates[1][0] - coordinates[0][0];
        long long dy = coordinates[1][1] - coordinates[0][1];
        return all_of(coordinates.begin() + 2, coordinates.end(), [&](const vector<int>& point) {
            long long currentX = point[0] - coordinates[0][0];
            long long currentY = point[1] - coordinates[0][1];
            return dx * currentY == dy * currentX;
        });
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

</details>
