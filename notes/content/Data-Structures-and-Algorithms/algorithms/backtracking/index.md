---
title: Backtracking 回溯算法
date: 2026-02-01
description: 子集、组合、排列等枚举型问题的递归搜索与剪枝。
lang: zh-cn
---

# 回溯基本框架

回溯适合处理“枚举所有可行解”的问题。它通常用递归维护一条当前路径 `path`，在搜索过程中做选择，递归进入下一层，再撤销选择回到上一层。

## 递归三问

回溯算法需要先确定三个问题：

1. **路径**：已经做出的选择，通常由 `path` 保存。
2. **选择列表**：当前还可以做出的选择，通常由循环枚举，或由下标 `start`、`used` 数组等状态限定。
3. **结束条件**：决策树到达叶子、无法继续选择，或已经得到一个完整合法解的条件。

递归函数负责在当前路径上枚举选择列表；做出选择后进入下一层，递归返回时撤销这次选择。先写清这三个部分，`dfs` 的参数、循环范围和终止条件就自然确定了。

伪代码：
```text
result = []
def backtrack(路径, 选择列表):
    if 满足结束条件:          # 第三问：结束条件是什么？
        result.add(路径)
        return

    for 选择 in 选择列表:     # 第二问：选择列表怎么构建？
        做选择                # 把选择加入路径
        backtrack(路径, 新选择列表)
        撤销选择              # 回溯的核心：恢复现场
```

# 子集型回溯

子集型回溯用于枚举一个集合的所有子集。每个元素可以选择要或者不要，因此可以看成一棵二叉搜索树；也可以枚举下一个要加入 `path` 的元素，把搜索过程看成一棵多叉树。

## 代码模板

### 选或不选

```cpp
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> ans;
        vector<int> path;

        auto dfs = [&](this auto& dfs, int i) -> void {
            if (i == n) {
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
};
```

### 枚举下一个数

```cpp
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> ans;
        vector<int> path;

        auto dfs = [&](this auto& dfs, int i) -> void {
            ans.push_back(path);

            for (int j = i; j < n; j++) {
                path.push_back(nums[j]);
                dfs(j + 1);
                path.pop_back();
            }
        };

        dfs(0);
        return ans;
    }
};
```

## 例题：[78. 子集](https://leetcode.cn/problems/subsets/)

题目描述：给你一个整数数组 `nums`，数组中的元素互不相同。返回该数组所有可能的子集（幂集）。解集不能包含重复的子集，可以按任意顺序返回。

输入：第一行输入整数 `n`，表示数组长度。第二行输入 `n` 个整数，表示数组 `nums`。

输出：每行输出一个子集，元素之间用空格分隔。空子集输出 `[]`。

示例：

- 输入：

  ```text
  3
  1 2 3
  ```

- 输出：

  ```text
  []
  3
  2
  2 3
  1
  1 3
  1 2
  1 2 3
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：每个元素都有选和不选两种状态。递归到第 `i` 个元素时，先递归“不选 `nums[i]`”，再把 `nums[i]` 加入路径递归“选 `nums[i]`”。当 `i == n` 时，当前路径就是一个子集。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    vector<vector<int>> ans;
    vector<int> path;

    auto dfs = [&](this auto& dfs, int i) -> void {
        if (i == n) {
            ans.push_back(path);
            return;
        }

        dfs(i + 1);

        path.push_back(nums[i]);
        dfs(i + 1);
        path.pop_back();
    };

    dfs(0);

    for (const vector<int>& subset : ans) {
        if (subset.empty()) {
            cout << "[]" << '\n';
            continue;
        }

        for (int i = 0; i < (int)subset.size(); i++) {
            if (i > 0) cout << ' ';
            cout << subset[i];
        }
        cout << '\n';
    }

    return 0;
}
```

</details>

# 组合型回溯

组合型回溯要求路径上的元素满足某些条件，例如元素个数为 `k`，或者元素和等于 `target`。由于结果不关心顺序，递归时通常从当前位置向后选择，避免产生重复组合。

组合型回溯常见剪枝：如果剩余元素数量不足以填满 `path`，或者当前和已经超过目标值，可以提前返回。

## 代码模板

```cpp
class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        int n = candidates.size();
        vector<vector<int>> ans;
        vector<int> path;

        auto dfs = [&](this auto& dfs, int i, int t) -> void {
            if (t == 0) {
                ans.push_back(path);
                return;
            }
            if (i == n || t < 0) {
                return;
            }

            dfs(i + 1, t);

            path.push_back(candidates[i]);
            dfs(i, t - candidates[i]); // 同一个数可以重复选择，下一层仍从 i 开始
            path.pop_back();
        };

        dfs(0, target);
        return ans;
    }
};
```

## 例题：[39. 组合总和](https://leetcode.cn/problems/combination-sum/)

题目描述：给你一个无重复元素的整数数组 `candidates` 和一个目标整数 `target`，找出 `candidates` 中可以使数字和为 `target` 的所有不同组合。`candidates` 中的同一个数字可以无限制重复选取。

