---
title: 295. 数据流的中位数
date: 2026-09-07
lang: zh-cn
---

中位数是有序整数序列的中间值：元素数量为奇数时取正中间的元素；为偶数时取中间两个元素的平均值。

设计 `MedianFinder`，支持向数据流加入整数，并随时返回当前所有元素的中位数。

[题目链接](https://leetcode.cn/problems/find-median-from-data-stream/)

## 示例

- 输入：

  ```text
  ["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]
  [[],[1],[2],[],[3],[]]
  ```

- 输出：

  ```text
  [null,null,null,1.50000,null,2.00000]
  ```

- 解释：加入 `1、2` 后中位数为 $(1+2)/2=1.5$；再加入 `3` 后中位数为 `2`

## 数据范围

- $-10^5 \leq num \leq 10^5$
- 调用 `findMedian` 前至少已经加入一个元素
- `addNum` 和 `findMedian` 最多共调用 $5\times 10^4$ 次

<details class="note-solution">
<summary>查看解析</summary>

## 用两个堆划分数据

把数据分成前后两半：

- `lower` 是大根堆，保存较小的一半，堆顶是前半部分最大值；
- `upper` 是小根堆，保存较大的一半，堆顶是后半部分最小值。

始终维护两个不变量：

1. `lower` 中所有元素都不大于 `upper` 中所有元素；
2. `lower.size()` 等于 `upper.size()`，或比它多一个元素。

加入新数时，先放入 `lower`，再把 `lower` 的最大值移动到 `upper`。这一步保证两边的大小关系。若 `upper` 元素更多，再把它的最小值移回 `lower`，恢复数量平衡。

```cpp
class MedianFinder {
    priority_queue<int> lower;
    priority_queue<int, vector<int>, greater<int>> upper;

public:
    MedianFinder() = default;

    void addNum(int num) {
        lower.push(num);
        upper.push(lower.top());
        lower.pop();

        if (lower.size() < upper.size()) {
            lower.push(upper.top());
            upper.pop();
        }
    }

    double findMedian() {
        if (lower.size() > upper.size()) {
            return lower.top();
        }
        return (lower.top() + upper.top()) / 2.0;
    }
};
```

由于两堆之间有序且大小相差不超过一，元素总数为奇数时多出的中间元素一定是 `lower.top()`；总数为偶数时，中间两个元素分别是 `lower.top()` 和 `upper.top()`。

- `addNum` 时间复杂度：$O(\log n)$
- `findMedian` 时间复杂度：$O(1)$
- 空间复杂度：$O(n)$

## 插入过程示例

依次加入 `5、2、8、3`：

| 操作后 | `lower` 保存的值 | `upper` 保存的值 | 中位数 |
| --- | --- | --- | --- |
| 加入 `5` | `{5}` | `{}` | `5` |
| 加入 `2` | `{2}` | `{5}` | `3.5` |
| 加入 `8` | `{5,2}` | `{8}` | `5` |
| 加入 `3` | `{3,2}` | `{5,8}` | `4` |

表中只展示两个堆各自包含的值，不表示堆底层数组的排列顺序。

## 易错点

- `lower` 必须是大根堆，`upper` 必须是小根堆，才能在 $O(1)$ 时间取得中间边界。
- 平衡后让 `lower` 数量不少于 `upper`，奇数情况才能统一读取 `lower.top()`。
- 不能每次查询时再排序全部数据，否则连续调用的总成本过高。
- 本题值域保证两个堆顶相加不会溢出 `int`；若值域扩展到完整 32 位整数，应先转换为 `long long` 或 `double`。

</details>

## 参考

- [项目现有堆笔记](../../data-structures/tree/heap.md)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/find-median-from-data-stream/solutions/)
