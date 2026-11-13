---
title: 33. 搜索旋转排序数组
date: 2026-09-07
lang: zh-cn
---

一个由不同整数构成的严格递增数组，可能在某个下标处旋转。例如 `[0,1,2,4,5,6,7]` 旋转后可以变成 `[4,5,6,7,0,1,2]`。给定旋转后的数组 `nums` 和目标值 `target`，返回目标值的下标；不存在则返回 `-1`。算法的时间复杂度必须为 $O(\log n)$。

[题目链接](https://leetcode.cn/problems/search-in-rotated-sorted-array/)

## 示例

### 示例 1

- 输入：`nums = [4,5,6,7,0,1,2], target = 0`
- 输出：`4`

### 示例 2

- 输入：`nums = [4,5,6,7,0,1,2], target = 3`
- 输出：`-1`

### 示例 3

- 输入：`nums = [1], target = 0`
- 输出：`-1`

## 数据范围

- $1 \leq nums.length \leq 5000$
- $-10^4 \leq nums[i], target \leq 10^4$
- `nums` 中的值互不相同
- `nums` 是一个严格递增数组旋转后的结果

<details class="note-solution">
<summary>查看解析</summary>

## 判断有序的一半

旋转数组整体不一定有序，但任取区间中点，左右两半中至少有一半保持有序：

- `nums[left] <= nums[mid]`，左半段有序；
- 否则右半段有序。

确定有序的一半后，就能通过端点判断 `target` 是否落在该半段的值域内。若在，保留该半段；否则舍弃它并搜索另一半。

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            }

            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
};
```

每轮先排除 `mid`。剩余两半中至少一半有序，而有序半段的端点能够准确判断目标值是否属于它。算法始终保留可能含有目标值的一半，因此找到时返回正确下标；区间为空时，目标值不存在。

- 时间复杂度：$O(\log n)$
- 空间复杂度：$O(1)$

## 易错点

- 判断左半段有序时需要使用 `<=`，单元素区间也应归入有序情况。
- 左半段目标值范围是 `nums[left] <= target && target < nums[mid]`，不能在两端都使用闭区间，因为 `mid` 已经比较过。
- 本题元素互不相同。若允许重复值，`nums[left] == nums[mid]` 时可能无法判断旋转点在哪一侧，需要额外处理。

</details>

## 参考

- [项目现有二分查找笔记](../../algorithms/techniques/binary-search.md)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/search-in-rotated-sorted-array/solutions/)
