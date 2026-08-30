---
title: "二维前缀和：子矩阵求和"
category: "前缀和"
order: 52
problems:
  - "304. 二维区域和检索"
  - "1314. 矩阵区域和"
keywords:
  - "二维前缀和"
  - "矩阵"
  - "子矩阵"
  - "NumMatrix"
tags:
  - "二维前缀和"
  - "矩阵"
  - "左闭右开"
---

```cpp
class NumMatrix {
private:
    vector<vector<int>> sum;

public:
    NumMatrix(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        sum.assign(m + 1, vector<int>(n + 1));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                sum[i + 1][j + 1] = sum[i + 1][j] + sum[i][j + 1] - sum[i][j] + matrix[i][j];
            }
        }
    }

    int sumRegion(int r1, int c1, int r2, int c2) {
        return sum[r2 + 1][c2 + 1] - sum[r2 + 1][c1] - sum[r1][c2 + 1] + sum[r1][c1];
    }
};
```
