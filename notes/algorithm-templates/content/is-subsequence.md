---
title: "判断子序列：双指针扫描"
category: "双指针"
order: 46
problems:
  - "392. 判断子序列"
  - "2486. 追加字符以获得子序列"
keywords:
  - "子序列"
  - "双序列"
  - "贪心匹配"
  - "双指针"
tags:
  - "子序列"
  - "双序列"
  - "贪心匹配"
---

```cpp
bool isSubsequence(string s, string t) {
    int i = 0;
    for (char c : t) {
        if (i < (int) s.size() && s[i] == c) i++;
    }
    return i == (int) s.size();
}
```
