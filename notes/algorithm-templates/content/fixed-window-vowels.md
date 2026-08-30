---
title: "定长滑动窗口：最大元音数"
category: "滑动窗口"
order: 9
problems:
  - "1456. 定长子串中元音的最大数目"
keywords:
  - "滑动窗口"
  - "定长窗口"
  - "入更新出"
  - "元音"
tags:
  - "1456"
  - "定长窗口"
  - "入-更新-出"
---

```cpp
bool isVowel(char c) {
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}

int maxVowels(string s, int k) {
    int ans = 0;
    int cur = 0;

    for (int right = 0; right < (int)s.size(); right++) {
        if (isVowel(s[right])) {
            cur++;
        }

        int left = right - k + 1;
        if (left < 0) {
            continue;
        }

        ans = max(ans, cur);

        if (isVowel(s[left])) {
            cur--;
        }
    }

    return ans;
}
```
