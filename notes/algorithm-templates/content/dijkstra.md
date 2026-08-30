---
title: "Dijkstra：非负权单源最短路"
category: "图论"
order: 54
problems:
  - "743. 网络延迟时间"
  - "1631. 最小体力消耗路径"
keywords:
  - "Dijkstra"
  - "最短路"
  - "堆"
  - "灵神风格"
tags:
  - "灵神风格"
  - "最短路"
  - "堆优化"
---

```cpp
vector<long long> dijkstra(int n, vector<vector<pair<int, int>>>& g, int start) {
    const long long INF = LLONG_MAX / 2;
    vector<long long> dis(n, INF);
    dis[start] = 0;
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    pq.emplace(0, start);

    while (!pq.empty()) {
        auto [dx, x] = pq.top();
        pq.pop();
        if (dx > dis[x]) { // 懒删除
            continue;
        }
        for (auto [y, w] : g[x]) {
            long long new_dis = dx + w;
            if (new_dis < dis[y]) {
                dis[y] = new_dis;
                pq.emplace(new_dis, y);
            }
        }
    }
    return dis;
}

vector<vector<pair<int, int>>> buildGraph(int n, vector<vector<int>>& edges) {
    vector<vector<pair<int, int>>> g(n);
    for (auto& e : edges) {
        int x = e[0], y = e[1], w = e[2];
        g[x].emplace_back(y, w);
        // 无向图加上：g[y].emplace_back(x, w);
    }
    return g;
}
```
