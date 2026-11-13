---
title: 84. 柱状图中最大的矩形
date: 2026-09-07
lang: zh-cn
---

给定非负整数数组 `heights`，其中 `heights[i]` 表示一根宽度为 `1` 的柱子高度，所有柱子相邻。返回柱状图中由连续柱子构成的最大矩形面积。

[题目链接](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

## 示例

### 示例 1

- 输入：`heights = [2,1,5,6,2,3]`
- 输出：`10`
- 解释：高度为 `5` 和 `6` 的两根连续柱子可以组成高为 `5`、宽为 `2` 的矩形，面积为 `10`

### 示例 2

- 输入：`heights = [2,4]`
- 输出：`4`

## 数据范围

- $1 \leq heights.length \leq 10^5$
- $0 \leq heights[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

## 从枚举高度到寻找边界

把每根柱子 `i` 当作矩形中的最低柱子。以 `heights[i]` 为高度时，矩形可以向两侧延伸，直到遇到第一根严格更矮的柱子。

若左侧第一个更矮的位置是 `left`，右侧第一个更矮的位置是 `right`，那么可覆盖的柱子区间是 `[left+1,right-1]`：

$$
width=right-left-1
$$

$$
area=heights[i]\times(right-left-1)
$$

逐根向两侧寻找边界会达到 $O(n^2)$。单调栈可以在一次扫描中确定这些边界。

## 单调递增栈

维护柱高单调不减的下标栈。遇到更矮的当前柱 `i` 时，栈顶 `mid` 无法继续向右延伸：

- `i` 是 `mid` 右侧第一个严格更矮的位置；
- 弹出 `mid` 后的新栈顶是其左侧更矮的位置；
- 此时可以立即计算以 `heights[mid]` 为高度的最大矩形。

在数组两端各加入高度为 `0` 的哨兵。左哨兵保证弹栈后仍有左边界，右哨兵负责结算扫描结束时仍留在栈中的柱子。

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h{0};
        h.insert(h.end(), heights.begin(), heights.end());
        h.push_back(0);

        int answer = 0;
        stack<int> increasing;
        increasing.push(0);

        int n = h.size();
        for (int i = 1; i < n; i++) {
            while (h[increasing.top()] > h[i]) {
                int mid = increasing.top();
                increasing.pop();
                int left = increasing.top();
                answer = max(answer, h[mid] * (i - left - 1));
            }
            increasing.push(i);
        }
        return answer;
    }
};
```

以 `[2,1,5,6,2,3]` 为例，扫描到高度 `2` 时，高度 `6` 与 `5` 依次出栈。高度 `5` 出栈后，左侧更矮柱高度为 `1`，右侧更矮柱是当前的 `2`，因此它覆盖原数组中的 `5、6` 两根柱子，面积为 $5\times2=10$。

每根柱子出栈时，左右第一个更矮的位置都已确定，所以计算的是以它为最低高度时能够取得的最大宽度。所有柱子都会在更矮柱或右哨兵到来时结算，最大值因此覆盖所有可能的最优矩形。

- 时间复杂度：$O(n)$，每个下标最多入栈、出栈各一次
- 空间复杂度：$O(n)$

## 相同高度如何处理

代码只在当前高度严格更小时弹栈，因此相同高度可以同时留在栈中。它们随后会从右向左依次结算，最左侧的同高柱能得到包含整段同高柱的最大宽度，不会遗漏答案。

也可以在相等时弹栈，但必须确保左哨兵不会被弹出，并统一重新计算边界。两种规则都能正确实现，不能把判断符号单独替换而不调整其余逻辑。

## 易错点

- 栈中保存下标而不是高度，宽度由下标差计算。
- 左右边界本身都比 `heights[mid]` 更矮，不能包含在矩形中，所以宽度需要减一。
- 右侧哨兵不可省略，否则递增数组中的柱子不会出栈结算。
- 面积上界为 $10^9$，在 32 位有符号整数范围内。

</details>

## 参考

- [项目现有单调栈笔记](../../algorithms/techniques/monotonic-stack.md)
- [灵茶山艾府：单调栈题单](https://leetcode.cn/discuss/post/3579480/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/largest-rectangle-in-histogram/solutions/)
