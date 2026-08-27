---
title: Greedy 贪心算法
date: 2026-07-14
description: 从排序配对、区间选择、区间合并到区间覆盖，理解贪心算法的常见决策方式与正确性证明。
lang: zh-cn
tags:
  - DSA
  - Greedy
  - Sorting
  - Interval
---

# Greedy 贪心算法

贪心算法在每一步都做当前看来最优的选择，并希望这些局部选择能够组成全局最优解。它通常不能靠状态枚举来兜底，所以关键不在于“想到一个看起来合理的规则”，而在于确认这个规则不会错过最优解。

常见信号包括：答案与原顺序无关时先排序；需要尽量选更多对象时优先留下更大的后续空间；区间问题常按端点排序；扫描数组时维护当前可达范围。

> 贪心不适合所有最优化问题。若一个局部选择会不可逆地限制后续选择，且无法证明它总能出现在某个最优解中，就应考虑动态规划、搜索或其他方法。

## 常用思考方法

1. 明确每一步可做的选择，以及选择后保留的资源或空间。
2. 尝试排序：从最小/最大，或从最左/最右开始处理。
3. 猜测一个局部规则后，用反例检查；再用交换论证证明：把任意最优解中的选择替换为贪心选择，不会让答案变差。
4. 写清楚循环不变量。例如“已选择的区间数量最多，且最后结束时间最早”。

## 例题：[455. 分发饼干](https://leetcode.cn/problems/assign-cookies/)

### 题目描述

假设有一些孩子和一些饼干。每个孩子 `i` 都有一个胃口值 `g[i]`：只有当分配给他的饼干尺寸 `s[j] >= g[i]` 时，这块饼干才能让他满足。

每个孩子最多只能得到一块饼干，每块饼干也最多只能分配给一个孩子。给定数组 `g` 和 `s`，返回能让多少个孩子得到满足的最大值。原题中两个数组长度均至少为 `1`，至多为 `3 * 10^4`。

### 输入格式

第一行输入 `n`，接着输入 `n` 个整数表示胃口值；第二行输入 `m`，接着输入 `m` 个整数表示饼干尺寸。

### 输出格式

输出最多能满足的孩子数量。

### 示例

```text
输入：
3
1 2 3
2
1 1

输出：
1
```

### 思路

把胃口和饼干都从小到大排序。优先尝试满足胃口最小的未满足孩子：

- 当前饼干不够大，就不可能满足这个孩子，只能丢弃饼干；
- 当前饼干够大，就用它满足该孩子。

如果一块饼干能满足胃口最小的孩子，把它留给胃口更大的孩子不会增加满足人数；因此优先满足最小胃口是安全的。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> g(n);
    for (int& x : g) cin >> x;

    int m;
    cin >> m;
    vector<int> s(m);
    for (int& x : s) cin >> x;

    sort(g.begin(), g.end());
    sort(s.begin(), s.end());

    int child = 0;
    for (int cookie = 0; cookie < m && child < n; cookie++) {
        if (s[cookie] >= g[child]) {
            child++;
        }
    }

    cout << child << '\n';
    return 0;
}
```

时间复杂度为 $O(n\log n + m\log m)$，排序后扫描为 $O(n+m)$。

## 例题：[435. 无重叠区间](https://leetcode.cn/problems/non-overlapping-intervals/)

### 题目描述

给定一个区间集合 `intervals`，其中每个区间为 `intervals[i] = [start_i, end_i]`。请移除最少数量的区间，使剩余区间两两不重叠，并返回需要移除的最少区间数。

区间边界相接不算重叠：例如 `[1, 2]` 与 `[2, 3]` 可以同时保留。原题保证 `start_i < end_i`，区间数量最多为 `10^5`。

### 输入格式

第一行输入区间数量 `n`，接下来 `n` 行每行输入两个整数 `start end`。

### 输出格式

输出最少删除的区间数量。

### 示例

```text
输入：
4
1 2
2 3
3 4
1 3

输出：
1
```

### 思路

最少删除等价于尽量保留更多不重叠区间。按右端点从小到大排序后，依次选择第一个与已选区间不重叠的区间。

选择结束最早的区间会给后面的区间留下最大的空间。对于任意一个最优方案，若其第一个选中的区间结束得更晚，可以把它替换为当前结束最早的区间；替换后不会与后续区间新增冲突。因此这个选择可以出现在某个最优解中。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<int>> intervals(n, vector<int>(2));
    for (auto& interval : intervals) {
        cin >> interval[0] >> interval[1];
    }

    sort(intervals.begin(), intervals.end(), [](const auto& a, const auto& b) {
        return a[1] < b[1];
    });

    int kept = 0;
    int lastEnd = INT_MIN;
    for (const auto& interval : intervals) {
        if (interval[0] >= lastEnd) {
            kept++;
            lastEnd = interval[1];
        }
    }

    cout << n - kept << '\n';
    return 0;
}
```

