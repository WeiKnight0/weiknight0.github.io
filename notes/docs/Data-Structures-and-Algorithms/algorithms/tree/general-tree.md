---
title: General Tree 一般树
date: 2026-09-01
description: 用邻接表将无根树定根，掌握遍历与树的直径。
lang: zh-cn
tags:
  - DSA
  - Tree
---

这里的一般树指由边给出的无权树，而不是二叉树节点对象。用邻接表保存无根树后，任选节点作为根，通过父节点参数避免走回父边。

# 建树与遍历

```cpp
vector<vector<int>> graph(n + 1);
for (auto [u, v] : edges) {
    graph[u].push_back(v);
    graph[v].push_back(u);
}

void dfs(int u, int parent) {
    for (int v : graph[u]) {
        if (v == parent) continue;
        dfs(v, u);
    }
}
```

`parent` 既表示定根后的父节点，也防止无向边让 DFS 在父子之间无限往返。

# 例题与模板

## N 叉树的最大深度

题目来源：[559. N 叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-n-ary-tree/)

题目描述：N 叉树节点有 `children` 数组。给定根节点 `root`，返回从根到最远叶节点的节点数。

**示例 1：**

- 输入：`root = [1,null,3,2,4,null,5,6]`

- 输出：`3`

思路：二叉树求高度的递归公式可直接推广：当前节点深度为所有子树最大深度加一。

```cpp
class Solution {
public:
    int maxDepth(Node* root) {
        if (!root) return 0;
        int depth = 0;
        for (Node* child : root->children) {
            depth = max(depth, maxDepth(child));
        }
        return depth + 1;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

## 树的直径

题目描述：给定一棵含 `n` 个节点、`n-1` 条无权边的连通树，求任意两节点之间的最大边数距离。

**示例：**

- 输入：`n = 6`，`edges = [[1,2],[2,3],[2,4],[4,5],[4,6]]`

- 输出：`3`

- 解释：路径 `3 → 2 → 4 → 5` 的长度为 `3`。

思路：任选节点 `s`，BFS 找到离它最远的节点 `a`；再从 `a` BFS，最远距离就是树的直径。树中两点之间路径唯一，因此无需 Dijkstra。

```cpp
pair<int, int> farthest(const vector<vector<int>>& graph, int start) {
    vector<int> dist(graph.size(), -1);
    queue<int> q;
    q.push(start);
    dist[start] = 0;
    int last = start;

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        last = u;
        for (int v : graph[u]) {
            if (dist[v] != -1) continue;
            dist[v] = dist[u] + 1;
            q.push(v);
        }
    }
    return {last, dist[last]};
}

int treeDiameter(const vector<vector<int>>& graph) {
    int a = farthest(graph, 1).first;
    return farthest(graph, a).second;
}
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

# 交叉阅读

- [最近公共祖先](./lowest-common-ancestor.md)
- 仅包含父子关系的树形动态规划，详见[树形 DP](../dynamic-programming/tree.md)。
- 边可以组成环、需要处理访问状态的题，详见[图论算法](../graph/index.md)。
