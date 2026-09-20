---
title: 48. 旋转图像
date: 2026-09-07
lang: zh-cn
---

给定 $n\times n$ 矩阵，将图像顺时针旋转 $90^\circ$。必须直接修改输入矩阵，不能使用另一个矩阵替换输入。

[题目链接](https://leetcode.cn/problems/rotate-image/)

## 示例

### 示例 1

- 输入：`matrix = [[1,2,3],[4,5,6],[7,8,9]]`
- 输出：`[[7,4,1],[8,5,2],[9,6,3]]`

### 示例 2

- 输入：`matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]`
- 输出：`[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]`

## 数据范围

- $n=matrix.length=matrix[i].length$
- $1 \leq n \leq 20$
- $-1000 \leq matrix[i][j] \leq 1000$

## 下标变换

顺时针旋转后，原位置 $(i,j)$ 移动到：

$$
(i,j)\rightarrow(j,n-1-i)
$$

例如 $3\times3$ 矩阵中的 `(0, 1)` 会移动到 `(1, 2)`。

## 方法一：辅助矩阵

按照下标变换把元素写入辅助矩阵。该方法用于直接理解映射，但不满足原地修改的进阶要求。

```cpp
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        vector<vector<int>> rotated(n, vector<int>(n));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                rotated[j][n - 1 - i] = matrix[i][j];
            }
        }
        matrix = move(rotated);
    }
};
```

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(n^2)$

## 方法二：转置后水平翻转

顺时针旋转可以拆成两步：

1. 沿主对角线转置，令 $(i,j)\rightarrow(j,i)$；
2. 水平翻转每一行，令 $(j,i)\rightarrow(j,n-1-i)$。

两步组合后正好得到顺时针旋转的下标变换。

```cpp
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }
        for (auto& row : matrix) {
            reverse(row.begin(), row.end());
        }
    }
};
```

转置只交换主对角线一侧的元素。若从 `j = 0` 开始，会把同一对元素交换两次，矩阵恢复原状。

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

## 方法三：四个位置循环交换

旋转会把四个位置组成一组：

$$
(i,j)\rightarrow(j,n-1-i)\rightarrow(n-1-i,n-1-j)
\rightarrow(n-1-j,i)\rightarrow(i,j)
$$

逐层处理矩阵，每组只交换一次。

```cpp
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n / 2; i++) {
            for (int j = i; j < n - i - 1; j++) {
                int top = matrix[i][j];
                matrix[i][j] = matrix[n - 1 - j][i];
                matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j];
                matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i];
                matrix[j][n - 1 - i] = top;
            }
        }
    }
};
```

外层 `i` 表示当前层，内层只遍历该层上边且不包含右上角的重复起点。奇数阶矩阵的中心元素无需移动。

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

## 易错点

- 顺时针旋转是“主对角线转置后水平翻转”；先上下翻转再转置也可以，但不能混用为逆时针顺序。
- 原题要求直接修改矩阵，辅助矩阵方法不满足最终空间要求。
- 四元交换时应先保存一个位置，否则第一个赋值会覆盖仍需使用的值。

## 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/rotate-image/solutions/)
