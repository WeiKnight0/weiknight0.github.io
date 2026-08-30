---
title: "区间 DP：枚举区间长度和断点"
category: "动态规划"
order: 64
problems:
  - "312. 戳气球"
  - "1547. 切棍子的最小成本"
keywords:
  - "区间DP"
  - "枚举断点"
  - "按长度枚举"
  - "灵神风格"
tags:
  - "灵神风格"
  - "枚举断点"
  - "O(n^3)"
---

```cpp
// f[l][r] 表示闭区间 [l,r] 的最优值
int intervalDp(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> f(n, vector<int>(n));

    for (int len = 2; len <= n; len++) {
        for (int l = 0; l + len - 1 < n; l++) {
            int r = l + len - 1;
            f[l][r] = INT_MAX / 2;
            for (int k = l; k < r; k++) {
                int cost = 0; // TODO: 合并 [l,k] 和 [k+1,r] 的额外代价
                f[l][r] = min(f[l][r], f[l][k] + f[k + 1][r] + cost);
            }
        }
    }
    return f[0][n - 1];
}

// 记忆化搜索写法：适合从题意自然递归到左右端点
int intervalDfs(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> memo(n, vector<int>(n, -1));
    auto dfs = [&](auto&& dfs, int l, int r) -> int {
        if (l == r) {
            return 0;
        }
        int& res = memo[l][r];
        if (res != -1) {
            return res;
        }
        res = INT_MAX / 2;
        for (int k = l; k < r; k++) {
            int cost = 0; // TODO: 合并代价
            res = min(res, dfs(dfs, l, k) + dfs(dfs, k + 1, r) + cost);
        }
        return res;
    };
    return dfs(dfs, 0, n - 1);
}
```
