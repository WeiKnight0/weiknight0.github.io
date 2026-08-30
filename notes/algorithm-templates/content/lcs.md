---
title: "LCS：最长公共子序列"
category: "动态规划"
order: 61
problems:
  - "1143. 最长公共子序列"
  - "1035. 不相交的线"
keywords:
  - "LCS"
  - "双序列DP"
  - "最长公共子序列"
  - "字符串"
tags:
  - "线性DP"
  - "双序列"
  - "字符串"
---

```cpp
int longestCommonSubsequence(string a, string b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (a[i] == b[j]) dp[i + 1][j + 1] = dp[i][j] + 1;
            else dp[i + 1][j + 1] = max(dp[i][j + 1], dp[i + 1][j]);
        }
    }
    return dp[n][m];
}
```
