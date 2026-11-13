---
title: 39. 组合总和
date: 2026-09-07
lang: zh-cn
---

给定无重复正整数数组 `candidates` 和正整数 `target`，找出所有元素和为 `target` 的不同组合。每个候选数字可以重复选择任意次，答案顺序不限。

两个组合只要至少一个数字的选择次数不同，就视为不同组合；同一组数字的不同排列不算不同答案。

[题目链接](https://leetcode.cn/problems/combination-sum/)

## 示例

### 示例 1

- 输入：`candidates = [2,3,6,7], target = 7`
- 输出：`[[2,2,3],[7]]`

### 示例 2

- 输入：`candidates = [2,3,5], target = 8`
- 输出：`[[2,2,2,2],[2,3,3],[3,5]]`

### 示例 3

- 输入：`candidates = [2], target = 1`
- 输出：`[]`

## 数据范围

- $1 \leq candidates.length \leq 30$
- $2 \leq candidates[i] \leq 40$
- `candidates` 中所有元素互不相同
- $1 \leq target \leq 40$
- 合法组合总数少于 `150`

<details class="note-solution">
<summary>查看解析</summary>

## 选或不选

递归状态 `(index, rest)` 表示只考虑下标 `index` 及之后的候选数，凑出剩余和 `rest`：

- **路径**：已经选择的数字；
- **选择列表**：不选择 `candidates[index]`，或再选择一次；
- **结束条件**：`rest == 0` 时得到答案；候选数用完或 `rest < 0` 时当前路径无解。

不选当前数时进入 `index + 1`；选择当前数后仍停在 `index`，因为它可以重复选择。

```cpp
class Solution {
    vector<vector<int>> answer;
    vector<int> path;

    void dfs(const vector<int>& candidates, int index, int rest) {
        if (rest == 0) {
            answer.push_back(path);
            return;
        }
        if (index == candidates.size() || rest < 0) {
            return;
        }

        dfs(candidates, index + 1, rest);
        path.push_back(candidates[index]);
        dfs(candidates, index, rest - candidates[index]);
        path.pop_back();
    }

public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        answer.clear();
        path.clear();
        dfs(candidates, 0, target);
        return answer;
    }
};
```

## 为什么不会出现重复排列

一旦递归选择“不使用当前数字”并进入 `index + 1`，后面不能再回到更小下标。因此，每个组合只会按照候选数下标非递减的顺序生成一次。例如 `[2,2,3]` 能生成，但不会再生成 `[2,3,2]` 或 `[3,2,2]`。

## 正确性

对每个候选数，递归会枚举选择它 `0、1、2...` 次的所有可能，直到剩余和为负或转向下一个候选数。因此任意合法组合对应一条唯一的选择次数路径，必然被枚举。只有剩余和恰好为零时才记录，所有输出组合之和均为目标值。

## 复杂度

搜索树大小与候选数和目标值有关。设最小候选数为 $m$：

- 递归深度最多为 $target/m+candidates.length$；
- 最坏时间复杂度可写为 $O(2^{target/m+c})$，实际会被剩余和小于零大量剪枝；
- 空间复杂度为递归深度，不计算返回结果。

## 易错点

- 选择当前数字后仍从 `index` 继续，才能重复使用。
- 不选择当前数字后进入 `index + 1`，避免同一组合产生不同排列。
- 所有候选数都是正数，因此 `rest < 0` 才能安全剪枝。
- 记录答案后应立即返回，不能继续加入正数。

</details>

## 参考

- [项目现有回溯笔记](../../algorithms/backtracking/index.md)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/combination-sum/solutions/)
