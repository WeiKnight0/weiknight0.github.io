---
title: "Floyd：全源最短路"
category: "图论"
order: 56
problems:
  - "1334. 阈值距离内邻居最少的城市"
  - "2976. 转换字符串的最小成本 I"
keywords:
  - "Floyd"
  - "全源最短路"
  - "灵神风格"
  - "O(n^3)"
tags:
  - "灵神风格"
  - "全源最短路"
  - "O(n^3)"
---

```cpp
vector<vector<long long>> floyd(int n, vector<vector<int>>& edges) {
    const long long INF = LLONG_MAX / 2;
    vector<vector<long long>> dis(n, vector<long long>(n, INF));
    for (int i = 0; i < n; i++) {
        dis[i][i] = 0;
    }
    for (auto& e : edges) {
        int x = e[0], y = e[1], w = e[2];
        dis[x][y] = min(dis[x][y], (long long) w);
        // 无向图加上：dis[y][x] = min(dis[y][x], (long long) w);
    }

    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                dis[i][j] = min(dis[i][j], dis[i][k] + dis[k][j]);
            }
        }
    }
    return dis;
}
```
