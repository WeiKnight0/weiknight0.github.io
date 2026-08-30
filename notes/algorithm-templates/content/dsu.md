---
title: "UnionFind 并查集：连通块与大小"
category: "并查集"
order: 29
problems:
  - "547. 省份数量"
  - "684. 冗余连接"
keywords:
  - "并查集"
  - "UnionFind"
  - "连通块"
  - "灵神风格"
tags:
  - "灵神风格"
  - "连通块"
  - "Kruskal"
---

```cpp
class DSU {
private:
    vector<int> parent;
    vector<int> size;

public:
    DSU(int n) : parent(n), size(n, 1) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    bool unite(int a, int b) {
        int ra = find(a);
        int rb = find(b);
        if (ra == rb) return false;

        if (size[ra] < size[rb]) swap(ra, rb);
        parent[rb] = ra;
        size[ra] += size[rb];
        return true;
    }

    bool connected(int a, int b) {
        return find(a) == find(b);
    }
};
```
