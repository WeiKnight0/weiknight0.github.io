---
title: "子集：选或不选"
category: "回溯"
order: 19
problems:
  - "78. 子集"
keywords:
  - "回溯"
  - "子集"
  - "选或不选"
  - "Hot100"
tags:
  - "Hot100 78"
  - "子集"
  - "DFS"
---

```cpp
vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> ans;
    vector<int> path;

    function<void(int)> dfs = [&](int i) {
        if (i == (int)nums.size()) {
            ans.push_back(path);
            return;
        }

        dfs(i + 1);

        path.push_back(nums[i]);
        dfs(i + 1);
        path.pop_back();
    };

    dfs(0);
    return ans;
}
```
