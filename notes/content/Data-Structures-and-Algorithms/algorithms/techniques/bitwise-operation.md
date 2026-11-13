---
title: Bitwise Operation 位运算
date: 2025-07-26
lang: zh-cn
wide: true
---

原文：[分享｜从集合论到位运算，常见位运算技巧分类总结！by灵茶山艾府 https://leetcode.cn/discuss/post/3571304/cong-ji-he-lun-dao-wei-yun-suan-chang-ji-enve/](https://leetcode.cn/discuss/post/3571304/cong-ji-he-lun-dao-wei-yun-suan-chang-ji-enve/)

集合可以用二进制表示，二进制从低到高第 $i$ 位为 $1$ 表示 $i$ 在集合中，为 $0$ 表示 $i$ 不在集合中。例如集合 $\{0,2,3\}$ 可以用二进制数 $1101_{(2)}$  表示；反过来，二进制数 $1101_{(2)}$ 就对应着集合 $\{0,2,3\}$。

正式地说，包含非负整数的集合 $S$ 可以用如下方式「压缩」成一个数字：
$$
f(S) = \sum_{i \in S} 2^i
$$
例如集合 $\{0, 2, 3\}$ 可以压缩成 $2^0 + 2^2 + 2^3 = 13$，也就是二进制数 $1101_{(2)}$。

# 集合与集合

| 术语       | 集合运算                           | 位运算                           |
| ---------- | ---------------------------------- | -------------------------------- |
| 交集       | $A \cap B$                         | $a \& b$                         |
| 并集       | $A \cup B$                         | $a \mid b$                       |
| 对称差     | $A \triangle B$                    | $a \oplus b$                     |
| 差         | $A \setminus B$                    | $a \& \sim b$                    |
| 差（子集） | $A \setminus B$（$B \subseteq A$） | $a \& \sim b \quad\text{or}\quad a - b$                          |
| 包含于     | $A \subseteq B$                    | $a \& b == a$ 或 $a \mid b == b$ |

# 集合与元素

通常会用到移位运算。

| 术语                 | 集合运算               | 位运算                     | 集合示例                          | 位运算示例                          |
|----------------------|------------------------|----------------------------|-----------------------------------|-------------------------------------|
| 空集                 | $\emptyset$          | $0$                      |                                   |                                     |
| 单元素集合           | $\{i\}$              | $1 << i$                 | $\{2\}$                         | $1 << 2 = 100$                    |
| 全集                 | $U$                  | $(1 << n) - 1$           | $\{0,1,2\}$                     | $(1 << 3) - 1 = 111$              |
| 补集                 | $\complement_U A$    | $((1 << n) - 1) \& \sim a$ | $U = \{0,1,2\}, \complement_U \{1\} = \{0,2\}$ |                                     |
| 属于                 | $i \in S$            | $(s >> i) \& 1 == 1$     | $2 \in \{1,2\}$                 | $(110 >> 2) \& 1 == 1$           |
| 不属于               | $i \notin S$         | $(s >> i) \& 1 == 0$     | $1 \notin \{0,2\}$              | $(101 >> 1) \& 1 == 0$           |
| 添加元素             | $S \cup \{i\}$       | $s \mid (1 << i)$        | $\{0,3\} \cup \{2\} = \{0,2,3\}$ | $1001 \mid (1 << 2) = 1101$       |
| 删除元素             | $S \setminus \{i\}$  | $s \& \sim (1 << i)$     | $\{0,2,3\} \setminus \{2\} = \{0,3\}$ | $1101 \& \sim (1 << 2) = 1001$    |
| 删除元素（一定在集合中） | $S \setminus \{i\}$  | $s \oplus (1 << i)$      | $\{0,2,3\} \setminus \{2\} = \{0,3\}$ | $1101 \oplus (1 << 2) = 1001$    |
|删除最小元素|          |                        | $s \& (s - 1)$           |  |

常用的库函数如下：
| 术语         | Python               | Java                          | C++                  | Go                  |
|--------------|----------------------|-------------------------------|----------------------|---------------------|
| 集合大小     | `s.bit_count()`      | `Integer.bitCount(s)`         | `__builtin_popcount(s)` | `bits.OnesCount(s)` |
| 二进制长度   | `s.bit_length()`     | `32 - Integer.numberOfLeadingZeros(s)` | `__lg(s) + 1`       | `bits.Len(s)`       |
| 集合最大元素 | `s.bit_length() - 1` | `31 - Integer.numberOfLeadingZeros(s)` | `__lg(s)`           | `bits.Len(s) - 1`   |
| 集合最小元素 | `(s & -s).bit_length() - 1` | `Integer.numberOfTrailingZeros(s)` | `__builtin_ctz(s)`  | `bits.TrailingZeros(s)` |

- `__builtin_popcount(s)`：返回 `s` 的二进制表示中 `1` 的个数，即集合中元素的数量。
- `__lg(s)`：返回 $\lfloor \log_2 s \rfloor$；对非零 `s`，这正是最高位 `1` 的下标。
- `__builtin_ctz(s)`：返回 `s` 的二进制末尾连续 `0` 的个数；对非零 `s`，这正是最低位 `1` 的下标。

`__lg(0)` 和 `__builtin_ctz(0)` 都没有定义，调用前必须保证 `s != 0`。

对于 C++ 的 `long long`，需使用相应的 `__builtin_popcountll` 等函数，即函数名后缀添加 `ll`（两个小写字母 L）。`__lg` 支持 `long long`。

# 遍历集合

```cpp
for (int i = 0; i < n; i++) {
    if ((s >> i) & 1) { // i 在 s 中
        // 处理 i 的逻辑
    }
}
```

# 枚举非空子集

```cpp
for (int sub = s; sub; sub = (sub - 1) & s) {
    // 处理 sub 的逻辑
}
```

为什么是`sub = (sub - 1) & s`？

相当于“压缩版”二进制减法。只对`s`中的非零数字进行减法。如`101001->101000->100001`

# 枚举所有子集，包括空集

```cpp
int sub = s;
do {
    // 处理 sub 的逻辑
    sub = (sub - 1) & s;
} while (sub != s); // 当sub==0后，减1得到-1，即为11111...，此时有sub&s==s
```

```python
sub = s
while True:
    # 处理 sub 的逻辑
    if sub == 0:
        break
    sub = (sub - 1) & s
```

# 枚举超集

如果 $T$ 是 $S$ 的子集，那么称 $S$ 是 $T$ 的**超集**。

```cpp
// 假设 T 的最大大小是n
for (int s = t; s < (1 << n); s = (s + 1) | t) {
    // 处理 s 的逻辑
}
```

# 常见例题

以下四题从[灵茶山艾府的位运算题单](https://leetcode.cn/discuss/post/3580371/fen-xiang-gun-ti-dan-wei-yun-suan-ji-chu-nth4/)中筛选。

## 191. 位 1 的个数

题目来源：[191. 位 1 的个数](https://leetcode.cn/problems/number-of-1-bits/)

题目描述：统计一个无符号整数的二进制表示中有多少个 `1`。

**示例 1：**

- 输入：`n = 11`，二进制为 `1011`

- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

思路：`n - 1` 会把 `n` 最低位的 `1` 变成 `0`，其后的 `0` 变成 `1`；再与原数按位与，恰好只删除最低位的一个 `1`。循环次数等于 `1` 的个数。

复杂度：时间 $O(\operatorname{popcount}(n))$，空间 $O(1)$。

```cpp
class Solution {
public:
    int hammingWeight(uint32_t n) {
        int count = 0;
        while (n != 0) {
            n &= n - 1;
            count++;
        }
        return count;
    }
};
```

</details>

## 136. 只出现一次的数字

题目来源：[136. 只出现一次的数字](https://leetcode.cn/problems/single-number/)

题目描述：数组中除一个数只出现一次外，其余数字都恰好出现两次，找出这个数。

**示例 1：**

- 输入：`nums = [4,1,2,1,2]`

- 输出：`4`

<details class="note-solution">
<summary>查看解析</summary>

思路：异或满足 `x ^ x = 0`、`x ^ 0 = x`，且满足交换律、结合律。把所有元素异或，成对数字抵消，剩下的就是答案。

复杂度：时间 $O(n)$，空间 $O(1)$。

```cpp
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int answer = 0;
        for (int number : nums) {
            answer ^= number;
        }
        return answer;
    }
};
```

</details>

## 260. 只出现一次的数字 III

题目来源：[260. 只出现一次的数字 III](https://leetcode.cn/problems/single-number-iii/)

题目描述：数组中恰有两个数字各出现一次，其余数字各出现两次，找出这两个只出现一次的数字。

**示例 1：**

- 输入：`nums = [1,2,1,3,2,5]`

- 输出：`[3,5]`，顺序不限

<details class="note-solution">
<summary>查看解析</summary>

思路：先异或所有数，成对数字消失，得到 `xorSum = a ^ b`。`xorSum` 的任意一个 `1` 位都表示 `a` 与 `b` 在该位不同；取 `lowbit = xorSum & -xorSum` 后，按这一位是否为 `1` 分成两组。相同数字必在同一组，`a`、`b` 则分属两组，分别异或即可。

复杂度：时间 $O(n)$，空间 $O(1)$。

```cpp
class Solution {
public:
    vector<int> singleNumber(vector<int>& nums) {
        int xorSum = 0;
        for (int number : nums) {
            xorSum ^= number;
        }

        const unsigned lowbit = static_cast<unsigned>(xorSum) & -static_cast<unsigned>(xorSum);
        int first = 0;
        int second = 0;
        for (int number : nums) {
            if ((static_cast<unsigned>(number) & lowbit) != 0) {
                first ^= number;
            } else {
                second ^= number;
            }
        }
        return {first, second};
    }
};
```

</details>

## 1863. 找出所有子集的异或总和再求和

题目来源：[1863. 找出所有子集的异或总和再求和](https://leetcode.cn/problems/sum-of-all-subset-xor-totals/)

题目描述：对数组的每个子集计算元素异或和，再把所有子集的异或和相加。

**示例 1：**

- 输入：`nums = [1,3]`

- 输出：`6`

- 解释：子集为 `[]`、`[1]`、`[3]`、`[1,3]`，异或和分别为 `0`、`1`、`3`、`2`。

<details class="note-solution">
<summary>查看解析</summary>

思路：每个位置只有“选”与“不选”两种决策。深度优先搜索记录当前异或值；走到数组末尾时，当前值就是一个子集的异或和。它与前面的子集掩码枚举等价，但递归更直接地对应选择过程。

复杂度：时间 $O(n2^n)$，递归栈空间 $O(n)$。

```cpp
class Solution {
public:
    int subsetXORSum(vector<int>& nums) {
        return dfs(nums, 0, 0);
    }

private:
    int dfs(const vector<int>& nums, int index, int xorSum) {
        if (index == nums.size()) {
            return xorSum;
        }
        return dfs(nums, index + 1, xorSum)
            + dfs(nums, index + 1, xorSum ^ nums[index]);
    }
};
```

</details>
