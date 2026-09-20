---
title: 79. 单词搜索
date: 2026-09-07
lang: zh-cn
---

给定字符网格 `board` 和字符串 `word`。判断能否从某个格子开始，通过上下左右相邻格子依次拼出 `word`。同一个格子在一条路径中不能重复使用。

[题目链接](https://leetcode.cn/problems/word-search/)

## 示例

给定网格：

```text
A B C E
S F C S
A D E E
```

### 示例 1

- 输入：`word = "ABCCED"`
- 输出：`true`

### 示例 2

- 输入：`word = "SEE"`
- 输出：`true`

### 示例 3

- 输入：`word = "ABCB"`
- 输出：`false`
- 解释：最后一个 `B` 不能重复使用已经走过的格子。

## 数据范围

- $1 \leq board.length,board[i].length \leq 6$
- $1 \leq word.length \leq 15$
- `board` 和 `word` 只包含大小写英文字母

## 从每个可能起点搜索

外层枚举网格中每个与 `word[0]` 相同的格子。DFS 状态 `(row, column, index)` 表示当前格子要匹配 `word[index]`：

1. 坐标越界或字符不同，当前路径失败；
2. `index` 已是最后一个字符，匹配成功；
3. 暂时把当前格改为 `'#'`，表示本条路径已使用；
4. 搜索四个相邻格子；
5. 返回前恢复原字符，供其他路径使用。

```cpp
class Solution {
    int rows, columns;

    bool dfs(vector<vector<char>>& board, const string& word,
             int row, int column, int index) {
        if (row < 0 || row >= rows || column < 0 || column >= columns ||
            board[row][column] != word[index]) {
            return false;
        }
        if (index + 1 == word.size()) {
            return true;
        }

        char letter = board[row][column];
        board[row][column] = '#';
        bool found = dfs(board, word, row - 1, column, index + 1) ||
                     dfs(board, word, row + 1, column, index + 1) ||
                     dfs(board, word, row, column - 1, index + 1) ||
                     dfs(board, word, row, column + 1, index + 1);
        board[row][column] = letter;
        return found;
    }

public:
    bool exist(vector<vector<char>>& board, string word) {
        rows = board.size();
        columns = board[0].size();
        if (word.size() > rows * columns) {
            return false;
        }
        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (dfs(board, word, row, column, 0)) {
                    return true;
                }
            }
        }
        return false;
    }
};
```

标记仅在当前递归路径中有效。即使某个方向已经找到答案，逻辑或短路后仍会执行后面的恢复语句，因此成功返回也不会永久修改输入网格。

## 正确性

DFS 的每一步只进入上下左右相邻且字符匹配的格子，临时标记保证路径中不会重复使用格子。匹配最后一个字符时，当前路径正好按顺序拼出整个单词。外层枚举全部起点，内层枚举每一步的全部合法方向，因此任意存在的路径都会被找到。

## 复杂度

设网格共有 $mn$ 个格子，单词长度为 $L$。第一步之后不能立刻走回上一个格子，每层最多继续三个方向：

- 时间复杂度：$O(mn\cdot3^L)$；
- 空间复杂度：$O(L)$，来自递归调用栈。

## 易错点

- 同一格子不能在一条路径中重复使用，但不同起点的搜索可以使用它。
- 无论搜索成功或失败，都应在返回前恢复当前字符。
- 字符匹配区分大小写。
- 单词长度大于格子总数时一定无解，可以直接返回。

## 参考

- [灵茶山艾府：网格图题单](https://leetcode.cn/discuss/post/YiXPXW/)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/word-search/solutions/)
