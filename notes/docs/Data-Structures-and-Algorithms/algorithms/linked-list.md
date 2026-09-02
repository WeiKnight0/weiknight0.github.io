---
title: Linked List Algorithms 链表算法
date: 2026-09-01
description: 用虚拟头节点、反转、前后指针、快慢指针与归并分治解决链表题。
lang: zh-cn
tags:
  - DSA
  - Linked List
  - Hot 100
---

链表题的关键是：改写 `next` 前先保存原后继，避免断链。LeetCode 的节点通常是：

```cpp
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};
```

# 常用模型与模板

## 虚拟头节点

头节点可能被删除或替换时，让 `dummy.next = head`。之后统一修改“前驱节点的 `next`”，无需单独讨论头节点。

```cpp
ListNode dummy(0);
dummy.next = head;
ListNode* prev = &dummy;

return dummy.next;
```

## 原地反转

`prev` 是已反转部分的头，`head` 是待处理部分的头。先保存 `next`，再反向连接。

```cpp
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
```

## 前后与快慢指针

- 前后指针先让 `fast` 多走固定步数，再同步移动，可定位倒数第 `n` 个节点。
- 快慢指针每轮分别走两步、一步，可找中点或判环。
- 判环相遇后，让一指针回到头节点，二者每次各走一步，再次相遇点就是环入口。

访问 `node->next` 的循环必须满足 `node && node->next`；只读取 `node` 时只需满足 `node`。

# 例题

## 206. 反转链表

题目来源：[206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/)

题目描述：给定单链表头节点 `head`，原地反转链表并返回新头节点。

**示例：**

- 输入：`head = [1,2,3,4,5]`

- 输出：`[5,4,3,2,1]`

思路：依次将当前节点接到已处理部分的前面，代码直接使用上面的反转模板。

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

## 19. 删除链表的倒数第 N 个结点

题目来源：[19. 删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

题目描述：删除单链表中倒数第 `n` 个节点并返回头节点。

**示例：**

- 输入：`head = [1,2,3,4,5]`，`n = 2`

- 输出：`[1,2,3,5]`

思路：从虚拟头节点出发，让 `fast` 领先 `n + 1` 步，再同步移动。`fast` 到末尾时，`slow` 正好是待删节点的前驱。

```cpp
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* slow = &dummy;
        ListNode* fast = &dummy;
        while (n-- >= 0) fast = fast->next;
        while (fast) {
            slow = slow->next;
            fast = fast->next;
        }
        slow->next = slow->next->next;
        return dummy.next;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

## 142. 环形链表 II

题目来源：[142. 环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/)

题目描述：若链表有环，返回入环的第一个节点；否则返回 `nullptr`。不能修改链表。

**示例：**

- 输入：`head = [3,2,0,-4]`，`pos = 1`

- 输出：尾节点连接到下标 `1` 的节点

思路：快慢指针相遇后，头节点到入口距离与相遇点继续走到入口的距离相同。一指针回到头节点后，两指针每轮各走一步，再次相遇即为入口。

```cpp
class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow != fast) continue;
            ListNode* p = head;
            while (p != slow) {
                p = p->next;
                slow = slow->next;
            }
            return p;
        }
        return nullptr;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

## 21. 合并两个有序链表

题目来源：[21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)

题目描述：将两个按非递减顺序排列的链表合并为一个同样有序的链表。

**示例：**

- 输入：`list1 = [1,2,4]`，`list2 = [1,3,4]`

- 输出：`[1,1,2,3,4,4]`

思路：维护结果链尾 `tail`，每次接入两个当前节点中较小的一个；循环结束后直接接上尚未耗尽的一条链。

```cpp
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
```

时间复杂度 $O(m+n)$，空间复杂度 $O(1)$。

## 23. 合并 K 个升序链表

题目来源：[23. 合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)

题目描述：给定 `k` 个升序链表，合并为一个升序链表。

**示例：**

- 输入：`lists = [[1,4,5],[1,3,4],[2,6]]`

- 输出：`[1,1,2,3,4,4,5,6]`

思路：把“合并两个有序链表”作为分治的合并函数。第 `i` 轮合并相距 `2^i` 的两条链，每个节点只参与 $O(\log k)$ 次合并。

```cpp
class Solution {
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

设节点总数为 $N$，时间复杂度 $O(N\log k)$，额外空间复杂度 $O(1)$。

# 扩展练习

- [2. 两数相加](https://leetcode.cn/problems/add-two-numbers/)
- [24. 两两交换链表中的节点](https://leetcode.cn/problems/swap-nodes-in-pairs/)
- [25. K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/)
- [138. 随机链表的复制](https://leetcode.cn/problems/copy-list-with-random-pointer/)
- [148. 排序链表](https://leetcode.cn/problems/sort-list/)
- [160. 相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/)
- [234. 回文链表](https://leetcode.cn/problems/palindrome-linked-list/)
