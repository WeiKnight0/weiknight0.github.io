---
title: 54. 螺旋矩阵
date: 2026-09-07
lang: zh-cn
---

给定 $m\times n$ 矩阵，按照从左上角开始、顺时针向内盘旋的顺序返回全部元素。

[题目链接](https://leetcode.cn/problems/spiral-matrix/)

## 示例

### 示例 1

- 输入：`matrix = [[1,2,3],[4,5,6],[7,8,9]]`
- 输出：`[1,2,3,6,9,8,7,4,5]`

### 示例 2

- 输入：`matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]`
- 输出：`[1,2,3,4,8,12,11,10,9,5,6,7]`

## 数据范围

- $m=matrix.length$，$n=matrix[0].length$
- $1 \leq m,n \leq 10$
- $-100 \leq matrix[i][j] \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

## 四条边界

使用 `top`、`bottom`、`left`、`right` 表示尚未访问区域的四条边。每一轮依次遍历：

1. 上边：从左到右，然后 `top++`；
2. 右边：从上到下，然后 `right--`；
3. 下边：确认仍有未访问行后，从右到左，然后 `bottom--`；
4. 左边：确认仍有未访问列后，从下到上，然后 `left++`。

```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int top = 0, bottom = matrix.size() - 1;
        int left = 0, right = matrix[0].size() - 1;
        vector<int> ans;

        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) {
                ans.push_back(matrix[top][j]);
            }
            top++;

            for (int i = top; i <= bottom; i++) {
                ans.push_back(matrix[i][right]);
            }
            right--;

            if (top <= bottom) {
                for (int j = right; j >= left; j--) {
                    ans.push_back(matrix[bottom][j]);
                }
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) {
                    ans.push_back(matrix[i][left]);
                }
                left++;
            }
        }
        return ans;
    }
};
```

## 正确性

每轮访问当前未处理矩形的外圈，随后四条边界各向内收缩一格。四段遍历互不重叠；当矩阵只剩一行或一列时，两个额外判断阻止下边或左边再次访问相同元素。边界交错时，所有元素恰好访问一次。

## 复杂度

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(1)$，返回数组不计入额外空间

## 易错点

- 遍历完上边和右边后，剩余区域可能已经为空，访问下边和左边前必须重新判断边界。
- 矩阵不一定是正方形，要分别维护行边界与列边界。
- 向左、向上遍历时循环变量是递减的，终止条件仍包含边界元素。

</details>

## 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/spiral-matrix/solutions/)
