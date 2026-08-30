---
title: "单调栈：左右最近严格更大元素"
category: "栈与单调栈"
order: 47
problems:
  - "907. 子数组的最小值之和"
  - "84. 柱状图中最大的矩形"
keywords:
  - "单调栈"
  - "左右边界"
  - "最近更大"
  - "灵神风格"
tags:
  - "灵神风格"
  - "左右边界"
  - "严格更大"
---

```cpp
// left[i] 是 nums[i] 左侧最近的严格大于 nums[i] 的数的下标，若不存在则为 -1
vector<int> leftGreater(vector<int>& nums) {
    int n = nums.size();
    vector<int> left(n, -1), st;
    for (int i = 0; i < n; i++) {
        while (!st.empty() && nums[st.back()] <= nums[i]) { // 如果求严格小于，改成 >=
            st.pop_back();
        }
        if (!st.empty()) left[i] = st.back();
        st.push_back(i);
    }
    return left;
}

// right[i] 是 nums[i] 右侧最近的严格大于 nums[i] 的数的下标，若不存在则为 n
vector<int> rightGreater(vector<int>& nums) {
    int n = nums.size();
    vector<int> right(n, n), st;
    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && nums[st.back()] <= nums[i]) { // 如果求严格小于，改成 >=
            st.pop_back();
        }
        if (!st.empty()) right[i] = st.back();
        st.push_back(i);
    }
    return right;
}
```
