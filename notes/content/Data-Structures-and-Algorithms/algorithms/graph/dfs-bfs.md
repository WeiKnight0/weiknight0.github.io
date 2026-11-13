---
title: 图的 DFS 与 BFS
date: 2025-02-04
description: 图论中最基础的遍历方法，包含邻接表、连通块、可达性、无权最短路和典型题。
categories:
  - Notes
  - Data Structures and Algorithms
  - Graph
tags:
  - DSA
  - Graph
  - DFS
  - BFS
---

DFS 和 BFS 是图论刷题的入口。大多数基础图题都可以先抽象成：点是什么、边是什么、要从哪些点开始搜索、访问状态如何记录。

# 图的存储

邻接矩阵、邻接表、十字链表和邻接多重表详见[图的存储结构](../../data-structures/graph/index.md)。以下算法统一假设图已使用邻接表表示。

# DFS

## 核心模板

DFS 适合处理连通块、可达性、路径搜索、树/图上的递归状态传递。

```cpp
void dfs(int u, vector<vector<int>>& graph, vector<int>& visited) {
    visited[u] = 1;

    for (int v : graph[u]) {
        if (!visited[v]) {
            dfs(v, graph, visited);
        }
    }
}
```

统计无向图连通块数量：

```cpp
int countComponents(int n, vector<vector<int>>& graph) {
    vector<int> visited(n, 0);
    int ans = 0;

    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            ans++;
            dfs(i, graph, visited);
        }
    }

    return ans;
}
```

# BFS

## 核心模板

BFS 适合处理无权图最短路、层序扩展、最少步数问题。

```cpp
vector<int> bfs(int start, vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> dist(n, -1); // 从start开始的无权最段路
    queue<int> q;

    dist[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : graph[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }

    return dist;
}
```

# 例题

## [547. 省份数量](https://leetcode.cn/problems/number-of-provinces/)

**题目描述：**

有 `n` 个城市，其中 `isConnected[i][j] = 1` 表示城市 `i` 和城市 `j` 直接相连。直接或间接相连的一组城市构成一个省份，求省份数量。

**输入：**

第一行输入整数 `n`。接下来 `n` 行，每行输入 `n` 个整数，表示连接矩阵。

**输出：**

输出一个整数，表示省份数量。

**示例：**

- 输入：

  ```text
  3
  1 1 0
  1 1 0
  0 0 1
  ```

- 输出：

  ```text
  2
  ```

<details class="note-solution">
<summary>查看解析</summary>

**思路：**

把矩阵看成无向图的邻接矩阵。从每个未访问城市出发 DFS，一次 DFS 可以访问整个省份，DFS 启动次数就是省份数量。

**代码：**

```cpp
#include <bits/stdc++.h>
using namespace std;

void dfs(int u, vector<vector<int>>& isConnected, vector<int>& visited) {
    visited[u] = 1;
    int n = isConnected.size();

    for (int v = 0; v < n; v++) {
        if (isConnected[u][v] == 1 && !visited[v]) {
            dfs(v, isConnected, visited);
        }
    }
}

int main() {
    int n;
    cin >> n;

    vector<vector<int>> isConnected(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> isConnected[i][j];
        }
    }

    vector<int> visited(n, 0);
    int provinces = 0;

    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            provinces++;
            dfs(i, isConnected, visited);
        }
    }

    cout << provinces << '\n';
    return 0;
}
```

</details>

## [1971. 寻找图中是否存在路径](https://leetcode.cn/problems/find-if-path-exists-in-graph/)

**题目描述：**

给定一个无向图，判断从 `source` 到 `destination` 是否存在路径。

**输入：**

第一行输入 `n m`，表示点数和边数。接下来 `m` 行输入无向边 `u v`。最后一行输入 `source destination`。

**输出：**

如果存在路径，输出 `true`，否则输出 `false`。

**示例：**

- 输入：

  ```text
  3 3
  0 1
  1 2
  2 0
  0 2
  ```

- 输出：

  ```text
  true
  ```

<details class="note-solution">
<summary>查看解析</summary>

**思路：**

建无向图后，从 `source` 出发 DFS 或 BFS。只要访问到 `destination`，答案就是 `true`。

**代码：**

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    vector<vector<int>> graph(n);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        graph[u].push_back(v);
        graph[v].push_back(u);
    }

    int source, destination;
    cin >> source >> destination;

    vector<int> visited(n, 0);
    queue<int> q;
    visited[source] = 1;
    q.push(source);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        if (u == destination) {
            cout << "true" << '\n';
            return 0;
        }

        for (int v : graph[u]) {
            if (!visited[v]) {
                visited[v] = 1;
                q.push(v);
            }
        }
    }

    cout << "false" << '\n';
    return 0;
}
```

</details>

## [752. 打开转盘锁](https://leetcode.cn/problems/open-the-lock/)

**题目描述：**

有一个四位转盘锁，初始状态是 `0000`。每次可以把任意一位数字向上或向下拨动一格，`9` 再向上变成 `0`，`0` 再向下变成 `9`。给定一组死亡状态 `deadends` 和目标状态 `target`，求打开锁的最少步数；如果无法打开，返回 `-1`。

**输入：**

第一行输入整数 `k`，表示死亡状态数量。接下来 `k` 行每行输入一个死亡状态。最后一行输入目标状态 `target`。

**输出：**

输出从 `0000` 到 `target` 的最少拨动次数；无法到达则输出 `-1`。

**示例：**

- 输入：

  ```text
  5
  0201
  0101
  0102
  1212
  2002
  0202
  ```

- 输出：

  ```text
  6
  ```

<details class="note-solution">
<summary>查看解析</summary>

**思路：**

每个四位字符串是一个图节点，一次拨动生成相邻节点。所有边权都是 `1`，所以用 BFS 求最短步数。

**代码：**

```cpp
#include <bits/stdc++.h>
using namespace std;

vector<string> getNextStates(string state) {
    vector<string> nextStates;

    for (int i = 0; i < 4; i++) {
        string up = state;
        up[i] = (up[i] == '9') ? '0' : up[i] + 1;
        nextStates.push_back(up);

        string down = state;
        down[i] = (down[i] == '0') ? '9' : down[i] - 1;
        nextStates.push_back(down);
    }

    return nextStates;
}

int main() {
    int k;
    cin >> k;

    unordered_set<string> dead;
    for (int i = 0; i < k; i++) {
        string s;
        cin >> s;
        dead.insert(s);
    }

    string target;
    cin >> target;

    string start = "0000";
    if (dead.count(start)) {
        cout << -1 << '\n';
        return 0;
    }

    queue<string> q;
    unordered_map<string, int> dist;
    q.push(start);
    dist[start] = 0;

    while (!q.empty()) {
        string cur = q.front();
        q.pop();

        if (cur == target) {
            cout << dist[cur] << '\n';
            return 0;
        }

        for (string nextState : getNextStates(cur)) {
            if (!dead.count(nextState) && !dist.count(nextState)) {
                dist[nextState] = dist[cur] + 1;
                q.push(nextState);
            }
        }
    }

    cout << -1 << '\n';
    return 0;
}
```

</details>

# 小结

| 场景 | 常用方法 |
| --- | --- |
| 判断可达性 | DFS / BFS |
| 统计连通块 | DFS / BFS |
| 无权图最短路 | BFS |
| 层序扩展、最少操作次数 | BFS |
| 递归搜索一整块区域 | DFS |
