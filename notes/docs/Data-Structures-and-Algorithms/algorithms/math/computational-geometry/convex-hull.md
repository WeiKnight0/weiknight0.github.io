---
title: Convex Hull 凸包
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Computational Geometry
---

给定平面点集，包含所有点的最小凸多边形称为凸包。可以把它理解为一根橡皮筋包住全部点后形成的边界。

# 转向判断

依次经过 $A,B,C$ 时，用叉积判断转向：

$$
cross(B-A,C-A)
$$

- 大于 `0`：逆时针转向。
- 等于 `0`：三点共线。
- 小于 `0`：顺时针转向。

构造凸包时，若新点导致错误方向，中间点不可能留在当前凸包边界上，应从栈顶删除。

# Andrew 算法

1. 按横坐标升序、纵坐标升序排列所有点，并去重。
2. 从左到右扫描下凸包。设栈顶两点为 $A,B$，新点为 $C$；若 $A\to B\to C$ 不是需要的逆时针转向，则 $B$ 不能继续作为下边界拐点，将它弹出。
3. 从右到左使用同样的规则扫描上凸包。
4. 两次扫描都会经过最左点和最右点，合并时删掉重复端点。

是否保留边界上的共线点由转向条件决定：

- `cross <= 0` 时弹出：只保留每条直线边的两个端点。
- `cross < 0` 时弹出：保留凸包边界上的所有共线点。

不断弹栈直到转向恢复正确，然后才把新点入栈。因此栈中始终是已扫描点集的当前边界，而不是所有扫描过的点。

```cpp
struct Point {
    long long x, y;
};

long long cross(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

// 计算只保留边端点的逆时针凸包
vector<Point> convexHull(vector<Point> points) {
    sort(points.begin(), points.end(), [](Point a, Point b) {
        return tie(a.x, a.y) < tie(b.x, b.y);
    });
    points.erase(unique(points.begin(), points.end(), [](Point a, Point b) {
        return a.x == b.x && a.y == b.y;
    }), points.end());
    if (points.size() <= 1) return points;

    vector<Point> hull;
    for (const Point& point : points) {
        while (hull.size() >= 2 && cross(hull[hull.size() - 2], hull.back(), point) <= 0) {
            hull.pop_back();
        }
        hull.push_back(point);
    }

    size_t lowerSize = hull.size();
    for (int i = static_cast<int>(points.size()) - 2; i >= 0; i--) {
        while (hull.size() > lowerSize
               && cross(hull[hull.size() - 2], hull.back(), points[i]) <= 0) {
            hull.pop_back();
        }
        hull.push_back(points[i]);
    }
    hull.pop_back();
    return hull;
}
```

排序占 $O(n\log n)$，两次扫描中每个点最多入栈、出栈一次，因此总时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

# 边界共线点

有些题要求返回凸包边界上的所有点。此时把两处弹栈条件从 `cross <= 0` 改为 `cross < 0`，并在最终结果中去重。

若所有点共线，保留共线点的版本会在上下凸包中重复经过它们，必须去重；只保留端点的版本则只返回两个端点。

# 例题

## 587. 安装栅栏

题目来源：[587. 安装栅栏](https://leetcode.cn/problems/erect-the-fence/)

题目描述：给定若干棵树的平面坐标 `trees[i] = [xi, yi]`，用绳子围住全部树。返回位于围栏边界上的所有树，答案顺序不限。边界线段中间的共线点也必须返回。

约束：$1\le trees.length\le3000$，$0\le x_i,y_i\le100$，所有坐标互不相同。

**示例 1：**

- 输入：`trees = [[1,1],[2,2],[2,0],[2,4],[3,3],[4,2]]`

- 输出：`[[1,1],[2,0],[4,2],[3,3],[2,4]]`，顺序不限

- 解释：`[2,2]` 位于围栏内部，其余五个点位于边界上。

**示例 2：**

- 输入：`trees = [[1,2],[2,2],[4,2]]`

- 输出：`[[4,2],[2,2],[1,2]]`，顺序不限

- 解释：三棵树共线，全部位于围栏边界上。

思路：按横坐标、纵坐标排序后分别构造下凸包和上凸包。题目要求保留边界共线点，因此仅在出现严格顺时针转向，即叉积小于 `0` 时弹栈。上下凸包会重复包含端点；所有点共线时还会产生更多重复点，合并后统一排序去重。

```cpp
class Solution {
    long long cross(const vector<int>& a, const vector<int>& b, const vector<int>& c) {
        return 1LL * (b[0] - a[0]) * (c[1] - a[1])
            - 1LL * (b[1] - a[1]) * (c[0] - a[0]);
    }

public:
    vector<vector<int>> outerTrees(vector<vector<int>>& trees) {
        sort(trees.begin(), trees.end());
        if (trees.size() <= 2) return trees;

        vector<vector<int>> hull;
        for (const auto& point : trees) {
            while (hull.size() >= 2
                   && cross(hull[hull.size() - 2], hull.back(), point) < 0) {
                hull.pop_back();
            }
            hull.push_back(point);
        }

        size_t lowerSize = hull.size();
        for (int i = static_cast<int>(trees.size()) - 2; i >= 0; i--) {
            while (hull.size() > lowerSize
                   && cross(hull[hull.size() - 2], hull.back(), trees[i]) < 0) {
                hull.pop_back();
            }
            hull.push_back(trees[i]);
        }

        sort(hull.begin(), hull.end());
        hull.erase(unique(hull.begin(), hull.end()), hull.end());
        return hull;
    }
};
```

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。
