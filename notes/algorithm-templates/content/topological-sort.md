---
title: "拓扑排序：Kahn 入度法"
category: "图论"
order: 28
problems:
  - "207. 课程表"
  - "210. 课程表 II"
keywords:
  - "图论"
  - "拓扑排序"
  - "入度"
  - "DAG"
tags:
  - "课程表"
  - "入度"
  - "DAG"
---

```cpp
vector<int> topoSort(int n, vector<vector<int>>& edges) {
    vector<vector<int>> graph(n);
    vector<int> indeg(n, 0);

    for (auto& e : edges) {
        int from = e[0], to = e[1];
        graph[from].push_back(to);
        indeg[to]++;
    }

    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (indeg[i] == 0) q.push(i);
    }

    vector<int> order;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : graph[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }

    return order.size() == n ? order : vector<int>{};
}
```
