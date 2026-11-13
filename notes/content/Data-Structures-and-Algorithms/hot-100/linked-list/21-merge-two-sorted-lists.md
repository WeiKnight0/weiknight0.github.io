---
title: 21. 合并两个有序链表
date: 2026-09-07
lang: zh-cn
---

给定两个按非递减顺序排列的链表 `list1` 和 `list2`，将它们的节点重新连接成一条非递减链表，并返回新链表的头节点。

[题目链接](https://leetcode.cn/problems/merge-two-sorted-lists/)

## 示例

### 示例 1

- 输入：`list1 = [1,2,4], list2 = [1,3,4]`
- 输出：`[1,1,2,3,4,4]`

### 示例 2

- 输入：`list1 = [], list2 = []`
- 输出：`[]`

### 示例 3

- 输入：`list1 = [], list2 = [0]`
- 输出：`[0]`

## 数据范围

- 两条链表的节点数均为 $[0,50]$
- $-100 \leq Node.val \leq 100$
- 两条链表均按非递减顺序排列

<details class="note-solution">
<summary>查看解析</summary>

## 方法一：迭代合并

使用虚拟头节点统一处理结果链表的第一个节点，`tail` 始终指向结果链尾。比较两条链表的当前节点，把较小者接到 `tail` 后面并移动对应指针。

当一条链表耗尽后，另一条链表本身已经有序，可直接整体接到结果末尾。

```cpp
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = list1;
                list1 = list1->next;
            } else {
                tail->next = list2;
                list2 = list2->next;
            }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};
```

每次选择两个当前节点中的较小者，它不大于两条链表中任何尚未处理的节点，因此一定是结果链表的下一个节点。重复选择直到一条链表为空，得到完整有序链表。

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(1)$

## 方法二：递归合并

若两个头节点都存在，较小的头节点一定是合并结果的头节点；它的后继是“剩余部分与另一条链表”的合并结果。

```cpp
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        if (!list1) {
            return list2;
        }
        if (!list2) {
            return list1;
        }
        if (list1->val <= list2->val) {
            list1->next = mergeTwoLists(list1->next, list2);
            return list1;
        }
        list2->next = mergeTwoLists(list1, list2->next);
        return list2;
    }
};
```

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(m+n)$，最坏情况下递归深度等于节点总数

## 易错点

- 虚拟头节点只用于简化接链，返回值是 `dummy.next`。
- 每次接入节点后，既要移动来源链表的指针，也要移动 `tail`。
- 剩余链表可以直接接入，不需要逐节点复制。
- 合并的是原节点，不需要创建一套值相同的新节点。

</details>

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/merge-two-sorted-lists/solutions/)
