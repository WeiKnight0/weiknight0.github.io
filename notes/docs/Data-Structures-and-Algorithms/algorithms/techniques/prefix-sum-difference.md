---
title: Prefix Sum and Difference 前缀和与差分
date: 2025-10-7
lang: zh-cn
---

# 一维前缀和

给定长度为 $n$ 的数组 $a[0\ldots n-1]$，定义长度为 $n+1$ 的前缀和数组 $s$：

$$
s[0]=0,\qquad s[i+1]=s[i]+a[i]\quad(0\le i<n)
$$

因此，$s[i]$ 表示原数组前 $i$ 个元素之和：

$$
s[i]=\sum_{k=0}^{i-1}a[k]
$$

闭区间 $[l,r]$ 的元素和为：

$$
\sum_{k=l}^{r}a[k]=s[r+1]-s[l]
$$

```cpp
// sum[i] 表示前 i 个数的求和
vector<int> buildPrefix(const vector<int>& arr) {
    int n = arr.size();
    vector<int> sum(n + 1);
    for (int i = 0; i < n; i++) {
        sum[i + 1] = sum[i] + arr[i];
    }
    return sum;
}

int rangeSum(const vector<int>& sum, int l, int r) {
    return sum[r + 1] - sum[l]; // 返回 arr[l]~arr[r]的求和
}
```

## 560. 和为 K 的子数组

题目来源：[560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/description/)

题目描述：给你一个整数数组 `nums` 和一个整数 `k`，请统计并返回数组中和为 `k` 的连续子数组个数。

示例：

**示例 1：**

- 输入：`nums = [1,1,1], k = 2`

- 输出：`2`

**示例 2：**

- 输入：`nums = [1,2,3], k = 3`

- 输出：`2`

思路：
- 设当前前缀和为 `sum`。
- 如果存在之前的前缀和 `sum - k`，那么从那个位置之后到当前位置的子数组和就是 `k`。
- 用 `unordered_map<long long, int>` 统计每种前缀和出现过几次。
- 初始 `cnt[0] = 1`，表示空前缀，方便统计从下标 `0` 开始的子数组。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    long long k;
    cin >> n >> k;

    unordered_map<long long, int> cnt;
    cnt[0] = 1;

    long long sum = 0;
    int ans = 0;

    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        sum += x;

        if (cnt.count(sum - k)) {
            ans += cnt[sum - k];
        }
        cnt[sum]++;
    }

    cout << ans << '\n';
    return 0;
}
```

# 一维差分

给定长度为 $n$ 的数组 $a[0\ldots n-1]$，定义差分数组 $d$：

$$
d[i]=
\begin{cases}
a[0], & i=0 \\
a[i]-a[i-1], & 1\le i<n
\end{cases}
$$

实际实现额外令 $d[n]=0$，作为区间结束位置的哨兵。

原数组可以由差分数组的前缀和恢复：

$$
a[i]=\sum_{k=0}^{i}d[k]
$$

将闭区间 $[l,r]$ 中的每个元素增加 $x$，只需修改变化开始和结束的位置：

$$
d[l]\mathrel{+}=x,\qquad d[r+1]\mathrel{-}=x
$$

代码让 `diff` 的长度为 $n+1$，最后一项作为哨兵，因此 `r = n - 1` 时也不需要单独判断。

```cpp
vector<int> buildDifference(const vector<int>& arr) {
    int n = arr.size();
    vector<int> diff(n + 1); // diff[n]只是为了rangeAdd的时候r+1不会越界
    diff[0] = arr[0];
    for (int i = 1; i < n; i++) {
        diff[i] = arr[i] - arr[i - 1];
    }
    return diff;
}

void rangeAdd(vector<int>& diff, int l, int r, int x) {
    // 增加
    diff[l] += x;
    diff[r + 1] -= x;
}

