---
title: Sorting 排序
date: 2026-07-10
lang: zh-cn
---

排序不是 OI 中最常专门考的模块，但面试经常会问实现、复杂度、稳定性和标准库用法。

本文所有数组实现都使用 C++ `vector<int>`。

# 总览

| 排序算法 | 平均复杂度 | 最坏复杂度 | 空间复杂度 | 稳定 | 原地 | 面试重点 |
| --- | --- | --- | --- | --- | --- | --- |
| 冒泡排序 | $O(n^2)$ | $O(n^2)$ | $O(1)$ | 是 | 是 | 相邻交换，基本不实用 |
| 选择排序 | $O(n^2)$ | $O(n^2)$ | $O(1)$ | 否 | 是 | 每轮选择最小值 |
| 插入排序 | $O(n^2)$ | $O(n^2)$ | $O(1)$ | 是 | 是 | 小数组、近乎有序时效果好 |
| 希尔排序 | 取决于 gap | 取决于 gap | $O(1)$ | 否 | 是 | 分组插入排序 |
| 归并排序 | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | 是 | 否 | 分治、稳定、链表排序常用 |
| 快速排序 | $O(n \log n)$ | $O(n^2)$ | $O(\log n)$ | 否 | 是 | partition、随机 pivot |
| 堆排序 | $O(n \log n)$ | $O(n \log n)$ | $O(1)$ | 否 | 是 | 建堆、下沉 |
| 计数排序 | $O(n + k)$ | $O(n + k)$ | $O(k)$ | 可稳定 | 否 | 值域小 |
| 桶排序 | 取决于分布 | $O(n^2)$ | $O(n + k)$ | 可稳定 | 否 | 数据分布均匀 |
| 基数排序 | $O(d(n + k))$ | $O(d(n + k))$ | $O(n + k)$ | 是 | 否 | 非比较排序，按位处理 |

# Bubble Sort 冒泡排序

冒泡排序每轮把当前未排序区间的最大值交换到末尾。

```cpp
void bubbleSort(vector<int>& nums) {
    int n = nums.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j + 1 < n - i; j++) {
            if (nums[j] > nums[j + 1]) {
                swap(nums[j], nums[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }
}
```

# Selection Sort 选择排序

选择排序每轮从未排序区间中找最小值，放到当前起点。

```cpp
void selectionSort(vector<int>& nums) {
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        int minIndex = i;
        for (int j = i + 1; j < n; j++) {
            if (nums[j] < nums[minIndex]) {
                minIndex = j;
            }
        }
        swap(nums[i], nums[minIndex]);
    }
}
```

选择排序不稳定，因为交换可能打乱相同元素的原始顺序。

# Insertion Sort 插入排序

插入排序维护一个有序前缀，把当前元素插入到前缀中的正确位置。

```cpp
void insertionSort(vector<int>& nums) {
    int n = nums.size();
    for (int i = 1; i < n; i++) {
        int x = nums[i];
        int j = i - 1;
        while (j >= 0 && nums[j] > x) {
            nums[j + 1] = nums[j];
            j--;
        }
        nums[j + 1] = x;
    }
}
```

插入排序是稳定排序。近乎有序时，移动次数少，效果很好。

## Binary Insertion Sort 折半插入排序

折半插入排序在已排序前缀中使用折半查找确定插入位置。它减少了关键字比较次数，但仍然需要移动后续元素，因此平均和最坏时间复杂度仍为 $O(n^2)$。

为保持稳定性，当待插入元素与已有元素相等时，应将新元素插入到所有相等元素之后。

# Shell Sort 希尔排序

希尔排序是插入排序的改进版。它先按较大的间隔 `gap` 分组做插入排序，再逐步缩小 `gap`，最后 `gap = 1`。

```cpp
void shellSort(vector<int>& nums) {
    int n = nums.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int x = nums[i];
            int j = i;
            while (j >= gap && nums[j - gap] > x) {
                nums[j] = nums[j - gap];
                j -= gap;
            }
            nums[j] = x;
        }
    }
}
```

希尔排序不稳定，复杂度和 gap 序列有关。

# Merge Sort 归并排序

归并排序使用分治：先排序左右两半，再合并两个有序数组。

```cpp
void mergeSort(vector<int>& nums) {
    int n = nums.size();
    vector<int> temp(n);

    auto merge = [&](int left, int mid, int right) {
        int i = left;
        int j = mid + 1;
        int k = left;

        while (i <= mid && j <= right) {
            if (nums[i] <= nums[j]) {
                temp[k++] = nums[i++];
            } else {
                temp[k++] = nums[j++];
            }
        }
        while (i <= mid) {
            temp[k++] = nums[i++];
        }
        while (j <= right) {
            temp[k++] = nums[j++];
        }
        for (int p = left; p <= right; p++) {
            nums[p] = temp[p];
        }
    };

    auto dfs = [&](this auto& dfs, int left, int right)->void{
        if (left >= right) {
            return;
        }
        int mid = left + (right - left) / 2;
        dfs(left, mid);
        dfs(mid + 1, right);
        merge(left, mid, right);
    };

    dfs(0, n - 1);
}
```

归并排序稳定，因为合并时相等元素优先取左边：`nums[i] <= nums[j]`。

# Quick Sort 快速排序

快速排序核心是 partition：选一个 pivot，把小于 pivot 的放左边，大于 pivot 的放右边，再递归处理两侧。

