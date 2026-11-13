---
title: 739. 每日温度
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `temperatures`，其中 `temperatures[i]` 表示第 `i` 天的温度。返回数组 `answer`，`answer[i]` 表示第 `i` 天之后要等待多少天才会出现更高温度；若以后不会升温，则该位置为 `0`。

[题目链接](https://leetcode.cn/problems/daily-temperatures/)

## 示例

### 示例 1

- 输入：`temperatures = [73,74,75,71,69,72,76,73]`
- 输出：`[1,1,4,2,1,1,0,0]`

### 示例 2

- 输入：`temperatures = [30,40,50,60]`
- 输出：`[1,1,1,0]`

### 示例 3

- 输入：`temperatures = [30,60,90]`
- 输出：`[1,1,0]`

## 数据范围

- $1 \leq temperatures.length \leq 10^5$
- $30 \leq temperatures[i] \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

## 单调栈

栈中保存仍未找到更高温度的日期下标，并让对应温度从栈底到栈顶单调不增。

扫描到第 `i` 天时，如果当前温度高于栈顶日期 `j` 的温度，那么：

- `i` 是 `j` 右侧第一个温度更高的日期；
- 等待天数是 `i - j`；
- `j` 的答案已经确定，可以弹栈。

继续比较新的栈顶，当前温度可能同时解决多个较早日期。最后把 `i` 压栈，等待以后出现更高温度。

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> answer(n);
        stack<int> pending;

        for (int i = 0; i < n; i++) {
            while (!pending.empty() &&
                   temperatures[pending.top()] < temperatures[i]) {
                int day = pending.top();
                pending.pop();
                answer[day] = i - day;
            }
            pending.push(i);
        }
        return answer;
    }
};
```

下标 `day` 在入栈后、出栈前遇到的温度都不高于 `temperatures[day]`。使它出栈的 `i` 是扫描到的第一个更高温度，所以 `i - day` 正是最短等待天数。最终仍在栈中的日期右侧没有更高温度，其初值 `0` 就是正确答案。

- 时间复杂度：$O(n)$，每个下标最多入栈、出栈各一次
- 空间复杂度：$O(n)$

## 易错点

- 栈中必须保存下标，只有下标才能计算等待天数。
- 题目要求严格升温，相同温度不能弹栈，比较符号应为 `<`。
- 未找到更高温度的位置应保留为 `0`，无需在扫描后再次处理栈。

</details>

## 参考

- [项目现有单调栈笔记](../../algorithms/techniques/monotonic-stack.md)
- [灵茶山艾府：单调栈题单](https://leetcode.cn/discuss/post/3579480/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/daily-temperatures/solutions/)