vector<int> restoreArray(const vector<int>& diff) {
    // 使用前缀和恢复原数组，但是注意第一个元素不是0而是diff[0]，与标准前缀和有差别
    int n = diff.size() - 1;
    vector<int> arr(n);
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += diff[i];
        arr[i] = sum;
    }
    return arr;
}
```

## 1109. 航班预订统计

题目来源：[1109. 航班预订统计](https://leetcode.cn/problems/corporate-flight-bookings/description/)

题目描述：这里有 `n` 个航班，编号从 `1` 到 `n`。给你若干条预订记录 `bookings[i] = [first, last, seats]`，表示从 `first` 到 `last` 的每个航班都预订了 `seats` 个座位。请返回每个航班被预订的座位总数。

示例：

**示例 1：**

- 输入：`bookings = [[1,2,10],[2,3,20],[2,5,25]], n = 5`

- 输出：`[10,55,45,25,25]`

**示例 2：**

- 输入：`bookings = [[1,2,10],[2,2,15]], n = 2`

- 输出：`[10,25]`

思路：
- 题目中的航班编号从 1 开始，读入后减 1，内部统一使用 0 下标。
- 每条预订记录都是一次闭区间加法。
- 最后对差分数组求前缀和，得到每个航班的座位数。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    vector<int> diff(n + 1);
    for (int i = 0; i < m; i++) {
        int first, last, seats;
        cin >> first >> last >> seats;
        first--;
        last--;
        diff[first] += seats;
        diff[last + 1] -= seats;
    }

    int cur = 0;
    for (int i = 0; i < n; i++) {
        cur += diff[i];
        if (i > 0) {
            cout << ' ';
        }
        cout << cur;
    }
    cout << '\n';

    return 0;
}
```

# 二维前缀和

给定 $m$ 行 $n$ 列的矩阵 $a$，原矩阵从 `a[0][0]` 开始。定义 $(m+1)\times(n+1)$ 的前缀和矩阵 $s$：

$$
s[i+1][j+1]=\sum_{x=0}^{i}\sum_{y=0}^{j}a[x][y]
$$

易知 `s[0][]` 和 `s[][0]` 均为0。

由容斥原理得到递推式：

$$
s[i+1][j+1]=s[i+1][j]+s[i][j+1]-s[i][j]+a[i][j]
$$

第一行和第一列均为 0。左上角为 $(r_1,c_1)$、右下角为 $(r_2,c_2)$ 的闭区间子矩阵之和为：

$$
\sum_{i=r_1}^{r_2}\sum_{j=c_1}^{c_2}a[i][j]
=s[r_2+1][c_2+1]-s[r_2+1][c_1]-s[r_1][c_2+1]+s[r_1][c_1]
$$

```cpp
vector<vector<int>> buildPrefix2D(const vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    vector<vector<int>> sum(m + 1, vector<int>(n + 1));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            sum[i + 1][j + 1] = sum[i + 1][j] + sum[i][j + 1]
                                    - sum[i][j] + matrix[i][j];
        }
    }
    return sum;
}

int sumRegion(const vector<vector<int>>& sum,
                    int r1, int c1, int r2, int c2) {
    return sum[r2 + 1][c2 + 1] - sum[r2 + 1][c1]
           - sum[r1][c2 + 1] + sum[r1][c1];
}
```

## 304. 二维区域和检索 - 矩阵不可变

