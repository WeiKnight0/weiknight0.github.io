---
title: 238. 除自身以外数组的乘积
date: 2026-09-07
lang: zh-cn
---

给定整数数组 `nums`，返回数组 `answer`，其中 `answer[i]` 等于 `nums` 中除 `nums[i]` 之外其余所有元素的乘积。不能使用除法，并要求在 $O(n)$ 时间内完成。

[题目链接](https://leetcode.cn/problems/product-of-array-except-self/)

## 示例

### 示例 1

- 输入：`nums = [1,2,3,4]`
- 输出：`[24,12,8,6]`

### 示例 2

- 输入：`nums = [-1,1,0,-3,3]`
- 输出：`[0,0,9,0,0]`

## 数据范围

- $2 \leq nums.length \leq 10^5$
- $-30 \leq nums[i] \leq 30$
- 任意前缀或后缀的乘积都在 32 位整数范围内

## 前缀乘积与后缀乘积

对下标 $i$，答案可以拆成左右两部分：

$$
answer[i]=\left(\prod_{j=0}^{i-1}nums[j]\right)
\left(\prod_{j=i+1}^{n-1}nums[j]\right)
$$

空区间的乘积为 `1`，所以首元素没有左侧元素时左侧乘积为 `1`，末元素没有右侧元素时右侧乘积也为 `1`。

## 方法一：两个辅助数组

`prefix[i]` 保存 `nums[i]` 左侧所有元素的乘积，`suffix[i]` 保存右侧所有元素的乘积。

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> prefix(n, 1), suffix(n, 1), answer(n);
        for (int i = 1; i < n; i++) {
            prefix[i] = prefix[i - 1] * nums[i - 1];
        }
        for (int i = n - 2; i >= 0; i--) {
            suffix[i] = suffix[i + 1] * nums[i + 1];
        }
        for (int i = 0; i < n; i++) {
            answer[i] = prefix[i] * suffix[i];
        }
        return answer;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$，不计算返回数组

## 方法二：复用答案数组

先把左侧乘积直接写入 `answer`。随后从右向左扫描，用一个变量 `suffix` 保存当前位置右侧的乘积：

1. `answer[i] *= suffix`，合并左右两侧；
2. `suffix *= nums[i]`，供下一个位置使用。

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n, 1);
        for (int i = 1; i < n; i++) {
            answer[i] = answer[i - 1] * nums[i - 1];
        }

        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= suffix;
            suffix *= nums[i];
        }
        return answer;
    }
};
```

以 `[1,2,3,4]` 为例，第一次扫描得到左侧乘积 `[1,1,2,6]`。从右向左乘上后缀乘积 `1、4、12、24` 后，得到 `[24,12,8,6]`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$，返回数组不计入额外空间

## 正确性

第一次扫描后，`answer[i]` 恰好等于下标 `i` 左侧全部元素的乘积。第二次扫描处理 `i` 时，`suffix` 恰好等于下标 `i` 右侧全部元素的乘积。二者相乘正好排除 `nums[i]`，并包含其他每个元素一次。

## 易错点

- 不能用数组总乘积除以 `nums[i]`，题目禁止除法，而且数组可能含零。
- 更新 `suffix` 必须在写入 `answer[i]` 之后，否则会把 `nums[i]` 乘入自己的答案。
- 前缀和后缀的初值都是乘法单位元 `1`，不是 `0`。

## 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/product-of-array-except-self/solutions/)
