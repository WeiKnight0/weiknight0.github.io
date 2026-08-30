---
title: "字母异位词分组：排序签名"
category: "数组与哈希"
order: 2
problems:
  - "49. 字母异位词分组"
keywords:
  - "异位词"
  - "哈希表"
  - "字符串"
  - "排序签名"
tags:
  - "Hot100 49"
  - "哈希表"
  - "排序签名"
---

```cpp
vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> groups;

    for (const string& s : strs) {
        string key = s;
        sort(key.begin(), key.end());
        groups[key].push_back(s);
    }

    vector<vector<string>> ans;
    for (auto& [key, words] : groups) {
        ans.push_back(move(words));
    }
    return ans;
}
```
