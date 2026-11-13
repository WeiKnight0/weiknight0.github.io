---
title: 128. Longest Consecutive Sequence 最长连续序列
date: 2026-09-07
lang: zh-cn
tags:
  - Hot 100
  - Hash Table
  - Array
---

题目来源：[128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/)

题解参考：[灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)、[力扣官方题解](https://leetcode.cn/problems/longest-consecutive-sequence/solutions/)

# 题目

给定一个未排序整数数组 `nums`，求其中最长连续整数序列的长度。序列要求数值依次相差 `1`，但这些数在原数组中的位置不必连续，出现顺序也不重要。

数组中的重复元素只能表示同一个数值，不能让连续序列变长。题目要求设计 $O(n)$ 时间复杂度的算法。

数据范围：

- `0 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`

**示例 1：**

- 输入：`nums = [100,4,200,1,3,2]`
- 输出：`4`
- 解释：数组包含连续序列 `[1,2,3,4]`，长度为 `4`。

**示例 2：**

- 输入：`nums = [0,3,7,2,5,8,4,6,0,1]`
- 输出：`9`
- 解释：最长连续序列是 `[0,1,2,3,4,5,6,7,8]`；重复的 `0` 不增加长度。

**示例 3：**

- 输入：`nums = [1,0,1,2]`
- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

# 解法一：排序后扫描

## 思路

排序后，相同元素和数值连续的元素都会相邻。扫描数组时维护当前连续序列长度：

- 当前数等于前一个数，说明遇到重复元素，直接跳过。
- 当前数等于前一个数加一，当前连续序列长度加一。
- 两数之差大于一，原连续序列结束，从当前数重新计数。

## 算法步骤

1. 空数组直接返回 `0`。
2. 将数组升序排序，初始化当前长度和最大长度为 `1`。
3. 从第二个元素开始扫描，根据相邻元素是重复、连续还是断开更新长度。
4. 返回扫描过程中出现的最大长度。

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        if (nums.empty()) return 0;
        sort(nums.begin(), nums.end());

        int current = 1;
        int ans = 1;
        for (int i = 1; i < nums.size(); i++) {
            if (nums[i] == nums[i - 1]) continue;
            if (nums[i] == nums[i - 1] + 1) {
                current++;
            } else {
                current = 1;
            }
            ans = max(ans, current);
        }
        return ans;
    }
};
```

## 正确性

排序后，一段连续整数必然按数值顺序相邻出现，重复值也只会出现在对应数值旁边。扫描时忽略重复值、累计相差一的相邻值，并在出现缺口时重新计数，因此每个不同的连续序列都会被完整计算一次，最大值就是答案。

## 复杂度

排序需要 $O(n\log n)$ 时间，扫描需要 $O(n)$ 时间，总时间复杂度为 $O(n\log n)$。忽略排序实现使用的栈空间，额外空间复杂度为 $O(1)$。

# 解法二：只从连续序列起点向后枚举

## 思路

把所有数放进哈希集合，可以在平均 $O(1)$ 时间内判断某个整数是否存在。

如果集合中存在 `x - 1`，那么 `x` 一定不是一段连续序列的起点，从 `x` 向后枚举会重复计算。只有当 `x - 1` 不存在时，才从 `x` 开始不断检查 `x + 1、x + 2...`。

以 `{100,4,200,1,3,2}` 为例：

- `2、3、4` 都有前驱，不开始枚举。
- `1` 没有前驱，从 `1` 向后找到 `2、3、4`，得到长度 `4`。
- `100` 和 `200` 没有前驱，各自得到长度 `1`。

虽然存在内层 `while`，但每个数只会在所属序列从起点向后扩展时被访问一次，不会形成 $O(n^2)$ 的重复扫描。

## 算法步骤

1. 用 `unordered_set` 对数组去重，并支持常数时间的存在性查询。
2. 枚举集合中的每个数 `x`。
3. 若 `x - 1` 存在，跳过 `x`。
4. 否则从 `x` 开始向后寻找连续整数，统计本段长度并更新答案。

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> values(nums.begin(), nums.end());
        int ans = 0;

        for (int x : values) {
            if (values.count(x - 1)) continue;

            int current = x;
            int length = 1;
            while (values.count(current + 1)) {
                current++;
                length++;
            }
            ans = max(ans, length);
        }
        return ans;
    }
};
```

## 正确性

任意连续序列都有唯一的最小元素 `start`，集合中不存在 `start - 1`，所以算法一定会从它开始枚举。序列中其他元素都有前驱，不会再次启动枚举。从 `start` 不断加一，恰好访问该序列中的所有元素并在第一个缺失整数处停止，因此得到该序列的准确长度。所有序列都被计算一次，最大长度即为答案。

## 复杂度

建立哈希集合平均需要 $O(n)$ 时间。每个不同元素至多作为起点判断一次，并在某一段扩展中访问一次，因此总时间复杂度平均为 $O(n)$。哈希集合占用 $O(n)$ 空间。

# 方法选择与易错点

- 题目明确要求 $O(n)$，最终应使用哈希集合解法；排序解法用于理解问题和对照优化过程。
- 不能对每个 `x` 都向后枚举，否则连续数组会退化为 $O(n^2)$。
- 必须使用集合去重，否则重复值会干扰长度统计。
- 空数组答案为 `0`，不能把初始答案固定为 `1` 后直接返回。
- 本题数值范围为 $[-10^9,10^9]$，执行 `x - 1` 和 `current + 1` 不会溢出 `int`。

</details>
