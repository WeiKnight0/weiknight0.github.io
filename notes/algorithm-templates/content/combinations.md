---
title: "组合：从当前位置向后选择"
category: "回溯"
order: 98
problems:
  - "77. 组合"
keywords:
  - "回溯"
  - "组合"
  - "start"
  - "剪枝"
tags:
  - "LeetCode 77"
  - "组合"
  - "DFS"
---

```cpp
vector<vector<int>> combine(int n, int k) {
    vector<vector<int>> ans;
    vector<int> path;

    function<void(int)> dfs = [&](int start) {
        if ((int)path.size() == k) {
            ans.push_back(path);
            return;
        }

        int need = k - (int)path.size();
        for (int x = start; x <= n - need + 1; x++) {
            path.push_back(x);
            dfs(x + 1);
            path.pop_back();
        }
    };

    dfs(1);
    return ans;
}
```

`start` 保证下一层只选择当前数字之后的数字，避免 `[1, 2]` 和 `[2, 1]` 被当作两个组合。循环上界 `n - need + 1` 保证剩余数字足够填满路径。

若每个元素可以重复选择，递归时改为 `dfs(x)`；若输入数组可能包含重复元素，应先排序，并在同一递归层跳过相同元素。
