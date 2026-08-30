---
title: "0-1 BFS：边权只有 0 和 1"
category: "图论"
order: 55
problems:
  - "2290. 到达角落需要移除障碍物的最小数目"
  - "1368. 使网格图至少有一条有效路径的最小代价"
keywords:
  - "0-1 BFS"
  - "最短路"
  - "deque"
  - "网格图"
tags:
  - "最短路"
  - "deque"
  - "0-1 BFS"
---

```cpp
vector<int> zeroOneBfs(int n, vector<vector<pair<int, int>>>& g, int start) {
    const int INF = 1e9;
    vector<int> dist(n, INF);
    deque<int> q;
    dist[start] = 0;
    q.push_front(start);

    while (!q.empty()) {
        int x = q.front();
        q.pop_front();
        for (auto [y, w] : g[x]) {
            if (dist[x] + w < dist[y]) {
                dist[y] = dist[x] + w;
                if (w == 0) q.push_front(y);
                else q.push_back(y);
            }
        }
    }
    return dist;
}
```
