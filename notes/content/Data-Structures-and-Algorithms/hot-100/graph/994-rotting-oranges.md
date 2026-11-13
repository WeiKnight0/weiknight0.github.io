---
title: 994. 腐烂的橘子
date: 2026-09-07
lang: zh-cn
---

给定网格 `grid`：`0` 表示空格，`1` 表示新鲜橘子，`2` 表示腐烂橘子。每分钟，腐烂橘子会使上下左右相邻的新鲜橘子腐烂。返回所有新鲜橘子腐烂所需的最少分钟数；若无法全部腐烂，返回 `-1`。

[题目链接](https://leetcode.cn/problems/rotting-oranges/)

## 示例

### 示例 1

- 输入：`grid = [[2,1,1],[1,1,0],[0,1,1]]`
- 输出：`4`

### 示例 2

- 输入：`grid = [[2,1,1],[0,1,1],[1,0,1]]`
- 输出：`-1`
- 解释：左下角的新鲜橘子与其他橘子不连通，永远不会腐烂。

### 示例 3

- 输入：`grid = [[0,2]]`
- 输出：`0`
- 解释：开始时没有新鲜橘子。

## 数据范围

- $m=grid.length$，$n=grid[i].length$
- $1 \leq m,n \leq 10$
- `grid[i][j]` 为 `0`、`1` 或 `2`

<details class="note-solution">
<summary>查看解析</summary>

## 多源 BFS

所有初始腐烂橘子会同时扩散，不能逐个从每个腐烂橘子独立搜索。把所有初始腐烂位置一起加入队列，它们构成 BFS 的第 `0` 层；之后每扩展一层就过去一分钟。

同时统计新鲜橘子数量 `fresh`。只有实际使至少一个新鲜橘子腐烂的一层才增加分钟数。

```cpp
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int rows = grid.size(), columns = grid[0].size();
        queue<pair<int, int>> q;
        int fresh = 0;
        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (grid[row][column] == 2) {
                    q.push({row, column});
                } else if (grid[row][column] == 1) {
                    fresh++;
                }
            }
        }

        int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        int minutes = 0;
        while (!q.empty() && fresh > 0) {
            int size = q.size();
            while (size--) {
                auto [x, y] = q.front();
                q.pop();
                for (auto& direction : directions) {
                    int nextX = x + direction[0];
                    int nextY = y + direction[1];
                    if (nextX < 0 || nextX >= rows || nextY < 0 || nextY >= columns ||
                        grid[nextX][nextY] != 1) {
                        continue;
                    }
                    grid[nextX][nextY] = 2;
                    fresh--;
                    q.push({nextX, nextY});
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
};
```

## 为什么是最少时间

BFS 按距离递增访问网格。所有腐烂橘子同时作为起点后，一个新鲜橘子第一次被访问的层数，就是它到任意初始腐烂橘子的最短四联通距离，也就是它最早腐烂的时间。所有橘子腐烂的时间是这些最短时间的最大值。

## 复杂度

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(mn)$

## 易错点

- 初始腐烂橘子必须同时入队，这是多源 BFS。
- 没有新鲜橘子时答案为 `0`，不能因为队列非空而多算一分钟。
- 新鲜橘子入队时立即改为 `2`，避免被重复腐烂和重复计数。
- BFS 结束后仍有 `fresh > 0`，说明存在无法到达的橘子，应返回 `-1`。

</details>

## 参考

- [灵茶山艾府：网格图题单](https://leetcode.cn/discuss/post/YiXPXW/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/rotting-oranges/solutions/)
