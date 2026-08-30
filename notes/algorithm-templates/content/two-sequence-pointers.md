---
title: "双序列双指针：合并有序数组"
category: "双指针"
order: 45
problems:
  - "88. 合并两个有序数组"
  - "986. 区间列表的交集"
keywords:
  - "双序列"
  - "双指针"
  - "merge"
  - "有序数组"
tags:
  - "双序列"
  - "merge"
  - "O(n+m)"
---

```cpp
vector<int> mergeSorted(vector<int>& a, vector<int>& b) {
    vector<int> ans;
    int i = 0, j = 0;
    while (i < (int) a.size() || j < (int) b.size()) {
        if (j == (int) b.size() || i < (int) a.size() && a[i] <= b[j]) {
            ans.push_back(a[i++]);
        } else {
            ans.push_back(b[j++]);
        }
    }
    return ans;
}
```
