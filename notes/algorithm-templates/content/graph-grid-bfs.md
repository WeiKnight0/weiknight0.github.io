---
title: "网格图 BFS：最短距离"
category: "图论"
order: 25
problems:
  - "994. 腐烂的橘子"
  - "1091. 二进制矩阵中的最短路径"
keywords:
  - "图论"
  - "BFS"
  - "网格图"
  - "最短距离"
  - "灵神风格"
tags:
  - "灵神风格"
  - "网格图"
  - "BFS"
---

```cpp
int DIRS[5] = {-1, 0, 1, 0, -1};

int shortestPath(vector<vector<int>>& grid, int sx, int sy, int tx, int ty) {
    int m = grid.size(), n = grid[0].size();
    vector<vector<int>> dis(m, vector<int>(n, -1));
    queue<pair<int, int>> q;
    dis[sx][sy] = 0;
    q.emplace(sx, sy);

    while (!q.empty()) {
        auto [i, j] = q.front();
        q.pop();
        if (i == tx && j == ty) {
            return dis[i][j];
        }
        for (int k = 0; k < 4; k++) {
            int x = i + DIRS[k], y = j + DIRS[k + 1];
            if (0 <= x && x < m && 0 <= y && y < n && grid[x][y] == 0 && dis[x][y] < 0) {
                dis[x][y] = dis[i][j] + 1;
                q.emplace(x, y);
            }
        }
    }
    return -1;
}
```
