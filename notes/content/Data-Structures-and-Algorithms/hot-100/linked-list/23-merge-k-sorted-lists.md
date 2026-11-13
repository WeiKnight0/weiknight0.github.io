---
title: 23. 合并 K 个升序链表
date: 2026-09-07
lang: zh-cn
---

给定包含 `k` 条升序链表的数组 `lists`，将所有节点合并成一条升序链表并返回。

[题目链接](https://leetcode.cn/problems/merge-k-sorted-lists/)

## 示例

### 示例 1

- 输入：`lists = [[1,4,5],[1,3,4],[2,6]]`
- 输出：`[1,1,2,3,4,4,5,6]`

三条输入链表为：

```text
1 → 4 → 5
1 → 3 → 4
2 → 6
```

### 示例 2

- 输入：`lists = []`
- 输出：`[]`

### 示例 3

- 输入：`lists = [[]]`
- 输出：`[]`

## 数据范围

- $k=lists.length$
- $0 \leq k \leq 10^4$
- 每条链表的节点数为 $[0,500]$
- $-10^4 \leq Node.val \leq 10^4$
- 所有链表的节点总数不超过 $10^4$

设所有链表的节点总数为 $N$。

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：小根堆

任意时刻，合并结果的下一个节点一定是各条链表当前头节点中的最小者。把所有非空链表的头节点放入小根堆：

1. 取出最小节点并接到结果末尾；
2. 若该节点还有后继，将后继加入堆；
3. 重复直到堆为空。

```cpp
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto greater = [](ListNode* a, ListNode* b) {
            return a->val > b->val;
        };
        priority_queue<ListNode*, vector<ListNode*>, decltype(greater)> heap(greater);
        for (ListNode* head : lists) {
            if (head) {
                heap.push(head);
            }
        }

        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (!heap.empty()) {
            ListNode* node = heap.top();
            heap.pop();
            tail->next = node;
            tail = node;
            if (node->next) {
                heap.push(node->next);
            }
        }
        return dummy.next;
    }
};
```

堆中每条链表最多保留一个候选节点，所以堆大小不超过 `k`。

- 时间复杂度：$O(N\log k)$
- 空间复杂度：$O(k)$

## 方法二：两两归并

复用“合并两个有序链表”的方法，按归并排序的方式成对合并：

```text
第 1 轮：0 与 1 合并，2 与 3 合并……
第 2 轮：0 与 2 合并，4 与 6 合并……
第 3 轮：0 与 4 合并……
```

每轮步长翻倍，经过 $\lceil\log_2 k\rceil$ 轮后只剩一条链表。

```cpp
class Solution {
    ListNode* merge(ListNode* a, ListNode* b) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) {
                tail->next = a;
                a = a->next;
            } else {
                tail->next = b;
                b = b->next;
            }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }

public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        for (int step = 1; step < lists.size(); step *= 2) {
            for (int i = 0; i + step < lists.size(); i += step * 2) {
                lists[i] = merge(lists[i], lists[i + step]);
            }
        }
        return lists.empty() ? nullptr : lists[0];
    }
};
```

每一轮所有节点至多参与一次合并，共有 $O(\log k)$ 轮。

- 时间复杂度：$O(N\log k)$
- 空间复杂度：$O(1)$

## 易错点

- 堆中应保存节点指针；弹出节点后只加入它的直接后继。
- `priority_queue` 默认是大根堆，比较函数需要让较小值具有更高优先级。
- 两两归并不能每次都把结果与下一条链表顺序合并，否则在链表长度接近时可能退化为 $O(Nk)$。
- `lists` 可能为空，不能直接返回 `lists[0]`。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/merge-k-sorted-lists/solutions/)
