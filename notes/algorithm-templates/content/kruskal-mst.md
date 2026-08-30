---
title: "Kruskal：最小生成树"
category: "图论"
order: 57
problems:
  - "1584. 连接所有点的最小费用"
  - "1489. 找到最小生成树里的关键边和伪关键边"
keywords:
  - "Kruskal"
  - "MST"
  - "最小生成树"
  - "灵神风格"
tags:
  - "灵神风格"
  - "MST"
  - "并查集"
---

```cpp
class UnionFind {
    vector<int> fa, size;

public:
    int cc;

    UnionFind(int n) : fa(n), size(n, 1), cc(n) {
        iota(fa.begin(), fa.end(), 0);
    }

    int find(int x) {
        if (fa[x] != x) {
            fa[x] = find(fa[x]);
        }
        return fa[x];
    }

    bool merge(int from, int to) {
        int x = find(from), y = find(to);
        if (x == y) {
            return false;
        }
        fa[x] = y;
        size[y] += size[x];
        cc--;
        return true;
    }

    int getSize(int x) {
        return size[find(x)];
    }
};

long long kruskal(int n, vector<vector<int>>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b) {
        return a[2] < b[2];
    });

    UnionFind uf(n);
    long long ans = 0;
    for (auto& e : edges) {
        int x = e[0], y = e[1], w = e[2];
        if (uf.merge(x, y)) {
            ans += w;
        }
    }
    return uf.cc == 1 ? ans : -1;
}
```
