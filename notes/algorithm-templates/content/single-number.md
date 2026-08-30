---
title: "只出现一次：异或抵消"
category: "位运算"
order: 36
problems:
  - "136. 只出现一次的数字"
keywords:
  - "位运算"
  - "异或"
  - "Hot100"
tags:
  - "Hot100 136"
  - "异或"
  - "O(1) 空间"
---

```cpp
int singleNumber(vector<int>& nums) {
    int ans = 0;
    for (int x : nums) ans ^= x;
    return ans;
}
```
