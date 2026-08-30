---
title: "最长无重复子串：不定长窗口"
category: "滑动窗口"
order: 7
problems:
  - "3. 无重复字符的最长子串"
keywords:
  - "滑动窗口"
  - "无重复字符"
  - "不定长窗口"
  - "越短越合法"
  - "Hot100"
tags:
  - "Hot100 3"
  - "越短越合法"
  - "不定长窗口"
---

```cpp
int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> cnt;
    int left = 0;
    int ans = 0;

    for (int right = 0; right < (int)s.size(); right++) {
        cnt[s[right]]++;

        while (cnt[s[right]] > 1) {
            cnt[s[left]]--;
            left++;
        }

        ans = max(ans, right - left + 1);
    }

    return ans;
}
```
