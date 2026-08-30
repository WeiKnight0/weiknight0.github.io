---
title: "GCD / LCM：最大公约数与最小公倍数"
category: "数学"
order: 73
problems:
  - "1979. 找出数组的最大公约数"
  - "2470. 最小公倍数为 K 的子数组数目"
keywords:
  - "GCD"
  - "LCM"
  - "欧几里得"
  - "数论"
tags:
  - "数论"
  - "欧几里得"
  - "裴蜀"
---

```cpp
long long gcdLong(long long a, long long b) {
    while (b) {
        long long t = a % b;
        a = b;
        b = t;
    }
    return abs(a);
}

long long lcmLong(long long a, long long b) {
    return a / gcdLong(a, b) * b;
}
```