题目来源：[304. 二维区域和检索 - 矩阵不可变](https://leetcode.cn/problems/range-sum-query-2d-immutable/description/)

题目描述：给定一个二维矩阵 `matrix`，多次查询子矩阵范围内元素的总和。子矩阵由左上角 `(row1, col1)` 和右下角 `(row2, col2)` 确定。

示例：

**示例 1：**

- 输入：

  ```text
  matrix = [
    [3,0,1,4,2],
    [5,6,3,2,1],
    [1,2,0,1,5],
    [4,1,0,1,7],
    [1,0,3,0,5]
  ]
  sumRegion(2,1,4,3)
  ```

- 输出：

  ```text
  8
  ```

思路：预处理 `sum` 后，每次查询用右下角大矩形减去上方和左方，再加回被重复减去的左上方。上述 `buildPrefix2D` 和 `sumRegion` 可以直接完成预处理与查询。

# 二维差分

给定从 `a[0][0]` 开始的 $m \times n$矩阵，二维差分$(m+1) \times (n+1)$定义为：

$$
d[i][j] = a[i][j]-a[i-1][j]-a[i][j-1]+a[i-1][j-1]
$$
对于式中 $a$ 矩阵越界的数字，直接定义为0。此外 `d[m][]` 和 `d[][n]` 也均为0。

原矩阵由二维前缀和恢复：

$$
a[i][j]=\sum_{x=0}^{i}\sum_{y=0}^{j}d[x][y]
$$

如果要将`a`中的左上角为 $(r_1,c_1)$、右下角为 $(r_2,c_2)$ 的闭区间子矩阵全部增加 $x$，可以如下操作差分矩阵：

$$
\begin{aligned}
d[r_1][c_1]&\mathrel{+}=x \\
d[r_1][c_2+1]&\mathrel{-}=x \\
d[r_2+1][c_1]&\mathrel{-}=x \\
d[r_2+1][c_2+1]&\mathrel{+}=x
\end{aligned}
$$

由于差分矩阵额外补了一行和一列，因此更新右边界与下边界时无需特判。

```cpp
vector<vector<int>> buildDifference2D(
    const vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    vector<vector<int>> diff(m + 1, vector<int>(n + 1));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            diff[i][j] = matrix[i][j];
            if (i > 0) diff[i][j] -= matrix[i - 1][j];
            if (j > 0) diff[i][j] -= matrix[i][j - 1];
            if (i > 0 && j > 0) diff[i][j] += matrix[i - 1][j - 1];
        }
    }
    return diff;
}

void rectangleAdd(vector<vector<int>>& diff,
                  int r1, int c1, int r2, int c2, int x) {
    diff[r1][c1] += x;
    diff[r1][c2 + 1] -= x;
    diff[r2 + 1][c1] -= x;
    diff[r2 + 1][c2 + 1] += x;
}

vector<vector<int>> restoreMatrix(
    const vector<vector<int>>& diff) {
    int m = diff.size() - 1, n = diff[0].size() - 1;
    vector<vector<int>> matrix(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            matrix[i][j] = diff[i][j];
            if (i > 0) matrix[i][j] += matrix[i - 1][j];
            if (j > 0) matrix[i][j] += matrix[i][j - 1];
            if (i > 0 && j > 0) matrix[i][j] -= matrix[i - 1][j - 1];
        }
    }
    return matrix;
}
```

## 例题：花园积水

小明有一座位于平面直角坐标系第一象限的矩形花园，左下角位于原点。花园由 $a$ 列、$b$ 行单位方格组成，方格坐标记为 $(X,Y)$。横坐标从左向右递增，纵坐标从下向上递增，因此花园内的方格满足 $0\le X<a$、$0\le Y<b$。

花园附近有 $n$ 片矩形积水区域。每片区域由左下角方格坐标 $(x,y)$、横向长度 $l$ 和纵向宽度 $w$ 描述，覆盖满足以下条件的方格：

$$
x\le X<x+l,\qquad y\le Y<y+w
$$

积水区域可以相交，也可能有一部分位于花园外。请输出花园内部的积水图案：普通方格用 `.` 表示，积水方格用 `x` 表示。按照从最上方一行到最下方一行的顺序输出，每行从左向右排列。

输入格式：

- 第一行包含两个整数 $a$ 和 $b$，分别表示花园的列数和行数。
- 第二行包含整数 $n$，表示积水区域的数量。
- 接下来 $n$ 行，每行包含四个整数 $x$、$y$、$l$ 和 $w$。

输出格式：输出 $b$ 行，每行恰有 $a$ 个字符。

数据范围：

$$
1\le a,b\le10^3,\qquad 1\le a\times b\le2\times10^5
$$

$$
0\le n\le10^5,\qquad -10^9\le x,y\le10^9,\qquad 1\le l,w\le10^9
$$

**示例：**

- 输入：

  ```text
  8 4
  2
  1 0 2 4
  6 1 2 2
  ```

- 输出：

  ```text
  .xx.....
  .xx...xx
  .xx...xx
  .xx.....
  ```

思路：矩形坐标可能超出花园，先把横坐标范围裁剪到 $[0,a)$，纵坐标范围裁剪到 $[0,b)$。裁剪结果仍是半开矩形 $[x_1,x_2)\times[y_1,y_2)$，可直接在二维差分矩阵的四个角更新。所有矩形处理完后求二维前缀和，值大于 0 的方格被积水覆盖。

差分矩阵的行下标就是纵坐标 $Y$，所以恢复时按 $Y$ 从小到大计算；题目要求从花园顶部开始输出，因此输出时再按 $Y$ 从 $b-1$ 到 0 遍历。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int a, b, n;
    cin >> a >> b >> n;

    vector<vector<int>> diff(b + 1, vector<int>(a + 1));
    while (n--) {
        long long x, y, l, w;
        cin >> x >> y >> l >> w;

        int x1 = max(0LL, x);
        int y1 = max(0LL, y);
        int x2 = min((long long)a, x + l);
        int y2 = min((long long)b, y + w);
        if (x1 >= x2 || y1 >= y2) continue;

        diff[y1][x1]++;
        diff[y1][x2]--;
        diff[y2][x1]--;
        diff[y2][x2]++;
    }

    for (int y = 0; y < b; y++) {
        for (int x = 0; x < a; x++) {
            if (y > 0) diff[y][x] += diff[y - 1][x];
            if (x > 0) diff[y][x] += diff[y][x - 1];
            if (y > 0 && x > 0) diff[y][x] -= diff[y - 1][x - 1];
        }
    }

    for (int y = b - 1; y >= 0; y--) {
        for (int x = 0; x < a; x++) {
            cout << (diff[y][x] > 0 ? 'x' : '.');
        }
        cout << '\n';
    }
    return 0;
}
```

# 树上前缀和
树上前缀和是前缀和在树结构上的应用。对于树上前缀和，主要分为点权和边权两种情况。

## 点权前缀和
点权前缀和是指计算从根节点到某个节点的路径上所有节点的权值之和。有递推关系：
$$
sum[u] = w[u] + sum[fa[u]]
$$
其中$sum[u]$表示从根节点到节点$u$的路径上所有节点的权值之和，$w[u]$表示节点$u$的权值，$fa[u]$表示节点$u$的父节点。可以通过DFS遍历树来实现。

预处理完成后，可以在$O(1)$的时间内计算出节点$u$到节点$v$路径上所有节点的权值之和：
$$
\sum_{x \in path(u,v)} w[x] = sum[u] + sum[v] - sum[lca(u,v)] - sum[parent[lca(u,v)]]
$$
其中$lca(u,v)$表示节点$u$和节点$v$的最近公共祖先。

## 边权前缀和
边权前缀和是指计算从根节点到某个节点的路径上所有边的权值之和。可以假设边权存储在离根远的结点上，根结点处存储的权值是0。此时，节点$u$到节点$v$路径上所有边的权值之和可以表示为：
$$
\sum_{e \in path(u,v)} w[e] = sum[u] + sum[v] - 2 \times sum[lca(u,v)]
$$

## 子树和
子树和是指计算以某个节点为根的子树中所有节点的权值之和。可以通过DFS遍历树来实现。

# 树上差分
树上差分是差分数组在树结构上的应用。对于树上差分，一般分为点权和边权两种情况。点权差分可以通过树的DFS序列来实现，而边权差分则需要将边权转化为点权。
树上差分的差分数组的产生通常通过 **逐步更新权值** 的方式实现。

## 点权差分
如果要对结点$u$到结点$v$路径上的所有结点增加$x$，可以通过以下步骤实现：
1. 找到$u$和$v$的最近公共祖先$lca(u,v)$。
2. 对**差分数组**进行如下操作：
  $$
  \begin{cases}
    diff[u] \leftarrow diff[u] + x \\
    diff[v] \leftarrow diff[v] + x \\
    diff[lca(u,v)] \leftarrow diff[lca(u,v)] - x \\
    \text{if } lca(u,v) \neq \text{root}: \\
    \quad diff[parent[lca(u,v)]] \leftarrow diff[parent[lca(u,v)]] - x
  \end{cases}
  $$
3. 最后通过一次DFS计算出每个节点的最终值。

## 边权差分
边权差分可以将边权转化为点权来处理。通常，我们可以将每条边的权值加到其远离根的节点上，并令根节点的权值为0，然后使用点权差分的方法进行处理。
需要注意的是，边权差分在处理边权更新时，仍然需要找到路径的最近公共祖先，但由于公共祖先代表的边不在路径上，因此更新操作会有所不同。
假设要对路径$u$到$v$上的所有边增加$x$，可以通过以下步骤实现：
1. 找到$u$和$v$的最近公共祖先$lca(u,v)$。
2. 对**差分数组**进行如下操作：
  $$
  \begin{cases}
    diff[u] \leftarrow diff[u] + x \\
    diff[v] \leftarrow diff[v] + x \\
    diff[lca(u,v)] \leftarrow diff[lca(u,v)] - 2x \\
  \end{cases}
  $$
3. 最后通过一次DFS计算出每个节点的最终值。

模板C++

```cpp
const int N = 1e5 + 10;
const int LOG = 20; // For LCA
vector<int> g[N];  // Adjacency list for the tree
int w[N];          // Node weights
int diff[N];      // Difference array
int parent[N];     // Parent node
int sum[N];        // Final values after applying differences
int depth[N];      // Depth of each node
int fa[N][LOG]; // Ancestor table for LCA
int n;             // Number of nodes

