---
title: 73. 矩阵置零
date: 2026-09-07
lang: zh-cn
---

给定 $m\times n$ 整数矩阵。若某个元素为 `0`，将它所在行和列的所有元素都置为 `0`。要求直接修改原矩阵。

[题目链接](https://leetcode.cn/problems/set-matrix-zeroes/)

## 示例

### 示例 1

- 输入：`matrix = [[1,1,1],[1,0,1],[1,1,1]]`
- 输出：`[[1,0,1],[0,0,0],[1,0,1]]`

### 示例 2

- 输入：`matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]`
- 输出：`[[0,0,0,0],[0,4,5,0],[0,3,1,0]]`

## 数据范围

- $m=matrix.length$，$n=matrix[0].length$
- $1 \leq m,n \leq 200$
- $-2^{31} \leq matrix[i][j] \leq 2^{31}-1$

## 为什么不能遇到零就立即修改

若扫描到 `0` 时立刻把整行整列置零，新产生的零会在后续扫描中被误认为原始零，最终可能把无关行列也清零。必须先记录原始零涉及的行列，再统一修改。

## 方法一：记录行和列

使用两个布尔数组分别记录哪些行、哪些列需要置零。

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        vector<bool> zeroRow(m), zeroColumn(n);
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    zeroRow[i] = true;
                    zeroColumn[j] = true;
                }
            }
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (zeroRow[i] || zeroColumn[j]) {
                    matrix[i][j] = 0;
                }
            }
        }
    }
};
```

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(m+n)$

## 方法二：用首行和首列保存标记

`matrix[i][0]` 可记录第 `i` 行是否应置零，`matrix[0][j]` 可记录第 `j` 列是否应置零。`matrix[0][0]` 同时属于首行和首列，无法保存两个独立状态，因此额外使用 `firstRowZero` 和 `firstColumnZero`。

处理顺序：

1. 单独检查首行、首列是否原本含零；
2. 扫描其余元素，把置零信息写入对应的行首和列首；
3. 根据标记修改首行、首列以外的元素；
4. 最后根据两个布尔值处理首行和首列。

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        bool firstRowZero = false, firstColumnZero = false;

        for (int j = 0; j < n; j++) {
            firstRowZero |= matrix[0][j] == 0;
        }
        for (int i = 0; i < m; i++) {
            firstColumnZero |= matrix[i][0] == 0;
        }
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }
        if (firstRowZero) {
            fill(matrix[0].begin(), matrix[0].end(), 0);
        }
        if (firstColumnZero) {
            for (auto& row : matrix) {
                row[0] = 0;
            }
        }
    }
};
```

标记阶段不会修改内部元素，写回阶段读取的行首、列首标记也会保留到内部区域处理结束，因此每个元素是否归零都与原矩阵中的零准确对应。

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(1)$

## 易错点

- 首行和首列必须单独记录，不能只依赖 `matrix[0][0]`。
- 必须先完成全部标记，再修改内部矩阵。
- 首行、首列应最后处理，否则会破坏仍需读取的标记。

## 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/set-matrix-zeroes/solutions/)
