---
title: "快速选择：第 K 大元素"
category: "排序与选择"
order: 35
problems:
  - "215. 数组中的第 K 个最大元素"
keywords:
  - "快速选择"
  - "TopK"
  - "排序"
  - "Hot100"
tags:
  - "Hot100 215"
  - "TopK"
  - "快速选择"
---

```cpp
int findKthLargest(vector<int>& nums, int k) {
    int target = nums.size() - k;
    int left = 0;
    int right = nums.size() - 1;

    while (left <= right) {
        int pivot = nums[left + (right - left) / 2];
        int i = left;
        int j = right;

        while (i <= j) {
            while (nums[i] < pivot) i++;
            while (nums[j] > pivot) j--;
            if (i <= j) swap(nums[i++], nums[j--]);
        }

        if (target <= j) right = j;
        else if (target >= i) left = i;
        else return nums[target];
    }

    return nums[target];
}
```
