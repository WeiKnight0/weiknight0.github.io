---
title: "LCA 倍增：最近公共祖先"
category: "二叉树"
order: 67
problems:
  - "1483. 树节点的第 K 个祖先"
  - "2846. 边权重均等查询"
keywords:
  - "灵神风格"
  - "LCA"
  - "倍增"
  - "最近公共祖先"
  - "一般树"
tags:
  - "灵神风格"
  - "LCA"
  - "倍增"
  - "一般树"
---

```cpp
class LcaBinaryLifting {
    vector<int> depth;
    vector<long long> dis; // 如果是无权树（边权为 1），dis 可以去掉，用 depth 代替
    vector<vector<int>> pa;

public:
    LcaBinaryLifting(vector<vector<int>>& edges) {
        int n = edges.size() + 1;
        int m = bit_width((unsigned) n); // n 的二进制长度
        vector<vector<pair<int, int>>> g(n);
        for (auto& e : edges) {
            // 如果题目的节点编号从 1 开始，改成 x=e[0]-1 和 y=e[1]-1
            int x = e[0], y = e[1], w = e[2];
            g[x].emplace_back(y, w);
            g[y].emplace_back(x, w);
        }

        depth.resize(n);
        dis.resize(n);
        pa.resize(m, vector<int>(n, -1));

        auto dfs = [&](this auto&& dfs, int x, int fa) -> void {
            pa[0][x] = fa;
            for (auto& [y, w] : g[x]) {
                if (y != fa) {
                    depth[y] = depth[x] + 1;
                    dis[y] = dis[x] + w;
                    dfs(y, x);
                }
            }
        };
        dfs(0, -1);

        for (int i = 0; i < m - 1; i++) {
            for (int x = 0; x < n; x++) {
                if (int p = pa[i][x]; p != -1) {
                    pa[i + 1][x] = pa[i][p];
                }
            }
        }
    }

    // 返回 node 的第 k 个祖先节点
    // 如果不存在，返回 -1
    int get_kth_ancestor(int node, int k) {
        for (; k > 0 && node >= 0; k &= k - 1) {
            node = pa[countr_zero((unsigned) k)][node];
        }
        return node;
    }

    // 返回 x 和 y 的最近公共祖先（节点编号从 0 开始）
    int get_lca(int x, int y) {
        if (depth[x] > depth[y]) {
            swap(x, y);
        }
        y = get_kth_ancestor(y, depth[y] - depth[x]); // 使 y 和 x 在同一深度
        if (y == x) {
            return x;
        }
        for (int i = pa.size() - 1; i >= 0; i--) {
            int px = pa[i][x], py = pa[i][y];
            if (px != py) {
                x = px;
                y = py; // 同时往上跳 2^i 步
            }
        }
        return pa[0][x];
    }

    // 返回 x 到 y 的距离（最短路长度）
    long long get_dis(int x, int y) {
        return dis[x] + dis[y] - dis[get_lca(x, y)] * 2;
    }
};
```
## 使用方法

这是有边权无向树的倍增 LCA 预处理模板。构造函数接收整棵树的边，根节点固定为 `0`，预处理后可以查询第 `k` 个祖先、最近公共祖先，以及两点之间的路径长度。

### 输入格式

- `edges` 长度必须是 `n - 1`，表示一棵连通无向树。
- 每条边格式为 `{x, y, w}`，表示节点 `x` 和 `y` 之间有一条边权为 `w` 的无向边。
- 默认节点编号从 `0` 到 `n - 1`。如果题目节点编号从 `1` 开始，构图时把 `x = e[0]`、`y = e[1]` 改成 `x = e[0] - 1`、`y = e[1] - 1`。
- 如果是无权树，可以把每条边的 `w` 当作 `1`；只查 LCA 或祖先时，`dis` 相关逻辑可以去掉。
- 代码使用 `bit_width`、`countr_zero`，需要 `#include <bit>`；递归 lambda 的 `this auto` 写法需要 C++23。

### 返回值

- `get_kth_ancestor(node, k)` 返回 `node` 的第 `k` 个祖先；不存在则返回 `-1`。
- `get_lca(x, y)` 返回 `x` 和 `y` 的最近公共祖先，节点编号保持为 `0-indexed`。
- `get_dis(x, y)` 返回 `x` 到 `y` 的路径边权和。

### 调用示例

```cpp
vector<vector<int>> edges = {
    {0, 1, 3},
    {1, 2, 4},
    {1, 3, 2},
};

LcaBinaryLifting lca(edges);

int p = lca.get_lca(2, 3);          // 返回 1
int anc = lca.get_kth_ancestor(2, 2); // 返回 0
long long d = lca.get_dis(2, 3);    // 返回 6，即 4 + 2
```

<p class="source-note">代码来源：灵茶山艾府，LeetCode 讨论 <a href="https://leetcode.cn/discuss/post/K0n2gO/">LCA 倍增模板</a>。</p>
