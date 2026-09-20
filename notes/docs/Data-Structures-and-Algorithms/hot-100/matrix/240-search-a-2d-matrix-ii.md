---
title: 240. 搜索二维矩阵 II
date: 2026-09-07
lang: zh-cn
---

给定 $m\times n$ 整数矩阵 `matrix` 和整数 `target`。矩阵每行从左到右非递减，每列从上到下非递减，判断目标值是否存在。

[题目链接](https://leetcode.cn/problems/search-a-2d-matrix-ii/)

## 示例

给定矩阵：

```text
1   4   7  11  15
2   5   8  12  19
3   6   9  16  22
10 13  14  17  24
18 21  23  26  30
```

### 示例 1

- 输入：`target = 5`
- 输出：`true`

### 示例 2

- 输入：`target = 20`
- 输出：`false`

## 数据范围

- $m=matrix.length$，$n=matrix[i].length$
- $1 \leq m,n \leq 300$
- $-10^9 \leq matrix[i][j],target \leq 10^9$
- 每行从左到右非递减，每列从上到下非递减

## 方法一：逐行二分

每一行都是有序数组，可以对每行分别二分查找。若目标小于本行首元素或大于本行末元素，可直接跳过该行。

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        for (const auto& row : matrix) {
            if (target < row.front() || target > row.back()) {
                continue;
            }
            if (binary_search(row.begin(), row.end(), target)) {
                return true;
            }
        }
        return false;
    }
};
```

- 时间复杂度：$O(m\log n)$
- 空间复杂度：$O(1)$

该方法只利用了每行有序，没有利用每列也有序的条件。

## 方法二：从右上角开始排除

右上角元素具有两个方向相反的单调性：向左数值不增，向下数值不减。设当前位置为 `(row, column)`：

- 若当前值大于 `target`，当前列从该位置向下都不小于当前值，因此整列不可能包含目标，令 `column--`；
- 若当前值小于 `target`，当前行从该位置向左都不大于当前值，因此整行不可能包含目标，令 `row++`；
- 相等时返回 `true`。

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int row = 0;
        int column = matrix[0].size() - 1;
        while (row < matrix.size() && column >= 0) {
            if (matrix[row][column] == target) {
                return true;
            }
            if (matrix[row][column] > target) {
                column--;
            } else {
                row++;
            }
        }
        return false;
    }
};
```

每次比较都会排除一整行或一整列。搜索区域始终是尚未排除的左下矩形；目标若存在，就不会在上述排除中被移除。退出时行或列已经全部排除，因此目标不存在。

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(1)$

也可以从左下角开始，较大时上移、较小时右移。不能从左上角开始，因为向右和向下都会增大，比较一次后无法确定排除哪个方向。

## 易错点

- 本题与“搜索二维矩阵”不同：下一行首元素不保证大于上一行末元素，不能把矩阵直接视为一个整体有序数组。
- 阶梯搜索应选择右上角或左下角，保证两个移动方向的数值变化相反。
- `column` 需要使用有符号整数，否则减到 `-1` 时会发生无符号下溢。

## 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/search-a-2d-matrix-ii/solutions/)
