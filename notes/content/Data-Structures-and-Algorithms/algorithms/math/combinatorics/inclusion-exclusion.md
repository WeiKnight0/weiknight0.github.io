---
title: Inclusion–Exclusion Principle 容斥原理
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Combinatorics
---

多个集合存在交集时，直接相加会重复计数。两个集合满足：

$$
|A\cup B|=|A|+|B|-|A\cap B|
$$

三个集合满足：

$$
|A\cup B\cup C|
=|A|+|B|+|C|
-|A\cap B|-|A\cap C|-|B\cap C|
+|A\cap B\cap C|
$$

一般地，先加所有单个集合，减去两两交集，加回三者交集，依次交替符号。

例如在 `1～10` 中，能被 `2` 整除的数有 `5` 个，能被 `3` 整除的数有 `3` 个，其中 `6` 同时属于两者。能被 `2` 或 `3` 整除的数共有 $5+3-1=7$ 个，而不是 `8` 个。

# 子集形式

对 $n$ 个集合 $A_1,A_2,\ldots,A_n$：

$$
\left|\bigcup_{i=1}^{n}A_i\right|
=\sum_{\varnothing\ne S\subseteq\{1,2,\ldots,n\}}
(-1)^{|S|+1}\left|\bigcap_{i\in S}A_i\right|
$$

当集合数量较少时，可用位掩码枚举非空子集。奇数个集合的交集相加，偶数个集合的交集相减。

```cpp
long long inclusionExclusion(const vector<long long>& divisors, long long upper) {
    long long answer = 0;
    for (uint64_t mask = 1; mask < (1ULL << divisors.size()); mask++) {
        long long multiple = 1;
        for (size_t i = 0; i < divisors.size(); i++) {
            if (((mask >> i) & 1) == 0) continue;
            long long factor = divisors[i] / std::gcd(multiple, divisors[i]);
            if (multiple > upper / factor) {
                multiple = upper + 1;
                break;
            }
            multiple *= factor;
        }
        if (multiple > upper) continue;
        if (__builtin_popcountll(mask) & 1) answer += upper / multiple;
        else answer -= upper / multiple;
    }
    return answer;
}
```

枚举 $n$ 个集合的所有非空子集需要 $O(n2^n)$ 时间，只适合集合数量较少的情况。代码在计算最小公倍数前先判断结果是否超过 `upper`，避免无意义的大数和乘法溢出。

# 统计可整除的数

在 $[1,x]$ 中，能被正整数 $d$ 整除的数有 $\lfloor x/d\rfloor$ 个。若要同时被 $a,b$ 整除，就必须被 $\operatorname{lcm}(a,b)$ 整除。

因此能被 `a、b、c` 中至少一个整除的整数数量为：

$$
\begin{aligned}
count(x)={}&\left\lfloor\frac{x}{a}\right\rfloor
+\left\lfloor\frac{x}{b}\right\rfloor
+\left\lfloor\frac{x}{c}\right\rfloor \\
&-\left\lfloor\frac{x}{\operatorname{lcm}(a,b)}\right\rfloor
-\left\lfloor\frac{x}{\operatorname{lcm}(a,c)}\right\rfloor
-\left\lfloor\frac{x}{\operatorname{lcm}(b,c)}\right\rfloor \\
&+\left\lfloor\frac{x}{\operatorname{lcm}(a,b,c)}\right\rfloor
\end{aligned}
$$

# 例题

## 1201. 丑数 III

题目来源：[1201. 丑数 III](https://leetcode.cn/problems/ugly-number-iii/)

题目描述：正整数如果能被 `a、b、c` 中至少一个整除，就称为丑数。给定 `n、a、b、c`，求从小到大排列后的第 `n` 个丑数。

约束：$1\le n,a,b,c\le10^9$，答案不超过 $2\times10^9$。

**示例 1：**

- 输入：`n = 3, a = 2, b = 3, c = 5`

- 输出：`4`

- 解释：前三个丑数是 `2、3、4`。

**示例 2：**

- 输入：`n = 4, a = 2, b = 3, c = 4`

- 输出：`6`

- 解释：前四个丑数是 `2、3、4、6`。

<details class="note-solution">
<summary>查看解析</summary>

思路：利用上面的容斥公式计算 `count(x)`，表示 `[1,x]` 中有多少个丑数。`count(x)` 随 `x` 单调不减，因此二分最小的 `x`，使 `count(x) >= n`。能同时被两个数整除的数按最小公倍数统计，三个集合的交集则使用 `lcm(a,b,c)`。

```cpp
class Solution {
public:
    int nthUglyNumber(int n, int a, int b, int c) {
        long long ab = std::lcm(a, b);
        long long ac = std::lcm(a, c);
        long long bc = std::lcm(b, c);
        long long abc = std::lcm(ab, static_cast<long long>(c));

        auto count = [&](long long upper) {
            return upper / a + upper / b + upper / c
                - upper / ab - upper / ac - upper / bc + upper / abc;
        };

        long long left = 1, right = 2'000'000'000;
        while (left < right) {
            long long middle = left + (right - left) / 2;
            if (count(middle) >= n) right = middle;
            else left = middle + 1;
        }
        return left;
    }
};
```

时间复杂度 $O(\log 2\times10^9)$，空间复杂度 $O(1)$。

</details>

# 常见错误

- 集合并不互斥却直接相加。
- 交集使用乘积而不是最小公倍数。
- 计算最小公倍数时先乘后除导致溢出。
- 枚举子集时把符号写反：交集集合数为奇数时应加，偶数时应减。
