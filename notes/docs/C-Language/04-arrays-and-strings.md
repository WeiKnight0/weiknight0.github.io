---
title: C Arrays and Strings 数组与字符串
date: 2026-08-27
lang: zh-cn
tags:
  - C
  - Array
---

# C Arrays and Strings 数组与字符串

## 1. 数组的边界与初始化

数组下标从 0 开始，长度为 `n` 的数组合法下标是 `0` 到 `n - 1`。C 不会自动进行边界检查，越界访问是未定义行为。

```c
int values[5] = {1, 2, 3};  /* 后两个元素初始化为 0 */
int all_zero[5] = {0};
```

数组名在大多数表达式中会转换为指向首元素的指针，但它不是可赋值的普通指针变量：`values = other;` 非法。例外包括 `sizeof values`、`&values` 和字符串字面量初始化等场景。

## 2. 一维数组与函数参数

将数组传给函数时，实际传入的是首元素地址；函数内无法通过 `sizeof parameter` 得到原数组长度，长度应由额外参数传递。

```c
#include <stdio.h>

int sum_array(const int values[], int count)
{
    int i;
    int sum;

    sum = 0;
    for (i = 0; i < count; i = i + 1) {
        sum = sum + values[i];
    }
    return sum;
}

int main(void)
{
    int values[4] = {2, 4, 6, 8};

    printf("%d\n", sum_array(values, 4));
    return 0;
}
```

`const int values[]` 表示函数不能通过该参数修改元素，不能阻止调用方本身修改数组。

## 3. 二维数组

`int matrix[3][4];` 是“3 个元素的数组，每个元素又是 4 个 `int` 的数组”。按行连续存放。作为形参时，除第一维外的维度必须已知，编译器需要它计算每一行的跨度。

```c
int sum_matrix(const int matrix[][3], int rows)
{
    int i;
    int j;
    int sum;

    sum = 0;
    for (i = 0; i < rows; i = i + 1) {
        for (j = 0; j < 3; j = j + 1) {
            sum = sum + matrix[i][j];
        }
    }
    return sum;
}
```

## 4. 字符数组与 C 字符串

C 字符串是以空字符 `\0` 结尾的字符序列。`char word[] = "cat";` 实际需要 4 个元素：`'c'`、`'a'`、`'t'`、`'\0'`。

| 声明 | 结果 |
| --- | --- |
| `char a[] = "abc";` | 可修改数组元素，长度为 4 |
| `char a[3] = {'a', 'b', 'c'};` | 不是 C 字符串，没有结尾 `\0` |
| `char *p = "abc";` | `p` 指向字符串字面量，不能修改 `p[0]` |

`strlen` 不计 `\0`；`sizeof` 对数组给出整个数组字节数，但对指针只给出指针本身大小。`strcpy`、`strcat` 要求目标空间足够，`scanf("%s", word)` 不会自动知道数组容量，应使用宽度限制，如 `scanf("%19s", word)`。

## 考试检查表

- 字符数组是否预留了 `\0`？
- 数组长度是否由参数传入，而不是在函数内错误地使用 `sizeof`？
- 二维数组形参除第一维外的维度是否已写明？
- 字符串输入是否限制宽度，并确保输出和复制有足够空间？
