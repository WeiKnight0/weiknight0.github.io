---
title: 56. 合并区间
date: 2026-09-07
lang: zh-cn
---

给定若干闭区间 `intervals[i] = [start_i, end_i]`，合并所有重叠区间，返回恰好覆盖原有区间且互不重叠的区间数组。

[题目链接](https://leetcode.cn/problems/merge-intervals/)

## 示例

### 示例 1

- 输入：`intervals = [[1,3],[2,6],[8,10],[15,18]]`
- 输出：`[[1,6],[8,10],[15,18]]`
- 解释：`[1,3]` 与 `[2,6]` 重叠，合并为 `[1,6]`。

### 示例 2

- 输入：`intervals = [[1,4],[4,5]]`
- 输出：`[[1,5]]`
- 解释：两个闭区间在端点 `4` 相交，因此可以合并。

### 示例 3

- 输入：`intervals = [[4,7],[1,4]]`
- 输出：`[[1,7]]`

## 数据范围

- $1 \leq intervals.length \leq 10^4$
- `intervals[i].length == 2`
- $0 \leq start_i \leq end_i \leq 10^4$

## 排序后合并

先按区间左端点升序排列。设答案的最后一个区间为 `[left, right]`，下一个区间为 `[start, end]`：

- 若 `start <= right`，两个闭区间重叠，把右端点更新为 `max(right, end)`；
- 若 `start > right`，后续区间的左端点只会更大，不可能再与 `[left, right]` 重叠，应开始一个新区间。

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> ans;

        for (const auto& interval : intervals) {
            if (ans.empty() || interval[0] > ans.back()[1]) {
                ans.push_back(interval);
                continue;
            }
            ans.back()[1] = max(ans.back()[1], interval[1]);
        }
        return ans;
    }
};
```

以 `[[1,3],[2,6],[8,10],[15,18]]` 为例：

1. `[1,3]` 作为第一个结果区间；
2. `[2,6]` 的左端点不大于 `3`，合并为 `[1,6]`；
3. `[8,10]` 与 `[1,6]` 分离，加入新区间；
4. `[15,18]` 与 `[8,10]` 分离，加入新区间。

## 正确性

排序后，尚未处理的区间不会从当前区间左侧开始。遇到左端点不大于当前右端点的区间时，两者必然相交，扩展右端点即可覆盖二者；遇到左端点更大的区间时，当前区间与此后所有区间都不再相交，可以安全写入结果。依次处理后，答案互不重叠且覆盖全部原区间。

## 复杂度

- 时间复杂度：$O(n\log n)$，主要来自排序
- 空间复杂度：忽略返回结果时为 $O(\log n)$，取决于排序实现使用的栈空间

## 易错点

- 输入是闭区间，`[1,4]` 与 `[4,5]` 在 `4` 处相交，判断不重叠应使用 `start > right`。
- 合并后的右端点要取最大值，不能直接替换为新区间的右端点，例如 `[1,10]` 与 `[2,3]` 合并后仍是 `[1,10]`。
- 必须先按左端点排序，否则只与答案末尾比较没有意义。

## 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/merge-intervals/solutions/)
