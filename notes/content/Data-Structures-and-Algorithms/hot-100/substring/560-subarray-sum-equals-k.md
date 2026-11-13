---
title: 560. 和为 K 的子数组
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `nums` 和整数 `k`，统计和等于 `k` 的连续非空子数组个数。

[题目链接](https://leetcode.cn/problems/subarray-sum-equals-k/)

## 示例

### 示例 1

- 输入：`nums = [1,1,1], k = 2`
- 输出：`2`

### 示例 2

- 输入：`nums = [1,2,3], k = 3`
- 输出：`2`
- 解释：满足条件的子数组是 `[1,2]` 和 `[3]`。

## 数据范围

- $1 \leq nums.length \leq 2\times 10^4$
- $-1000 \leq nums[i] \leq 1000$
- $-10^7 \leq k \leq 10^7$

<details class="note-solution">
<summary>查看解析</summary>

## 前缀和关系

令 $prefix[i]$ 表示前 $i$ 个元素的和，且 $prefix[0]=0$。下标区间 `[left, right]` 的和为：

$$
prefix[right+1]-prefix[left]
$$

它等于 $k$ 当且仅当：

$$
prefix[left]=prefix[right+1]-k
$$

因此，遍历到当前前缀和 `sum` 时，只需知道此前出现过多少次 `sum - k`。

## 方法一：枚举左端点

固定右端点并向左累加，枚举所有以该位置结尾的子数组。

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int ans = 0;
        for (int right = 0; right < nums.size(); right++) {
            int sum = 0;
            for (int left = right; left >= 0; left--) {
                sum += nums[left];
                if (sum == k) {
                    ans++;
                }
            }
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

## 方法二：前缀和与哈希表

哈希表 `count[x]` 记录当前下标之前，前缀和 `x` 出现的次数。初始放入 `count[0] = 1`，这样从数组下标 `0` 开始、和恰好为 `k` 的子数组也能被统计。

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        count[0] = 1;
        int sum = 0, ans = 0;

        for (int x : nums) {
            sum += x;
            ans += count[sum - k];
            count[sum]++;
        }
        return ans;
    }
};
```

查询必须在记录当前前缀和之前完成，否则当 `k = 0` 时，当前前缀会与自身配对，错误地统计空子数组。

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$

## 正确性

每个以当前位置为右端点、和为 `k` 的子数组，都唯一对应一个值为 `sum - k` 的历史前缀和。哈希表保存了这些历史前缀的准确数量，所以本轮增加的计数恰好等于以当前位置结尾的合法子数组数。遍历全部右端点即可统计所有答案，且不会重复。

## 易错点

- 数组含负数，窗口和不具有单调性，不能使用普通滑动窗口。
- 必须初始化 `count[0] = 1`。
- 先查询 `sum - k`，再把当前 `sum` 加入哈希表。
- 题目统计子数组个数，不是不同的和或不同的数值排列。

</details>

## 参考

- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目](https://leetcode.cn/problems/subarray-sum-equals-k/)
