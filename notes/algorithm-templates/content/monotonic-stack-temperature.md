---
title: "每日温度：递减栈"
category: "栈与单调栈"
order: 16
problems:
  - "739. 每日温度"
keywords:
  - "单调栈"
  - "下一个更大元素"
  - "递减栈"
  - "Hot100"
tags:
  - "Hot100 739"
  - "单调栈"
  - "下一个更大元素"
---

```cpp
vector<int> dailyTemperatures(vector<int>& temperatures) {
    int n = temperatures.size();
    vector<int> ans(n, 0);
    stack<int> st;

    for (int i = 0; i < n; i++) {
        while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
            int j = st.top();
            st.pop();
            ans[j] = i - j;
        }
        st.push(i);
    }

    return ans;
}
```
