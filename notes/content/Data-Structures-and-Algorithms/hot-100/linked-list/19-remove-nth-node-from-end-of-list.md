---
title: 19. 删除链表的倒数第 N 个结点
date: 2026-09-07
lang: zh-cn
---

给定单链表头节点 `head` 和整数 `n`，删除链表的倒数第 `n` 个节点，返回删除后的头节点。

[题目链接](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

## 示例

### 示例 1

- 输入：`head = [1,2,3,4,5], n = 2`
- 输出：`[1,2,3,5]`

### 示例 2

- 输入：`head = [1], n = 1`
- 输出：`[]`

### 示例 3

- 输入：`head = [1,2], n = 1`
- 输出：`[1]`

## 数据范围

- 链表节点数为 $sz$
- $1 \leq sz \leq 30$
- $0 \leq Node.val \leq 100$
- $1 \leq n \leq sz$

<details class="note-solution">
<summary>查看解析</summary>

## 为什么使用虚拟头节点

删除节点需要修改其前驱的 `next`。若删除的是原头节点，它没有前驱。令 `dummy.next = head` 后，原头节点也有统一的前驱 `dummy`，无需单独判断。

## 方法一：计算链表长度

先得到链表长度 `length`。倒数第 `n` 个节点是正数第 `length - n + 1` 个节点，其前驱距离虚拟头节点 `length - n` 步。

```cpp
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        int length = 0;
        for (ListNode* node = head; node; node = node->next) {
            length++;
        }

        ListNode dummy(0);
        dummy.next = head;
        ListNode* prev = &dummy;
        for (int i = 0; i < length - n; i++) {
            prev = prev->next;
        }
        prev->next = prev->next->next;
        return dummy.next;
    }
};
```

- 时间复杂度：$O(L)$
- 空间复杂度：$O(1)$

虽然有两次遍历，但总步数不超过 $2L$，仍是线性时间。

## 方法二：前后指针

先让 `fast` 从头节点向前走 `n` 步，再令 `slow` 从虚拟头节点出发。之后两个指针同步前进。当 `fast` 到达链表末尾时，二者间始终相隔 `n` 个节点，`slow` 正好位于待删除节点的前驱。

```cpp
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* slow = &dummy;
        ListNode* fast = head;
        for (int i = 0; i < n; i++) {
            fast = fast->next;
        }
        while (fast) {
            slow = slow->next;
            fast = fast->next;
        }
        slow->next = slow->next->next;
        return dummy.next;
    }
};
```

- 时间复杂度：$O(L)$
- 空间复杂度：$O(1)$

## 易错点

- 需要找到待删除节点的前驱，而不是待删除节点本身。
- 删除头节点时也应返回 `dummy.next`，不能始终返回原 `head`。
- 题目保证 `n` 合法，不需要在内部重复校验链表是否足够长。
- 前后指针的初始位置与领先步数必须配套；本写法是 `fast = head` 先走 `n` 步，`slow = dummy`。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/solutions/)
