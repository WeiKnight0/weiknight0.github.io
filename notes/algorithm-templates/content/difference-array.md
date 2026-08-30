---
title: "一维差分：区间加法"
category: "基础容器与技巧"
order: 51
problems:
  - "1109. 航班预订统计"
  - "1094. 拼车"
keywords:
  - "差分"
  - "区间更新"
  - "前缀和"
  - "扫描线"
tags:
  - "差分"
  - "区间更新"
  - "前缀还原"
---

```cpp
vector<long long> rangeAdd(int n, vector<array<int, 3>>& queries) {
    vector<long long> diff(n + 1);
    for (auto [l, r, v] : queries) {
        diff[l] += v;
        if (r + 1 < n) diff[r + 1] -= v;
    }
    vector<long long> ans(n);
    long long cur = 0;
    for (int i = 0; i < n; i++) {
        cur += diff[i];
        ans[i] = cur;
    }
    return ans;
}
```
