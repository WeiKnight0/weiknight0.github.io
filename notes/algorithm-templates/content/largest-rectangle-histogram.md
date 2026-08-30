---
title: "柱状图最大矩形：单调栈"
category: "栈与单调栈"
order: 48
problems:
  - "84. 柱状图中最大的矩形"
  - "85. 最大矩形"
keywords:
  - "单调栈"
  - "矩形"
  - "柱状图"
  - "哨兵"
tags:
  - "矩形"
  - "单调递增栈"
  - "哨兵"
---

```cpp
int largestRectangleArea(vector<int>& heights) {
    heights.push_back(0);
    vector<int> st;
    int ans = 0;
    for (int i = 0; i < (int) heights.size(); i++) {
        while (!st.empty() && heights[st.back()] > heights[i]) {
            int h = heights[st.back()];
            st.pop_back();
            int left = st.empty() ? -1 : st.back();
            ans = max(ans, h * (i - left - 1));
        }
        st.push_back(i);
    }
    heights.pop_back();
    return ans;
}
```
