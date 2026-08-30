---
title: "快慢指针：链表判环"
category: "链表"
order: 15
problems:
  - "141. 环形链表"
keywords:
  - "链表"
  - "快慢指针"
  - "判环"
  - "Hot100"
tags:
  - "Hot100 141"
  - "快慢指针"
  - "判环"
---

```cpp
bool hasCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;

    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }

    return false;
}
```
