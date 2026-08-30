---
title: "K 个一组翻转链表"
category: "链表"
order: 96
problems:
  - "25. K 个一组翻转链表"
  - "24. 两两交换链表中的节点"
keywords:
  - "链表"
  - "K个一组"
  - "反转"
  - "分组"
tags:
  - "链表"
  - "反转"
  - "分组"
---

```cpp
ListNode* reverseKGroup(ListNode* head, int k) {
    ListNode dummy(0, head);
    ListNode* groupPrev = &dummy;
    while (true) {
        ListNode* kth = groupPrev;
        for (int i = 0; i < k && kth; i++) kth = kth->next;
        if (!kth) break;

        ListNode* groupNext = kth->next;
        ListNode* prev = groupNext;
        ListNode* cur = groupPrev->next;
        while (cur != groupNext) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        ListNode* tail = groupPrev->next;
        groupPrev->next = kth;
        groupPrev = tail;
    }
    return dummy.next;
}
```
