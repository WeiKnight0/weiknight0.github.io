---
title: 215. 数组中的第 K 个最大元素
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `nums` 和整数 `k`，返回数组排序后的第 `k` 个最大元素。这里按元素的位置计数，不是第 `k` 个不同的值。

[题目链接](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

## 示例

### 示例 1

- 输入：`nums = [3,2,1,5,6,4], k = 2`
- 输出：`5`

### 示例 2

- 输入：`nums = [3,2,3,1,2,4,5,5,6], k = 4`
- 输出：`4`

## 数据范围

- $1 \leq k \leq nums.length \leq 10^5$
- $-10^4 \leq nums[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：维护大小为 k 的小根堆

小根堆保存目前见过的最大 `k` 个元素，堆顶是这 `k` 个元素中最小的一个：

1. 元素入堆；
2. 堆大小超过 `k` 时弹出堆顶，删除当前候选中最小的元素；
3. 扫描结束后，堆中正好是整个数组最大的 `k` 个元素，堆顶就是第 `k` 大。

重复值必须分别入堆。例如 `[5,5,4]` 的第 `2` 大仍然是 `5`。

```cpp
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> largest;
        for (int value : nums) {
            largest.push(value);
            if (largest.size() > static_cast<size_t>(k)) {
                largest.pop();
            }
        }
        return largest.top();
    }
};
```

处理完任意前缀后，堆中保存该前缀最大的至多 `k` 个元素。加入新元素再删除其中最小者后，这一性质继续成立。因此处理完整个数组后，堆顶就是全局第 `k` 大元素。

- 时间复杂度：$O(n\log k)$
- 空间复杂度：$O(k)$

这是通用 Top K 解法，但不满足当前题面要求的线性时间；需要满足该要求时使用下面的快速选择。

## 方法二：快速选择

第 `k` 大元素在升序数组中的目标下标是 `n-k`。快速选择进行一次类似快速排序的划分，但只继续处理目标下标所在的一侧，不必把整个数组排好序。

下面直接使用项目算法模板中的双指针划分：划分结束后，`[left,j]` 不大于基准，`[i,right]` 不小于基准；目标落在哪一侧，就只缩小到该侧继续处理。目标位于中间的基准值区域时，可以直接返回。

```cpp
class Solution {
public:
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
};
```

每次划分后，目标下标之外的另一侧无需再排序。算法最终把目标位置收缩到已经确定的划分区域，`nums[n-k]` 就是第 `k` 大元素。

- 平均时间复杂度：$O(n)$
- 最坏时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

若要求严格保证线性最坏复杂度，需要使用中位数的中位数选择基准；工程和竞赛中通常使用随机基准或上述快速选择。

## 易错点

- 第 `k` 大不是第 `k` 个不同元素，不能先去重。
- C++ 的 `priority_queue<int>` 默认是大根堆；固定保存最大的 `k` 个元素需要小根堆。
- 升序下标是 `n-k`，不是 `k-1`。
- 快速选择会修改原数组；若后续仍需原顺序，应先复制数组。

</details>

## 参考

- [项目快速选择模板](/notes/algorithm-templates/)
- [项目现有堆笔记](../../data-structures/tree/heap.md)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/kth-largest-element-in-an-array/solutions/)
