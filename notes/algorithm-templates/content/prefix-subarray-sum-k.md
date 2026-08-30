---
title: "和为 K 的子数组：前缀和计数"
category: "前缀和"
order: 12
problems:
  - "560. 和为 K 的子数组"
keywords:
  - "前缀和"
  - "哈希表"
  - "子数组"
  - "Hot100"
tags:
  - "Hot100 560"
  - "哈希表"
  - "子数组"
---

```cpp
int subarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> cnt;
    cnt[0] = 1;

    int sum = 0;
    int ans = 0;
    for (int x : nums) {
        sum += x;
        if (cnt.count(sum - k)) ans += cnt[sum - k];
        cnt[sum]++;
    }

    return ans;
}
```