时间复杂度为 $O(n\log n)$，空间复杂度为排序所需空间。

## 例题：[56. 合并区间](https://leetcode.cn/problems/merge-intervals/)

### 题目描述

以二维数组 `intervals` 表示若干区间，其中 `intervals[i] = [start_i, end_i]`。请合并所有彼此重叠的区间，并返回一个不重叠的区间数组；返回结果必须恰好覆盖原输入中的全部区间。

例如，`[1, 3]` 与 `[2, 6]` 有重叠，合并为 `[1, 6]`；端点相接的 `[1, 4]` 与 `[4, 5]` 也应合并为 `[1, 5]`。原题的区间数量最多为 `10^4`。

### 输入格式

第一行输入区间数量 `n`，接下来 `n` 行每行输入两个整数 `start end`。

### 输出格式

按起点升序输出合并后的区间。

### 示例

```text
输入：
4
1 3
2 6
8 10
15 18

输出：
1 6
8 10
15 18
```

### 思路

按左端点排序。扫描时维护已经合并出的最后一个区间：

- 下一个区间起点不超过最后区间的终点，二者重叠，扩展终点；
- 否则它一定不能和更早的区间重叠，可以直接开始一个新区间。

这类题更准确地说是“排序后的区间扫描”，但和区间贪心一样，核心是每一步只维护对未来有用的边界信息。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<int>> intervals(n, vector<int>(2));
    for (auto& interval : intervals) {
        cin >> interval[0] >> interval[1];
    }

    sort(intervals.begin(), intervals.end());
    vector<vector<int>> merged;

    for (const auto& interval : intervals) {
        if (merged.empty() || merged.back()[1] < interval[0]) {
            merged.push_back(interval);
        } else {
            merged.back()[1] = max(merged.back()[1], interval[1]);
        }
    }

    for (const auto& interval : merged) {
        cout << interval[0] << ' ' << interval[1] << '\n';
    }
    return 0;
}
```

时间复杂度为 $O(n\log n)$，排序后的扫描为 $O(n)$。

## 例题：[45. 跳跃游戏 II](https://leetcode.cn/problems/jump-game-ii/)

### 题目描述

给定一个长度为 `n` 的非负整数数组 `nums`，初始位于下标 `0`。数组中的元素 `nums[i]` 表示从下标 `i` 最多可以向前跳跃的距离；也就是说，可以跳到任意满足 `i < j <= i + nums[i]` 的下标 `j`。

请返回到达最后一个下标 `n - 1` 所需的最少跳跃次数。题目保证一定可以到达最后一个下标，且数组长度至多为 `10^4`。

### 输入格式

第一行输入 `n`，第二行输入 `n` 个非负整数。

### 输出格式

输出到达最后一个下标的最少跳跃次数。

### 示例

```text
输入：
5
2 3 1 1 4

输出：
2
```

### 思路

把一次跳跃能到达的位置看成一个区间。扫描当前区间内所有位置，计算下一次跳跃的最远边界 `farthest`；当扫描到当前区间右边界 `currentEnd` 时，说明必须再跳一次，并把边界扩展到 `farthest`。

在同一次跳跃可达的所有位置中，只关心下一次最远能到哪里。选择能把下一层边界扩得最远的位置，不会增加跳跃次数。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int& x : nums) cin >> x;

    int jumps = 0;
    int currentEnd = 0;
    int farthest = 0;

    for (int i = 0; i < n - 1; i++) {
        farthest = max(farthest, i + nums[i]);

        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }

    cout << jumps << '\n';
    return 0;
}
```

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

## 小结与延伸

这四题分别对应四种常见入口：排序后匹配、按右端点选择、按左端点扫描、维护可达区间。遇到贪心题时，先问“当前选择会给未来留下什么”，再尝试用交换论证或循环不变量验证它。

更多分类练习可参考 [灵茶山艾府的贪心题单](https://leetcode.cn/discuss/post/3091107/fen-xiang-gun-ti-dan-tan-xin-ji-ben-tan-k58yb/)；其中的反悔贪心、字典序贪心与构造题适合在掌握本文基础后继续练习。
