---
title: "LogTrick：子数组 OR 去重"
category: "位运算"
order: 75
problems:
  - "898. 子数组按位或操作"
  - "3171. 找到按位或最接近 K 的子数组"
keywords:
  - "LogTrick"
  - "AND"
  - "OR"
  - "子数组"
tags:
  - "AND/OR"
  - "LogTrick"
  - "子数组"
---

```cpp
vector<int> distinctSubarrayORs(vector<int>& nums) {
    vector<pair<int, int>> cur;
    vector<int> all;
    for (int i = 0; i < (int) nums.size(); i++) {
        for (auto& p : cur) p.first |= nums[i];
        cur.push_back({nums[i], i});

        int write = 0;
        for (auto p : cur) {
            if (write == 0 || cur[write - 1].first != p.first) cur[write++] = p;
        }
        cur.resize(write);
        for (auto [v, left] : cur) all.push_back(v);
    }
    sort(all.begin(), all.end());
    all.erase(unique(all.begin(), all.end()), all.end());
    return all;
}
```
