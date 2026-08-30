---
title: "最长连续序列：只从起点扩展"
category: "数组与哈希"
order: 3
problems:
  - "128. 最长连续序列"
keywords:
  - "哈希集合"
  - "unordered_set"
  - "连续序列"
  - "Hot100"
tags:
  - "Hot100 128"
  - "unordered_set"
  - "连续序列"
---

```cpp
int longestConsecutive(vector<int>& nums) {
    unordered_set<int> st(nums.begin(), nums.end());
    int ans = 0;

    for (int x : st) {
        if (st.count(x - 1)) continue;

        int y = x;
        while (st.count(y)) y++;
        ans = max(ans, y - x);
    }

    return ans;
}
```
