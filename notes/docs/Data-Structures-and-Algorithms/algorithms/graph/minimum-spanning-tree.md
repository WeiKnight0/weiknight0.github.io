---
title: 最小生成树
date: 2025-02-04
description: 无向连通图的最小生成树，包含 Prim、Kruskal 和典型题。
categories:
  - Notes
  - Data Structures and Algorithms
  - Graph
tags:
  - DSA
  - Graph
  - Minimum Spanning Tree
  - Kruskal
  - Union Find
---

# 最小生成树

最小生成树用于无向连通带权图：从所有边中选出 `n - 1` 条边，使所有点连通，并且边权总和最小。

生成树包含图的全部 $n$ 个顶点和 $n-1$ 条边。对于连通图，任意生成树再增加一条边都会形成环，删除一条边都会变得不连通。最小生成树可能不唯一，但最小总权值相同。

## Prim

Prim 从任意一个顶点开始扩展生成树。每次从已加入生成树的顶点集合 $U$ 与未加入集合 $V-U$ 之间选择权值最小的边，将新顶点和边加入生成树。

使用邻接矩阵时，维护每个未加入顶点到当前生成树的最小边权，时间复杂度为 $O(n^2)$，适合稠密图。使用邻接表和优先队列时，复杂度为 $O((n+m)\log n)$，适合稀疏图。

Prim 每次选择跨越割的最小边。若最终未能加入全部顶点，说明原图不连通，不存在生成树。

## Kruskal

核心步骤：

1. 把所有边按权重从小到大排序。
2. 依次枚举每条边 `(u, v, w)`。
3. 如果 `u` 和 `v` 还不连通，就选择这条边，并合并两个集合。
4. 选够 `n - 1` 条边后结束。

Kruskal 按边扩展森林，排序主导时间复杂度为 $O(m\log m)$，通常适合稀疏图。若最后选中的边少于 $n-1$ 条，原图不连通。

判断两个顶点是否已连通并合并连通分量时使用并查集，具体实现详见[并查集](../../data-structures/tree/dsu.md)。

## 例题：[1584. 连接所有点的最小费用](https://leetcode.cn/problems/min-cost-to-connect-all-points/)

### 题目描述

给定平面上的 `n` 个点，连接两个点的费用是它们的曼哈顿距离：`|xi - xj| + |yi - yj|`。求连接所有点的最小总费用。

### 输入格式

第一行输入整数 `n`。接下来 `n` 行，每行输入一个点的坐标 `x y`。

### 输出格式

输出连接所有点的最小总费用。

### 示例

```text
输入：
5
0 0
2 2
3 10
5 2
7 0

输出：
20
```

### 思路

把每两个点之间都看成一条边，边权是曼哈顿距离。问题变成完全图上的最小生成树，使用 Kruskal：排序所有边，按边权从小到大选择不会形成环的边。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int u;
    int v;
    int w;
};

struct DSU {
    vector<int> parent, size;

    DSU(int n) : parent(n), size(n, 1) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }

    bool unite(int a, int b) {
        int rootA = find(a);
        int rootB = find(b);
        if (rootA == rootB) return false;

        if (size[rootA] < size[rootB]) {
            swap(rootA, rootB);
        }
        parent[rootB] = rootA;
        size[rootA] += size[rootB];
        return true;
    }
};

int main() {
    int n;
    cin >> n;

    vector<pair<int, int>> points(n);
    for (int i = 0; i < n; i++) {
        cin >> points[i].first >> points[i].second;
    }

    vector<Edge> edges;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int w = abs(points[i].first - points[j].first) +
                    abs(points[i].second - points[j].second);
            edges.push_back({i, j, w});
        }
    }

    sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        return a.w < b.w;
    });

    DSU dsu(n);
    int ans = 0;
    int count = 0;

    for (const Edge& edge : edges) {
        if (dsu.unite(edge.u, edge.v)) {
            ans += edge.w;
            count++;
            if (count == n - 1) break;
        }
    }

    cout << ans << '\n';
    return 0;
}
```

## 小结

| 问题特征 | 处理方式 |
| --- | --- |
| 要用最小代价连通所有点 | 最小生成树 |
| 无向带权图 | Kruskal / Prim |
| 判断加边是否成环 | 并查集 |
| LeetCode 常见写法 | Kruskal + DSU |
