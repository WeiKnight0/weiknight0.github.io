---
title: "最长递增子序列：贪心 + 二分"
category: "动态规划"
order: 32
problems:
  - "300. 最长递增子序列"
keywords:
  - "动态规划"
  - "LIS"
  - "二分"
  - "Hot100"
tags:
  - "Hot100 300"
  - "LIS"
  - "二分"
---

```cpp
int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;

    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x);
        } else {
            *it = x;
        }
    }

    return tails.size();
}
```
