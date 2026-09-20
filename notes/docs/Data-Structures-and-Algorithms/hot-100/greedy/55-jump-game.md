---
title: 55. 跳跃游戏
date: 2026-09-07
lang: zh-cn
---

给定非负整数数组 `nums`，初始位于下标 `0`。`nums[i]` 表示从下标 `i` 最多能够向右跳跃的距离，判断是否能够到达最后一个下标。

[题目链接](https://leetcode.cn/problems/jump-game/)

## 示例

### 示例 1

- 输入：`nums = [2,3,1,1,4]`
- 输出：`true`
- 解释：可以先从下标 `0` 跳到 `1`，再从下标 `1` 跳到最后一个位置

### 示例 2

- 输入：`nums = [3,2,1,0,4]`
- 输出：`false`
- 解释：无论如何选择都会到达下标 `3`，该位置无法继续前进

## 数据范围

- $1 \leq nums.length \leq 10^4$
- $0 \leq nums[i] \leq 10^5$

## 维护最远可达位置

`farthest` 表示从目前已经确认可达的所有位置出发，最远能够到达的下标。

扫描到 `i` 时：

- 若 `i > farthest`，当前下标不可达，后面的下标更不可能被处理，立即返回 `false`；
- 否则可以从 `i` 起跳，用 `i + nums[i]` 扩展最远可达范围。

```cpp
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int farthest = 0;
        for (int i = 0; i < nums.size(); i++) {
            if (i > farthest) {
                return false;
            }
            farthest = max(farthest, i + nums[i]);
        }
        return true;
    }
};
```

每轮开始时，区间 `[0,farthest]` 中的所有位置都属于当前可达范围。若 `i` 在这个区间内，从它起跳得到的新终点会被合并进可达范围；若 `i` 已在范围之外，先前所有可达位置都无法跨过这个缺口。算法因此准确判断最后一个位置是否可达。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 易错点

- `nums[i]` 是最大跳跃距离，可以选择跳 `0` 到 `nums[i]` 之间的任意距离。
- 只有可达的下标才能用于更新 `farthest`，必须先判断 `i > farthest`。
- 数组只有一个元素时已经位于终点，应返回 `true`。
- 不需要真的选择并记录一条跳跃路径；本题只询问是否可达。

## 参考

- [项目现有贪心笔记](../../algorithms/techniques/greedy.md)
- [灵茶山艾府：贪心题单](https://leetcode.cn/discuss/post/3091107/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/jump-game/solutions/)
