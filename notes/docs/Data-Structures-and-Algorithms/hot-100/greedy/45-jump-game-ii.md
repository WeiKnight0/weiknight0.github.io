---
title: 45. 跳跃游戏 II
date: 2026-09-07
lang: zh-cn
---

给定非负整数数组 `nums`，初始位于下标 `0`。`nums[i]` 表示从下标 `i` 最多能够向右跳跃的距离。返回到达最后一个下标所需的最少跳跃次数，题目保证终点一定可达。

[题目链接](https://leetcode.cn/problems/jump-game-ii/)

## 示例

### 示例 1

- 输入：`nums = [2,3,1,1,4]`
- 输出：`2`
- 解释：从下标 `0` 跳到 `1`，再从下标 `1` 跳到最后一个位置

### 示例 2

- 输入：`nums = [2,3,0,1,4]`
- 输出：`2`

## 数据范围

- $1 \leq nums.length \leq 10^4$
- $0 \leq nums[i] \leq 1000$
- 题目保证最后一个下标可达

## 按跳跃次数扩展区间

把所有使用相同跳跃次数可以到达的位置看作一层：

- `currentEnd` 是使用 `jumps` 次跳跃能够覆盖的右边界；
- `farthest` 是扫描当前层所有位置时，下一次跳跃能够到达的最远位置。

当扫描到 `currentEnd`，当前层的所有起跳位置都已经考察完。此时必须增加一次跳跃，并把新一层边界更新为 `farthest`。这相当于只保存边界的广度优先搜索。

```cpp
class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0;
        int currentEnd = 0;
        int farthest = 0;
        int n = nums.size();

        for (int i = 0; i < n - 1; i++) {
            farthest = max(farthest, i + nums[i]);
            if (i == currentEnd) {
                jumps++;
                currentEnd = farthest;
            }
        }
        return jumps;
    }
};
```

在增加第 `jumps+1` 次跳跃之前，算法检查了第 `jumps` 层的所有可达位置，因此 `farthest` 是再跳一次能够覆盖的最大范围。任何方案用相同次数都不可能越过它。逐层扩展，第一次覆盖终点所用的跳跃次数必然最少。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 为什么只扫描到倒数第二个位置

到达最后一个下标后不需要再次起跳。若循环扫描最后一个位置，并且它恰好等于 `currentEnd`，会把答案多加一次。因此循环条件是 `i < n - 1`。

数组长度为 `1` 时循环不会执行，正确返回 `0`。

## 易错点

- `farthest` 是扫描过的整个当前层能到达的最远位置，不是只由 `currentEnd` 位置计算。
- 只有扫描到当前层边界时才增加跳跃次数，不能每处理一个下标就增加。
- 本题保证终点可达；若没有这项保证，还需要在扩展层次时检测边界是否停滞。

## 参考

- [项目现有贪心笔记](../../algorithms/techniques/greedy.md)
- [灵茶山艾府：贪心题单](https://leetcode.cn/discuss/post/3091107/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/jump-game-ii/solutions/)
