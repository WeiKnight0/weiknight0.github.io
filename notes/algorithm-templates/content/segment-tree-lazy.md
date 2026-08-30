---
title: "线段树：区间加，区间和"
category: "基础容器与技巧"
order: 53
problems:
  - "307. 区域和检索 - 数组可修改"
  - "LCP 05. 发 LeetCoin"
keywords:
  - "线段树"
  - "lazy"
  - "区间查询"
  - "灵神风格"
tags:
  - "灵神风格"
  - "lazy"
  - "区间查询"
---

```cpp
class SegmentTree {
    vector<long long> sum, todo;

    void do_(int o, int l, int r, long long v) {
        sum[o] += v * (r - l + 1);
        todo[o] += v;
    }

    void spread(int o, int l, int r) {
        long long v = todo[o];
        if (v == 0 || l == r) {
            return;
        }
        int m = (l + r) / 2;
        do_(o * 2, l, m, v);
        do_(o * 2 + 1, m + 1, r, v);
        todo[o] = 0;
    }

    void maintain(int o) {
        sum[o] = sum[o * 2] + sum[o * 2 + 1];
    }

    void update(int o, int l, int r, int ql, int qr, long long v) {
        if (ql <= l && r <= qr) {
            do_(o, l, r, v);
            return;
        }
        spread(o, l, r);
        int m = (l + r) / 2;
        if (ql <= m) {
            update(o * 2, l, m, ql, qr, v);
        }
        if (m < qr) {
            update(o * 2 + 1, m + 1, r, ql, qr, v);
        }
        maintain(o);
    }

    long long query(int o, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) {
            return sum[o];
        }
        spread(o, l, r);
        int m = (l + r) / 2;
        long long res = 0;
        if (ql <= m) {
            res += query(o * 2, l, m, ql, qr);
        }
        if (m < qr) {
            res += query(o * 2 + 1, m + 1, r, ql, qr);
        }
        return res;
    }

public:
    SegmentTree(int n) : sum(n * 4), todo(n * 4) {}

    // 闭区间 [l,r]，下标从 0 开始
    void update(int n, int l, int r, long long v) {
        update(1, 0, n - 1, l, r, v);
    }

    long long query(int n, int l, int r) {
        return query(1, 0, n - 1, l, r);
    }
};
```
