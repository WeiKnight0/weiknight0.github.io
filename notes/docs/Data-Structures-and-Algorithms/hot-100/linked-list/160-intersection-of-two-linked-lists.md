---
title: 160. 相交链表
date: 2026-09-07
lang: zh-cn
---

给定两个无环单链表的头节点 `headA` 和 `headB`，返回它们开始相交的节点；若不相交则返回 `nullptr`。相交按节点地址判断，不是节点值相等。

[题目链接](https://leetcode.cn/problems/intersection-of-two-linked-lists/)

## 示例

### 示例 1

- 输入：`listA = [4,1,8,4,5]`，`listB = [5,6,1,8,4,5]`
- 相交位置：`listA` 下标 `2`、`listB` 下标 `3` 指向同一个值为 `8` 的节点
- 输出：相交节点 `8`

### 示例 2

- 输入：`listA = [1,9,1,2,4]`，`listB = [3,2,4]`
- 相交位置：`listA` 下标 `3`、`listB` 下标 `1` 指向同一个值为 `2` 的节点
- 输出：相交节点 `2`

### 示例 3

- 输入：`listA = [2,6,4]`，`listB = [1,5]`
- 输出：`nullptr`

## 相交的含义

单链表节点只有一个后继。两个链表一旦共享某个节点，此后的所有节点也必然相同，整体呈 Y 形。即使两个节点的值相等，只要地址不同，就不算相交。

## 方法一：记录第一个链表的节点

把 `headA` 经过的节点地址加入哈希集合，再遍历 `headB`，第一个已在集合中的节点就是相交起点。

```cpp
class Solution {
public:
    ListNode* getIntersectionNode(ListNode* headA, ListNode* headB) {
        unordered_set<ListNode*> visited;
        for (ListNode* node = headA; node; node = node->next) {
            visited.insert(node);
        }
        for (ListNode* node = headB; node; node = node->next) {
            if (visited.count(node)) {
                return node;
            }
        }
        return nullptr;
    }
};
```

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(m)$

## 方法二：交换起点

两个指针分别从 `headA`、`headB` 出发。走到链表末尾后，改从另一条链表的头部继续：

```text
a 经过的路径：A 的独有部分 → 公共部分 → B 的独有部分 → 公共部分
b 经过的路径：B 的独有部分 → 公共部分 → A 的独有部分 → 公共部分
```

两条路径总长度相同。若链表相交，两个指针会在相交起点同时到达；若不相交，最终会同时成为 `nullptr`。

```cpp
class Solution {
public:
    ListNode* getIntersectionNode(ListNode* headA, ListNode* headB) {
        ListNode* a = headA;
        ListNode* b = headB;
        while (a != b) {
            a = a ? a->next : headB;
            b = b ? b->next : headA;
        }
        return a;
    }
};
```

设两条链表的独有部分长度分别为 $a$、$b$，公共部分长度为 $c$。两个指针到相交点前都走了 $a+b+c$ 步，只是先后经过的独有部分顺序不同，所以会同时到达相交点。

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(1)$

## 易错点

- 必须比较节点指针，不能比较 `node->val`。
- 指针走到 `nullptr` 时应切换到另一条链表的头节点，而不是自己的头节点。
- 不相交时两个指针会同时为 `nullptr`，循环能够正常结束，无须额外计数。
- 题目要求保持链表结构不变，不能通过断链或拼接来判定。

## 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/intersection-of-two-linked-lists/solutions/)
