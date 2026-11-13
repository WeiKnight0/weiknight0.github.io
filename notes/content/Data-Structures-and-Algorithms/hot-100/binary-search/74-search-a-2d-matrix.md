---
title: 74. 搜索二维矩阵
date: 2026-09-07
lang: zh-cn
---

给定一个 $m\times n$ 的整数矩阵 `matrix`，每行从左到右递增，并且每行第一个整数都大于上一行最后一个整数。判断目标值 `target` 是否在矩阵中。算法的时间复杂度必须为 $O(\log(mn))$。

[题目链接](https://leetcode.cn/problems/search-a-2d-matrix/)

## 示例

### 示例 1

- 输入：`matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3`
- 输出：`true`

### 示例 2

- 输入：`matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13`
- 输出：`false`

## 数据范围

- $1 \leq m,n \leq 100$
- $-10^4 \leq matrix[i][j], target \leq 10^4$
- 每行严格递增
- 每行首元素大于上一行末元素

<details class="note-solution">
<summary>查看解析</summary>

## 将矩阵视为有序数组

矩阵按行依次连接后是一个长度为 $mn$ 的严格递增数组。无需真的创建新数组：虚拟数组下标 `index` 对应矩阵坐标

$$
row=\left\lfloor\frac{index}{n}\right\rfloor,\qquad col=index\bmod n
$$

于是可以直接在虚拟下标 $[0,mn-1]$ 上二分查找。

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();
        int left = 0, right = m * n - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int value = matrix[mid / n][mid % n];
            if (value == target) {
                return true;
            }
            if (value < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return false;
    }
};
```

由于题目保证行内递增且下一行首元素大于上一行末元素，虚拟数组严格递增。每次比较都能排除不可能包含目标值的一半区间，因此循环返回 `true` 当且仅当矩阵含有 `target`。

- 时间复杂度：$O(\log(mn))$
- 空间复杂度：$O(1)$

## 易错点

- 列数是 `n`，因此坐标转换是 `mid / n` 和 `mid % n`。
- 本题条件强于“每行、每列分别递增”；只有满足相邻两行首尾衔接时，才能把整个矩阵看成一个有序数组。
- `right = m * n - 1` 对应左闭右闭区间，循环条件应为 `left <= right`。

</details>

## 参考

- [项目现有二分查找笔记](../../algorithms/techniques/binary-search.md)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/search-a-2d-matrix/solutions/)
