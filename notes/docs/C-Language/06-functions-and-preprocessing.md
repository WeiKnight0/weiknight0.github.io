---
title: C Functions Recursion and Preprocessing 函数、递归与预处理
date: 2026-08-27
lang: zh-cn
tags:
  - C
  - Functions
---

# C Functions Recursion and Preprocessing 函数、递归与预处理

## 1. 声明、定义与调用

函数声明告诉编译器名称、返回类型和参数类型；函数定义给出函数体。应在首次调用前声明函数，避免旧式隐式声明带来的类型错误。

```c
#include <stdio.h>

int max_int(int left, int right);

int max_int(int left, int right)
{
    return left > right ? left : right;
}

int main(void)
{
    printf("%d\n", max_int(4, 9));
    return 0;
}
```

C 只有值传递：形参获得实参值的副本。若函数要修改调用者的对象，传入其地址并用指针形参修改。

## 2. 递归

递归函数必须同时有：

1. 可直接得到答案的基本情况；
2. 向基本情况收敛的递归步骤。

```c
#include <stdio.h>

long factorial(int n)
{
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main(void)
{
    printf("%ld\n", factorial(5));
    return 0;
}
```

递归调用消耗调用栈；深度过大可能栈溢出。读递归题时先画出 `n` 如何递减，再从基本情况回推返回值。

## 3. 作用域、链接与多文件

- 块作用域：局部变量、形参从声明处到当前代码块结束。
- 文件作用域：函数外声明的名字从声明处到本翻译单元结束。
- `static` 文件作用域函数/变量具有内部链接，只能被当前 `.c` 文件使用。
- 将共享声明放在头文件，用 include guard 防止同一头文件重复包含。

```c
#ifndef SCORE_H
#define SCORE_H

int score_total(const int values[], int count);

#endif
```

头文件通常放声明，不放普通对象定义；否则多个源文件包含它时可能产生重复定义。

## 4. 预处理器

预处理发生在编译之前，主要处理包含、宏替换和条件编译。

```c
#define ARRAY_COUNT(a) (sizeof(a) / sizeof((a)[0]))
#define SQUARE(x) ((x) * (x))
```

宏没有类型检查，参数可能被重复求值：`SQUARE(i++)` 会产生问题。复杂逻辑优先使用函数；宏参数和整体表达式都要加括号。

`#if`、`#ifdef`、`#ifndef` 用于条件编译。不要把 `#define` 当作带作用域的变量声明：宏只是文本替换，直到 `#undef` 或文件结束。

## 5. `main` 的参数

常见托管环境写法：

```c
#include <stddef.h>

int main(int argc, char *argv[])
{
    return argc > 0 && argv[0] != NULL ? 0 : 1;
}
```

`argc` 是参数个数，`argv` 是参数字符串数组。一般基础题只需使用 `int main(void)`；命令行参数题再使用该形式。

## 考试检查表

- 函数原型的参数类型、返回类型是否与定义一致？
- 函数能否通过值形参修改调用者变量？不能，除非传指针。
- 递归是否有基本情况，且每次是否确实接近它？
- 宏参数、宏整体、`sizeof` 里的数组表达式是否都加了括号？
