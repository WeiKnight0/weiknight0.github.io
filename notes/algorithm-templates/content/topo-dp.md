---
title: "拓扑序 DP：DAG 最长路"
category: "图论"
order: 93
problems:
  - "2050. 并行课程 III"
  - "1857. 有向图中最大颜色值"
keywords:
  - "拓扑DP"
  - "DAG"
  - "最长路"
  - "动态规划"
tags:
  - "拓扑DP"
  - "DAG"
  - "刷表"
---

```cpp
vector<int> longestPathDAG(int n, vector<vector<int>>& edges) {
    vector<vector<int>> g(n);
    vector<int> indeg(n), dp(n);
    for (auto& e : edges) {
        g[e[0]].push_back(e[1]);
        indeg[e[1]]++;
    }
    queue<int> q;
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
    while (!q.empty()) {
        int x = q.front(); q.pop();
        for (int y : g[x]) {
            dp[y] = max(dp[y], dp[x] + 1);
            if (--indeg[y] == 0) q.push(y);
        }
    }
    return dp;
}
```
