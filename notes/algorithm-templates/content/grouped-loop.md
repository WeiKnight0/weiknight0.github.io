---
title: "分组循环：按连续段处理"
category: "双指针"
order: 44
problems:
  - "485. 最大连续 1 的个数"
  - "1446. 连续字符"
keywords:
  - "分组循环"
  - "连续段"
  - "一次遍历"
  - "双指针"
tags:
  - "分组循环"
  - "连续段"
  - "一次遍历"
---

```cpp
int longestGroup(vector<int>& nums) {
    int n = nums.size();
    int ans = 0;
    int i = 0;
    while (i < n) {
        int start = i;
        i++;
        while (i < n && nums[i] == nums[i - 1]) {
            i++;
        }
        ans = max(ans, i - start);
    }
    return ans;
}
```
