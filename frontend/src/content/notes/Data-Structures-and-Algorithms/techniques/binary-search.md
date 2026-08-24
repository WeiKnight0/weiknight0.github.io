---
title: Binary Search 二分查找
date: 2025-10-07
lang: zh-cn
---

# Binary Search 二分查找
二分查找（Binary Search）是一种在有序数组中查找特定元素的高效算法。它通过反复将搜索区间减半来快速定位目标元素的位置。二分查找的时间复杂度为 $O(\log n)$，远优于线性查找的 $O(n)$。

核心介绍视频：[二分查找 红蓝染色法](https://www.bilibili.com/video/BV1AP41137w7)

对于二分查找的实现，主要有三种区间划分方式，每种方式又分为第一个 大于等于、大于、小于等于、小于 `target`四种情况。
下面给出大于等于的代码。其余情况可以转化成大于等于。
## 情况1：`[left, right]` 左闭右闭区间
```cpp
// 在arr[0..n-1]中查找第一个大于等于target的元素下标（lower_bound），找不到返回-1
int binary_search_lower_bound(int arr[], int n, int target) {
    int left = 0, right = n - 1; // [left, right]
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < target) {
            left = mid + 1;    // [mid+1, right]
        } else {
            right = mid - 1;   // [left, mid-1]
        }
    }
    if (left == n){ // 如果找不到，最终left一定在数组外面
        return -1;
    }
    return left;
}
```
## 情况2：`[left, right)` 左闭右开区间
```cpp
// 在arr[0..n-1]中查找第一个大于等于target的元素下标，找不到返回-1
int binary_search_lower_bound(int arr[], int n, int target) {
    int left = 0, right = n; // [left, right)
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < target) {
            left = mid + 1; // 搜索右半部分 [mid+1, right)
        } else {
            right = mid; // 搜索左半部分 [left, mid)
        }
    }
    if (left == n){
        return -1;
    }
    return left; // 也可以return right
}
```
## 情况3：`(left, right)` 左开右开区间
```cpp
// 在arr[0..n-1]中查找第一个大于等于target的元素下标（lower_bound），找不到返回-1
int binary_search_lower_bound(int arr[], int n, int target) {
    int left = -1, right = n; // (left, right)
    
    while (left + 1 < right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < target) {
            left = mid; // 搜索右半部分 (mid, right)
        } else {
            right = mid; // 搜索左半部分 (left, mid)
        }
    }
    if (right == n) {
        return -1; // 没有不小于target的元素
    }
    return right;
}
```

## 关键：循环不变量
二分查找的循环不变量和题目本身密切相关，不能完全套模板。核心要求在于：**确保 `target` 总是会在规定的区间内**，并且在每次迭代后正确更新区间边界以保持这个不变量。

注意，**循环不变量关心的是区间外的元素**，而不是区间内的元素。例如，left的左边永远小于target，right的右边永远大于等于target。这样才能保证在循环结束时，left和right指向的区间内包含target。

一定要分三种情况来分析循环不变量：`arr[mid] < target`、`arr[mid] == target`、`arr[mid] > target`。对于每种情况，分析 `target` 在哪个区间内，并更新 `left` 和 `right` 来保持循环不变量。为了保证准确，可以不合并 `arr[mid] == target` 的情况。

例1：查找 `target` 的下标
- 循环不变量：`target` 在 `[left, right]` 内
- 更新：如果 `arr[mid] < target`，则 `left = mid + 1`；若 `arr[mid] > target`，则 `right = mid - 1`；若 `arr[mid] == target`，则直接返回 `mid`。
```cpp
int binary_search(int arr[], int n, int target) {
    int left = 0, right = n - 1; // [left, right]
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < target) {
            left = mid + 1;    // [mid+1, right]
        } else if (arr[mid] > target) {
            right = mid - 1;   // [left, mid-1]
        } else {
            return mid; // 找到目标元素，返回下标
        }
    }
    return -1; // 没有找到目标元素
}
```
例2：
已知一个长度为 n 的数组，预先按照升序排列，经由 1 到 n 次 旋转 后，得到输入数组。例如，原数组 nums = [0,1,2,4,5,6,7] 在变化后可能得到：
若旋转 4 次，则可以得到 [4,5,6,7,0,1,2]
若旋转 7 次，则可以得到 [0,1,2,4,5,6,7]
注意，数组 [a[0], a[1], a[2], ..., a[n-1]] 旋转一次 的结果为数组 [a[n-1], a[0], a[1], a[2], ..., a[n-2]] 。

给你一个元素值 互不相同 的数组 nums ，它原来是一个升序排列的数组，并按上述情形进行了多次旋转。请你找出并返回数组中的 最小元素 。

你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。
- 关键：循环不变量：最小值的下标 在 `[left, right]` 内
- 更新：如果 `arr[mid] < arr[right]`，则 `right = mid`（**注意：这里不能是 `right = mid - 1`！因为mid可能就是最小值的下标**）；若 `arr[mid] > arr[right]`，则 `left = mid + 1`（**注意这里要加1，因为mid不可能是最小值的下标**）；若 `arr[mid] == arr[right]`，则 `return mid`，因为此时 `mid` 就是最小值的下标。
- 注意，对于高手，可以把 `arr[mid] == arr[right]` 的情况合并到 `arr[mid] > arr[right]` 中，因为当 `arr[mid] == arr[right]` 时，`mid` 就是最小值的下标，此时 `left = mid + 1` 也不会错，此时 `left == right + 1`，循环结束后 `right` 就是最小值的下标。但不建议这样写，因为不够直观，容易出错。
```cpp
int findMin(int arr[], int n) {
    int left = 0, right = n - 1; // [left, right]
    
    while (left < right) { // 注意这里是 <，而不是 <=
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < arr[right]) {
            right = mid; // 最小值在 [left, mid]
        } else if (arr[mid] > arr[right]) {
            left = mid + 1; // 最小值在 [mid+1, right]
        } else {
            return mid; // arr[mid] == arr[right]，mid就是最小值的下标
        }
    }
    return right; // 循环结束后，left == right，指向最小值的下标
}
```

# STL中的二分查找
在 C++ STL 中，二分查找相关的函数主要有 `std::lower_bound` 和 `std::upper_bound`。这些函数都要求输入的范围是有序的。
- `lower_bound(first, last, num)`：返回第一个 **不小于（大于等于）** 目标值的元素位置。
- `upper_bound(first, last, num)`：返回第一个 **大于** 目标值的元素位置。
注意，这两个函数返回的是指针或迭代器；此外，如果目标值不存在，`lower_bound` 返回的是第一个大于目标值的位置。
两个函数的输入均为 **左闭右开区间** `[first, last)`。
```cpp
int arr[] = {1, 2, 2, 3, 4};
int n = 5;
int* lower = std::lower_bound(arr, arr + n, 2); // 指向第一个2的位置
int* upper = std::upper_bound(arr, arr + n, 2); // 指向第一个大于2的位置（即3的位置）
```
```cpp
// 查找第一个不小于target的元素下标
int lower_bound_search(int arr[], int n, int target) {
    int* it = std::lower_bound(arr, arr + n, target);
    if (it != arr + n && *it == target) {
        return it - arr;
    }
    return -1;
}
```
```cpp
// 查找第一个大于target的元素的前一个下标（即最后一个等于target的元素下标）
int upper_bound_search(int arr[], int n, int target) {
    int* it = std::upper_bound(arr, arr + n, target);
    if (it != arr && *(it - 1) == target) {
        return (it - 1) - arr;
    }
    return -1;
}
```
此外，还有 `std::binary_search` 函数，用于判断一个元素是否存在于有序范围内。
```cpp
bool is_exist(int arr[], int n, int target) {
    return std::binary_search(arr, arr + n, target);
}
```

# 二分答案
当问题的答案具有**单调性**、有明确的`check()`函数、答案范围明确（一般是闭区间`[left, right]`）时，就可以尝试二分答案。

主要分为以下两种情况：
- 找最大值的`true`，`check()`随`x`增大从`true`变为`false`
代码示例：
```cpp
int binary_search_max(int left, int right) { // [left, right]
    while (left <= right) {
        int mid = left + (right - left + 1) / 2; // 向上取整
        if (check(mid)) { // check()随x增大从true变为false
            left = mid + 1; // [mid, right]
        } else {
            right = mid - 1; // [left, mid-1]
        }
    }
    return right;
}
```
- 找最小值，`check()`随`x`增大从`false`变为`true`
代码示例：
```cpp
int binary_search_min(int left, int right) { // [left, right]
    while (left <= right) {
        int mid = left + (right - left) / 2; // 向下取整
        if (check(mid)) { // check()随x增大从false变为true
            right = mid - 1; // [left, mid]
        } else {
            left = mid + 1; // [mid+1, right]
        }
    }
    return left;
}
```
总结表格：
| 问题类型 | check(x) 单调性 | 目标答案 | 状态更新 | 循环结束时状态 | 返回值 |
|---------|----------------|----------|----------|----------------|---------|
| **最大化问题**<br>(找最大的可行x) | `[T, T, ..., T, F, F, ..., F]`<br>x增大从true变false | 最后一个true | `if(check(mid)) l=mid+1;`<br>`else r=mid-1;` | `l` → 第一个false<br>`r` → 最后一个true | **`r`** |
| **最小化问题**<br>(找最小的可行x) | `[F, F, ..., F, T, T, ..., T]`<br>x增大从false变true | 第一个true | `if(check(mid)) r=mid-1;`<br>`else l=mid+1;` | `l` → 第一个true<br>`r` → 最后一个false | **`l`** |



