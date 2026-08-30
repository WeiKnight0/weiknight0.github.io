---
title: "合并区间：按左端点排序"
category: "贪心"
order: 34
problems:
  - "56. 合并区间"
keywords:
  - "贪心"
  - "区间"
  - "排序"
  - "Hot100"
tags:
  - "Hot100 56"
  - "区间"
  - "排序"
---

```cpp
vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> ans;

    for (auto& interval : intervals) {
        if (ans.empty() || interval[0] > ans.back()[1]) {
            ans.push_back(interval);
        } else {
            ans.back()[1] = max(ans.back()[1], interval[1]);
        }
    }

    return ans;
}
```
