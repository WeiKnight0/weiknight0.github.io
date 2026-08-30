---
title: "最小覆盖子串：缺口计数"
category: "滑动窗口"
order: 8
problems:
  - "76. 最小覆盖子串"
keywords:
  - "滑动窗口"
  - "最短窗口"
  - "字符串"
  - "Hot100"
tags:
  - "Hot100 76"
  - "最短窗口"
  - "字符串"
---

```cpp
string minWindow(string s, string t) {
    vector<int> need(128, 0);
    for (char c : t) need[c]++;

    int missing = t.size();
    int left = 0;
    int bestLeft = 0;
    int bestLen = INT_MAX;

    for (int right = 0; right < (int)s.size(); right++) {
        if (need[s[right]] > 0) missing--;
        need[s[right]]--;

        while (missing == 0) {
            int len = right - left + 1;
            if (len < bestLen) {
                bestLen = len;
                bestLeft = left;
            }

            need[s[left]]++;
            if (need[s[left]] > 0) missing++;
            left++;
        }
    }

    return bestLen == INT_MAX ? "" : s.substr(bestLeft, bestLen);
}
```
