---
title: "质数筛：埃氏筛"
category: "数学"
order: 71
problems:
  - "204. 计数质数"
  - "2523. 范围内最接近的两个质数"
keywords:
  - "质数"
  - "埃氏筛"
  - "数论"
  - "预处理"
tags:
  - "数论"
  - "质数"
  - "预处理"
---

```cpp
vector<int> sieve(int n) {
    vector<int> primes;
    vector<bool> isPrime(n + 1, true);
    if (n >= 0) isPrime[0] = false;
    if (n >= 1) isPrime[1] = false;
    for (int i = 2; i <= n; i++) {
        if (!isPrime[i]) continue;
        primes.push_back(i);
        if ((long long) i * i <= n) {
            for (long long j = (long long) i * i; j <= n; j += i) isPrime[j] = false;
        }
    }
    return primes;
}
```
