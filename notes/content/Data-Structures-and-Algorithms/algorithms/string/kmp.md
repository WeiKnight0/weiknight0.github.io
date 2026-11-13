---
title: KMP 字符串匹配
date: 2025-10-23
lang: zh-cn
---

# KMP 字符串匹配

给定主串 $T$ 和模式串 $P$，模式匹配要查找 $P$ 在 $T$ 中第一次出现的位置。

朴素匹配在失配后将主串起点后移一位，并从模式串头部重新比较，最坏时间复杂度为 $O(nm)$。KMP 利用已匹配部分的前后缀关系移动模式串，主串指针不回退。

## 相等前后缀

串的前缀必须从第一个字符开始，后缀必须在最后一个字符结束。计算相等前后缀时不包含字符串本身。

假设在 $P[j]$ 处失配，已经匹配了 $P[0\ldots j-1]$。若这段已匹配字符的最长相等真前缀和真后缀长度为 $k$，则可以将模式串移动到 $P[k]$ 继续比较。

## next 数组

这里采用 `next[0] = -1` 的定义：当 $P[j]$ 失配时，下一次将 $P[next[j]]$ 与当前主串字符比较。`next[j]` 等于 $P[0\ldots j-1]$ 的最长相等真前后缀长度。

例如：

```text
P       = A  B  A  B  C  A  B  A  B
j       = 0  1  2  3  4  5  6  7  8
next[j] = -1 0  0  1  2  0  1  2  3
```

`next` 数组本身也使用前面已经计算的前后缀信息，因此可以在 $O(m)$ 时间内构造。

```cpp
vector<int> computeNext(const string &P) {
    int length = P.size();
    vector<int> next(length);
    next[0] = -1; // 初始化
    int j = 0, k = -1; // j是当前计算的位置，k是上一个匹配成功的位置
    while (j < length - 1) {
        if(k == -1 || P[j] == P[k]) {
            // 如果找不到匹配的
            // 或者继上一次匹配后当前字符也匹配成功
            j++;
            k++;
            next[j] = k; // 更新next数组
        } else {
            k = next[k]; // 回溯，回退到上一个匹配的地方
        }
    }
    return next;
}
```

## KMP 匹配

```cpp
int KMP(const string &T, const string &P) {
    vector<int> next = computeNext(P);
    int i = 0; // T的下标
    int j = 0; // P的下标
    int tLength = T.size();
    int pLength = P.size();
    while (i < tLength && j < pLength) {
        if (j == -1 || T[i] == P[j]) {
            // j==-1表示P已经回溯到最前面了，或者当前字符匹配成功
            i++;
            j++;
        } else {
            j = next[j]; // 回溯P的位置
        }
    }
    if (j == pLength) {
        return i - j; // 找到匹配，返回起始位置
    } else {
        return -1; // 未找到匹配
    }
}
```

主串指针 $i$ 最多向右移动 $n$ 次，模式串的预处理需要 $O(m)$ 时间，因此总时间复杂度为 $O(n+m)$，额外空间复杂度为 $O(m)$。

## nextval

若失配后的新比较字符 $P[next[j]]$ 与刚刚失配的 $P[j]$ 相同，这次比较必然再次失败。`nextval` 将这类位置继续回退到 `nextval[next[j]]`，避免无效比较：

$$
nextval[j]=
\begin{cases}
next[j], & next[j]=-1 \text{ or } P[j]\ne P[next[j]] \\
nextval[next[j]], & P[j]=P[next[j]]
\end{cases}
$$

`nextval` 只减少字符比较次数，不改变 KMP 的渐进复杂度。

仍以模式串 `ABABCABAB` 为例，其 `next` 与 `nextval` 分别为：

```text
P          = A  B  A  B  C  A  B  A  B
下标 j      = 0  1  2  3  4  5  6  7  8
next[j]    = -1 0  0  1  2  0  1  2  3
nextval[j] = -1 0 -1 0  2 -1 0 -1 0
```

例如 `j=3` 时，`next[3]=1`，但 $P[3]=P[1]=\texttt{B}$。若 `P[3]` 与主串当前字符失配，回退到 `P[1]` 后仍会拿同一个 `B` 与同一主串字符比较，结果必然再次失配，所以直接令 `nextval[3]=nextval[1]=0`。同理，`j=2`、`5`、`7` 都跳到 `-1`；`j=4` 的 `C` 与 $P[2]=\texttt{A}$ 不同，不能跳过，故保留 `nextval[4]=2`。

构造 `nextval` 时复用 `next`：

```cpp
vector<int> computeNextVal(const string &pattern) {
    vector<int> next = computeNext(pattern);
    vector<int> nextval(pattern.size());
    nextval[0] = -1;
    for (int j = 1; j < pattern.size(); ++j) {
        nextval[j] = pattern[j] == pattern[next[j]]
            ? nextval[next[j]]
            : next[j];
    }
    return nextval;
}
```