输入：第一行输入整数 `n` 和 `target`。第二行输入 `n` 个整数，表示数组 `candidates`。

输出：每行输出一个组合，元素之间用空格分隔。如果没有合法组合，不输出任何内容。

示例：

- 输入：

  ```text
  4 7
  2 3 6 7
  ```

- 输出：

  ```text
  7
  2 2 3
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：对每个 `candidates[i]`，可以选择“不选它”，转到 `i + 1`；也可以选择“选它”，因为同一个数可以重复选，所以下一个状态仍然停留在 `i`，同时目标和减少 `candidates[i]`。当剩余目标和为 `0` 时，当前路径就是一个合法组合。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, target;
    cin >> n >> target;

    vector<int> candidates(n);
    for (int i = 0; i < n; i++) {
        cin >> candidates[i];
    }

    vector<vector<int>> ans;
    vector<int> path;

    auto dfs = [&](this auto& dfs, int i, int rest) -> void {
        if (rest == 0) {
            ans.push_back(path);
            return;
        }
        if (i == n || rest < 0) {
            return;
        }

        dfs(i + 1, rest);

        path.push_back(candidates[i]);
        dfs(i, rest - candidates[i]);
        path.pop_back();
    };

    dfs(0, target);

    for (const vector<int>& combination : ans) {
        for (int i = 0; i < (int)combination.size(); i++) {
            if (i > 0) cout << ' ';
            cout << combination[i];
        }
        cout << '\n';
    }

    return 0;
}
```

</details>

# 排列型回溯

排列型回溯要求每个位置填入一个还没有使用过的元素。和子集型、组合型不同，排列型回溯通常需要一个 `used` 数组记录哪些元素已经在路径中。

## 代码模板

### 无重复元素

```cpp
class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> ans;
        vector<int> path;
        vector<bool> used(n, false);

        auto dfs = [&](this auto& dfs, int i) -> void {
            if (i == n) {
                ans.push_back(path);
                return;
            }

            for (int j = 0; j < n; j++) { // 使用“选下一个数”的逻辑，从第0开始遍历到第n-1个数
                if (used[j]) {
                    continue;
                }

                used[j] = true;
                path.push_back(nums[j]);
                dfs(i + 1);
                path.pop_back();
                used[j] = false;
            }
        };

        dfs(0);
        return ans;
    }
};
```

### 有重复元素

如果 `nums` 中可能有重复数字，需要先排序，并在同一层跳过重复选择。

```cpp
// 前一个相同值未进入当前路径，说明 nums[j] 是同层重复选择。
class Solution {
public:
    vector<vector<int>> permuteUnique(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        vector<vector<int>> ans;
        vector<int> path;
        vector<bool> used(n, false);

        auto dfs = [&](this auto& dfs, int i) -> void {
            if (i == n) {
                ans.push_back(path);
                return;
            }

            for (int j = 0; j < n; j++) {
                if (used[j]) {
                    continue;
                }
                if (j > 0 && nums[j] == nums[j - 1] && !used[j - 1]) {
                    continue;
                }

                used[j] = true;
                path.push_back(nums[j]);
                dfs(i + 1);
                path.pop_back();
                used[j] = false;
            }
        };

        dfs(0);
        return ans;
    }
};
```

## 例题：[46. 全排列](https://leetcode.cn/problems/permutations/)

题目描述：给定一个不含重复数字的数组 `nums`，返回其所有可能的全排列。你可以按任意顺序返回答案。

输入：第一行输入整数 `n`，表示数组长度。第二行输入 `n` 个整数，表示数组 `nums`。

输出：每行输出一个排列，元素之间用空格分隔。

示例：

- 输入：

  ```text
  3
  1 2 3
  ```

- 输出：

  ```text
  1 2 3
  1 3 2
  2 1 3
  2 3 1
  3 1 2
  3 2 1
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：排列型回溯按位置填数。递归到第 `i` 个位置时，枚举所有还没有使用过的 `nums[j]` 放入路径，并用 `used[j]` 标记该数已经被使用。当路径长度等于 `n` 时，得到一个完整排列。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    vector<vector<int>> ans;
    vector<int> path;
    vector<int> used(n, 0);

    auto dfs = [&](this auto& dfs, int i) -> void {
        if (i == n) {
            ans.push_back(path);
            return;
        }

        for (int j = 0; j < n; j++) {
            if (used[j]) {
                continue;
            }

            used[j] = 1;
            path.push_back(nums[j]);
            dfs(i + 1);
            path.pop_back();
            used[j] = 0;
        }
    };

    dfs(0);

    for (const vector<int>& permutation : ans) {
        for (int i = 0; i < (int)permutation.size(); i++) {
            if (i > 0) cout << ' ';
            cout << permutation[i];
        }
        cout << '\n';
    }

    return 0;
}
```

</details>
