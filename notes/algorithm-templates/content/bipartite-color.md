---
title: "二分图染色：DFS 交替染色"
category: "图论"
order: 58
problems:
  - "785. 判断二分图"
  - "886. 可能的二分法"
keywords:
  - "二分图"
  - "染色"
  - "DFS"
  - "图论"
tags:
  - "二分图"
  - "染色"
  - "DFS"
---

```cpp
bool isBipartite(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> color(n);

    function<bool(int, int)> dfs = [&](int x, int c) {
        color[x] = c;
        for (int y : graph[x]) {
            if (color[y] == c) return false;
            if (color[y] == 0 && !dfs(y, -c)) return false;
        }
        return true;
    };

    for (int i = 0; i < n; i++) {
        if (color[i] == 0 && !dfs(i, 1)) return false;
    }
    return true;
}
```
