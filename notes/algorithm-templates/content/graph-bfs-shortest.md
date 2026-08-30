---
title: "邻接表 BFS：无权图最短路"
category: "图论"
order: 27
problems:
  - "752. 打开转盘锁"
  - "815. 公交路线"
keywords:
  - "图论"
  - "BFS"
  - "最短路"
  - "邻接表"
  - "灵神风格"
tags:
  - "灵神风格"
  - "邻接表"
  - "无权图"
---

```cpp
vector<int> bfs(vector<vector<int>>& g, int start) {
    int n = g.size();
    vector<int> dis(n, -1);
    queue<int> q;
    dis[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int x = q.front();
        q.pop();
        for (int y : g[x]) {
            if (dis[y] < 0) {
                dis[y] = dis[x] + 1;
                q.push(y);
            }
        }
    }
    return dis;
}
```
