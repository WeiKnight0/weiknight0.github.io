---
title: "完全背包：物品可重复选"
category: "动态规划"
order: 60
problems:
  - "322. 零钱兑换"
  - "518. 零钱兑换 II"
keywords:
  - "完全背包"
  - "背包"
  - "正序"
  - "灵神风格"
tags:
  - "灵神风格"
  - "正序"
  - "无限次"
---

```cpp
// 最大价值：每个物品可以选无限次，容量为 target
int completeKnapsack(vector<int>& weight, vector<int>& value, int target) {
    vector<int> f(target + 1);
    for (int i = 0; i < weight.size(); i++) {
        int w = weight[i], v = value[i];
        for (int c = w; c <= target; c++) { // 完全背包必须正序
            f[c] = max(f[c], f[c - w] + v);
        }
    }
    return f[target];
}

// 最少个数：凑成 target 的最少物品数，不能凑成返回 -1
int minCoins(vector<int>& coins, int target) {
    const int INF = target + 1;
    vector<int> f(target + 1, INF);
    f[0] = 0;
    for (int x : coins) {
        for (int c = x; c <= target; c++) {
            f[c] = min(f[c], f[c - x] + 1);
        }
    }
    return f[target] == INF ? -1 : f[target];
}

// 组合数：外层枚举物品，内层正序枚举容量
long long countCombinations(vector<int>& nums, int target) {
    vector<long long> f(target + 1);
    f[0] = 1;
    for (int x : nums) {
        for (int c = x; c <= target; c++) {
            f[c] += f[c - x];
        }
    }
    return f[target];
}
```
