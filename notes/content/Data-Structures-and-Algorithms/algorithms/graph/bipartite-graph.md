---
title: 二分图
date: 2025-02-04
description: 二分图判定，包含染色法 BFS/DFS 和典型题。
categories:
  - Notes
  - Data Structures and Algorithms
  - Graph
tags:
  - DSA
  - Graph
  - Bipartite Graph
---

如果一个图的点可以被分成两个集合，并且每条边的两个端点都属于不同集合，那么这个图是二分图。

二分图判定的核心方法是染色法：用两种颜色给相邻节点染不同颜色。如果出现一条边的两个端点颜色相同，就不是二分图。

# 二分图判定

## BFS 染色模板

```cpp
bool isBipartite(int n, vector<vector<int>>& graph) {
    vector<int> color(n, 0); // 0 表示未染色，1 和 -1 表示两种颜色

    for (int i = 0; i < n; i++) {
        if (color[i] != 0) continue;

        queue<int> q;
        color[i] = 1;
        q.push(i);

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (int v : graph[u]) {
                if (color[v] == 0) {
                    color[v] = -color[u];
                    q.push(v);
                } else if (color[v] == color[u]) {
                    return false;
                }
            }
        }
    }

    return true;
}
```

为什么要从每个点开始检查：图可能不连通，每个连通块都需要单独染色。

## 例题：[785. 判断二分图](https://leetcode.cn/problems/is-graph-bipartite/)

**题目描述：**

给定一个无向图，判断它是否是二分图。图中可能不连通。

**输入：**

第一行输入整数 `n`，表示点数。接下来 `n` 行，每行先输入整数 `k`，表示该点的邻居数量，然后输入 `k` 个邻居编号。

**输出：**

如果是二分图，输出 `true`，否则输出 `false`。

**示例：**

- 输入：

  ```text
  4
  2 1 3
  2 0 2
  2 1 3
  2 0 2
  ```

- 输出：

  ```text
  true
  ```

上面的输入表示：

```text
0: 1 3
1: 0 2
2: 1 3
3: 0 2
```

<details class="note-solution">
<summary>查看解析</summary>

**思路：**

使用 BFS 染色。遇到未染色节点就给它染成 `1`，它的所有邻居染成 `-1`。如果搜索过程中发现相邻节点颜色相同，说明不能分成两个集合。

**代码：**

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<vector<int>> graph(n);
    for (int i = 0; i < n; i++) {
        int k;
        cin >> k;
        graph[i].resize(k);
        for (int j = 0; j < k; j++) {
            cin >> graph[i][j];
        }
    }

    vector<int> color(n, 0);

    for (int i = 0; i < n; i++) {
        if (color[i] != 0) continue;

        queue<int> q;
        color[i] = 1;
        q.push(i);

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (int v : graph[u]) {
                if (color[v] == 0) {
                    color[v] = -color[u];
                    q.push(v);
                } else if (color[v] == color[u]) {
                    cout << "false" << '\n';
                    return 0;
                }
            }
        }
    }

    cout << "true" << '\n';
    return 0;
}
```

</details>

## 例题：[886. 可能的二分法](https://leetcode.cn/problems/possible-bipartition/)

**题目描述：**

有 `n` 个人，编号为 `1` 到 `n`。给定若干组互相不喜欢的关系 `dislikes[i] = [a, b]`。判断是否可以把所有人分成两组，使每组内部没有互相不喜欢的人。

**输入：**

第一行输入 `n m`。接下来 `m` 行，每行输入 `a b`，表示 `a` 和 `b` 互相不喜欢。

**输出：**

如果可以分成两组，输出 `true`，否则输出 `false`。

**示例：**

- 输入：

  ```text
  4 3
  1 2
  1 3
  2 4
  ```

- 输出：

  ```text
  true
  ```

<details class="note-solution">
<summary>查看解析</summary>

**思路：**

把每个人看成点，不喜欢关系看成无向边。要求边的两个端点分在不同组，本质上就是判断这张图是否是二分图。

**代码：**

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    vector<vector<int>> graph(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        graph[a].push_back(b);
        graph[b].push_back(a);
    }

    vector<int> color(n + 1, 0);

    for (int i = 1; i <= n; i++) {
        if (color[i] != 0) continue;

        queue<int> q;
        color[i] = 1;
        q.push(i);

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (int v : graph[u]) {
                if (color[v] == 0) {
                    color[v] = -color[u];
                    q.push(v);
                } else if (color[v] == color[u]) {
                    cout << "false" << '\n';
                    return 0;
                }
            }
        }
    }

    cout << "true" << '\n';
    return 0;
}
```

</details>

# 小结

| 问题特征 | 处理方式 |
| --- | --- |
| 相邻点必须分到不同集合 | 二分图染色 |
| 图可能不连通 | 从每个未染色点开始 BFS/DFS |
| 染色冲突 | 不是二分图 |
| 判断是否能分成两组 | 转成二分图判定 |
