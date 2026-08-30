---
title: "反转链表：三指针"
category: "链表"
order: 14
problems:
  - "206. 反转链表"
keywords:
  - "链表"
  - "反转链表"
  - "三指针"
  - "Hot100"
tags:
  - "Hot100 206"
  - "原地修改"
  - "三指针"
---

```cpp
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* cur = head;

    while (cur != nullptr) {
        ListNode* nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }

    return prev;
}
```