// Preprocess for LCA
void dfs_lca(int u, int p) {
  parent[u] = p;
  depth[u] = (p == -1) ? 0 : depth[p] + 1;
  fa[u][0] = p;
  for (int i = 1; i < LOG; ++i) {
    if (fa[u][i - 1] != -1)
      fa[u][i] = fa[fa[u][i - 1]][i - 1];
    else
      fa[u][i] = -1;
  }
  for (int v : g[u]) {
    if (v != p) {
      dfs_lca(v, u);
    }
  }
}
```
```cpp
// Find LCA of u and v
int lca(int u, int v) {
  if (depth[u] < depth[v]) swap(u, v);
  for (int i = LOG - 1; i >= 0; --i) {
    if (fa[u][i] != -1 && depth[fa[u][i]] >= depth[v]) {
      u = fa[u][i];
    }
  }
  if (u == v) return u;
  for (int i = LOG - 1; i >= 0; --i) {
    if (fa[u][i] != fa[v][i]) {
      u = fa[u][i];
      v = fa[v][i];
    }
  }
  return parent[u];
}
```
```cpp
// Range update: add x to all nodes on the path from u to v
void range_update(int u, int v, int x) {
  int ancestor = lca(u, v);
  diff[u] += x;
  diff[v] += x;
  diff[ancestor] -= x;
  if (parent[ancestor] != -1) {
    diff[parent[ancestor]] -= x;
  }
}
```
```cpp
// DFS to apply the differences and compute final values
void apply_differences(int u, int p) {
  sum[u] = w[u] + diff[u];
  for (int v : g[u]) {
    if (v != p) {
      apply_differences(v, u);
      sum[u] += sum[v]; // If you want to accumulate values from children
    }
  }
}
```

# 参考

- [前缀和与差分 - OI Wiki](https://oi-wiki.org/basic/prefix-sum/)
- [灵茶山艾府：前缀和与差分](https://leetcode.cn/discuss/post/mOr1u6/)
