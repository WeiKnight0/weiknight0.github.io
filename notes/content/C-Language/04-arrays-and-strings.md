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

## 2. 二维数组

`int matrix[3][4];` 是“3 个元素的数组，每个元素又是 4 个 `int` 的数组”。按行连续存放。作为形参时，除第一维外的维度必须已知，编译器需要它计算每一行的跨度。

## 3. 函数参数传递

C 的参数传递始终是值传递。数组作为实参传入函数时，形参会直接按指针处理：`int p[]` 调整为 `int *p`，`int p[][3]` 调整为 `int (*p)[3]`。因此函数只拿到地址，**无法知道原数组有多少个元素或多少行**；`sizeof(p)` 得到的只是指针类型的大小，长度必须额外传入。

### 一维数组形参

```c
#include <stdio.h>

void inspect_array(int p[])
{
    printf("%zu\n", sizeof(p));  // 64 位系统输出 8，32 位系统输出 4
}

int main(void)
{
    int arr[5] = {1, 2, 3, 4, 5};

    printf("%zu\n", sizeof(arr));  // 常见 int 为 4 字节时输出 20
    inspect_array(arr);
    return 0;
}
```

调用 `inspect_array(arr)` 时，`arr` 退化为 `&arr[0]`，传入的是 `int *`。所以 `sizeof(arr)` 在 `main` 中是整个 `int[5]` 的大小，而 `sizeof(p)` 在函数中只是 `sizeof(int *)`。需要元素个数时写为 `void inspect_array(const int p[], size_t count)`，并由调用方传入 `count`。

### 二维数组形参

```c
#include <stdio.h>

void inspect_matrix(int p[][3])
{
    printf("%zu\n", sizeof(p));     // 64 位系统输出 8，32 位系统输出 4
    printf("%zu\n", sizeof(p[0]));  // 一行 int[3]；常见 int 为 4 字节时输出 12
}

int main(void)
{
    int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};

    printf("%zu\n", sizeof(matrix));  // 常见 int 为 4 字节时输出 24
    inspect_matrix(matrix);
    return 0;
}
```

`int p[][3]` 在函数参数位置等价于 `int (*p)[3]`：它是“指向含 3 个 `int` 的一行的指针”。因此第二维 `3` 不能省略，编译器要用它计算 `p + 1` 应跳过一整行；第一维行数仍然丢失，必须另传 `rows`。`sizeof(p[0])` 能得到一行大小，是因为 `p[0]` 在 `sizeof` 的操作数位置不发生数组退化。

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
