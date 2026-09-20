---
title: 148. 排序链表
date: 2026-09-07
lang: zh-cn
---

给定单链表头节点 `head`，将链表按节点值升序排列并返回。要求时间复杂度为 $O(n\log n)$；进阶要求额外空间复杂度为 $O(1)$。

[题目链接](https://leetcode.cn/problems/sort-list/)

## 示例

### 示例 1

- 输入：`head = [4,2,1,3]`
- 输出：`[1,2,3,4]`

### 示例 2

- 输入：`head = [-1,5,3,4,0]`
- 输出：`[-1,0,3,4,5]`

### 示例 3

- 输入：`head = []`
- 输出：`[]`

## 数据范围

- 链表节点数为 $[0,5\times10^4]$
- $-10^5 \leq Node.val \leq 10^5$

## 为什么选择归并排序

链表不能按下标随机访问，不适合依赖中间下标与交换的数组排序。归并排序只需要顺序扫描：

1. 把链表分成两半；
2. 分别排序；
3. 线性合并两条有序链表。

每层合并处理全部 $n$ 个节点，共有 $O(\log n)$ 层。

## 方法一：自顶向下归并

快慢指针找到中点前一个节点，断开为两条链表。递归排序后再合并。

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
    ListNode* sortList(ListNode* head) {
        if (!head || !head->next) {
            return head;
        }
        ListNode* slow = head;
        ListNode* fast = head->next;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* right = slow->next;
        slow->next = nullptr;
        return merge(sortList(head), sortList(right));
    }
};
```

`fast` 从 `head->next` 开始，使偶数个节点时 `slow` 停在左半部分末尾。断开 `slow->next` 很重要，否则递归处理左半部分时链表长度不会缩小。

- 时间复杂度：$O(n\log n)$
- 空间复杂度：$O(\log n)$，来自递归调用栈

## 方法二：自底向上归并

要达到 $O(1)$ 额外空间，可以消除递归。依次合并长度为 `1、2、4、8...` 的相邻有序段：

```text
长度 1： [4] [2] [1] [3]
长度 2： [2,4] [1,3]
长度 4： [1,2,3,4]
```

`split(head, size)` 从 `head` 截取最多 `size` 个节点，断开后返回下一段的头节点。

```cpp
class Solution {
    ListNode* split(ListNode* head, int size) {
        if (!head) {
            return nullptr;
        }
        for (int i = 1; i < size && head->next; i++) {
            head = head->next;
        }
        ListNode* next = head->next;
        head->next = nullptr;
        return next;
    }

    pair<ListNode*, ListNode*> merge(ListNode* a, ListNode* b) {
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
        while (tail->next) {
            tail = tail->next;
        }
        return {dummy.next, tail};
    }

public:
    ListNode* sortList(ListNode* head) {
        int length = 0;
        for (ListNode* node = head; node; node = node->next) {
            length++;
        }

        ListNode dummy(0);
        dummy.next = head;
        for (int size = 1; size < length; size *= 2) {
            ListNode* tail = &dummy;
            ListNode* current = dummy.next;
            while (current) {
                ListNode* left = current;
                ListNode* right = split(left, size);
                current = split(right, size);
                auto [mergedHead, mergedTail] = merge(left, right);
                tail->next = mergedHead;
                tail = mergedTail;
            }
        }
        return dummy.next;
    }
};
```

每轮开始时，链表由若干条长度不超过 `size` 的有序段组成；两两合并后得到长度不超过 `2 * size` 的有序段。`size` 达到链表长度时，整条链表有序。

- 时间复杂度：$O(n\log n)$
- 空间复杂度：$O(1)$

## 易错点

- 自顶向下写法必须在递归前断开左右链表。
- 快慢指针的初始位置要保证长度为 `2` 时也能正确分开。
- 自底向上时最后一段可能不足 `size`，`split` 需要允许提前到达链尾。
- 每次合并后必须让 `tail` 指向合并结果的尾节点，下一对链表才能接在正确位置。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/sort-list/solutions/)
