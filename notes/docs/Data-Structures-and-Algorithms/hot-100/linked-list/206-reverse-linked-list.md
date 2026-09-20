---
title: 206. 反转链表
date: 2026-09-07
lang: zh-cn
---

给定单链表头节点 `head`，反转链表并返回新的头节点。

[题目链接](https://leetcode.cn/problems/reverse-linked-list/)

## 示例

### 示例 1

- 输入：`head = [1,2,3,4,5]`
- 输出：`[5,4,3,2,1]`

### 示例 2

- 输入：`head = [1,2]`
- 输出：`[2,1]`

### 示例 3

- 输入：`head = []`
- 输出：`[]`

## 数据范围

- 链表节点数为 $[0,5000]$
- $-5000 \leq Node.val \leq 5000$

## 方法一：迭代

维护两个部分：`prev` 是已经反转部分的头节点，`head` 是尚未处理部分的头节点。修改 `head->next` 前必须先保存原后继，否则会丢失未处理链表。

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* next = head->next;
            head->next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }
};
```

每轮结束后，原链表前若干个节点已经被完整反转并由 `prev` 指向，`head` 仍指向剩余链表。处理结束时剩余部分为空，`prev` 就是新头节点。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

## 方法二：递归

先递归反转 `head->next` 开始的链表。递归返回后，原后继 `head->next` 已成为反转链表的尾节点，把它的 `next` 指回 `head`，再断开 `head` 原来的正向连接。

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        if (!head || !head->next) {
            return head;
        }
        ListNode* newHead = reverseList(head->next);
        head->next->next = head;
        head->next = nullptr;
        return newHead;
    }
};
```

例如 `1 → 2 → 3`：递归先得到 `3 → 2`，此时执行 `2->next = 1` 并断开 `1->next`，最终得到 `3 → 2 → 1`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$，来自递归调用栈

## 易错点

- 迭代时要在改写 `next` 前保存原后继。
- 递归回溯时必须令 `head->next = nullptr`，否则原来的前两节点会形成环。
- 空链表和单节点链表直接返回原头节点。
- 返回的是反转后的新头节点，不是原来的 `head`。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/reverse-linked-list/solutions/)
