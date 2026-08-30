---
title: "计数型滑动窗口：包含 abc"
category: "滑动窗口"
order: 11
problems:
  - "1358. 包含所有三种字符的子字符串数目"
keywords:
  - "滑动窗口"
  - "计数型"
  - "越长越合法"
  - "子字符串个数"
tags:
  - "1358"
  - "越长越合法"
  - "贡献 left"
---

```cpp
int numberOfSubstrings(string s) {
    int ans = 0;
    int left = 0;
    int cnt[3]{};

    for (int right = 0; right < (int)s.size(); right++) {
        cnt[s[right] - 'a']++;

        while (cnt[0] && cnt[1] && cnt[2]) {
            cnt[s[left] - 'a']--;
            left++;
        }

        ans += left;
    }

    return ans;
}
```
