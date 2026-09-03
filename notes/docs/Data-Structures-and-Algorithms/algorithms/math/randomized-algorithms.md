---
title: Randomized Algorithms 随机算法
date: 2026-09-03
lang: zh-cn
tags:
  - DSA
  - Math
  - Randomization
---

随机算法使用随机选择影响执行路径或输出。正确实现首先需要保证分布正确；不要使用 `rand() % n` 生成均匀整数，因为随机数范围不一定能被 `n` 整除，会产生取模偏差。

C++ 可使用 `<random>` 中的随机数引擎和分布：

```cpp
// 在闭区间[left, right]内生成均匀随机整数
int uniformInt(int left, int right, mt19937& generator) {
    return uniform_int_distribution<int>(left, right)(generator);
}
```

# Fisher–Yates 洗牌

从数组末尾向前处理位置 `i`，在闭区间 `[0,i]` 中均匀随机选择 `j`，交换 `a[i]` 与 `a[j]`。

任意给定排列出现的概率为：

$$
\frac1n\cdot\frac1{n-1}\cdots\frac11=\frac1{n!}
$$

```cpp
// 原地生成均匀随机排列
void shuffleValues(vector<int>& values, mt19937& generator) {
    for (int i = static_cast<int>(values.size()) - 1; i > 0; i--) {
        uniform_int_distribution<int> distribution(0, i);
        swap(values[i], values[distribution(generator)]);
    }
}
```

时间复杂度 $O(n)$，额外空间复杂度 $O(1)$。

# 蓄水池抽样

数据以流的形式到达、总长度未知且只能扫描一次时，可以从前 $i$ 个元素中等概率保留一个样本：处理第 $i$ 个元素时，以 $1/i$ 的概率替换当前样本。

处理完 $n$ 个元素后，第 $k$ 个元素被保留的概率为：

$$
\frac1k\cdot\frac{k}{k+1}\cdot\frac{k+1}{k+2}\cdots\frac{n-1}{n}=\frac1n
$$

保留 $k$ 个样本时，先把前 $k$ 个元素放入蓄水池；处理第 $i$ 个元素时，在 `[0,i]` 中随机取下标，若下标小于 $k$，就替换对应样本。

```cpp
vector<int> reservoirSample(const vector<int>& stream, int k, mt19937& generator) {
    vector<int> sample(stream.begin(), stream.begin() + k);
    for (int i = k; i < stream.size(); i++) {
        int index = uniform_int_distribution<int>(0, i)(generator);
        if (index < k) sample[index] = stream[i];
    }
    return sample;
}
```

时间复杂度 $O(n)$，保存 $k$ 个样本需要 $O(k)$ 空间。调用前必须保证 $0<k\le n$。

# 按权重随机选择

正权重数组为 $w_0,w_1,\ldots,w_{n-1}$。构造前缀和：

$$
s_i=\sum_{j=0}^{i}w_j
$$

在 `[1,s_{n-1}]` 中均匀生成整数 `target`，返回第一个满足 $s_i\ge target$ 的下标。下标 $i$ 对应长度为 $w_i$ 的整数区间，因此被选中的概率为：

$$
\frac{w_i}{\sum_j w_j}
$$

# 例题

## 384. 打乱数组

题目来源：[384. 打乱数组](https://leetcode.cn/problems/shuffle-an-array/)

题目描述：给定一个没有重复元素的整数数组，实现以下操作：构造函数保存初始数组，`reset()` 恢复并返回初始状态，`shuffle()` 返回一个随机排列。所有 $n!$ 种排列必须等概率出现。

约束：$1\le nums.length\le50$，$-10^6\le nums[i]\le10^6$，所有元素互不相同；`reset` 和 `shuffle` 最多调用 $10^4$ 次。

**示例 1：**

- 输入：初始数组 `nums = [1,2,3]`

- 输出：调用 `shuffle()` 可能得到 `[3,1,2]`，调用 `reset()` 得到 `[1,2,3]`

- 解释：`shuffle()` 的具体结果不固定，但 `[1,2,3]` 的每一种排列出现概率都应为 $1/6$。

思路：每次 `shuffle()` 都复制初始数组，再执行 Fisher–Yates 洗牌。从末尾向前处理位置 `i`，在 `[0,i]` 中均匀选择交换位置，保证每种排列等概率。`original` 始终不修改，所以 `reset()` 可以直接返回初始数组。

```cpp
class Solution {
    vector<int> original;
    mt19937 generator{random_device{}()};

public:
    Solution(vector<int>& nums) : original(nums) {}

    vector<int> reset() {
        return original;
    }

    vector<int> shuffle() {
        vector<int> result = original;
        for (int i = static_cast<int>(result.size()) - 1; i > 0; i--) {
            uniform_int_distribution<int> distribution(0, i);
            swap(result[i], result[distribution(generator)]);
        }
        return result;
    }
};
```

每次洗牌时间复杂度 $O(n)$，返回数组需要 $O(n)$ 空间；`reset()` 返回副本的时间和空间也都是 $O(n)$。

## 528. 按权重随机选择

题目来源：[528. 按权重随机选择](https://leetcode.cn/problems/random-pick-with-weight/)

题目描述：给定从 `0` 开始的正整数权重数组 `w`，实现 `pickIndex()`。每次调用返回 `[0,w.length-1]` 中的一个下标，返回下标 `i` 的概率必须为 $w_i/\sum_jw_j$。

约束：$1\le w.length\le10^4$，$1\le w[i]\le10^5$，`pickIndex` 最多调用 $10^4$ 次。

**示例 1：**

- 输入：`w = [1]`

- 输出：每次调用 `pickIndex()` 都返回 `0`

**示例 2：**

- 输入：`w = [1,3]`

- 输出：多次调用可能得到 `1,1,1,1,0`

- 解释：单次输出不是固定答案；下标 `0` 应以 $1/4$ 的概率出现，下标 `1` 应以 $3/4$ 的概率出现。

思路：前缀和把每个权重映射为一段连续整数区间。`w = [1,3]` 对应区间 `[1]` 和 `[2,4]`。在 `[1,4]` 中均匀取整数，再用 `lower_bound` 找到第一个不小于随机数的前缀和，下标被覆盖的整数数量恰好等于它的权重。

```cpp
class Solution {
    vector<long long> prefix;
    mt19937 generator{random_device{}()};

public:
    Solution(vector<int>& weights) {
        partial_sum(weights.begin(), weights.end(), back_inserter(prefix));
    }

    int pickIndex() {
        uniform_int_distribution<long long> distribution(1, prefix.back());
        return lower_bound(prefix.begin(), prefix.end(), distribution(generator)) - prefix.begin();
    }
};
```

预处理时间复杂度和空间复杂度都是 $O(n)$，每次选择的时间复杂度为 $O(\log n)$，额外空间复杂度为 $O(1)$。

# 如何检查随机结果

随机输出不能靠单次结果验证。应分别检查：

- 结构约束：洗牌后元素不增不减，抽样结果一定来自输入。
- 边界输入：单元素、权重差异很大、数据流长度恰好等于蓄水池容量。
- 分布检查：固定大量试验次数，确认各结果频率落在合理误差范围内。

调试时使用固定种子，便于重现同一组结果；提交时再根据题目接口决定是否使用 `random_device`。
