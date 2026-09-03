---
title: Modular Arithmetic 模运算
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Number Theory
---

若 $a$ 与 $b$ 除以正整数 $m$ 的余数相同，则称两者模 $m$ 同余：

$$
a\equiv b\pmod m
$$

同余关系可以进行加、减、乘，但除法必须转化为乘模逆元。

# 基本运算

$$
\begin{aligned}
(a+b)\bmod m&=((a\bmod m)+(b\bmod m))\bmod m \\
(a-b)\bmod m&=((a\bmod m)-(b\bmod m)+m)\bmod m \\
(ab)\bmod m&=((a\bmod m)(b\bmod m))\bmod m
\end{aligned}
$$

C++ 对负数取模的结果可能为负。需要标准的 $[0,m)$ 余数时使用：

```cpp
// 把余数规范到[0, mod)
long long normalize(long long value, long long mod) {
    return (value % mod + mod) % mod;
}
```

连续相乘时及时取模。即使最终答案取模，中间的两个 `long long` 乘积仍可能溢出；题目模数通常不超过 $10^9+7$，此时两个已取模的数相乘可放入 `long long`。

# 快速幂

把指数写成二进制。每轮令底数平方；若指数当前最低位为 $1$，就把底数乘入答案。

$$
a^{13}=a^{(1101)_2}=a^8a^4a
$$

```cpp
// 计算base^exponent mod mod
long long modPow(long long base, long long exponent, long long mod) {
    long long result = 1 % mod;
    base = normalize(base, mod);
    while (exponent > 0) {
        if (exponent & 1) result = result * base % mod;
        base = base * base % mod;
        exponent >>= 1;
    }
    return result;
}
```

时间复杂度 $O(\log exponent)$，空间复杂度 $O(1)$。

# 模逆元

若存在整数 $x$ 满足

$$
ax\equiv1\pmod m
$$

则 $x$ 是 $a$ 模 $m$ 的逆元，记作 $a^{-1}$。逆元存在当且仅当 $\gcd(a,m)=1$。

当 $m$ 是质数且 $a\not\equiv0\pmod m$ 时，费马小定理给出：

$$
a^{m-1}\equiv1\pmod m
$$

因此：

$$
a^{-1}\equiv a^{m-2}\pmod m
$$

```cpp
// mod为质数时求value的模逆元
long long inversePrimeMod(long long value, long long mod) {
    return modPow(value, mod - 2, mod);
}
```

模意义下的除法 `a / b` 应写成 `a * inverse(b) % mod`，不能先做整数除法。

模数不是质数时，仍然先检查 $\gcd(a,m)=1$，再用[扩展欧几里得算法](./gcd-and-lcm.md#扩展欧几里得算法)求出 $ax+my=1$。系数 $x$ 就是逆元，将它规范到 $[0,m)$ 即可。若最大公约数不为 `1`，逆元不存在，不能做模除法。

```cpp
// 返回value在模mod下的逆元，调用前需保证gcd(value, mod) == 1
long long inverse(long long value, long long mod) {
    long long x, y;
    extendedGcd(value, mod, x, y);
    return normalize(x, mod);
}
```

# 例题

## 1922. 统计好数字的数目

题目来源：[1922. 统计好数字的数目](https://leetcode.cn/problems/count-good-numbers/)

题目描述：长度为 `n` 的数字字符串可以包含前导零。偶数下标位置只能放偶数数字，奇数下标位置只能放一位质数。求满足条件的字符串数量，答案对 $10^9+7$ 取模。

约束：$1\le n\le10^{15}$。

**示例 1：**

- 输入：`n = 1`

- 输出：`5`

- 解释：唯一的位置下标为 `0`，可填 `0、2、4、6、8`。

**示例 2：**

- 输入：`n = 4`

- 输出：`400`

- 解释：两个偶数下标各有 `5` 种选择，两个奇数下标各有 `4` 种选择，共有 $5^2\times4^2=400$ 种。

思路：偶数下标共有 $\lceil n/2\rceil$ 个，每个位置有 `0、2、4、6、8` 五种选择；奇数下标共有 $\lfloor n/2\rfloor$ 个，每个位置有 `2、3、5、7` 四种选择。各位置独立，根据乘法原理，答案为：

$$
5^{\lceil n/2\rceil}4^{\lfloor n/2\rfloor}
$$

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
    int countGoodNumbers(long long n) {
        return power(5, (n + 1) / 2) * power(4, n / 2) % MOD;
    }
};
```

时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。
