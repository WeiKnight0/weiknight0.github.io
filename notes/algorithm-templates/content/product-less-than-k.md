---
title: "计数型滑动窗口：乘积小于 K"
category: "滑动窗口"
order: 10
problems:
  - "713. 乘积小于 K 的子数组"
keywords:
  - "滑动窗口"
  - "计数型"
  - "越短越合法"
  - "子数组个数"
tags:
  - "713"
  - "越短越合法"
  - "贡献 right-left+1"
---

```cpp
int numSubarrayProductLessThanK(vector<int>& nums, int k) {
    if (k <= 1) return 0;

    int ans = 0;
    int left = 0;
    long long product = 1;

    for (int right = 0; right < (int)nums.size(); right++) {
        product *= nums[right];

        while (product >= k) {
            product /= nums[left];
            left++;
        }

        ans += right - left + 1;
    }

    return ans;
}
```