```cpp
void quickSort(vector<int>& nums, int left, int right) {
    if (left >= right) {
        return;
    }

    // 取中间元素的值作为 pivot，避免 pivot 被交换后丢失比较基准。
    int pivot = nums[left + (right - left) / 2];
    int i = left;
    int j = right;

    // Hoare 双指针分区：循环后 [left, j] <= pivot，
    // [i, right] >= pivot，中间部分已经完成分区。
    while (i <= j) {
        while (nums[i] < pivot) {
            i++;
        }
        while (nums[j] > pivot) {
            j--;
        }
        if (i <= j) {
            swap(nums[i], nums[j]);
            i++;
            j--;
        }
    }

    quickSort(nums, left, j);
    quickSort(nums, i, right);
}

void quickSort(vector<int>& nums) {
    if (!nums.empty()) {
        quickSort(nums, 0, (int)nums.size() - 1);
    }
}
```

快排不稳定。这个模板能自然处理重复元素；中点 pivot 在有序输入上通常比固定取首尾元素更稳妥。若需要进一步降低特定数据导致最坏情况的概率，可以把 pivot 改为随机下标对应的值。

# Heap Sort 堆排序

堆排序先建大根堆，然后不断把堆顶最大值交换到数组末尾。

```cpp
void heapSort(vector<int>& nums) {
    int n = nums.size();

    auto siftDown = [&](int start, int end) {
        int root = start;
        while (root * 2 + 1 <= end) {
            int child = root * 2 + 1;
            int swapIndex = root;

            if (nums[swapIndex] < nums[child]) {
                swapIndex = child;
            }
            if (child + 1 <= end && nums[swapIndex] < nums[child + 1]) {
                swapIndex = child + 1;
            }
            if (swapIndex == root) {
                return;
            }
            swap(nums[root], nums[swapIndex]);
            root = swapIndex;
        }
    };

    for (int i = n / 2 - 1; i >= 0; i--) {
        siftDown(i, n - 1);
    }

    for (int end = n - 1; end > 0; end--) {
        swap(nums[0], nums[end]);
        siftDown(0, end - 1);
    }
}
```

堆排序不稳定，但空间复杂度是 $O(1)$。

# Counting Sort 计数排序

计数排序适合整数且值域不大的情况。

```cpp
vector<int> countingSort(vector<int>& nums) {
    if (nums.empty()) {
        return {};
    }

    int minValue = ranges::min(nums);
    int maxValue = ranges::max(nums);
    vector<int> count(maxValue - minValue + 1, 0);

    for (int x : nums) {
        count[x - minValue]++;
    }

    vector<int> ans;
    for (int i = 0; i < (int)count.size(); i++) {
        while (count[i] > 0) {
            ans.push_back(i + minValue);
            count[i]--;
        }
    }
    return ans;
}
```

如果需要稳定排序，要使用前缀和从后往前填答案。

# Bucket Sort 桶排序

桶排序把数据分到多个桶中，每个桶内部排序，最后按桶顺序合并。它通常依赖数据分布均匀。

```cpp
void bucketSort(vector<int>& nums) {
    if (nums.empty()) {
        return;
    }

    int minValue = ranges::min(nums);
    int maxValue = ranges::max(nums);
    int n = nums.size();
    int bucketCount = n;
    int bucketSize = max(1, (maxValue - minValue) / bucketCount + 1);
    vector<vector<int>> buckets(bucketCount);

    for (int x : nums) {
        int index = (x - minValue) / bucketSize;
        buckets[index].push_back(x);
    }

    int k = 0;
    for (auto& bucket : buckets) {
        sort(bucket.begin(), bucket.end());
        for (int x : bucket) {
            nums[k++] = x;
        }
    }
}
```

桶排序最坏情况下所有元素落到同一个桶，复杂度会退化。

# Radix Sort 基数排序

基数排序按位排序，常见写法是从低位到高位，每一位使用稳定的计数排序。

下面模板只处理非负整数。

```cpp
void radixSort(vector<int>& nums) {
    if (nums.empty()) {
        return;
    }

    int maxValue = ranges::max(nums);
    vector<int> output(nums.size());

    for (int exp = 1; maxValue / exp > 0; exp *= 10) {
        vector<int> count(10, 0);

        for (int x : nums) {
            count[(x / exp) % 10]++;
        }
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        for (int i = nums.size() - 1; i >= 0; i--) {
            int digit = (nums[i] / exp) % 10;
            output[--count[digit]] = nums[i];
        }
        nums = output;
    }
}
```

# C++ 标准库排序

面试中除了手写排序，也常问 C++ 标准库排序函数。

```cpp
sort(nums.begin(), nums.end());                    // 升序
sort(nums.begin(), nums.end(), greater<int>());     // 降序
stable_sort(nums.begin(), nums.end());              // 稳定排序
```

自定义比较器：

```cpp
sort(nums.begin(), nums.end(), [](int a, int b) {
    return a > b;
});
```

对结构体或 pair 排序：

```cpp
sort(items.begin(), items.end(), [](const auto& a, const auto& b) {
    if (a.first != b.first) {
        return a.first < b.first;
    }
    return a.second > b.second;
});
```

求第 k 小可以用 `nth_element`，它只保证第 k 个位置正确，左右两边不一定有序。

```cpp
nth_element(nums.begin(), nums.begin() + k, nums.end());
int kthSmallest = nums[k];
```

`partial_sort` 可以得到前 k 个有序元素：

```cpp
partial_sort(nums.begin(), nums.begin() + k, nums.end());
```

# 面试常问点

- 稳定排序：相等元素排序后相对顺序不变。
- 稳定排序：冒泡、插入、归并、计数、基数。
- 不稳定排序：选择、希尔、快速、堆。
- 快排最坏情况是 $O(n^2)$，通常由极不平衡划分导致。
- 归并排序稳定，但需要额外 $O(n)$ 空间。
- 堆排序空间复杂度好，但不稳定，实际缓存局部性也一般。
- 比较排序的时间复杂度下界是 $O(n \log n)$。
- 计数、桶、基数是非比较排序，需要额外条件，例如值域小或数据分布合适。
