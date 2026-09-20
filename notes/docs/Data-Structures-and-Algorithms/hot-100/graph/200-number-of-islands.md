---
title: 200. 岛屿数量
date: 2026-09-07
lang: zh-cn
---

给定由字符 `'1'`（陆地）和 `'0'`（水）组成的二维网格。相邻陆地仅通过上、下、左、右连接，网格边界外都是水。返回网格中的岛屿数量。

[题目链接](https://leetcode.cn/problems/number-of-islands/)

## 示例

### 示例 1

- 输入：

  ```text
  1 1 1 1 0
  1 1 0 1 0
  1 1 0 0 0
  0 0 0 0 0
  ```

- 输出：`1`

### 示例 2

- 输入：

  ```text
  1 1 0 0 0
  1 1 0 0 0
  0 0 1 0 0
  0 0 0 1 1
  ```

- 输出：`3`

## 数据范围

- $m=grid.length$，$n=grid[i].length$
- $1 \leq m,n \leq 300$
- `grid[i][j]` 为 `'0'` 或 `'1'`

## 连通块

把每个陆地格看作图中的节点，上下左右相邻的陆地之间连边，一座岛屿就是一个连通块。

从任意尚未访问的陆地出发，一次 DFS 或 BFS 会访问整座岛屿。外层扫描每发现一块新陆地，答案加一，再把它所在的整个连通块标记为已访问。

以下写法直接把访问过的 `'1'` 改成 `'0'`，用输入网格保存访问状态。

## 方法一：DFS

```cpp
class Solution {
    int rows, columns;

    void dfs(vector<vector<char>>& grid, int row, int column) {
        if (row < 0 || row >= rows || column < 0 || column >= columns ||
            grid[row][column] != '1') {
            return;
        }
        grid[row][column] = '0';
        dfs(grid, row - 1, column);
        dfs(grid, row + 1, column);
        dfs(grid, row, column - 1);
        dfs(grid, row, column + 1);
    }

public:
    int numIslands(vector<vector<char>>& grid) {
        rows = grid.size();
        columns = grid[0].size();
        int answer = 0;
        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (grid[row][column] == '1') {
                    answer++;
                    dfs(grid, row, column);
                }
            }
        }
        return answer;
    }
};
```

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(mn)$，最坏情况下递归栈包含整个网格

## 方法二：BFS

发现新岛屿后，用队列逐层访问所有相连陆地。节点入队时立即标记，避免同一格被多个邻居重复加入队列。

```cpp
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int rows = grid.size(), columns = grid[0].size();
        int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        int answer = 0;

        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (grid[row][column] != '1') {
                    continue;
                }
                answer++;
                queue<pair<int, int>> q;
                q.push({row, column});
                grid[row][column] = '0';
                while (!q.empty()) {
                    auto [x, y] = q.front();
                    q.pop();
                    for (auto& direction : directions) {
                        int nextX = x + direction[0];
                        int nextY = y + direction[1];
                        if (nextX < 0 || nextX >= rows || nextY < 0 || nextY >= columns ||
                            grid[nextX][nextY] != '1') {
                            continue;
                        }
                        grid[nextX][nextY] = '0';
                        q.push({nextX, nextY});
                    }
                }
            }
        }
        return answer;
    }
};
```

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(mn)$

## 正确性

一次搜索只会沿上下左右进入陆地，所以访问的格子都属于同一岛屿；反过来，该岛屿中的任意陆地都与起点连通，最终一定被搜索访问。外层扫描只在遇到未访问陆地时计数，因此每座岛屿恰好计数一次。

## 易错点

- 对角线相邻不算连通。
- BFS 应在入队时标记，而不是出队时标记。
- 本实现会修改输入网格；若调用者需要保留输入，应另建访问数组。
- 网格保存的是字符 `'0'`、`'1'`，不是整数 `0`、`1`。

## 参考

- [灵茶山艾府：网格图题单](https://leetcode.cn/discuss/post/YiXPXW/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/number-of-islands/solutions/)
