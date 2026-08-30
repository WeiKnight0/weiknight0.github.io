---
title: "移动零：稳定覆盖"
category: "双指针"
order: 6
problems:
  - "283. 移动零"
keywords:
  - "双指针"
  - "原地修改"
  - "覆盖"
  - "Hot100"
tags:
  - "Hot100 283"
  - "原地修改"
  - "覆盖"
---

```cpp
void moveZeroes(vector<int>& nums) {
    int write = 0;
    for (int x : nums) {
        if (x != 0) nums[write++] = x;
    }
    while (write < (int)nums.size()) {
        nums[write++] = 0;
    }
}
```
