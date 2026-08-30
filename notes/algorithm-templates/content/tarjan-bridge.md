---
title: "Tarjan：无向图桥"
category: "图论"
order: 87
problems:
  - "1192. 查找集群内的关键连接"
  - "1568. 使陆地分离的最少天数"
keywords:
  - "Tarjan"
  - "桥"
  - "lowlink"
  - "通用模板"
tags:
  - "Tarjan"
  - "桥"
  - "lowlink"
---

```cpp
vector<vector<int>> criticalConnections(int n, vector<vector<int>>& edges) {
    vector<vector<pair<int, int>>> g(n);
    for (int i = 0; i < (int) edges.size(); i++) {
        int x = edges[i][0], y = edges[i][1];
        g[x].push_back({y, i});
        g[y].push_back({x, i});
    }
    vector<int> dfn(n, -1), low(n);
    vector<vector<int>> bridges;
    int timer = 0;

    function<void(int, int)> dfs = [&](int x, int parentEdge) {
        dfn[x] = low[x] = timer++;
        for (auto [y, id] : g[x]) {
            if (id == parentEdge) continue;
            if (dfn[y] == -1) {
                dfs(y, id);
                low[x] = min(low[x], low[y]);
                if (low[y] > dfn[x]) bridges.push_back({x, y});
            } else {
                low[x] = min(low[x], dfn[y]);
            }
        }
    };
    for (int i = 0; i < n; i++) if (dfn[i] == -1) dfs(i, -1);
    return bridges;
}
```
