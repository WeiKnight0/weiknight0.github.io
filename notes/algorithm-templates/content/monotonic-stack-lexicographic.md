---
title: "最小字典序：单调栈去重"
category: "栈与单调栈"
order: 49
problems:
  - "316. 去除重复字母"
  - "1081. 不同字符的最小子序列"
keywords:
  - "单调栈"
  - "字典序"
  - "去重"
  - "贪心"
tags:
  - "字典序"
  - "去重"
  - "贪心"
---

```cpp
string removeDuplicateLetters(string s) {
    vector<int> last(26), inStack(26);
    for (int i = 0; i < (int) s.size(); i++) last[s[i] - 'a'] = i;

    string st;
    for (int i = 0; i < (int) s.size(); i++) {
        int x = s[i] - 'a';
        if (inStack[x]) continue;
        while (!st.empty() && st.back() > s[i] && last[st.back() - 'a'] > i) {
            inStack[st.back() - 'a'] = 0;
            st.pop_back();
        }
        st.push_back(s[i]);
        inStack[x] = 1;
    }
    return st;
}
```
