---
title: "快速幂与组合数预处理"
category: "数学"
order: 72
problems:
  - "1922. 统计好数字的数目"
  - "2514. 统计同位异构字符串数目"
keywords:
  - "快速幂"
  - "组合数"
  - "逆元"
  - "取模"
tags:
  - "组合数学"
  - "取模"
  - "逆元"
---

```cpp
const long long MOD = 1000000007;

long long qpow(long long a, long long e) {
    long long res = 1;
    while (e) {
        if (e & 1) res = res * a % MOD;
        a = a * a % MOD;
        e >>= 1;
    }
    return res;
}

class Comb {
    vector<long long> fact, invFact;

public:
    Comb(int n) : fact(n + 1), invFact(n + 1) {
        fact[0] = 1;
        for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
        invFact[n] = qpow(fact[n], MOD - 2);
        for (int i = n; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;
    }

    long long C(int n, int k) {
        if (k < 0 || k > n) return 0;
        return fact[n] * invFact[k] % MOD * invFact[n - k] % MOD;
    }
};
```
