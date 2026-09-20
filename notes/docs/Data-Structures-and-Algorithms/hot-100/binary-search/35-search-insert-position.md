---
title: 35. 搜索插入位置
date: 2026-09-07
lang: zh-cn
---

给定一个无重复元素的升序数组 `nums` 和目标值 `target`。如果数组中存在目标值，返回它的下标；否则返回将它插入数组并保持升序的位置。算法的时间复杂度必须为 $O(\log n)$。

[题目链接](https://leetcode.cn/problems/search-insert-position/)

## 示例

### 示例 1

- 输入：`nums = [1,3,5,6], target = 5`
- 输出：`2`

### 示例 2

- 输入：`nums = [1,3,5,6], target = 2`
- 输出：`1`

### 示例 3

- 输入：`nums = [1,3,5,6], target = 7`
- 输出：`4`

## 数据范围

- $1 \leq nums.length \leq 10^4$
- $-10^4 \leq nums[i], target \leq 10^4$
- `nums` 严格递增

## 查找插入位置

目标位置是数组中第一个大于或等于 `target` 的下标。若所有元素都小于 `target`，答案就是数组长度 $n$。

使用左闭右开区间 $[left,right)$：

- `nums[mid] < target` 时，`mid` 不可能是答案，令 `left = mid + 1`；
- `nums[mid] >= target` 时，`mid` 可能是答案，令 `right = mid`。

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
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
};
```

循环结束时 `left == right`。该位置左侧的元素都小于 `target`，该位置及其右侧的元素都大于或等于 `target`，所以它正是目标值的位置或合法插入位置。

- 时间复杂度：$O(\log n)$
- 空间复杂度：$O(1)$

## 标准库写法

`lower_bound` 返回有序区间中第一个大于或等于目标值的迭代器，与上面的查找目标完全相同。

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        return lower_bound(nums.begin(), nums.end(), target) - nums.begin();
    }
};
```

## 易错点

- `right` 初值为 `nums.size()`，表示搜索区间不包含右端点。
- 当目标值大于所有元素时，返回 `nums.size()`，不能把答案限制在最后一个有效下标。
- 这里找的是第一个大于或等于目标值的位置，不是任意一个相等位置。

## 参考

- [项目现有二分查找笔记](../../algorithms/techniques/binary-search.md)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/search-insert-position/solutions/)
