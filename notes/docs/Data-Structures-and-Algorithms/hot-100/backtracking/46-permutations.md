---
title: 46. 全排列
date: 2026-09-07
lang: zh-cn
---

给定不含重复数字的数组 `nums`，返回所有可能的全排列。答案顺序不限。

[题目链接](https://leetcode.cn/problems/permutations/)

## 示例

### 示例 1

- 输入：`nums = [1,2,3]`
- 输出：`[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`

### 示例 2

- 输入：`nums = [0,1]`
- 输出：`[[0,1],[1,0]]`

### 示例 3

- 输入：`nums = [1]`
- 输出：`[[1]]`

## 数据范围

- $1 \leq nums.length \leq 6$
- $-10 \leq nums[i] \leq 10$
- `nums` 中所有整数互不相同

## 回溯三要素

- **路径**：`path` 保存已经填好的排列前缀；
- **选择列表**：所有尚未使用的 `nums[i]`；
- **结束条件**：路径长度等于 `nums.length`，得到一个完整排列。

排列关心顺序。`[1,2]` 和 `[2,1]` 是不同结果，因此每一层都要从整个数组中选择一个尚未使用的数，而不是只从当前下标之后选择。

## 算法过程

以 `[1,2,3]` 为例：

1. 第一位选择 `1`，剩余可选 `2、3`；
2. 第二位选择 `2`，第三位只能选择 `3`，得到 `[1,2,3]`；
3. 撤销 `2`，第二位改选 `3`，得到 `[1,3,2]`；
4. 撤销到第一层，再依次以 `2`、`3` 开头继续搜索。

```cpp
class Solution {
    vector<vector<int>> answer;
    vector<int> path;
    vector<bool> used;

    void dfs(const vector<int>& nums) {
        if (path.size() == nums.size()) {
            answer.push_back(path);
            return;
        }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) {
                continue;
            }
            used[i] = true;
            path.push_back(nums[i]);
            dfs(nums);
            path.pop_back();
            used[i] = false;
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        answer.clear();
        path.clear();
        used.assign(nums.size(), false);
        dfs(nums);
        return answer;
    }
};
```

## 正确性

`used` 保证一条路径中每个数组元素只出现一次。路径长度达到 $n$ 时，它包含全部 $n$ 个不同元素，因此是一个合法排列。反过来，每个排列都对应决策树中唯一的一条选择顺序，循环会枚举每层所有未使用元素，所以不会漏掉任何排列。

## 复杂度

- 时间复杂度：$O(n\cdot n!)$，共有 $n!$ 个排列，复制每个排列需要 $O(n)$
- 空间复杂度：$O(n)$，不计算返回结果

## 易错点

- 排列的每层选择范围是整个数组，需要 `used` 防止重复使用。
- 递归返回后必须同时弹出路径末尾并恢复 `used[i]`。
- 保存答案时需要复制当前路径，不能只保存同一个可变对象的引用。
- 若成员变量可能被重复调用，应在入口清空答案和路径。

## 参考

- [项目现有回溯笔记](../../algorithms/backtracking/index.md)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/permutations/solutions/)
