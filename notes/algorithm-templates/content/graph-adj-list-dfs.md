---
title: "邻接表 DFS：遍历连通块"
category: "图论"
order: 26
problems:
  - "1971. 寻找图中是否存在路径"
  - "323. 无向图中连通分量的数目"
keywords:
  - "图论"
  - "DFS"
  - "邻接表"
  - "灵神风格"
tags:
  - "灵神风格"
  - "邻接表"
  - "DFS"
---

```cpp
vector<vector<int>> g;
vector<int> vis;

void dfs(int x) {
    vis[x] = true;
    for (int y : g[x]) {
        if (!vis[y]) {
            dfs(y);
        }
    }
}

int countComponents(int n, vector<vector<int>>& edges) {
    g.assign(n, {});
    for (auto& e : edges) {
        int x = e[0], y = e[1];
        g[x].push_back(y);
        g[y].push_back(x);
    }

    vis.assign(n, false);
    int ans = 0;
    for (int i = 0; i < n; i++) {
        if (!vis[i]) {
            ans++;
            dfs(i);
        }
    }
    return ans;
}
```
