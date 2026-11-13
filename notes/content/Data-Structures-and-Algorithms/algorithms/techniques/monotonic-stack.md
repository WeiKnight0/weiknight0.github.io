---
title: Monotonic Stack 单调栈
date: 2026-09-01
description: 用单调栈在线求最近更大、更小元素，掌握接雨水与矩形面积等经典模型。
lang: zh-cn
tags:
  - DSA
  - Stack
  - Monotonic Stack
---

单调栈保存一组下标，并让这些下标对应的值始终单调递增或单调递减。它不用于排序，而是在线确定某个元素左侧或右侧第一个更大/更小元素。

灵茶山艾府将这一专题分为基础、矩形面积、贡献法和最小字典序；本页先掌握最常见的基础与矩形面积模型，再用子数组最小值之和理解贡献法。

# 单调栈解决什么问题

当遍历到 `nums[i]` 时，栈顶若不再满足单调性，栈顶元素就等到了自己的答案：当前 `i` 正是它右侧第一个更大或更小的位置。

例如维护值单调递减的栈，遇到更大的 `nums[i]` 时，所有比它小的栈顶元素出栈；对每个出栈下标 `j`，`i` 就是右侧第一个严格更大的下标。

栈中应保存**下标**而不是值：题目通常需要距离、宽度或左右边界，而这些都由下标计算。每个下标最多入栈一次、出栈一次，因此总时间复杂度为 $O(n)$，额外空间为 $O(n)$。

# 模板

注意符号的可否取等：根据题目要求来。

## 从左到右：在出栈时结算右边界

下面的模板求每个位置右侧第一个严格更大的元素下标。栈内 `nums` 值从栈底到栈顶单调不增；当前值更大时，栈顶的右边界就已确定。

```cpp
vector<int> nextGreaterIndex(const vector<int>& nums) {
    int n = nums.size();
    vector<int> right(n, -1);
    stack<int> st;

    for (int i = 0; i < n; i++) {
        while (!st.empty() && nums[st.top()] < nums[i]) {
            right[st.top()] = i;  // i 是栈顶右侧第一个严格更大的位置
            st.pop();
        }
        st.push(i);
    }
    return right;
}
```

## 从右到左：栈顶直接给出答案

从右向左扫描时，先弹掉不可能成为答案的位置；弹栈后栈顶就是当前元素右侧最近的目标。

```cpp
vector<int> nextGreaterIndex(const vector<int>& nums) {
    int n = nums.size();
    vector<int> right(n, -1);
    stack<int> st;

    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && nums[st.top()] <= nums[i]) {
            st.pop();  // 相等也不能作为“严格更大”的答案
        }
        if (!st.empty()) right[i] = st.top();
        st.push(i);
    }
    return right;
}
```

# 例题

## 739. 每日温度

题目来源：[739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)

题目描述：给定整数数组 `temperatures`，其中 `temperatures[i]` 表示第 `i` 天的温度。请返回等长数组 `answer`：`answer[i]` 是从第 `i` 天起还需要等待多少天，才会出现温度**严格更高**的一天；若之后不存在更高温度，则 `answer[i] = 0`。

约束：$1 \le temperatures.length \le 10^5$，$30 \le temperatures[i] \le 100$。

**示例 1：**

- 输入：`temperatures = [73,74,75,71,69,72,76,73]`

- 输出：`[1,1,4,2,1,1,0,0]`

- 解释：第 `0` 天温度为 `73`，第 `1` 天的 `74` 更高，所以答案为 `1`；第 `2` 天的 `75` 要等到第 `6` 天的 `76`，所以答案为 `4`；最后两天之后没有更高温度，答案为 `0`。

**示例 2：**

- 输入：`temperatures = [30,40,50,60]`

- 输出：`[1,1,1,0]`

<details class="note-solution">
<summary>查看解析</summary>

思路：从左到右维护温度单调不增的下标栈。新温度更高时，它正好是所有较低温度的“下一次更高温度”。

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> ans(n);
        stack<int> st;

        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[st.top()] < temperatures[i]) {
                int j = st.top();
                st.pop();
                ans[j] = i - j;  // j 等到 i 这一天
            }
            st.push(i);
        }
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

## 42. 接雨水

题目来源：[42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)

题目描述：给定 `n` 个非负整数 `height`，每个元素代表宽度为 `1` 的柱子高度。下雨后，柱子之间可以积水；请计算所有柱子能够接住的雨水总量。

约束：$1 \le height.length \le 2 \times 10^4$，$0 \le height[i] \le 10^5$。

**示例 1：**

- 输入：`height = [0,1,0,2,1,0,1,3,2,1,2,1]`

