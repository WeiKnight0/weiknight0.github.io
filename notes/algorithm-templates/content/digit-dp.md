---
title: "数位 DP：记忆化搜索"
category: "动态规划"
order: 65
problems:
  - "2376. 统计特殊整数"
  - "233. 数字 1 的个数"
keywords:
  - "数位DP"
  - "记忆化搜索"
  - "is_limit"
  - "灵神风格"
tags:
  - "灵神风格"
  - "is_limit"
  - "is_num"
---

```cpp
// 统计 [1,n] 中没有重复数字的正整数个数
int countSpecialNumbers(int n) {
    string s = to_string(n);
    int m = s.length();
    vector<vector<int>> memo(m, vector<int>(1 << 10, -1));

    auto dfs = [&](auto&& dfs, int i, int mask, bool is_limit, bool is_num) -> int {
        if (i == m) {
            return is_num;
        }
        if (!is_limit && is_num && memo[i][mask] != -1) {
            return memo[i][mask];
        }

        int res = 0;
        if (!is_num) {
            res = dfs(dfs, i + 1, mask, false, false); // 跳过当前数位
        }
        int up = is_limit ? s[i] - '0' : 9;
        for (int d = 1 - is_num; d <= up; d++) {
            if ((mask >> d & 1) == 0) {
                res += dfs(dfs, i + 1, mask | (1 << d), is_limit && d == up, true);
            }
        }
        if (!is_limit && is_num) {
            memo[i][mask] = res;
        }
        return res;
    };

    return dfs(dfs, 0, 0, true, false);
}
```
