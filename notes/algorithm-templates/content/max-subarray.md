---
title: "最大子数组和：Kadane"
category: "动态规划"
order: 31
problems:
  - "53. 最大子数组和"
keywords:
  - "动态规划"
  - "Kadane"
  - "连续子数组"
  - "Hot100"
tags:
  - "Hot100 53"
  - "Kadane"
  - "连续子数组"
---

```cpp
int maxSubArray(vector<int>& nums) {
    int best = nums[0];
    int cur = 0;

    for (int x : nums) {
        cur = max(x, cur + x);
        best = max(best, cur);
    }

    return best;
}
```
