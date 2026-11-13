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

### 作用域

- **块作用域（block scope）：**函数形参、函数体内声明的变量，以及 `{}` 内声明的名字；从声明处开始，到所在 `}` 结束。内层同名声明会遮蔽外层名字。
- **文件作用域（file scope）：**函数外声明的变量和函数；从声明处到当前 `.c` 文件末尾。
- **函数原型作用域（function prototype scope）：**仅出现在函数声明参数列表、且没有对应定义的参数名；声明结束后名字立即失效。
- **函数作用域（function scope）：**仅用于标签名；标签在整个函数内可被 `goto` 引用，不受嵌套代码块限制。

```c
int file_value;                 /* 文件作用域：本 .c 文件余下部分可见。 */
int sum(int prototype_value);   /* prototype_value 只在这一条声明中可见。 */

void example(int parameter)     /* parameter 从此处到函数结尾都是块作用域。 */
{
    int outer = parameter;

    {
        int outer = 0;          /* 遮蔽外层 outer，仅在这对花括号内有效。 */
        if (outer == 0) {
            goto done;
        }
    }

done:                           /* 标签具有整个函数作用域。 */
    file_value = outer;
}
```

### 链接与存储期

- **无链接：**块作用域变量、形参；其他 `.c` 文件不能用同一个名字引用它。
- **内部链接：**文件作用域的 `static` 对象或函数；名字只连接当前 `.c` 文件中的声明。
- **外部链接：**普通文件作用域对象或函数；其他 `.c` 文件可用匹配的 `extern` 声明引用同一实体。
- **自动存储期：**进入代码块创建，离开代码块结束；**静态存储期：**程序开始时存在，到程序结束才消失。

| 写法 | 作用域 | 链接 | 存储期 | 含义 |
| --- | --- | --- | --- | --- |
| 函数内 `int count;` | 块作用域 | 无 | 自动 | 每次进入代码块创建，离开后失效 |
| 形参 `int count` | 函数块 | 无 | 自动 | 调用期间存在 |
| 函数外 `int total;` | 文件作用域 | 外部 | 静态 | 可被其他 `.c` 文件用 `extern` 引用 |
| 函数外 `static int cache;` | 文件作用域 | 内部 | 静态 | 整个程序运行期存在，但仅当前 `.c` 文件可用 |
| `extern int total;` | 文件作用域 | 外部 | 由定义决定 | 只是声明，不分配存储 |
| `static int helper(void);` | 文件作用域 | 内部 | — | 该函数只能由当前 `.c` 文件调用 |

### 一个完整的三文件例子

`score.h` 只放共享声明。include guard 防止同一翻译单元重复包含它：

```c
#ifndef SCORE_H
#define SCORE_H

int score_total(const int values[], int count);

#endif
```

`score.c` 放定义。`score_total` 具有外部链接，`clamp_nonnegative` 使用 `static`，因此不会暴露给其他文件：

```c
#include "score.h"

static int clamp_nonnegative(int value)
{
    return value < 0 ? 0 : value;
}

int score_total(const int values[], int count)
{
    int i;
    int total;

    total = 0;
    for (i = 0; i < count; i = i + 1) {
        total = total + clamp_nonnegative(values[i]);
    }
    return total;
}
```

`main.c` 包含头文件后可以调用 `score_total`，但不能调用 `clamp_nonnegative`：

```c
#include <stdio.h>
#include "score.h"

int main(void)
{
    int scores[3] = {8, -2, 5};

    printf("%d\n", score_total(scores, 3));  /* 输出 13。 */
    return 0;
}
```

编译命令为 `cc -std=c90 -Wall -Wextra main.c score.c -o score`。头文件通常放声明，不放普通对象定义：若把 `int total = 0;` 放进 `score.h`，每个包含它的 `.c` 文件都会产生一个定义，链接时重复定义。

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
