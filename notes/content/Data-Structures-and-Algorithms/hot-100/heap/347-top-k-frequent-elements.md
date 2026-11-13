---
title: 347. 前 K 个高频元素
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `nums` 和整数 `k`，返回出现频率最高的 `k` 个元素，答案顺序不限。题目保证前 `k` 高频元素的集合唯一。

[题目链接](https://leetcode.cn/problems/top-k-frequent-elements/)

## 示例

### 示例 1

- 输入：`nums = [1,1,1,2,2,3], k = 2`
- 输出：`[1,2]`

### 示例 2

- 输入：`nums = [1], k = 1`
- 输出：`[1]`

### 示例 3

- 输入：`nums = [1,2,1,2,1,2,3,1,3,2], k = 2`
- 输出：`[1,2]`

## 数据范围

- $1 \leq nums.length \leq 10^5$
- $-10^4 \leq nums[i] \leq 10^4$
- $1 \leq k \leq$ 不同元素的数量
- 前 `k` 高频元素的集合唯一

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：哈希计数与小根堆

先用哈希表统计每个值的出现次数，再用大小为 `k` 的小根堆保存当前频率最高的 `k` 个元素。堆中存放 `(frequency,value)`，频率最低的候选位于堆顶；候选超过 `k` 个时弹出堆顶。

```cpp
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> frequency;
        for (int value : nums) {
            frequency[value]++;
        }

        using Entry = pair<int, int>;
        priority_queue<Entry, vector<Entry>, greater<Entry>> top;
        for (auto [value, count] : frequency) {
            top.push({count, value});
            if (top.size() > static_cast<size_t>(k)) {
                top.pop();
            }
        }

        vector<int> answer;
        while (!top.empty()) {
            answer.push_back(top.top().second);
            top.pop();
        }
        return answer;
    }
};
```

处理完任意若干种元素后，堆中保存其中频率最高的至多 `k` 种。全部处理后，堆里正是全局前 `k` 高频元素。

- 时间复杂度：$O(n+u\log k)$，$u$ 为不同元素数量
- 空间复杂度：$O(u+k)$

## 方法二：按频率分桶

任一元素的频率都在 $[1,n]$ 内。建立 `n+1` 个桶，令 `buckets[f]` 保存所有出现 `f` 次的元素，再从最高频率向下取满 `k` 个元素。

这种方法不对不同元素排序，能够达到线性时间。

```cpp
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> frequency;
        for (int value : nums) {
            frequency[value]++;
        }

        int n = nums.size();
        vector<vector<int>> buckets(n + 1);
        for (auto [value, count] : frequency) {
            buckets[count].push_back(value);
        }

        vector<int> answer;
        for (int count = n; count > 0; count--) {
            for (int value : buckets[count]) {
                answer.push_back(value);
                if (answer.size() == static_cast<size_t>(k)) {
                    return answer;
                }
            }
        }
        return answer;
    }
};
```

从频率 `n` 向下扫描保证先取到的元素频率不低于后取到的元素。题目保证答案集合唯一，因此取满 `k` 个时得到的就是唯一的前 `k` 高频集合。

- 时间复杂度：$O(n+u)$
- 空间复杂度：$O(n+u)$

## 易错点

- 堆的比较关键字是频率，不是元素值。
- 固定保留前 `k` 名要使用小根堆，便于淘汰候选中频率最低的元素。
- 返回顺序不限，不需要再对答案排序。
- 桶数组长度应为 `n+1`，因为某个元素最多可能出现 `n` 次。

</details>

## 参考

- [项目现有堆笔记](../../data-structures/tree/heap.md)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/top-k-frequent-elements/solutions/)
