---
title: "全排列：used 标记"
category: "回溯"
order: 20
problems:
  - "46. 全排列"
keywords:
  - "回溯"
  - "全排列"
  - "used"
  - "Hot100"
tags:
  - "Hot100 46"
  - "全排列"
  - "used"
---

```cpp
vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> ans;
    vector<int> path;
    vector<int> used(nums.size(), 0);

    function<void()> dfs = [&]() {
        if (path.size() == nums.size()) {
            ans.push_back(path);
            return;
        }

        for (int i = 0; i < (int)nums.size(); i++) {
            if (used[i]) continue;
            used[i] = 1;
            path.push_back(nums[i]);
            dfs();
            path.pop_back();
            used[i] = 0;
        }
    };

    dfs();
    return ans;
}
```
