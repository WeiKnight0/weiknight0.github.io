---
title: "线性基：最大异或和"
category: "位运算"
order: 76
problems:
  - "3681. 子序列最大 XOR 值"
keywords:
  - "线性基"
  - "XOR"
  - "最大异或"
  - "位运算"
tags:
  - "线性基"
  - "XOR"
  - "最大异或"
---

```cpp
class XorBasis {
    static const int LOG = 60;
    long long basis[LOG]{};

public:
    void insert(long long x) {
        for (int i = LOG - 1; i >= 0; i--) {
            if (((x >> i) & 1) == 0) continue;
            if (!basis[i]) {
                basis[i] = x;
                return;
            }
            x ^= basis[i];
        }
    }

    long long maxXor() {
        long long ans = 0;
        for (int i = LOG - 1; i >= 0; i--) {
            ans = max(ans, ans ^ basis[i]);
        }
        return ans;
    }
};
```
