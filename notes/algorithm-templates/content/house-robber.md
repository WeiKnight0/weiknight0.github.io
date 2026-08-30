---
title: "打家劫舍：滚动变量 DP"
category: "动态规划"
order: 30
problems:
  - "198. 打家劫舍"
keywords:
  - "动态规划"
  - "滚动变量"
  - "选或不选"
  - "Hot100"
tags:
  - "Hot100 198"
  - "滚动变量"
  - "选或不选"
---

```cpp
int rob(vector<int>& nums) {
    int prev2 = 0;
    int prev1 = 0;

    for (int x : nums) {
        int cur = max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
    }

    return prev1;
}
```
