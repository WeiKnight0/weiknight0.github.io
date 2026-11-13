---
title: 25. K 个一组翻转链表
date: 2026-09-07
lang: zh-cn
---

给定单链表头节点 `head` 和正整数 `k`，每 `k` 个节点分为一组并翻转组内节点。若最后剩余节点不足 `k` 个，保持原顺序。不能只修改节点值。

[题目链接](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

## 示例

### 示例 1

- 输入：`head = [1,2,3,4,5], k = 2`
- 输出：`[2,1,4,3,5]`

### 示例 2

- 输入：`head = [1,2,3,4,5], k = 3`
- 输出：`[3,2,1,4,5]`

## 数据范围

- 链表节点数为 $n$
- $1 \leq k \leq n \leq 5000$
- $0 \leq Node.val \leq 1000$

<details class="note-solution">
<summary>查看解析</summary>

## 一组翻转前后的连接

设 `groupPrev` 是当前组前驱，`groupEnd` 是第 `k` 个节点，`groupNext` 是下一组的头节点：

```text
groupPrev → 1 → 2 → 3 → groupNext
```

当 `k = 3` 时，翻转后为：

```text
groupPrev → 3 → 2 → 1 → groupNext
```

原组首节点 `1` 会变成组尾，并成为下一组的 `groupPrev`。

## 方法一：迭代

每组执行三个阶段：

1. 从 `groupPrev` 向后走 `k` 步找到 `groupEnd`；若不存在，说明剩余节点不足一组，直接结束；
2. 以 `groupNext` 作为反转时 `prev` 的初值，翻转 `[groupPrev->next, groupNext)`；
3. 把前驱接到原组尾，并把 `groupPrev` 移到原组首。

```cpp
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* groupPrev = &dummy;

        while (true) {
            ListNode* groupEnd = groupPrev;
            for (int i = 0; i < k && groupEnd; i++) {
                groupEnd = groupEnd->next;
            }
            if (!groupEnd) {
                break;
            }

            ListNode* groupNext = groupEnd->next;
            ListNode* current = groupPrev->next;
            ListNode* prev = groupNext;
            while (current != groupNext) {
                ListNode* next = current->next;
                current->next = prev;
                prev = current;
                current = next;
            }

            ListNode* oldFirst = groupPrev->next;
            groupPrev->next = groupEnd;
            groupPrev = oldFirst;
        }
        return dummy.next;
    }
};
```

把 `prev` 初始化为 `groupNext` 后，原组首节点在反转时会直接连接下一组，无须结束后再次补链。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 方法二：递归

先确认从 `head` 开始至少存在 `k` 个节点。若不足一组，直接返回 `head`。否则反转这一组，并令原组首节点连接递归处理后的下一组。

```cpp
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        if (!head) {
            return nullptr;
        }
        ListNode* groupEnd = head;
        for (int i = 1; i < k; i++) {
            if (!groupEnd->next) {
                return head;
            }
            groupEnd = groupEnd->next;
        }

        ListNode* groupNext = groupEnd->next;
        ListNode* current = head;
        ListNode* prev = groupNext;
        while (current != groupNext) {
            ListNode* next = current->next;
            current->next = prev;
            prev = current;
            current = next;
        }
        head->next = reverseKGroup(groupNext, k);
        return groupEnd;
    }
};
```

本组反转后 `groupEnd` 成为组首，原来的 `head` 成为组尾。递归返回的是下一段处理后的头节点，把它接到 `head->next` 即可。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n/k)$，来自每组一次的递归调用

## 正确性

算法只在确认存在完整 `k` 个节点后翻转，因此最后不足一组的节点不会被修改。局部反转使当前组顺序完全颠倒，同时首尾分别连接上一组和下一组；随后对剩余链表执行相同操作。所有完整分组都被翻转一次且连接关系完整，结果符合要求。

## 易错点

- 必须先确认一整组存在，再开始修改指针；边翻转边计数会使不足 `k` 个的末尾难以恢复。
- 局部反转的终点是 `groupNext`，不应继续进入下一组。
- 翻转后原组首成为组尾，下一轮的前驱应更新为它。
- `k = 1` 时每组只有一个节点，两种写法仍应正常结束。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/reverse-nodes-in-k-group/solutions/)
