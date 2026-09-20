---
title: 153. 寻找旋转排序数组中的最小值
date: 2026-09-07
lang: zh-cn
---

一个由不同整数构成的严格递增数组被旋转了若干次。给定旋转后的数组 `nums`，返回其中的最小元素。算法的时间复杂度必须为 $O(\log n)$。

[题目链接](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/)

## 示例

### 示例 1

- 输入：`nums = [3,4,5,1,2]`
- 输出：`1`

### 示例 2

- 输入：`nums = [4,5,6,7,0,1,2]`
- 输出：`0`

### 示例 3

- 输入：`nums = [11,13,15,17]`
- 输出：`11`

## 数据范围

- $1 \leq nums.length \leq 5000$
- $-5000 \leq nums[i] \leq 5000$
- `nums` 中的值互不相同
- `nums` 是一个严格递增数组旋转后的结果

## 与区间末尾比较

在候选区间 $[left,right]$ 中，用 `nums[mid]` 与 `nums[right]` 比较：

- `nums[mid] > nums[right]`：`mid` 位于旋转前较大的那一段，最小值一定在 `mid` 右侧；
- `nums[mid] < nums[right]`：从 `mid` 到 `right` 递增，`mid` 可能就是最小值，因此保留 `mid`。

循环中 `mid < right`，并且数组元素互不相同，所以不会出现 `nums[mid] == nums[right]`。

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int left = 0, right = nums.size() - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
};
```

每次更新都保留最小值所在下标：第一种情况排除较大段及 `mid`，第二种情况排除 `mid` 右侧但保留可能为最小值的 `mid`。区间最终收缩到一个位置，该位置就是旋转点，也就是数组最小值。

- 时间复杂度：$O(\log n)$
- 空间复杂度：$O(1)$

## 易错点

- `right = mid` 不能写成 `mid - 1`，因为 `nums[mid] < nums[right]` 时 `mid` 可能正是最小值。
- 比较对象应是当前区间的 `nums[right]`，不是固定的数组末尾元素。
- 数组可能没有发生有效旋转，此时算法会收缩到下标 `0`。

## 参考

- [项目现有二分查找笔记](../../algorithms/techniques/binary-search.md)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/solutions/)
