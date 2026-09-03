---
title: Probability and Expectation 概率与期望
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Probability
  - Expectation
---

# 概率

随机试验的全部可能结果组成样本空间 $\Omega$，其中一部分结果组成事件。若有限样本空间中的基本结果等可能，则事件 $A$ 的概率为：

$$
P(A)=\frac{|A|}{|\Omega|}
$$

## 基本公式

对任意事件 $A,B$：

$$
P(\overline A)=1-P(A)
$$

$$
P(A\cup B)=P(A)+P(B)-P(A\cap B)
$$

在 $P(B)>0$ 时，已知 $B$ 发生后 $A$ 发生的条件概率为：

$$
P(A\mid B)=\frac{P(A\cap B)}{P(B)}
$$

乘法公式为：

$$
P(A\cap B)=P(B)P(A\mid B)
$$

若 $P(A\cap B)=P(A)P(B)$，则 $A,B$ 相互独立。独立与互斥不同：两个概率非零的互斥事件不可能独立。

## 全概率公式与贝叶斯公式

若事件 $B_1,B_2,\ldots,B_n$ 两两互斥且覆盖样本空间，则：

$$
P(A)=\sum_{i=1}^{n}P(B_i)P(A\mid B_i)
$$

观察到结果 $A$ 后，原因 $B_i$ 的后验概率为：

$$
P(B_i\mid A)=
\frac{P(B_i)P(A\mid B_i)}
{\sum_{j=1}^{n}P(B_j)P(A\mid B_j)}
$$

## 独立重复试验

单次成功概率为 $p$，独立试验 $n$ 次，恰好成功 $k$ 次的概率服从二项分布：

$$
P(X=k)=\binom nkp^k(1-p)^{n-k}
$$

“至少一次成功”通常用补集计算：

$$
P(X\ge1)=1-P(X=0)=1-(1-p)^n
$$

## 概率动态规划

概率 DP 适用于“经过固定步数后，到达某状态的概率”。状态的值不是方案数，而是所有能到达该状态的路径概率之和。

设 `dp[u]` 表示当前时刻处于状态 `u` 的概率，从 `u` 转移到 `v` 的概率为 $p(u,v)$，则：

$$
next[v]=\sum_u dp[u]p(u,v)
$$

建模时按以下顺序：

1. 确定状态表示“已完成多少步”还是“还剩多少步”。
2. 初始状态的概率为 `1`，其他状态为 `0`。
3. 把当前概率按各选择的概率分配到下一层。多条路径到达同一状态时使用加法合并。
4. 根据题意读取单个终止状态，或求所有合法终止状态的概率和。

如果每一层只依赖上一层，用 `current` 和 `next` 两个数组滚动即可。转移到非法状态的概率是否丢弃，要由题意决定；例如骑士离开棋盘后停止，这部分概率不能再转移回棋盘。

# 数学期望

离散随机变量 $X$ 取值为 $x_i$，对应概率为 $p_i$，其数学期望为：

$$
E[X]=\sum_i x_ip_i
$$

期望是大量重复试验中结果的平均值，不要求它本身是一次试验可能出现的结果。例如公平六面骰子的点数期望是 $3.5$。

## 期望的线性性质

无论随机变量是否独立，都有：

$$
E[X+Y]=E[X]+E[Y]
$$

更一般地：

$$
E\left[\sum_{i=1}^{n}X_i\right]=\sum_{i=1}^{n}E[X_i]
$$

计数问题中，可以令指示变量 $I_i$ 表示第 $i$ 个事件是否发生：发生时为 `1`，否则为 `0`。由于 $E[I_i]=P(I_i=1)$，总发生次数的期望就是各事件发生概率之和。

例如长度为 $n$ 的随机排列中，对每对 $i<j$ 定义指示变量 $I_{i,j}$，当这两个元素构成逆序对时取 `1`。两个元素的相对次序等概率，所以 $E[I_{i,j}]=1/2$。一共有 $\binom n2$ 对元素，逆序对数的期望为 $n(n-1)/4$。这些指示变量并不独立，但不影响期望的线性。

## 条件期望

根据第一次选择分类，可以建立期望递推：

$$
E[X]=\sum_i P(B_i)E[X\mid B_i]
$$

若 `dp[s]` 表示从状态 `s` 到终止状态还需要的期望步数，每走一步都会增加 `1`：

