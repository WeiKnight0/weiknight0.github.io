---
title: 42. 接雨水
date: 2026-09-07
lang: zh-cn
---

给定 $n$ 个非负整数表示宽度均为 `1` 的柱子高度，计算这些柱子在下雨后能够接住多少水。

[题目链接](https://leetcode.cn/problems/trapping-rain-water/)

## 示例

### 示例 1

- 输入：`height = [0,1,0,2,1,0,1,3,2,1,2,1]`
- 输出：`6`

### 示例 2

- 输入：`height = [4,2,0,3,2,5]`
- 输出：`9`

## 数据范围

- $1 \leq n \leq 2\times 10^4$
- $0 \leq height[i] \leq 10^5$

## 每根柱子上方的水量

下标 $i$ 上方的水面由左侧最高柱与右侧最高柱中较矮的一侧决定。设两侧最高值分别为 $leftMax[i]$ 和 $rightMax[i]$，则：

$$
water[i]=\min(leftMax[i],rightMax[i])-height[i]
$$

只要能高效得到每个位置左右两侧的最高值，就能求出总水量。

## 方法一：前后缀最大值

分别预处理每个位置左侧与右侧的最高柱，再按照公式累加。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        vector<int> leftMax(n), rightMax(n);
        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) {
            leftMax[i] = max(leftMax[i - 1], height[i]);
        }
        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) {
            rightMax[i] = max(rightMax[i + 1], height[i]);
        }

        int ans = 0;
        for (int i = 0; i < n; i++) {
            ans += min(leftMax[i], rightMax[i]) - height[i];
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

## 方法二：相向双指针

前后缀数组中，每个位置只需要较小的那一侧。双指针可以在移动过程中确定这一侧，无须保存两个数组。

维护：

- `leftMax`：区间 `[0, left]` 的最大高度；
- `rightMax`：区间 `[right, n - 1]` 的最大高度。

若 `leftMax < rightMax`，右侧已经存在一根至少高为 `rightMax` 的柱子，因此 `left` 位置的水量只由 `leftMax` 决定，可以立即结算。反之结算 `right`。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0;
        int ans = 0;

        while (left <= right) {
            leftMax = max(leftMax, height[left]);
            rightMax = max(rightMax, height[right]);
            if (leftMax < rightMax) {
                ans += leftMax - height[left];
                left++;
            } else {
                ans += rightMax - height[right];
                right--;
            }
        }
        return ans;
    }
};
```

以 `[4,2,0,3,2,5]` 为例，右侧最高值始终至少为 `5`，内部位置受到左侧高度 `4` 限制，水量依次为 `2、4、1、2`，总和为 `9`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 方法三：单调栈

前两种方法按列计算水量；单调栈按横向的一层水计算。

栈中保存下标，并使对应高度单调不增。遇到更高的柱子 `i` 时，栈顶柱子成为凹槽底部：

1. 弹出槽底 `bottom`；
2. 若栈为空，槽底左侧没有边界，不能接水；
3. 新栈顶 `left` 是左边界，`i` 是右边界；
4. 宽度为 `i - left - 1`，水层高度为 `min(height[left], height[i]) - height[bottom]`。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        stack<int> st;
        int ans = 0;

        for (int i = 0; i < height.size(); i++) {
            while (!st.empty() && height[i] > height[st.top()]) {
                int bottom = st.top();
                st.pop();
                if (st.empty()) {
                    break;
                }
                int left = st.top();
                int width = i - left - 1;
                int level = min(height[left], height[i]) - height[bottom];
                ans += width * level;
            }
            st.push(i);
        }
        return ans;
    }
};
```

每次弹栈都结算由当前左右边界封闭、位于 `bottom` 高度之上的一层水。不同弹栈过程对应互不重叠的水层，因此所有水量恰好被计算一次。

- 时间复杂度：$O(n)$，每个下标最多入栈、出栈各一次
- 空间复杂度：$O(n)$

## 易错点

- 双指针比较的是 `leftMax` 与 `rightMax`，这能直接说明当前哪一侧可结算。
- 单调栈必须保存下标，计算横向宽度时不能只保存高度。
- 单调栈弹出槽底后若栈为空，说明没有左边界，不能计算水量。
- 柱子本身占据一个单位宽度，所以两边界之间的宽度是 `right - left - 1`。

## 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题解：接雨水](https://leetcode.cn/problems/trapping-rain-water/solutions/692342/jie-yu-shui-by-leetcode-solution-tuvc/)