- 输出：`6`

- 解释：其中凹槽会被左右两侧更高的柱子围住，所有位置累积可接 `6` 单位雨水。

**示例 2：**

- 输入：`height = [4,2,0,3,2,5]`

- 输出：`9`

<details class="note-solution">
<summary>查看解析</summary>

思路：维护高度单调递减的下标栈。当 `height[i]` 高于栈顶时，栈顶 `bottom` 是一个凹槽底部；弹出它以后，新的栈顶 `left` 是左墙，`i` 是右墙。

凹槽这一层的宽度为 $i-left-1$，可盛水高度为 $\min(height[left], height[i])-height[bottom]$。若弹出后栈空，说明缺少左墙，不能接水。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int ans = 0;
        stack<int> st;

        for (int i = 0; i < height.size(); i++) {
            while (!st.empty() && height[st.top()] < height[i]) {
                int bottom = st.top();
                st.pop();
                if (st.empty()) break;  // 没有左墙

                int left = st.top();
                int width = i - left - 1;
                int waterHeight = min(height[left], height[i]) - height[bottom];
                ans += width * waterHeight;
            }
            st.push(i);
        }
        return ans;
    }
};
```

这里计算的是“底部 `bottom` 上方新露出的那一层水”，同一位置不会被重复计算。时间复杂度 $O(n)$，空间复杂度 $O(n)$。这题也有空间 $O(1)$ 的双指针解法；单调栈解法更适合练习“左右边界确定后立即结算”。

</details>

## 84. 柱状图中最大的矩形

题目来源：[84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

题目描述：给定非负整数数组 `heights`。下标 `i` 处有一根宽度为 `1`、高度为 `heights[i]` 的柱子，所有柱子首尾相接形成柱状图。请返回柱状图中由若干**连续**柱子构成的最大矩形面积。

约束：$1 \le heights.length \le 10^5$，$0 \le heights[i] \le 10^4$。

**示例 1：**

- 输入：`heights = [2,1,5,6,2,3]`

- 输出：`10`

- 解释：选择高度为 `5` 和 `6` 的两根连续柱子，矩形最小高度为 `5`、宽度为 `2`，面积为 `5 × 2 = 10`。

**示例 2：**

- 输入：`heights = [2,4]`

- 输出：`4`

<details class="note-solution">
<summary>查看解析</summary>

思路：把每根柱子当作矩形的最低高度。对于下标 `mid`，只要左右柱子都不低于 `heights[mid]`，矩形就能向两侧延伸；因此需要找到左右两侧第一个更低的柱子。

在数组两端加入高度 `0` 的哨兵。维护高度单调不减的栈，遇到更低柱子时弹出 `mid`：当前 `i` 是右侧第一个更低位置，弹栈后的新栈顶 `left` 是左侧第一个更低位置，所以宽度为 $i-left-1$。

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h{0};  // 左哨兵，避免处理空栈
        h.insert(h.end(), heights.begin(), heights.end());
        h.push_back(0);   // 右哨兵，结算所有未出栈柱子

        int ans = 0;
        stack<int> st;
        st.push(0);

        for (int i = 1; i < h.size(); i++) {
            while (h[st.top()] > h[i]) {
                int mid = st.top();
                st.pop();
                int left = st.top();
                ans = max(ans, h[mid] * (i - left - 1)); // 原数组中[left+1, i -1]可以构成高度为h[mid]的矩形
            }
            st.push(i);
        }
        return ans;
    }
};
```

例如 `mid` 高度为 `5`，左右第一个更低位置分别为下标 `1` 和 `4` 时，覆盖区间是 $(1, 4) = [2, 3]$，宽度不是 $4 - 1$，而是 $4-1-1=2$。这正是公式中减一的原因。

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

## 85. 最大矩形

