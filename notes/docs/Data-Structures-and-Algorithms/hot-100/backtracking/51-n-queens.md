---
title: 51. N 皇后
date: 2026-09-07
lang: zh-cn
---

在 $n\times n$ 棋盘上放置 `n` 个皇后，使任意两个皇后都不在同一行、同一列或同一条斜线上。返回所有不同的棋盘方案，其中 `Q` 表示皇后，`.` 表示空格。

[题目链接](https://leetcode.cn/problems/n-queens/)

## 示例

### 示例 1

- 输入：`n = 4`
- 输出：

  ```text
  .Q..    ..Q.
  ...Q    Q...
  Q...    ...Q
  ..Q.    .Q..
  ```

  两个棋盘分别是一种答案。

### 示例 2

- 输入：`n = 1`
- 输出：`[["Q"]]`

## 数据范围

- $1 \leq n \leq 9$

## 按行放置

每行必须且只能放一个皇后。递归到 `row` 时枚举这一行的所有列，只需判断列和两类对角线是否已经被占用。

棋盘坐标从 `0` 开始：

- 同一列的 `column` 相等；
- 同一条主对角线上的 `row - column` 相等，为避免负下标使用 `row - column + n - 1`；
- 同一条副对角线上的 `row + column` 相等。

两类对角线编号范围都是 `[0, 2n - 2]`。

## 回溯三要素

- **路径**：棋盘中前 `row` 行已经放置的皇后；
- **选择列表**：当前行中未被列和对角线占用的位置；
- **结束条件**：`row == n`，所有行都已放置皇后。

```cpp
class Solution {
    vector<vector<string>> answer;
    vector<string> board;
    vector<bool> columns;
    vector<bool> mainDiagonals;
    vector<bool> antiDiagonals;

    void dfs(int row, int n) {
        if (row == n) {
            answer.push_back(board);
            return;
        }
        for (int column = 0; column < n; column++) {
            int mainDiagonal = row - column + n - 1;
            int antiDiagonal = row + column;
            if (columns[column] || mainDiagonals[mainDiagonal] ||
                antiDiagonals[antiDiagonal]) {
                continue;
            }

            board[row][column] = 'Q';
            columns[column] = true;
            mainDiagonals[mainDiagonal] = true;
            antiDiagonals[antiDiagonal] = true;
            dfs(row + 1, n);
            board[row][column] = '.';
            columns[column] = false;
            mainDiagonals[mainDiagonal] = false;
            antiDiagonals[antiDiagonal] = false;
        }
    }

public:
    vector<vector<string>> solveNQueens(int n) {
        answer.clear();
        board.assign(n, string(n, '.'));
        columns.assign(n, false);
        mainDiagonals.assign(n * 2 - 1, false);
        antiDiagonals.assign(n * 2 - 1, false);
        dfs(0, n);
        return answer;
    }
};
```

## 正确性

算法每层只处理一行，所以不同皇后不会同行；列和两类对角线占用数组保证新皇后不攻击此前皇后。到达第 `n` 行时，棋盘上恰有 `n` 个互不攻击的皇后。反过来，任意合法棋盘在每行都有唯一皇后位置，这些位置始终通过冲突检查，因此对应的搜索路径一定会被枚举。

## 复杂度

- 时间复杂度：上界为 $O(n\cdot n!)$，需要枚举列排列并复制每个棋盘；
- 空间复杂度：$O(n^2)$，棋盘占主要空间，不计算返回结果。

## 易错点

- 同一行无需额外标记，因为递归每层只放置一个皇后。
- 主对角线编号 `row - column` 可能为负，需要加 `n - 1`。
- 两类对角线不能混用同一组标记。
- 回溯时必须同时恢复棋盘、列和两类对角线状态。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/n-queens/solutions/)
