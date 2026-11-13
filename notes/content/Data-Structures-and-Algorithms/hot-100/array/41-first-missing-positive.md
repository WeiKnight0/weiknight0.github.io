---
title: 41. 缺失的第一个正数
date: 2026-09-07
lang: zh-cn
---

给定未排序整数数组 `nums`，返回其中没有出现的最小正整数。进阶要求时间复杂度为 $O(n)$，额外空间复杂度为 $O(1)$。

[题目链接](https://leetcode.cn/problems/first-missing-positive/)

## 示例

### 示例 1

- 输入：`nums = [1,2,0]`
- 输出：`3`

### 示例 2

- 输入：`nums = [3,4,-1,1]`
- 输出：`2`
- 解释：数组中存在 `1`，但不存在 `2`。

### 示例 3

- 输入：`nums = [7,8,9,11,12]`
- 输出：`1`

## 数据范围

- $1 \leq nums.length \leq 10^5$
- $-2^{31} \leq nums[i] \leq 2^{31}-1$

<details class="note-solution">
<summary>查看解析</summary>

## 答案范围

长度为 $n$ 的数组最多同时包含正整数 $1,2,\ldots,n$。若它们全部出现，答案为 $n+1$；否则答案一定在 `[1, n]` 中。

因此，负数、零和大于 `n` 的数都不影响答案。只需判断 `[1, n]` 中每个整数是否出现。

## 方法一：哈希集合

把所有数加入集合，再从 `1` 开始寻找第一个不在集合中的正整数。

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        unordered_set<int> values(nums.begin(), nums.end());
        for (int x = 1; x <= nums.size(); x++) {
            if (!values.count(x)) {
                return x;
            }
        }
        return nums.size() + 1;
    }
};
```

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$

该方法容易理解，但不满足 $O(1)$ 额外空间的进阶要求。

## 方法二：原地放置

把输入数组本身当作哈希表：数值 `x` 若位于 `[1, n]`，就应放在下标 `x - 1`。

遍历每个位置时，只要当前数属于 `[1, n]` 且尚未位于正确位置，就将它与目标位置交换。交换后当前位置得到了一个新数，需要继续判断，所以这里使用 `while` 而不是 `if`。

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            while (nums[i] >= 1 && nums[i] <= n &&
                   nums[nums[i] - 1] != nums[i]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }

        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }
        return n + 1;
    }
};
```

以 `[3,4,-1,1]` 为例：

1. `3` 放到下标 `2`，数组变为 `[-1,4,3,1]`；
2. `4` 放到下标 `3`，数组变为 `[-1,1,3,4]`；
3. 下标 `1` 的 `1` 放到下标 `0`，数组变为 `[1,-1,3,4]`；
4. 最终下标 `1` 上不是 `2`，所以缺失的最小正整数是 `2`。

## 为什么是线性时间

虽然代码中存在嵌套的 `while`，但每次交换都会把一个 `[1,n]` 内的数放到其目标下标。一个目标位置确定后不会因相同数值再次交换而被破坏，所以成功交换次数不超过 $n$，总时间复杂度仍为 $O(n)$。

## 正确性

放置结束后，若数值 `x` 存在，则下标 `x - 1` 上一定是 `x`；重复值会因目标位置已经具有同值而停止交换。随后从左向右检查，第一个不满足 `nums[i] == i + 1` 的位置对应最小缺失正整数。若所有位置都满足，`1` 到 `n` 全部存在，答案为 `n + 1`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 易错点

- 访问 `nums[nums[i] - 1]` 前，必须先确认 `nums[i]` 位于 `[1, n]`。
- 交换条件必须排除目标位置已经等于当前值的情况，否则重复值会导致死循环。
- 需要反复处理交换到当前位置的新值，因此不能把 `while` 改为 `if`。
- 最终返回的是缺失的正整数 `i + 1`，不是数组下标 `i`。

</details>

## 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/first-missing-positive/solutions/)
