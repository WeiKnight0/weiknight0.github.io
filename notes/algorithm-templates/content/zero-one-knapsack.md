---
title: "0-1 背包：选或不选"
category: "动态规划"
order: 59
problems:
  - "416. 分割等和子集"
  - "494. 目标和"
keywords:
  - "0-1背包"
  - "背包"
  - "倒序"
  - "灵神风格"
tags:
  - "灵神风格"
  - "倒序"
  - "每个物品选一次"
---

```cpp
// 最大价值：每个物品至多选一次，容量为 target
int zeroOneKnapsack(vector<int>& weight, vector<int>& value, int target) {
    vector<int> f(target + 1);
    for (int i = 0; i < weight.size(); i++) {
        int w = weight[i], v = value[i];
        for (int c = target; c >= w; c--) { // 0-1 背包必须倒序
            f[c] = max(f[c], f[c - w] + v);
        }
    }
    return f[target];
}

// 方案数：从 nums 中选若干数，和恰好等于 target
long long countSubsetSum(vector<int>& nums, int target) {
    vector<long long> f(target + 1);
    f[0] = 1;
    for (int x : nums) {
        for (int c = target; c >= x; c--) {
            f[c] += f[c - x];
        }
    }
    return f[target];
}
```
