---
title: "恰好型滑动窗口：atMost(k) 相减"
category: "滑动窗口"
order: 43
problems:
  - "992. K 个不同整数的子数组"
  - "1248. 统计优美子数组"
keywords:
  - "恰好K"
  - "atMost"
  - "滑动窗口"
  - "计数型"
tags:
  - "恰好K"
  - "至多"
  - "计数"
---

```cpp
long long subarraysWithExactlyK(vector<int>& nums, int k) {
    auto atMost = [&](int limit) -> long long {
        if (limit < 0) return 0;
        long long ans = 0;
        unordered_map<int, int> cnt;
        int left = 0;
        for (int right = 0; right < (int) nums.size(); right++) {
            if (cnt[nums[right]]++ == 0) limit--;
            while (limit < 0) {
                if (--cnt[nums[left]] == 0) limit++;
                left++;
            }
            ans += right - left + 1;
        }
        return ans;
    };
    return atMost(k) - atMost(k - 1);
}
```
