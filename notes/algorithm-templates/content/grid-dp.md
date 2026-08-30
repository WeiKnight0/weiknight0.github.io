---
title: "网格 DP：最小路径和"
category: "动态规划"
order: 90
problems:
  - "64. 最小路径和"
  - "62. 不同路径"
keywords:
  - "网格DP"
  - "二维DP"
  - "路径"
  - "动态规划"
tags:
  - "网格DP"
  - "二维DP"
  - "路径"
---

```cpp
int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector<vector<int>> dp(m, vector<int>(n, INT_MAX / 2));
    dp[0][0] = grid[0][0];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (i) dp[i][j] = min(dp[i][j], dp[i - 1][j] + grid[i][j]);
            if (j) dp[i][j] = min(dp[i][j], dp[i][j - 1] + grid[i][j]);
        }
    }
    return dp[m - 1][n - 1];
}
```
