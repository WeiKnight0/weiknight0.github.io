---
title: "两数之和：哈希表查补数"
category: "数组与哈希"
order: 1
problems:
  - "1. 两数之和"
keywords:
  - "哈希表"
  - "unordered_map"
  - "补数"
  - "Hot100"
tags:
  - "Hot100 1"
  - "unordered_map"
  - "补数"
---

```cpp
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> pos;

    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (pos.count(need)) {
            return {pos[need], i};
        }
        pos[nums[i]] = i;
    }

    return {};
}
```
