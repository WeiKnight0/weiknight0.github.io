---
title: "欧拉路径：Hierholzer 算法"
category: "图论"
order: 88
problems:
  - "332. 重新安排行程"
  - "2097. 合法重新排列数对"
keywords:
  - "欧拉路径"
  - "欧拉回路"
  - "Hierholzer"
  - "通用模板"
tags:
  - "欧拉路径"
  - "Hierholzer"
  - "有向图"
---

```cpp
vector<int> eulerPath(int n, vector<vector<int>>& edges, int start) {
    vector<vector<int>> g(n);
    for (auto& e : edges) g[e[0]].push_back(e[1]);
    vector<int> idx(n), path;

    function<void(int)> dfs = [&](int x) {
        while (idx[x] < (int) g[x].size()) {
            int y = g[x][idx[x]++];
            dfs(y);
        }
        path.push_back(x);
    };
    dfs(start);
    reverse(path.begin(), path.end());
    return path;
}
```