题目来源：[85. 最大矩形](https://leetcode.cn/problems/maximal-rectangle/)

题目描述：给定仅包含字符 `'0'` 和 `'1'` 的二维矩阵 `matrix`。请找出只由 `'1'` 组成、边与矩阵网格对齐的最大矩形，并返回该矩形的面积。

约束：$1 \le matrix.length, matrix[i].length \le 200$；`matrix[i][j]` 为 `'0'` 或 `'1'`。

**示例 1：**

- 输入：

  ```text
  matrix = [
    ["1","0","1","0","0"],
    ["1","0","1","1","1"],
    ["1","1","1","1","1"],
    ["1","0","0","1","0"]
  ]
  ```

- 输出：`6`

- 解释：第二、三行的第三至第五列组成一个 $2 \times 3$ 的全 `'1'` 矩形，面积为 `6`。

**示例 2：**

- 输入：`matrix = [["0"]]`

- 输出：`0`

<details class="note-solution">
<summary>查看解析</summary>

思路：逐行扫描，把每一列连续 `'1'` 的高度累积到 `heights[j]`。这样每处理一行，就得到一张以该行为底的柱状图；调用 84 题的函数求它的最大矩形，再取所有行的最大值。

```cpp
class Solution {
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h{0};
        h.insert(h.end(), heights.begin(), heights.end());
        h.push_back(0);

        int best = 0;
        stack<int> st;
        st.push(0);
        for (int i = 1; i < h.size(); i++) {
            while (h[st.top()] > h[i]) {
                int mid = st.top();
                st.pop();
                best = max(best, h[mid] * (i - st.top() - 1));
            }
            st.push(i);
        }
        return best;
    }

public:
    int maximalRectangle(vector<vector<char>>& matrix) {
        int n = matrix[0].size();
        vector<int> heights(n);
        int ans = 0;

        for (const auto& row : matrix) {
            for (int j = 0; j < n; j++) {
                heights[j] = row[j] == '1' ? heights[j] + 1 : 0;
            }
            ans = max(ans, largestRectangleArea(heights));
        }
        return ans;
    }
};
```

每一行更新高度为 $O(n)$，并执行一次 84 题的 $O(n)$ 算法；总时间复杂度为 $O(mn)$，空间复杂度为 $O(n)$。

</details>

## 907. 子数组的最小值之和

题目来源：[907. 子数组的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums/)

题目描述：给定整数数组 `arr`，对每个非空连续子数组，取其中的最小值；请返回这些最小值之和。结果可能很大，返回其对 $10^9+7$ 取模后的值。

约束：$1 \le arr.length \le 3 \times 10^4$，$1 \le arr[i] \le 3 \times 10^4$。

**示例 1：**

- 输入：`arr = [3,1,2,4]`

- 输出：`17`

- 解释：长度为 `1` 的子数组贡献为 `3 + 1 + 2 + 4`；长度为 `2` 的子数组贡献为 `1 + 1 + 2`；长度为 `3` 和 `4` 的子数组各贡献 `1`，总和为 `17`。

**示例 2：**

- 输入：`arr = [11,81,94,43,3]`

- 输出：`444`

<details class="note-solution">
<summary>查看解析</summary>

思路：不枚举所有子数组，而是计算每个 `arr[i]` 能作为多少个子数组的最小值。

向左找最近的比 `arr[i]` 小的位置 `left`，向右找最近的小于等于 `arr[i]` 的位置 `right`。那么左端点有 `i-left` 种选法，右端点有 `right-i` 种选法。

所以 `arr[i]` 的贡献为：

`arr[i] × (i-left) × (right-i)`

这些子数组中，每个子数组的最小值都是 arr[i]，最后把所有位置的贡献相加即可。左右边界可以用单调栈求出。

需要注意重复元素。为了避免同一个子数组被重复计算，可以规定一边找“严格小于”，另一边找“小于等于”。这里采用：左边找严格小于（对应单调栈是严格递增栈），右边找小于等于。这样每个子数组只会被计算一次。

```cpp
class Solution {
public:
    int sumSubarrayMins(vector<int>& arr) {
        const int MOD = 1'000'000'007;
        long long ans = 0;
        stack<int> st;
        st.push(-1);  // 左哨兵

        for (int i = 0; i <= arr.size(); i++) {
            while (st.top() != -1 && (i == arr.size() || arr[st.top()] >= arr[i])) {
                int mid = st.top();
                st.pop();
                int left = st.top();
                ans += 1LL * arr[mid] * (mid - left) * (i - mid);
                ans %= MOD;
            }
            if (i < arr.size()) st.push(i);
        }
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

# 练习顺序

按灵神题单的分类，先练“最近更大/更小”，再进入矩形面积与贡献法：

1. [739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)：出栈时结算右侧第一个更大。
2. [496. 下一个更大元素 I](https://leetcode.cn/problems/next-greater-element-i/)：把结果存进哈希表。
3. [42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)：弹出凹槽底部，按左右墙结算。
4. [84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)：第一个更小边界与哨兵。
5. [85. 最大矩形](https://leetcode.cn/problems/maximal-rectangle/)：将二维问题逐行化为 84。
6. [907. 子数组的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums/)：用边界计算贡献，并处理重复值归属。

# 参考

- [灵茶山艾府：单调栈题单（基础、矩形面积、贡献法、最小字典序）](https://leetcode.cn/discuss/post/3579480/)
