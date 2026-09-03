---
title: Divisors and Factorization 因数与质因数分解
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Number Theory
---

若整数 $d$ 能整除正整数 $n$，即存在整数 $k$ 使 $n=dk$，则 $d$ 是 $n$ 的因数。每个大于 $1$ 的整数都能唯一地写成质数幂的乘积：

$$
n=p_1^{e_1}p_2^{e_2}\cdots p_k^{e_k}
$$

质因数的排列顺序不影响分解结果，这就是算术基本定理。

# 枚举因数

因数成对出现：若 $d\mid n$，则 $n/d$ 也是因数。因此只需枚举到 $\sqrt n$。

```cpp
// 按升序求n的全部正因数
vector<long long> divisors(long long n) {
    vector<long long> small, large;
    for (long long divisor = 1; divisor <= n / divisor; divisor++) {
        if (n % divisor != 0) continue;
        small.push_back(divisor);
        if (divisor != n / divisor) large.push_back(n / divisor);
    }
    reverse(large.begin(), large.end());
    small.insert(small.end(), large.begin(), large.end());
    return small;
}
```

时间复杂度 $O(\sqrt n)$，除结果外空间复杂度 $O(1)$。

# 质因数分解

从最小可能的质因数开始试除。找到因数 $p$ 后持续除以 $p$，即可得到指数 $e$。循环结束后若 `n > 1`，剩余部分本身就是一个大于原枚举上界的质数。

```cpp
// 求n的质因数及其指数
vector<pair<long long, int>> factorize(long long n) {
    vector<pair<long long, int>> factors;
    for (long long prime = 2; prime <= n / prime; prime++) {
        if (n % prime != 0) continue;
        int exponent = 0;
        while (n % prime == 0) {
            n /= prime;
            exponent++;
        }
        factors.push_back({prime, exponent});
    }
    if (n > 1) factors.push_back({n, 1});
    return factors;
}
```

时间复杂度最坏为 $O(\sqrt n)$。

# 因数个数与因数和

由质因数分解可知，一个因数可以独立选择每个质因数的指数 $0\sim e_i$，因此正因数个数为：

$$
\tau(n)=\prod_{i=1}^{k}(e_i+1)
$$

全部正因数之和为：

$$
\sigma(n)=\prod_{i=1}^{k}\left(1+p_i+p_i^2+\cdots+p_i^{e_i}\right)
$$

例如 $72=2^3\cdot3^2$，所以它有 $(3+1)(2+1)=12$ 个正因数。

# 批量预处理最小质因数

多次分解不超过固定上界 `limit` 的整数时，可先用线性筛得到 `leastPrimeFactor`。每次取出当前数的最小质因数并除掉，单次分解只与质因数数量有关。

```cpp
// 使用最小质因数表分解value
vector<pair<int, int>> factorize(int value, const vector<int>& leastPrimeFactor) {
    vector<pair<int, int>> factors;
    while (value > 1) {
        int prime = leastPrimeFactor[value];
        int exponent = 0;
        while (value % prime == 0) {
            value /= prime;
            exponent++;
        }
        factors.push_back({prime, exponent});
    }
    return factors;
}
```

# 例题

## 2521. 数组乘积中的不同质因数数目

题目来源：[2521. 数组乘积中的不同质因数数目](https://leetcode.cn/problems/distinct-prime-factors-of-product-of-array/)

题目描述：给定正整数数组 `nums`，将所有元素相乘后，返回乘积中不同质因数的数量。

约束：$1\le nums.length\le10^4$，$2\le nums[i]\le1000$。

**示例 1：**

- 输入：`nums = [2,4,3,7,10,6]`

- 输出：`4`

- 解释：乘积中出现的质因数为 `2、3、5、7`。

**示例 2：**

- 输入：`nums = [2,4,8,16]`

- 输出：`1`

- 解释：所有元素都只有质因数 `2`。

思路：不能直接计算所有元素的乘积，因为乘积可能溢出。分别分解每个元素，并把出现过的质因数放入集合；乘积的质因数集合就是各元素质因数集合的并集。试除某个质因数后要一次除尽，避免重复处理同一个质因数。

```cpp
class Solution {
public:
    int distinctPrimeFactors(vector<int>& nums) {
        unordered_set<int> factors;
        for (int value : nums) {
            for (int prime = 2; prime <= value / prime; prime++) {
                if (value % prime != 0) continue;
                factors.insert(prime);
                while (value % prime == 0) value /= prime;
            }
            if (value > 1) factors.insert(value);
        }
        return factors.size();
    }
};
```

设数组长度为 $n$、元素最大值为 $M$，时间复杂度最坏为 $O(n\sqrt M)$，空间复杂度为 $O(k)$，其中 $k$ 是不同质因数数量。
