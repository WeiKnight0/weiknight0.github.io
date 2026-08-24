---
title: Array and List 数组与列表
date: 2026-02-01
lang: zh-cn
---

# Array 数组

数组是一种线性数据结构，存储在连续的内存位置。主要特点包括：
- 固定大小：数组在创建时需要指定大小，大小不可更改。
- 快速访问：可以通过索引快速访问任意元素，时间复杂度为 $O(1)$。
- 插入和删除操作较慢：在数组中间插入或删除元素需要移动其他元素，时间复杂度为 $O(n)$。

C++ 直接使用 `type array[size];` 来定义数组，或者使用 `std::array` 和 `std::vector`。

# Array List 动态数组

Array List 是一种基于数组的列表，能够根据需要自动调整大小。C++ STL 提供了 `std::vector`，Java 提供了 `ArrayList` 类。

```cpp
#include <vector>

std::vector<int> vec;
vec.push_back(10); // 添加元素
int element = vec[0]; // 访问元素
vec.pop_back(); // 删除最后一个元素
vec.size(); // 获取大小
```

```java
import java.util.ArrayList;

List<Integer> list = new ArrayList<>();
list.add(10); // 添加元素
int element = list.get(0); // 访问元素
list.remove(list.size() - 1); // 删除最后一个元素
list.size(); // 获取大小
```

# 常见题型

- 原地修改数组
- 有序数组双指针
- 前缀和与差分
- 子数组统计

# 41. 缺失的第一个正数

题目来源：[41. 缺失的第一个正数](https://leetcode.cn/problems/first-missing-positive/description/?envType=study-plan-v2&envId=top-100-liked)

题目描述：给你一个未排序的整数数组 `nums`，请找出其中没有出现的最小正整数。要求算法的时间复杂度为 $O(n)$，并且只使用 $O(1)$ 额外空间。

示例：

```text
输入：nums = [1,2,0]
输出：3
```

```text
输入：nums = [3,4,-1,1]
输出：2
```

```text
输入：nums = [7,8,9,11,12]
输出：1
```

思路：
- 长度为 `n` 的数组中，缺失的第一个正数一定在 `[1, n + 1]` 范围内。
- 对于范围内的数 `x`，它应该被放在下标 `x - 1` 的位置。
- 遍历数组，持续交换 `nums[i]` 到它应该在的位置。
- 交换结束后，再从左到右检查，第一个满足 `nums[i] != i + 1` 的位置，答案就是 `i + 1`。
- 如果所有位置都正确，说明 `[1, n]` 都出现了，答案是 `n + 1`。

注意：交换前要判断目标位置是否已经是相同的值，否则遇到重复数字会死循环。

输入格式：

```text
n
nums[0] nums[1] ... nums[n-1]
```

输出格式：一行，一个整数，表示缺失的最小整数。

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

    for (int i = 0; i < n; i++) {
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            swap(nums[i], nums[nums[i] - 1]);
        }
    }

    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) {
            cout << i + 1 << '\n';
            return 0;
        }
    }

    cout << n + 1 << '\n';
    return 0;
}
```
