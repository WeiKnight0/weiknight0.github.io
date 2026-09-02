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

最小生成树用于无向连通带权图：从所有边中选出 `n - 1` 条边，使所有点连通，并且边权总和最小。

生成树包含图的全部 $n$ 个顶点和 $n-1$ 条边。对于连通图，任意生成树再增加一条边都会形成环，删除一条边都会变得不连通。最小生成树可能不唯一，但最小总权值相同。

# Prim 算法

每轮选择一条连接“已选点”和“未选点”的最短边，把新点加入生成树。邻接矩阵实现的时间复杂度为 $O(n^2)$。

## 算法流程

1. 任取一个点加入生成树。
2. 枚举所有“一端已选、一端未选”的边。
3. 选择其中权值最小的一条，加入该边和它的未选端点。
4. 重复第 2、3 步，直到所有顶点都在树中。

## 邻接矩阵模板

`graph[u][v] = 0` 表示没有边，边权为正数。

```cpp
vector<tuple<int, int, int>> prim(const vector<vector<int>>& graph) {
    int n = graph.size();
    vector<bool> selected(n, false);
    vector<tuple<int, int, int>> edges;
    selected[0] = true;

    for (int count = 0; count < n - 1; count++) {
        int minWeight = INT_MAX;
        int u = -1;
        int v = -1;
        for (int i = 0; i < n; i++) {
            if (!selected[i]) continue;
            for (int j = 0; j < n; j++) {
                if (selected[j] || graph[i][j] == 0) continue;
                if (graph[i][j] < minWeight) {
                    minWeight = graph[i][j];
                    u = i;
                    v = j;
                }
            }
        }

        selected[v] = true;
        edges.emplace_back(u, v, minWeight);
    }
    return edges;
}
```

# Kruskal 算法

Kruskal 是从**边**扩张：把所有边放进边表，按边权排序，再用并查集维护当前已经连通的点集。每次只选择两个端点尚不连通的边，因此不会形成环。

## 步骤

1. 把所有边按权重从小到大排序。
2. 依次枚举每条边 `(u, v, w)`。
3. 如果 `u` 和 `v` 还不连通，就选择这条边，并合并两个集合。
4. 选够 `n - 1` 条边后结束。

Kruskal 按边扩展森林，排序主导时间复杂度为 $O(m\log m)$，通常适合稀疏图。若最后选中的边少于 $n-1$ 条，原图不连通。

判断两个顶点是否已连通并合并连通分量时使用并查集，具体实现详见[并查集](../../data-structures/tree/dsu.md)。

## 边表与并查集模板

实现需要三种数据：边表 `edges`、按边权排序的 `sort`、用于判环和合并连通分量的并查集。排序占主要复杂度，因此总复杂度为 $O(m\log m)$。

```cpp
struct KruskalEdge {
    int u;
    int v;
    int weight;
};

struct DisjointSet {
    vector<int> parent;
    vector<int> size;

    explicit DisjointSet(int n) : parent(n), size(n, 1) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int x) {
        if (parent[x] == x) return x;
        return parent[x] = find(parent[x]);
    }

    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        return true;
    }
};

long long kruskal(int n, vector<KruskalEdge> edges) {
    sort(edges.begin(), edges.end(), [](const KruskalEdge& a, const KruskalEdge& b) {
        return a.weight < b.weight;
    });

    DisjointSet dsu(n);
    long long total = 0;
    int selected = 0;
    for (const KruskalEdge& edge : edges) {
        if (!dsu.unite(edge.u, edge.v)) continue;
        total += edge.weight;
        selected++;
        if (selected == n - 1) return total;
    }
    return -1;
}
```

## 例题：[1584. 连接所有点的最小费用](https://leetcode.cn/problems/min-cost-to-connect-all-points/)

题目描述：给定平面上的 `n` 个点，连接两个点的费用是它们的曼哈顿距离：`|xi - xj| + |yi - yj|`。求连接所有点的最小总费用。

输入：第一行输入整数 `n`。接下来 `n` 行，每行输入一个点的坐标 `x y`。

输出：连接所有点的最小总费用。

示例：

- 输入：

  ```text
  5
  0 0
  2 2
  3 10
  5 2
  7 0
  ```

- 输出：

  ```text
  20
  ```

思路：把每两个点之间都看成一条边，边权是曼哈顿距离。问题变成完全图上的最小生成树，使用 Kruskal：排序所有边，按边权从小到大选择不会形成环的边。

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

# 选择算法

| 问题特征 | 处理方式 |
| --- | --- |
| 要用最小代价连通所有点 | 最小生成树 |
| 无向带权图 | Kruskal / Prim |
| 判断加边是否成环 | 并查集 |
| LeetCode 常见写法 | Kruskal + DSU |
