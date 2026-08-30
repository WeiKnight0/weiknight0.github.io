---
title: "二维差分：子矩阵加法"
category: "基础容器与技巧"
order: 79
problems:
  - "2536. 子矩阵元素加 1"
  - "2132. 用邮票贴满网格图"
keywords:
  - "二维差分"
  - "矩阵"
  - "区间更新"
  - "前缀还原"
tags:
  - "二维差分"
  - "矩阵"
  - "区间更新"
---

```cpp
vector<vector<int>> rangeAddQueries(int n, vector<vector<int>>& queries) {
    vector<vector<int>> diff(n + 1, vector<int>(n + 1));
    for (auto& q : queries) {
        int r1 = q[0], c1 = q[1], r2 = q[2], c2 = q[3];
        diff[r1][c1]++;
        diff[r2 + 1][c1]--;
        diff[r1][c2 + 1]--;
        diff[r2 + 1][c2 + 1]++;
    }
    vector<vector<int>> ans(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            int up = i ? ans[i - 1][j] : 0;
            int left = j ? ans[i][j - 1] : 0;
            int diag = i && j ? ans[i - 1][j - 1] : 0;
            ans[i][j] = up + left - diag + diff[i][j];
        }
    }
    return ans;
}
```
