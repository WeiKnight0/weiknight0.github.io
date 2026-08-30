---
title: "网格图 DFS：统计连通块大小"
category: "图论"
order: 24
problems:
  - "200. 岛屿数量"
  - "695. 岛屿的最大面积"
keywords:
  - "图论"
  - "DFS"
  - "递归"
  - "网格图"
  - "灵神风格"
tags:
  - "灵神风格"
  - "DFS"
  - "网格图"
---

```cpp
int DIRS[5] = {-1, 0, 1, 0, -1};

int dfs(vector<vector<int>>& grid, int i, int j) {
    int m = grid.size(), n = grid[0].size();
    if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] == 0) {
        return 0;
    }
    grid[i][j] = 0; // 标记访问过，避免重复搜索
    int res = 1;
    for (int k = 0; k < 4; k++) {
        res += dfs(grid, i + DIRS[k], j + DIRS[k + 1]);
    }
    return res;
}

vector<int> componentSizes(vector<vector<int>>& grid) {
    vector<int> ans;
    for (int i = 0; i < grid.size(); i++) {
        for (int j = 0; j < grid[i].size(); j++) {
            if (grid[i][j]) {
                ans.push_back(dfs(grid, i, j));
            }
        }
    }
    return ans;
}
```
