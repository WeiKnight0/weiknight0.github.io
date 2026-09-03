---
title: Primes and Sieves 质数与筛法
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Number Theory
---

大于 $1$ 且只有 $1$ 和自身两个正因数的整数称为质数。大于 $1$ 的非质数称为合数，$1$ 既不是质数也不是合数。

# 判断一个数是否为质数

若合数 $n=ab$，则 $a,b$ 中至少一个不超过 $\sqrt n$。因此只需检查 $[2,\sqrt n]$ 内是否存在 $n$ 的因数。

不要在循环条件中写 `i * i <= n`：当 `n` 接近整数上限时乘法可能溢出。使用 `i <= n / i` 更安全。

```cpp
// 判断n是否为质数
bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i <= n / i; i++) {
        if (n % i == 0) return false;
    }
    return true;
}
```

时间复杂度 $O(\sqrt n)$，空间复杂度 $O(1)$。

# 埃拉托斯特尼筛法

需要查询 $[1,n]$ 内的全部质数时，不应对每个数分别试除。埃氏筛从小到大枚举质数 $p$，把它的倍数标记为合数。

小于 $p^2$ 的倍数已经被更小的质因数标记，所以从 $p^2$ 开始即可。

```cpp
// 求不超过n的全部质数
vector<int> eratosthenes(int n) {
    vector<bool> isPrime(n + 1, true);
    isPrime[0] = false;
    if (n >= 1) isPrime[1] = false;

    for (int p = 2; p <= n / p; p++) {
        if (!isPrime[p]) continue;
        for (int multiple = p * p; multiple <= n; multiple += p) {
            isPrime[multiple] = false;
        }
    }

    vector<int> primes;
    for (int value = 2; value <= n; value++) {
        if (isPrime[value]) primes.push_back(value);
    }
    return primes;
}
```

时间复杂度 $O(n\log\log n)$，空间复杂度 $O(n)$。

# 线性筛

线性筛让每个合数只被它的最小质因数筛掉一次。枚举到 $i$ 时，用已经得到的质数 $p$ 标记 $i\cdot p$；当 $p$ 整除 $i$ 后停止，因为继续枚举时，$i\cdot p'$ 的最小质因数仍然是 $p$，之后会重复标记。

```cpp
// 求不超过n的全部质数及每个数的最小质因数
pair<vector<int>, vector<int>> linearSieve(int n) {
    vector<int> primes;
    vector<int> leastPrimeFactor(n + 1);
    for (int value = 2; value <= n; value++) {
        if (leastPrimeFactor[value] == 0) {
            leastPrimeFactor[value] = value;
            primes.push_back(value);
        }
        for (int prime : primes) {
            if (prime > leastPrimeFactor[value] || 1LL * value * prime > n) break;
            leastPrimeFactor[value * prime] = prime;
        }
    }
    return {primes, leastPrimeFactor};
}
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。只需要质数表时埃氏筛更直观；还要反复分解整数时，保留最小质因数的线性筛更方便。

# 例题

## 204. 计数质数

题目来源：[204. 计数质数](https://leetcode.cn/problems/count-primes/)

题目描述：给定非负整数 `n`，返回严格小于 `n` 的质数数量。注意，`n` 本身即使是质数也不能计入答案。

约束：$0\le n\le5\times10^6$。

**示例 1：**

- 输入：`n = 10`

- 输出：`4`

- 解释：小于 `10` 的质数是 `2、3、5、7`。

**示例 2：**

- 输入：`n = 1`

- 输出：`0`

思路：使用埃氏筛处理区间 $[0,n-1]$。代码中的数组长度是 `n`，因此所有下标天然严格小于 `n`。筛到质数 `p` 时，从 `p * p` 开始标记其倍数；更小的倍数已经被比 `p` 小的质因数处理过。

```cpp
class Solution {
public:
    int countPrimes(int n) {
        vector<bool> isPrime(n, true);
        if (n > 0) isPrime[0] = false;
        if (n > 1) isPrime[1] = false;
        for (int p = 2; p <= (n - 1) / p; p++) {
            if (!isPrime[p]) continue;
            for (int multiple = p * p; multiple < n; multiple += p) {
                isPrime[multiple] = false;
            }
        }
        return count(isPrime.begin(), isPrime.end(), true);
    }
};
```

时间复杂度 $O(n\log\log n)$，空间复杂度 $O(n)$。
