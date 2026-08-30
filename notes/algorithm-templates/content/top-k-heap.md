---
title: "Top K 高频：大根堆"
category: "堆与优先队列"
order: 17
problems:
  - "347. 前 K 个高频元素"
keywords:
  - "堆"
  - "优先队列"
  - "TopK"
  - "Hot100"
tags:
  - "Hot100 347"
  - "priority_queue"
  - "TopK"
---

```cpp
vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> mp;
    for (auto x : nums) {
        mp[x]++;
    }

    priority_queue<pair<int, int>, vector<pair<int, int>>, less<pair<int, int>>> q;
    for (auto [x1, x2] : mp) {
        q.push({x2, x1});
    }

    vector<int> ans;
    while (k && !q.empty()) {
        ans.push_back(q.top().second);
        q.pop();
        k--;
    }
    return ans;
}
```
