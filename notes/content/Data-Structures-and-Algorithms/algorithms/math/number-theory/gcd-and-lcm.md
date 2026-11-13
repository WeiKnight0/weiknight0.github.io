---
title: GCD and LCM 最大公约数与最小公倍数
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Number Theory
---

整数 $a,b$ 的最大公约数记作 $\gcd(a,b)$，是能同时整除两数的最大正整数；最小公倍数记作 $\operatorname{lcm}(a,b)$，是能同时被两数整除的最小正整数。

# 欧几里得算法

设 $a=qb+r$，则 $a$、$b$ 的公因数与 $b$、$r$ 的公因数完全相同，因此：

$$
\gcd(a,b)=\gcd(b,a\bmod b)
$$

不断取余，直到余数为 $0$。

```cpp
// 求最大公约数
long long gcd(long long a, long long b) {
    while (b != 0) {
        long long remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}
```

时间复杂度 $O(\log\min(a,b))$，空间复杂度 $O(1)$。C++17 可直接使用 `<numeric>` 中的 `std::gcd` 和 `std::lcm`。

# 最小公倍数

当 $a,b>0$ 时：

$$
\gcd(a,b)\cdot\operatorname{lcm}(a,b)=a\cdot b
$$

实现时先除后乘，降低中间乘积溢出的风险：

```cpp
// 求最小公倍数
long long lcm(long long a, long long b) {
    return a / std::gcd(a, b) * b;
}
```

# 多个数的 GCD 与 LCM

最大公约数和最小公倍数都满足结合律，可以从左到右归并：

$$
\gcd(a,b,c)=\gcd(\gcd(a,b),c)
$$

若数组全部元素除以整体 GCD，得到的数组比例不变且所有元素没有大于 $1$ 的公共因数。这常用于把整数比例化为最简形式。

```cpp
long long arrayGcd(const vector<long long>& values) {
    return accumulate(values.begin(), values.end(), 0LL, [](long long result, long long value) {
        return std::gcd(result, value);
    });
}
```

# 裴蜀定理

对不全为 $0$ 的整数 $a,b$，所有形如 $ax+by$ 的整数中，最小正数是 $\gcd(a,b)$。方程

$$
ax+by=c
$$

存在整数解，当且仅当 $\gcd(a,b)\mid c$。

这一定理常用于判断“每次增加或减少固定步长，能否到达目标”的问题。若只需判断可达性，不必求出具体的 $x,y$。

# 扩展欧几里得算法

扩展欧几里得算法在求 $gcd(a,b)$ 的同时，求出一组整数 $x,y$，使得：

$$
ax+by=\gcd(a,b)
$$

递归到 `b == 0` 时有 $a\times1+0\times0=a$。由下一层的

$$
bx'+(a\bmod b)y'=\gcd(a,b)
$$

代入 $a\bmod b=a-\lfloor a/b\rfloor b$，得到当前层系数 $x=y'$、$y=x'-\lfloor a/b\rfloor y'$。

```cpp
long long extendedGcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    long long nextX, nextY;
    long long gcd = extendedGcd(b, a % b, nextX, nextY);
    x = nextY;
    y = nextX - a / b * nextY;
    return gcd;
}
```

方程 $ax+by=c$ 有整数解当且仅当 $c$ 能被 $g=\gcd(a,b)$ 整除。若 `extendedGcd` 求得 $ax_0+by_0=g$，则一组特解为 $x=x_0(c/g)$、$y=y_0(c/g)$。

# 例题

## 365. 水壶问题

题目来源：[365. 水壶问题](https://leetcode.cn/problems/water-and-jug-problem/)

题目描述：有容量分别为 `x` 和 `y` 升的两个水壶，水源无限。每次可以装满任意一壶、倒空任意一壶，或把一壶倒入另一壶直到前者为空或后者装满。判断能否让一个或两个水壶中的水量之和恰好为 `target` 升。

约束：$0\le x,y,target\le10^6$。

**示例 1：**

- 输入：`x = 3, y = 5, target = 4`

- 输出：`true`

- 解释：先装满 `5` 升壶并向 `3` 升壶倒水，`5` 升壶剩余 `2` 升。倒空 `3` 升壶，将这 `2` 升倒入其中，再装满 `5` 升壶并向 `3` 升壶倒水，最后 `5` 升壶中剩余 `4` 升。

**示例 2：**

- 输入：`x = 2, y = 6, target = 5`

- 输出：`false`

- 解释：$\gcd(2,6)=2$，所有可量出的整数水量都是 `2` 的倍数，无法得到 `5` 升。

<details class="note-solution">
<summary>查看解析</summary>

思路：装满或倒空水壶后，能够得到的水量变化都可写为 $ax+by$，其中 $a,b$ 为整数。由裴蜀定理，能够量出的水量必须是 $\gcd(x,y)$ 的倍数；反过来，只要目标是该最大公约数的倍数，就能通过反复倒水得到。还必须先检查 `target <= x + y`，因为两个水壶无法同时容纳更多的水。

```cpp
class Solution {
public:
    bool canMeasureWater(int x, int y, int target) {
        if (target > x + y) return false;
        if (target == 0) return true;
        return target % std::gcd(x, y) == 0;
    }
};
```

时间复杂度 $O(\log\min(x,y))$，空间复杂度 $O(1)$。

</details>
