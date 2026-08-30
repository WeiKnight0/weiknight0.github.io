---
title: "左边界二分：第一个 >= target"
category: "二分查找"
order: 13
problems:
  - "34. 查找元素的第一个和最后一个位置"
keywords:
  - "二分查找"
  - "lower_bound"
  - "左边界"
  - "有序数组"
tags:
  - "lower_bound"
  - "左边界"
  - "有序数组"
---

```cpp
int lowerBound(vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size();

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] >= target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return left;
}
```
