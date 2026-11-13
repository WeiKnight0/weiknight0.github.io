---
title: C Library Memory and Files 动态内存、标准库与文件
date: 2026-08-27
lang: zh-cn
tags:
  - C
  - Library
  - File
---

# C Library Memory and Files 动态内存、标准库与文件

## 1. 常用头文件

| 头文件 | 高频内容 |
| --- | --- |
| `<stdio.h>` | `printf`、`scanf`、`fopen`、`fclose`、`fgets`、`fputs` |
| `<stdlib.h>` | `malloc`、`calloc`、`realloc`、`free`、`exit`、`qsort` |
| `<string.h>` | `strlen`、`strcpy`、`strcmp`、`memcpy` |
| `<ctype.h>` | `isdigit`、`isalpha`、`tolower` |
| `<math.h>` | `sqrt`、`pow`、`fabs` |
| `<assert.h>` | `assert` |

输入输出格式必须匹配对象类型。常见对应：`int` 用 `%d`，`unsigned int` 用 `%u`，`long` 用 `%ld`，`double` 的 `printf` 用 `%f`，而 `scanf` 读 `double` 用 `%lf`，字符用 `%c`，字符串数组用 `%s`。

## 2. 动态内存

`malloc` 分配未初始化的字节，`calloc` 分配并置零，`realloc` 调整已有分配，`free` 释放。分配失败时返回 `NULL`，释放后指针值不会自动变为 `NULL`。

```c
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *values;
    int count;
    int i;

    count = 5;
    values = malloc((size_t)count * sizeof *values);
    if (values == NULL) {
        return 1;
    }
    for (i = 0; i < count; i = i + 1) {
        values[i] = i * i;
    }
    printf("%d\n", values[4]);
    free(values);
    values = NULL;
    return 0;
}
```

在 C 中不应强制转换 `malloc` 返回值；转换可能掩盖漏包含 `<stdlib.h>` 的错误。`sizeof *values` 比重复写类型更不易出错。

`realloc` 失败时原指针仍有效，因此先用临时指针接收结果，再决定是否覆盖旧指针。

## 3. 字符串库的边界

- `strlen(s)` 要求 `s` 指向以 `\0` 结尾的有效字符串。
- `strcpy(dest, src)` 不检查 `dest` 容量。
- `strcmp(a, b)` 返回小于、等于或大于 0，不承诺一定是 `-1`、`0`、`1`。
- `memcpy` 的源和目标区域不能重叠；重叠时使用 `memmove`。

## 4. 文本文件

文件操作顺序：声明 `FILE *`，`fopen`，检查是否为 `NULL`，读写，`fclose`。

```c
#include <stdio.h>

int main(void)
{
    FILE *file;
    char line[80];

    file = fopen("message.txt", "r");
    if (file == NULL) {
        return 1;
    }
    while (fgets(line, sizeof line, file) != NULL) {
        fputs(line, stdout);
    }
    fclose(file);
    return 0;
}
```

`fgets` 最多读取 `size - 1` 个字符并在成功时写入结尾 `\0`；它可能保留换行符。不要用 `while (!feof(file))` 驱动读取，因为 EOF 标志通常在一次读取失败后才设置；应直接检查读取函数返回值。

常见打开模式：`"r"` 读、`"w"` 截断写、`"a"` 追加、`"r+"` 读写、`"b"` 与前述组合表示二进制模式。二进制读写使用 `fread` 和 `fwrite`，其返回值是成功读写的元素数。

## 5. 排序与比较函数

`qsort` 的比较函数接收 `const void *`。比较整数时不要写 `return left - right;`，它可能溢出；使用三路比较。

```c
int compare_int(const void *first, const void *second)
{
    const int *left;
    const int *right;

    left = first;
    right = second;
    return (*left > *right) - (*left < *right);
}
```

## 考试检查表

- `scanf` 的普通变量是否传入地址？数组名作为字符串缓冲区时不加 `&`。
- `malloc` 后是否检查 `NULL`，每一次成功分配是否恰好 `free` 一次？
- 文件是否检查打开失败，循环是否依据实际读写函数返回值？
- `strcpy`、`sprintf` 等写入目标是否有足够容量？
