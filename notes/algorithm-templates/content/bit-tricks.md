---
title: "位运算基础：lowbit 与枚举子集"
category: "位运算"
order: 74
problems:
  - "191. 位 1 的个数"
  - "78. 子集"
keywords:
  - "lowbit"
  - "子集枚举"
  - "bitmask"
  - "位运算"
tags:
  - "lowbit"
  - "子集枚举"
  - "bitmask"
---

```cpp
int lowbit(int x) {
    return x & -x;
}

vector<int> enumerateSubmasks(int mask) {
    vector<int> ans;
    for (int sub = mask; sub; sub = (sub - 1) & mask) {
        ans.push_back(sub);
    }
    ans.push_back(0);
    return ans;
}

bool hasBit(int mask, int i) {
    return mask & (1 << i);
}
```
