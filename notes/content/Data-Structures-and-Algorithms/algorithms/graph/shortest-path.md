---
title: 最短路
date: 2025-02-04
description: 图论核心最短路算法，包含 Dijkstra、Floyd 和典型题。
categories:
  - Notes
  - Data Structures and Algorithms
  - Graph
tags:
  - DSA
  - Graph
  - Shortest Path
  - Dijkstra
  - Floyd
---

最短路问题是在带权图中求点到点的最小路径代价。面试和 LeetCode 中最常见的是：

| 场景 | 算法 |
| --- | --- |
| 单源最短路，边权非负 | Dijkstra |
| 单源最短路，允许负边权 | Bellman-Ford |
| 多源最短路，点数较小 | Floyd |
| 无权图最短路 | BFS |

# Dijkstra

Dijkstra 用于边权非负的图。核心思想是：每次从未确定的点中取当前距离最小的点，用它更新相邻点。

优先队列版本复杂度为 `O((n + m) log n)`。

## 核心模板

```cpp
vector<int> dijkstra(int n, vector<vector<pair<int, int>>>& graph, int start) {
    const int INF = 1e9;
    vector<int> dist(n, INF);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto [v, w] : graph[u]) {
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}
```

## 例题：[743. 网络延迟时间](https://leetcode.cn/problems/network-delay-time/)

题目描述：有 `n` 个网络节点，编号为 `1` 到 `n`。给定有向边 `times[i] = [u, v, w]`，表示信号从 `u` 到 `v` 需要 `w` 时间。信号从节点 `k` 发出，求所有节点收到信号的最短时间；如果有节点无法收到，返回 `-1`。

输入：第一行输入 `n m k`。接下来 `m` 行，每行输入 `u v w`，表示一条有向边。

输出：网络延迟时间；如果存在不可达节点，输出 `-1`。

示例：

- 输入：

  ```text
  4 3 2
  2 1 1
  2 3 1
  3 4 1
  ```

- 输出：

  ```text
  2
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：这是从 `k` 出发到所有点的单源正权最短路，使用 Dijkstra。答案是所有最短距离的最大值；如果存在不可达节点，输出 `-1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m, k;
    cin >> n >> m >> k;

    vector<vector<pair<int, int>>> graph(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        graph[u].push_back({v, w});
    }

    const int INF = 1e9;
    vector<int> dist(n + 1, INF);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

    dist[k] = 0;
    pq.push({0, k});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto [v, w] : graph[u]) {
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    int ans = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INF) {
            cout << -1 << '\n';
            return 0;
        }
        ans = max(ans, dist[i]);
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

# Bellman-Ford

Bellman-Ford 用于单源最短路，允许负边权。对所有边重复松弛 $n-1$ 轮；第 $n$ 轮仍能松弛，说明源点可达负环。时间复杂度为 $O(nm)$。

## 核心模板

```cpp
struct Edge {
    int from;
    int to;
    int weight;
};

bool bellmanFord(int n, int start, const vector<Edge>& edges, vector<long long>& dist) {
    const long long INF = 1LL << 60;
    dist.assign(n, INF);
    dist[start] = 0;

    for (int round = 1; round < n; round++) {
        bool changed = false;
        for (const Edge& edge : edges) {
            if (dist[edge.from] == INF) continue;
            if (dist[edge.to] <= dist[edge.from] + edge.weight) continue;
            dist[edge.to] = dist[edge.from] + edge.weight;
            changed = true;
        }
        if (!changed) break;
    }

    for (const Edge& edge : edges) {
        if (dist[edge.from] == INF) continue;
        if (dist[edge.to] > dist[edge.from] + edge.weight) return false;
    }
    return true;
}
```

# Floyd

Floyd 用于求所有点对之间的最短路，适合点数较小的图，复杂度为 `O(n^3)`。

## 核心模板

```cpp
for (int k = 0; k < n; k++) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (dist[i][k] != INF && dist[k][j] != INF) {
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
            }
        }
    }
}
```

## 例题：[1334. 阈值距离内邻居最少的城市](https://leetcode.cn/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/)

题目描述：有 `n` 个城市和若干条无向带权边。给定距离阈值 `distanceThreshold`，求能到达的邻居城市数量最少的城市编号；如果有多个答案，返回编号最大的城市。

输入：第一行输入 `n m distanceThreshold`。接下来 `m` 行，每行输入 `u v w`，表示无向带权边。

输出：满足条件的城市编号。

示例：

- 输入：

  ```text
  4 4 4
  0 1 3
  1 2 1
  1 3 4
  2 3 1
  ```

- 输出：

  ```text
  3
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：需要知道任意两个城市之间的最短距离，且 `n` 较小，使用 Floyd。统计每个城市能到达的城市数量，数量更少或数量相同但编号更大时更新答案。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m, distanceThreshold;
    cin >> n >> m >> distanceThreshold;

    const int INF = 1e9;
    vector<vector<int>> dist(n, vector<int>(n, INF));

    for (int i = 0; i < n; i++) {
        dist[i][i] = 0;
    }

    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        dist[u][v] = min(dist[u][v], w);
        dist[v][u] = min(dist[v][u], w);
    }

    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] != INF && dist[k][j] != INF) {
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
    }

    int ans = -1;
    int bestCount = INF;

    for (int i = 0; i < n; i++) {
        int count = 0;
        for (int j = 0; j < n; j++) {
            if (i != j && dist[i][j] <= distanceThreshold) {
                count++;
            }
        }

        if (count <= bestCount) {
            bestCount = count;
            ans = i;
        }
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

# 小结

| 算法 | 适用条件 | 复杂度 |
| --- | --- | --- |
| BFS | 无权图最短路 | `O(n + m)` |
| Dijkstra | 单源最短路，边权非负 | `O((n + m) log n)` |
| Floyd | 多源最短路，点数较小 | `O(n^3)` |
