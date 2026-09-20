---
title: 78. 子集
date: 2026-09-07
lang: zh-cn
---

给定元素互不相同的整数数组 `nums`，返回它的所有子集，包括空集和数组本身。答案不能包含重复子集，顺序不限。

[题目链接](https://leetcode.cn/problems/subsets/)

## 示例

### 示例 1

- 输入：`nums = [1,2,3]`
- 一种输出：`[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]`

### 示例 2

- 输入：`nums = [0]`
- 输出：`[[],[0]]`

## 数据范围

- $1 \leq nums.length \leq 10$
- $-10 \leq nums[i] \leq 10$
- `nums` 中所有元素互不相同

## 方法一：选或不选

对每个元素都有两个选择：不放入子集，或放入子集。

- **路径**：已经决定选择的元素；
- **选择列表**：当前元素“选”或“不选”；
- **结束条件**：所有元素都已决定，记录路径。

```cpp
class Solution {
    vector<vector<int>> answer;
    vector<int> path;

    void dfs(const vector<int>& nums, int index) {
        if (index == nums.size()) {
            answer.push_back(path);
            return;
        }
        dfs(nums, index + 1);
        path.push_back(nums[index]);
        dfs(nums, index + 1);
        path.pop_back();
    }

public:
    vector<vector<int>> subsets(vector<int>& nums) {
        answer.clear();
        path.clear();
        dfs(nums, 0);
        return answer;
    }
};
```

每个元素的两种选择相互独立，共产生 $2^n$ 条完整路径，与所有子集一一对应。

## 方法二：枚举下一个加入的元素

进入递归时立即记录当前路径，因为任意长度的路径都是一个合法子集。参数 `start` 限制下一元素只能从后面的下标选择，避免 `[1,2]` 和 `[2,1]` 被当作两个子集。

```cpp
class Solution {
    vector<vector<int>> answer;
    vector<int> path;

    void dfs(const vector<int>& nums, int start) {
        answer.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            path.push_back(nums[i]);
            dfs(nums, i + 1);
            path.pop_back();
        }
    }

public:
    vector<vector<int>> subsets(vector<int>& nums) {
        answer.clear();
        path.clear();
        dfs(nums, 0);
        return answer;
    }
};
```

下标在路径中严格递增，所以每个元素最多选择一次，每个子集也只有一种生成顺序。

## 复杂度

- 时间复杂度：$O(n\cdot2^n)$，复制所有子集需要这些时间
- 空间复杂度：$O(n)$，不计算返回结果

## 易错点

- 空集也是答案，不能从路径非空时才记录。
- 子集不关心元素选择顺序，枚举法下一层应从 `i + 1` 开始。
- 本题元素互不相同，不需要排序去重。
- 选或不选写法只在处理完全部元素时记录；枚举写法进入每层就记录，两种结束方式不要混用。

## 参考

- [项目现有回溯笔记](../../algorithms/backtracking/index.md)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/subsets/solutions/)
