---
title: 1. Two Sum 两数之和
date: 2026-09-07
lang: zh-cn
tags:
  - Hot 100
  - Hash Table
  - Array
---

题目来源：[1. 两数之和](https://leetcode.cn/problems/two-sum/)

题解参考：[灵茶山艾府：枚举右，维护左](https://leetcode.cn/discuss/post/mOr1u6/)

# 题目

给定整数数组 `nums` 和整数 `target`，寻找两个不同下标 `i`、`j`，使 `nums[i] + nums[j] = target`，返回这两个下标。题目保证恰好存在一组答案，返回下标的顺序不限。

不能把同一个元素使用两次。即使 `target = 2 * nums[i]`，也必须在数组中找到另一个满足条件的元素。

数据范围：

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`

**示例 1：**

- 输入：`nums = [2,7,11,15]`，`target = 9`
- 输出：`[0,1]`
- 解释：`nums[0] + nums[1] = 2 + 7 = 9`。

**示例 2：**

- 输入：`nums = [3,2,4]`，`target = 6`
- 输出：`[1,2]`

**示例 3：**

- 输入：`nums = [3,3]`，`target = 6`
- 输出：`[0,1]`

# 解法一：枚举两个下标

## 思路

直接枚举所有满足 `i < j` 的下标对，并判断两数之和是否等于 `target`。限制 `j` 从 `i + 1` 开始，既不会重复检查同一对下标，也不会把一个元素使用两次。

## 算法步骤

1. 枚举第一个下标 `i`。
2. 枚举 `i` 右侧的第二个下标 `j`。
3. 若 `nums[i] + nums[j] == target`，立即返回 `{i, j}`。

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) return {i, j};
            }
        }
        return {};
    }
};
```

## 正确性

两层循环会检查每一组满足 `i < j` 的下标，因此题目中的唯一有效下标对一定会被检查到。函数只在两数之和等于 `target` 时返回，所以返回结果必然有效。

## 复杂度

时间复杂度为 $O(n^2)$，空间复杂度为 $O(1)$。

# 解法二：枚举右端点，维护左侧元素

## 思路

等式 `nums[i] + nums[j] = target` 可以改写为 `nums[i] = target - nums[j]`。

从左到右枚举 `j`，把它看作答案中靠右的下标。处理 `nums[j]` 时，只需要查询左侧是否出现过 `target - nums[j]`。哈希表 `index` 保存已经遍历过的数及其下标，使查询的平均时间复杂度降为 $O(1)$。

必须先查询、后插入当前元素。这样哈希表中只包含下标小于 `j` 的元素，自然保证两个下标不同。示例 3 中处理第二个 `3` 时，第一个 `3` 已经在表中，因此重复值不会造成问题。

## 算法步骤

1. 建立从元素值到下标的哈希表 `index`。
2. 从左到右枚举下标 `j`，计算需要的另一个数 `target - nums[j]`。
3. 若该数已经在哈希表中，返回其下标和 `j`。
4. 否则把 `nums[j]` 及其下标加入哈希表，继续枚举。

以 `nums = [3,2,4]`、`target = 6` 为例：

| `j` | `nums[j]` | 需要查找 | 查询前的哈希表 | 结果 |
| --- | --- | --- | --- | --- |
| `0` | `3` | `3` | 空 | 未找到，记录 `3 -> 0` |
| `1` | `2` | `4` | `3 -> 0` | 未找到，记录 `2 -> 1` |
| `2` | `4` | `2` | `3 -> 0, 2 -> 1` | 找到，返回 `[1,2]` |

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> index;
        for (int j = 0; j < nums.size(); j++) {
            auto it = index.find(target - nums[j]);
            if (it != index.end()) return {it->second, j};
            index[nums[j]] = j;
        }
        return {};
    }
};
```

## 正确性

处理下标 `j` 前，哈希表恰好记录此前遍历过的元素。若表中存在 `target - nums[j]`，对应下标 `i` 满足 `i < j` 且两数之和为 `target`，返回的答案有效。若不存在，则任何以 `j` 为右端点的答案都不存在。唯一答案的右端点最终一定会被枚举到，因此算法一定能找到答案。

## 复杂度

时间复杂度平均为 $O(n)$，空间复杂度为 $O(n)$。

# 易错点

- 先插入当前元素再查询，可能在 `target = 2 * nums[j]` 时错误地重复使用同一下标。
- 返回的是下标，不是元素值。
- 数组可能包含负数，不能使用只适合非负整数的计数数组代替哈希表。
- `return {}` 只用于保持函数完整；题目已经保证答案存在。
