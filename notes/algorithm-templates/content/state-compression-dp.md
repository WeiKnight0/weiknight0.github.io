---
title: "状压 DP：集合与最后一个元素"
category: "动态规划"
order: 89
problems:
  - "847. 访问所有节点的最短路径"
  - "1723. 完成所有工作的最短时间"
keywords:
  - "状压DP"
  - "bitmask"
  - "枚举集合"
  - "灵神风格"
tags:
  - "灵神风格"
  - "bitmask"
  - "枚举集合"
---

```cpp
// f[s][i] 表示已经访问集合 s，且最后停在 i 的最小代价
int shortestHamiltonPath(vector<vector<int>>& dis) {
    int n = dis.size();
    const int INF = INT_MAX / 2;
    vector<vector<int>> f(1 << n, vector<int>(n, INF));
    f[1][0] = 0;

    for (int s = 1; s < (1 << n); s++) {
        for (int i = 0; i < n; i++) {
            if ((s >> i & 1) == 0 || f[s][i] == INF) {
                continue;
            }
            for (int j = 0; j < n; j++) {
                if (s >> j & 1) {
                    continue;
                }
                int t = s | (1 << j);
                f[t][j] = min(f[t][j], f[s][i] + dis[i][j]);
            }
        }
    }
    return *min_element(f.back().begin(), f.back().end());
}

// 枚举 mask 的非空子集
void enumSubsets(int mask) {
    for (int sub = mask; sub; sub = (sub - 1) & mask) {
        // TODO: 使用 sub 和 mask ^ sub
    }
}
```
