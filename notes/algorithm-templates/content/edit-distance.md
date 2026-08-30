---
title: "编辑距离：插入删除替换"
category: "动态规划"
order: 62
problems:
  - "72. 编辑距离"
  - "583. 两个字符串的删除操作"
keywords:
  - "编辑距离"
  - "双序列DP"
  - "字符串"
  - "最短操作"
tags:
  - "线性DP"
  - "双序列"
  - "最短操作"
---

```cpp
int minDistance(string a, string b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1));
    for (int i = 0; i <= n; i++) dp[i][0] = i;
    for (int j = 0; j <= m; j++) dp[0][j] = j;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]}) + 1;
        }
    }
    return dp[n][m];
}
```
