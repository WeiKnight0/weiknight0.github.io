---
title: "单调队列：滑动窗口最大值"
category: "基础容器与技巧"
order: 50
problems:
  - "239. 滑动窗口最大值"
  - "1438. 绝对差不超过限制的最长连续子数组"
keywords:
  - "单调队列"
  - "deque"
  - "滑动窗口最大值"
  - "灵神风格"
tags:
  - "deque"
  - "灵神风格"
  - "滑动窗口最大值"
---

```cpp
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> q; // 维护下标，对应元素从队首到队尾单调递减
    vector<int> ans;
    for (int i = 0; i < nums.size(); i++) {
        while (!q.empty() && nums[q.back()] <= nums[i]) {
            q.pop_back();
        }
        q.push_back(i);
        if (i - q.front() >= k) {
            q.pop_front();
        }
        if (i >= k - 1) {
            ans.push_back(nums[q.front()]);
        }
    }
    return ans;
}
```
