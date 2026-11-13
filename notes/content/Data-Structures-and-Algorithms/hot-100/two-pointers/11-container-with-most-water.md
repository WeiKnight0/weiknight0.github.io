---
title: 11. 盛最多水的容器
date: 2026-09-07
lang: zh-cn
---

给定长度为 $n$ 的整数数组 `height`。第 $i$ 条竖线的两个端点是 $(i,0)$ 和 $(i,height[i])$。选择两条竖线与 $x$ 轴组成容器，求容器最多能装多少水。容器不能倾斜。

[题目链接](https://leetcode.cn/problems/container-with-most-water/)

## 示例

### 示例 1

- 输入：`height = [1,8,6,2,5,4,8,3,7]`
- 输出：`49`
- 解释：选择下标 `1` 和 `8`，高度分别为 `8` 和 `7`，面积为 $(8-1)\times 7=49$。

### 示例 2

- 输入：`height = [1,1]`
- 输出：`1`

## 数据范围

- $2 \leq n \leq 10^5$
- $0 \leq height[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

## 面积公式

选择下标 $left<right$ 的两条竖线，容器宽度为 $right-left$，有效高度由较短的竖线决定：

$$
S=(right-left)\times\min(height[left],height[right])
$$

## 方法一：枚举两条边

枚举所有 $(left,right)$，直接计算面积。

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int ans = 0;
        for (int left = 0; left < height.size(); left++) {
            for (int right = left + 1; right < height.size(); right++) {
                ans = max(ans, (right - left) * min(height[left], height[right]));
            }
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

该方法能够直接验证定义，但在 $n=10^5$ 时会超时。

## 方法二：相向双指针

左右指针从数组两端开始。每次计算当前面积，然后移动较短的竖线：

1. 计算 `left` 与 `right` 组成的面积并更新答案；
2. 若左边更短，令 `left++`；
3. 否则令 `right--`。

为什么只能移动短边？假设 $height[left]\leq height[right]$。如果保留 `left` 并向左移动 `right`，宽度变小，而新容器的高度仍不可能超过 $height[left]$，面积一定不会更大。因此，以 `left` 为一端的其余方案都可排除，应移动 `left` 寻找更高的边。

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int ans = 0;
        while (left < right) {
            ans = max(ans, (right - left) * min(height[left], height[right]));
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return ans;
    }
};
```

每轮都安全地排除较短端点对应的所有未检查方案，并保留其中可能超过当前答案的方案。左右指针相遇时，全部候选端点均已被排除或计算，`ans` 即最大面积。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 易错点

- 高度应取两端的较小值，而不是较大值。
- 移动较高的一侧无法突破当前短边的高度限制，会漏掉答案。
- 面积使用下标之差 `right - left`，不是元素个数 `right - left + 1`。

</details>

## 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题目](https://leetcode.cn/problems/container-with-most-water/)
