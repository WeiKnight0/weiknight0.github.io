---
title: "Fenwick 树状数组：单点加，前缀和"
category: "基础容器与技巧"
order: 39
problems:
  - "307. 区域和检索 - 数组可修改"
keywords:
  - "树状数组"
  - "Fenwick"
  - "前缀和"
  - "灵神风格"
tags:
  - "灵神风格"
  - "1-indexed"
  - "前缀和"
---

```cpp
class Fenwick {
    vector<long long> tree;

public:
    Fenwick(int n) : tree(n + 1) {}

    // 下标从 1 开始：把 a[i] 增加 val
    void add(int i, long long val) {
        for (; i < tree.size(); i += i & -i) {
            tree[i] += val;
        }
    }

    // 返回 a[1] + ... + a[i]
    long long pre(int i) {
        long long res = 0;
        for (; i > 0; i &= i - 1) {
            res += tree[i];
        }
        return res;
    }

    long long query(int l, int r) {
        if (r < l) {
            return 0;
        }
        return pre(r) - pre(l - 1);
    }
};
```
