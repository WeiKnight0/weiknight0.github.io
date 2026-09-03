---
title: Computing Binomial Coefficients 组合数的计算
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Combinatorics
---

组合数 $\binom nk$ 的计算方式取决于数据范围、查询次数以及是否取模。

| 场景 | 方法 | 单次或预处理复杂度 |
| --- | --- | --- |
| 只查询一次，答案能放入整数类型 | 逐项相乘相除 | $O(\min(k,n-k))$ |
| $n$ 不大，需要得到许多个 $\binom nk$ | 杨辉三角 | 预处理 $O(n^2)$ |
| 模数为质数、$n<p$，查询很多 | 阶乘与逆阶乘 | 预处理 $O(n+\log p)$，查询 $O(1)$ |

# 单次计算且结果不取模

利用对称性令 $k=\min(k,n-k)$，逐项计算：

$$
\binom nk=\prod_{i=1}^{k}\frac{n-k+i}{i}
$$

```cpp
// 计算能够放入long long的组合数
long long combination(int n, int k) {
    if (k < 0 || k > n) return 0;
    k = min(k, n - k);
    long long result = 1;
    for (int i = 1; i <= k; i++) {
        result = result * (n - k + i) / i;
    }
    return result;
}
```

每一步的整体结果都是整数，但乘法仍可能在最终答案之前溢出。数据范围更大时需要高精度整数或约分后计算。

# 杨辉三角递推

由

$$
\binom nk=\binom{n-1}{k-1}+\binom{n-1}{k}
$$

计算到第 $n$ 行需要 $O(n^2)$ 时间和空间。转移只有加法，因此取模时不要求模数为质数。

```cpp
// 使用杨辉三角计算0到n的组合数，结果对mod取模
vector<vector<long long>> pascalTriangle(int n, long long mod) {
    vector<vector<long long>> combination(n + 1, vector<long long>(n + 1));
    for (int row = 0; row <= n; row++) {
        combination[row][0] = combination[row][row] = 1;
        for (int column = 1; column < row; column++) {
            combination[row][column] =
                (combination[row - 1][column - 1] + combination[row - 1][column]) % mod;
        }
    }
    return combination;
}
```

# 质数模下多次查询

当模数 $p$ 为质数且 $n<p$ 时，预处理阶乘和逆阶乘：

$$
\binom nk\equiv n!\,(k!)^{-1}\,((n-k)!)^{-1}\pmod p
$$

```cpp
class Combinations {
    long long mod;
    vector<long long> factorial, inverseFactorial;

    long long power(long long base, long long exponent) const {
        long long result = 1;
        while (exponent > 0) {
            if (exponent & 1) result = result * base % mod;
            base = base * base % mod;
            exponent >>= 1;
        }
        return result;
    }

public:
    // 预处理阶乘及逆阶乘
    Combinations(int limit, long long primeMod)
        : mod(primeMod), factorial(limit + 1, 1), inverseFactorial(limit + 1, 1) {
        for (int i = 1; i <= limit; i++) factorial[i] = factorial[i - 1] * i % mod;
        inverseFactorial[limit] = power(factorial[limit], mod - 2);
        for (int i = limit; i > 0; i--) {
            inverseFactorial[i - 1] = inverseFactorial[i] * i % mod;
        }
    }

    // 计算C(n, k)
    long long choose(int n, int k) const {
        if (k < 0 || k > n) return 0;
        return factorial[n] * inverseFactorial[k] % mod * inverseFactorial[n - k] % mod;
    }
};
```

预处理时间 $O(n+\log p)$、空间 $O(n)$，每次查询 $O(1)$。

# 例题

## 2400. 恰好移动 k 步到达某一位置的方法数目

题目来源：[2400. 恰好移动 k 步到达某一位置的方法数目](https://leetcode.cn/problems/number-of-ways-to-reach-a-position-after-exactly-k-steps/)

题目描述：在无限数轴上从正整数位置 `startPos` 出发，每一步可以向左或向右移动一个位置。求恰好移动 `k` 步后到达 `endPos` 的不同移动序列数量，答案对 $10^9+7$ 取模。只要移动顺序不同，就视为不同方案；移动过程中可以到达负数位置。

约束：$1\le startPos,endPos,k\le1000$。

**示例 1：**

- 输入：`startPos = 1, endPos = 2, k = 3`

- 输出：`3`

- 解释：三种移动序列分别为 `右、右、左`，`右、左、右` 和 `左、右、右`。

**示例 2：**

- 输入：`startPos = 2, endPos = 5, k = 10`

- 输出：`0`

- 解释：走 `10` 步后位置变化量的奇偶性为偶数，不可能产生距离为 `3` 的位移。

思路：设向右走 $r$ 步，向左走 $k-r$ 步。最终位置满足：

$$
startPos+r-(k-r)=endPos
$$

解得：

$$
r=\frac{k+endPos-startPos}{2}
$$

若分子为奇数或 $r\notin[0,k]$，说明无法恰好到达，答案为 `0`。否则只需从 `k` 步中选择哪 `r` 步向右，答案为 $\binom kr$。

```cpp
class Solution {
    static constexpr long long MOD = 1'000'000'007;

    long long power(long long base, long long exponent) {
        long long result = 1;
        while (exponent > 0) {
            if (exponent & 1) result = result * base % MOD;
            base = base * base % MOD;
            exponent >>= 1;
        }
        return result;
    }

public:
    int numberOfWays(int startPos, int endPos, int k) {
        int numerator = k + endPos - startPos;
        if (numerator < 0 || numerator % 2 != 0) return 0;
        int rightSteps = numerator / 2;
        if (rightSteps > k) return 0;

        vector<long long> factorial(k + 1, 1);
        for (int i = 1; i <= k; i++) factorial[i] = factorial[i - 1] * i % MOD;
        return factorial[k] * power(factorial[rightSteps], MOD - 2) % MOD
            * power(factorial[k - rightSteps], MOD - 2) % MOD;
    }
};
```

时间复杂度 $O(k+\log MOD)$，空间复杂度 $O(k)$。
