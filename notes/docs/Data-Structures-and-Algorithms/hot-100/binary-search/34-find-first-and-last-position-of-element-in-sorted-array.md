---
title: 34. 在排序数组中查找元素的第一个和最后一个位置
date: 2026-09-07
lang: zh-cn
---

给定一个非递减数组 `nums` 和目标值 `target`，返回目标值在数组中第一次和最后一次出现的下标。如果目标值不存在，返回 `[-1,-1]`。算法的时间复杂度必须为 $O(\log n)$。

[题目链接](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)

## 示例

### 示例 1

- 输入：`nums = [5,7,7,8,8,10], target = 8`
- 输出：`[3,4]`

### 示例 2

- 输入：`nums = [5,7,7,8,8,10], target = 6`
- 输出：`[-1,-1]`

### 示例 3

- 输入：`nums = [], target = 0`
- 输出：`[-1,-1]`

## 数据范围

- $0 \leq nums.length \leq 10^5$
- $-10^9 \leq nums[i], target \leq 10^9$
- `nums` 非递减

## 两次边界查找

把问题拆成两个明确的边界：

- 左边界是第一个大于或等于 `target` 的位置；
- 右边界的后一位是第一个大于 `target` 的位置。

两个函数都在左闭右开区间 $[left,right)$ 上搜索。这样即使答案在数组末尾之后，也能返回 `nums.size()`。

```cpp
class Solution {
    int lowerBound(const vector<int>& nums, int target) {
        int left = 0, right = nums.size();
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

    int upperBound(const vector<int>& nums, int target) {
        int left = 0, right = nums.size();
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] <= target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int n = nums.size();
        int first = lowerBound(nums, target);
        if (first == n || nums[first] != target) {
            return {-1, -1};
        }
        return {first, upperBound(nums, target) - 1};
    }
};
```

`lowerBound` 结束时，`first` 左侧都小于目标值；若 `nums[first] == target`，它就是第一次出现的位置。`upperBound` 返回值左侧都小于或等于目标值，因此减一就是最后一次出现的位置。

- 时间复杂度：$O(\log n)$
- 空间复杂度：$O(1)$

## 易错点

- 读取 `nums[first]` 前必须先判断 `first == nums.size()`，这是数组下标的外部边界。
- 不要在找到一次目标值后向两侧线性扫描，否则最坏时间复杂度会退化为 $O(n)$。
- `upperBound` 查找的是第一个严格大于目标值的位置，最终需要减一。
- 用 `lowerBound(target + 1)` 代替上界搜索可能产生整数溢出；直接实现 `upperBound` 更稳妥。

## 参考

- [项目现有二分查找笔记](../../algorithms/techniques/binary-search.md)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/solutions/)
