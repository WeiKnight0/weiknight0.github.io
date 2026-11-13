---
title: 53. 最大子数组和
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `nums`，找出和最大的连续非空子数组，返回该子数组的元素和。

[题目链接](https://leetcode.cn/problems/maximum-subarray/)

## 示例

### 示例 1

- 输入：`nums = [-2,1,-3,4,-1,2,1,-5,4]`
- 输出：`6`
- 解释：连续子数组 `[4,-1,2,1]` 的和最大，为 `6`。

### 示例 2

- 输入：`nums = [1]`
- 输出：`1`

### 示例 3

- 输入：`nums = [5,4,-1,7,8]`
- 输出：`23`

## 数据范围

- $1 \leq nums.length \leq 10^5$
- $-10^4 \leq nums[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：动态规划

令 `current` 表示以当前位置结尾的最大子数组和。加入当前元素 `x` 时只有两种选择：

1. 抛弃此前的子数组，从 `x` 重新开始；
2. 把 `x` 接在此前的子数组后面。

因此状态转移为：

$$
current=\max(x,current+x)
$$

每个 `current` 只代表以当前位置结尾的最优解，最终答案是所有位置的 `current` 的最大值。

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int current = nums[0], ans = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            current = max(nums[i], current + nums[i]);
            ans = max(ans, current);
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 方法二：前缀和

设当前前缀和为 `sum`。若一个子数组在当前位置结束，其和等于当前前缀和减去此前某个前缀和。要使结果最大，应减去当前位置之前出现过的最小前缀和。

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int sum = 0, minPrefix = 0;
        int ans = INT_MIN;
        for (int x : nums) {
            sum += x;
            ans = max(ans, sum - minPrefix);
            minPrefix = min(minPrefix, sum);
        }
        return ans;
    }
};
```

必须先用 `minPrefix` 更新答案，再把当前 `sum` 纳入最小前缀。否则会允许两个前缀取在同一位置，错误地把空子数组作为候选。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 正确性

动态规划中，以当前位置结尾的连续子数组要么只含当前元素，要么由前一位置结尾的连续子数组追加当前元素得到，不存在第三种情况。选取两者中较大者就得到当前状态的最优解。

前缀和方法则枚举了每个右端点，并为它选择此前最小的前缀和，所以得到以该右端点结束的最大和。两种方法最终都比较了所有可能的右端点。

## 易错点

- 子数组必须非空，答案不能初始化为 `0`；全负数组的答案是其中最大的负数。
- 题目要求连续子数组，不能跳过中间元素。
- `current` 变成负数并不需要单独清零，转移式会在下一位置决定是否重新开始。

</details>

## 参考

- [灵茶山艾府：动态规划题单](https://leetcode.cn/discuss/post/tXLS3i/)
- [LeetCode 官方题解](https://leetcode.cn/problems/maximum-subarray/solutions/)
