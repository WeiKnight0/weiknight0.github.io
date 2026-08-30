---
title: "树的直径：两次 BFS"
category: "二叉树"
order: 66
problems:
  - "1245. 树的直径"
  - "3203. 合并两棵树后的最小直径"
keywords:
  - "树的直径"
  - "一般树"
  - "BFS"
  - "两次搜索"
tags:
  - "一般树"
  - "直径"
  - "BFS"
---

```cpp
pair<int, int> farthest(vector<vector<int>>& g, int start) {
    vector<int> dist(g.size(), -1);
    queue<int> q;
    dist[start] = 0;
    q.push(start);
    int best = start;
    while (!q.empty()) {
        int x = q.front();
        q.pop();
        if (dist[x] > dist[best]) best = x;
        for (int y : g[x]) if (dist[y] < 0) {
            dist[y] = dist[x] + 1;
            q.push(y);
        }
    }
    return {best, dist[best]};
}

int treeDiameter(vector<vector<int>>& g) {
    auto [a, da] = farthest(g, 0);
    auto [b, diameter] = farthest(g, a);
    return diameter;
}
```
