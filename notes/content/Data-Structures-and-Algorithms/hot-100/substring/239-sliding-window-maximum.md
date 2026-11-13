---
title: 239. 滑动窗口最大值
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `nums` 和大小为 `k` 的滑动窗口。窗口从数组最左侧向右移动，每次移动一个位置，返回每个窗口中的最大值。

[题目链接](https://leetcode.cn/problems/sliding-window-maximum/)

## 示例

### 示例 1

- 输入：`nums = [1,3,-1,-3,5,3,6,7], k = 3`
- 输出：`[3,3,5,5,6,7]`
- 解释：六个窗口依次为 `[1,3,-1]`、`[3,-1,-3]`、`[-1,-3,5]`、`[-3,5,3]`、`[5,3,6]`、`[3,6,7]`。

### 示例 2

- 输入：`nums = [1], k = 1`
- 输出：`[1]`

## 数据范围

- $1 \leq nums.length \leq 10^5$
- $-10^4 \leq nums[i] \leq 10^4$
- $1 \leq k \leq nums.length$

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：优先队列

大根堆保存 `{数值, 下标}`。加入右端元素后，不断弹出下标已经离开窗口的堆顶，剩余堆顶就是当前最大值。

```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        priority_queue<pair<int, int>> heap;
        vector<int> ans;

        for (int right = 0; right < nums.size(); right++) {
            heap.push({nums[right], right});
            while (heap.top().second <= right - k) {
                heap.pop();
            }
            if (right >= k - 1) {
                ans.push_back(heap.top().first);
            }
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n\log n)$
- 空间复杂度：$O(n)$，失效但未到堆顶的元素不会立即删除

## 方法二：单调队列

双端队列保存元素下标，并使对应数值从队首到队尾单调不增：

1. 删除队首已经离开窗口的下标；
2. 当前值不小于队尾值时删除队尾，因为当前元素更大且离开窗口更晚，旧队尾不可能再成为最大值；
3. 把当前下标加入队尾；
4. 窗口形成后，队首对应当前最大值。

```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> q;
        vector<int> ans;

        for (int right = 0; right < nums.size(); right++) {
            while (!q.empty() && q.front() <= right - k) {
                q.pop_front();
            }
            while (!q.empty() && nums[q.back()] <= nums[right]) {
                q.pop_back();
            }
            q.push_back(right);
            if (right >= k - 1) {
                ans.push_back(nums[q.front()]);
            }
        }
        return ans;
    }
};
```

每个下标最多入队、出队各一次。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(k)$

## 正确性

队列删除两类不可能成为答案的元素：已经离开窗口的元素，以及左侧不大于当前值的元素。后者在数值上不占优，又会比当前元素更早离开窗口，因此可永久丢弃。剩余元素按值单调不增且都位于窗口内，所以队首必然是窗口最大值。

## 易错点

- 队列保存下标而不是数值，否则无法判断元素是否离开窗口。
- 窗口左边界是 `right - k + 1`，所以失效条件为 `index <= right - k`。
- 必须在窗口形成后，即 `right >= k - 1` 时才记录答案。
- 弹出队尾使用 `<=` 可移除更早的相同值；使用 `<` 也能正确求最大值，但会保留更多下标。

</details>

## 参考

- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目](https://leetcode.cn/problems/sliding-window-maximum/)
