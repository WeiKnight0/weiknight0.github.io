---
title: "区间贪心：最多不相交区间"
category: "贪心"
order: 77
problems:
  - "435. 无重叠区间"
  - "452. 用最少数量的箭引爆气球"
keywords:
  - "区间贪心"
  - "右端点排序"
  - "不相交区间"
  - "活动安排"
tags:
  - "区间"
  - "右端点排序"
  - "活动安排"
---

```cpp
int maxNonOverlapping(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) {
        return a[1] < b[1];
    });
    int ans = 0;
    int lastEnd = INT_MIN;
    for (auto& e : intervals) {
        if (e[0] >= lastEnd) {
            ans++;
            lastEnd = e[1];
        }
    }
    return ans;
}
```