$$
dp[s]=1+\sum_t P(s\to t)dp[t]
$$

当转移可能留在原状态时，等式右边会包含 `dp[s]`，必须移项求解，不能直接按普通 DAG 动态规划计算。

## 几何分布

每次独立试验成功概率为 $p$，直到第一次成功所需试验次数 $X$ 满足：

$$
P(X=k)=(1-p)^{k-1}p
$$

其期望为：

$$
E[X]=\frac1p
$$

若令 $E$ 表示还需试验的次数，根据第一次试验分类：

$$
E=1+(1-p)E
$$

移项得 $E=1/p$。式子中的 `1` 是已经进行的这一次试验，不能遗漏。

# 例题

## 688. 骑士在棋盘上的概率

题目来源：[688. 骑士在棋盘上的概率](https://leetcode.cn/problems/knight-probability-in-chessboard/)

题目描述：在 `n × n` 的国际象棋棋盘上，行列下标均从 `0` 开始。骑士从 `(row,column)` 出发，尝试移动 `k` 次。每次都从八种走法中等概率选择一种，即使该走法会离开棋盘；一旦离开就停止移动。求完成移动后仍在棋盘上的概率。

约束：$1\le n\le25$，$0\le k\le100$，起点一定在棋盘内。

**示例 1：**

- 输入：`n = 3, k = 2, row = 0, column = 0`

- 输出：`0.0625`

- 解释：第一步只有 `(1,2)` 和 `(2,1)` 两个落点仍在棋盘内；从这两个位置出发，第二步也各有两种合法落点，所以概率为 $4/8^2=0.0625$。

**示例 2：**

- 输入：`n = 1, k = 0, row = 0, column = 0`

- 输出：`1.0`

思路：令 `current[r][c]` 表示完成当前步数后位于 `(r,c)` 的概率。初始位置概率为 `1`。每次从一个格子向八个方向各分配当前概率的 $1/8$，只把仍落在棋盘内的转移加入下一层，越界部分自然丢失。完成 `k` 轮后，棋盘上所有状态的概率之和就是答案。

```cpp
class Solution {
public:
    double knightProbability(int n, int k, int row, int column) {
        constexpr int directions[8][2] = {
            {1, 2}, {1, -2}, {-1, 2}, {-1, -2},
            {2, 1}, {2, -1}, {-2, 1}, {-2, -1}
        };
        vector<vector<double>> current(n, vector<double>(n));
        current[row][column] = 1.0;

        while (k-- > 0) {
            vector<vector<double>> next(n, vector<double>(n));
            for (int r = 0; r < n; r++) {
                for (int c = 0; c < n; c++) {
                    for (auto [dr, dc] : directions) {
                        int nr = r + dr, nc = c + dc;
                        if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                        next[nr][nc] += current[r][c] / 8.0;
                    }
                }
            }
            current.swap(next);
        }

        return accumulate(current.begin(), current.end(), 0.0,
            [](double total, const vector<double>& line) {
                return total + accumulate(line.begin(), line.end(), 0.0);
            });
    }
};
```

时间复杂度 $O(kn^2)$，空间复杂度 $O(n^2)$。

## 收集全部卡片的期望次数

题目描述：共有 `n` 种卡片。每次独立且等概率地获得其中一种，已经获得过的卡片仍可能重复出现。求收集全部 `n` 种卡片所需抽取次数的期望。

约束：$1\le n\le10^7$。

**示例 1：**

- 输入：`n = 1`

- 输出：`1.0`

**示例 2：**

- 输入：`n = 2`

- 输出：`3.0`

- 解释：第一张卡片一定是新种类，期望抽取 `1` 次；只剩一种未收集时，每次抽中它的概率为 $1/2$，期望再抽 `2` 次。

思路：已收集 `i` 种时，下一次抽到新种类的概率为 $(n-i)/n$。这一阶段需要的抽取次数服从几何分布，期望为 $n/(n-i)$。根据期望的线性，各阶段期望相加：

$$
E=n\left(1+\frac12+\frac13+\cdots+\frac1n\right)
$$

```cpp
double expectedDraws(int n) {
    double answer = 0;
    for (int missing = n; missing >= 1; missing--) {
        answer += static_cast<double>(n) / missing;
    }
    return answer;
}
```

时间复杂度 $O(n)$，空间复杂度 $O(1)$。
