---
title: "划分 DP：枚举最后一段"
category: "动态规划"
order: 91
problems:
  - "139. 单词拆分"
  - "1043. 分隔数组以得到最大和"
keywords:
  - "划分DP"
  - "最后一段"
  - "前缀"
  - "灵神风格"
tags:
  - "灵神风格"
  - "最后一段"
  - "前缀"
---

```cpp
// f[i] 表示 nums[0..i-1] 的最优值，枚举最后一段 nums[j..i-1]
int partitionDp(vector<int>& nums) {
    int n = nums.size();
    const int INF = INT_MAX / 2;
    vector<int> f(n + 1, INF);
    f[0] = 0;

    for (int i = 1; i <= n; i++) {
        int cost = 0;
        for (int j = i - 1; j >= 0; j--) {
            // TODO: 增量维护最后一段 nums[j..i-1] 的代价
            cost += nums[j];
            f[i] = min(f[i], f[j] + cost);
        }
    }
    return f[n];
}

// 若最后一段长度最多为 k，内层从 i-1 枚举到 max(0,i-k)
int partitionDpWithLimit(vector<int>& nums, int k) {
    int n = nums.size();
    vector<int> f(n + 1, INT_MIN / 2);
    f[0] = 0;
    for (int i = 1; i <= n; i++) {
        int mx = 0;
        for (int j = i - 1; j >= max(0, i - k); j--) {
            mx = max(mx, nums[j]);
            f[i] = max(f[i], f[j] + mx * (i - j));
        }
    }
    return f[n];
}
```
