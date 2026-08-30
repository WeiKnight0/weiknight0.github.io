---
title: "字符串哈希：子串哈希"
category: "字符串"
order: 70
problems:
  - "1044. 最长重复子串"
  - "187. 重复的 DNA 序列"
keywords:
  - "字符串哈希"
  - "滚动哈希"
  - "子串"
  - "hash"
tags:
  - "滚动哈希"
  - "子串"
  - "双模可扩展"
---

```cpp
class StringHash {
    static const long long MOD = 1000000007;
    static const long long BASE = 911382323;
    vector<long long> h, p;

public:
    StringHash(string s) {
        int n = s.size();
        h.assign(n + 1, 0);
        p.assign(n + 1, 1);
        for (int i = 0; i < n; i++) {
            h[i + 1] = (h[i] * BASE + s[i]) % MOD;
            p[i + 1] = p[i] * BASE % MOD;
        }
    }

    long long get(int l, int r) {
        return (h[r] - h[l] * p[r - l] % MOD + MOD) % MOD;
    }
};
```
