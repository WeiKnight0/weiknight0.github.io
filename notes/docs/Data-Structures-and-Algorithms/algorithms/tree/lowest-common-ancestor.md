---
title: Lowest Common Ancestor 最近公共祖先
date: 2026-09-01
description: 用朴素上跳和倍增算法求树上最近公共祖先。
lang: zh-cn
tags:
  - DSA
  - Tree
  - LCA
---

在一棵已经定根的树中，`u`、`v` 的最近公共祖先（LCA）是同时为两者祖先且深度最大的节点。它必然位于 `u` 到 `v` 的唯一路径上。

本页默认输入为 `n` 个编号为 `1..n` 的节点、`n - 1` 条无权边，并以 `root` 为根；之后有多次查询 `(u, v)`，每次输出 `LCA(u, v)`。

# 朴素 DFS

先从根 DFS，记录每个节点的父节点 `parent[u]` 和深度 `depth[u]`。查询时先把较深节点不断跳到同一深度，再让两个节点同时向父节点跳；第一次相等的位置就是 LCA。

```cpp
constexpr int MAXN = 200000 + 5;
vector<int> graph[MAXN];
int parent[MAXN], depth[MAXN];

void dfs(int u, int p) {
    parent[u] = p;
    depth[u] = depth[p] + 1;
    for (int v : graph[u]) {
        if (v == p) continue;
        dfs(v, u);
    }
}

int lca(int u, int v) {
    while (depth[u] > depth[v]) u = parent[u];
    while (depth[v] > depth[u]) v = parent[v];
    while (u != v) {
        u = parent[u];
        v = parent[v];
    }
    return u;
}
```

建边后调用 `dfs(root, 0)`。

预处理时间 $O(n)$、空间 $O(n)$；单次查询最坏 $O(n)$，实际等于两点到 LCA 的路径长度。树高较小或查询很少时，这个写法最直接。

# 倍增

倍增把“向父节点跳一步”变为“向上跳 $2^k$ 步”。定义 `up[k][u]` 为 `u` 的第 $2^k$ 个祖先，则：

$$
up[k][u] = up[k - 1][up[k - 1][u]]
$$

先用 DFS 填 `up[0]`、`depth`，再递推其余层。查询分为两步：

1. 按深度差的二进制位，把较深节点提升到同层。
2. 从大的 $k$ 向下试跳；若两节点跳 $2^k$ 步后仍不相同，就同时跳。结束后它们的父节点就是 LCA。

```cpp
constexpr int MAXN = 200000 + 5;
constexpr int LOG = 20;
vector<int> graph[MAXN];
int up[MAXN][LOG], depth[MAXN];

void dfs(int u, int p) {
    up[u][0] = p;
    depth[u] = depth[p] + 1;
    for (int k = 1; k < LOG; k++) {
        up[u][k] = up[up[u][k - 1]][k - 1];
    }
    for (int v : graph[u]) {
        if (v == p) continue;
        dfs(v, u);
    }
}

int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = 0; k < LOG; k++) {
        if ((diff >> k) & 1) u = up[k][u];
    }
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; k--) {
        if (up[k][u] == up[k][v]) continue;
        u = up[k][u];
        v = up[k][v];
    }
    return up[0][u];
}

```

建边后调用 `dfs(root, 0)`。

预处理时间和空间都是 $O(n\log n)$，每次查询 $O(\log n)$，适合大量查询。

# 应用

若 `depth[x]` 是根到 `x` 的边数，树上两点距离为：

$$
dist(u, v) = depth[u] + depth[v] - 2 \times depth[LCA(u, v)]
$$

练习：[P3379 【模板】最近公共祖先（LCA）](https://www.luogu.com.cn/problem/P3379)。
