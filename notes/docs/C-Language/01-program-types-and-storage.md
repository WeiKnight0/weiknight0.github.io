---
title: C Program Types and Storage 程序、类型、作用域与存储期
date: 2026-08-27
lang: zh-cn
tags:
  - C
  - Types
---

# C Program Types and Storage 程序、类型、作用域与存储期

## 1. 一个 C 程序的最小结构

```c
#include <stdio.h>

int main(void)
{
    printf("Hello, C!\n");
    return 0;
}
```

- 预处理指令以 `#` 开头；`#include <stdio.h>` 引入标准输入输出声明。
- 程序从 `main` 开始执行。`int main(void)` 表示无参数、返回 `int`；`void main()` 不是标准 C 写法。
- C 区分大小写；一条普通语句通常以 `;` 结束；`{}` 构成复合语句和作用域。
- C90 要求一个代码块内的声明位于可执行语句之前。

## 2. 标识符、关键字与常量

标识符由字母、数字和下划线组成，不能以数字开头，不能是关键字。传统 C90 有 32 个关键字；`auto`、`register`、`static`、`extern` 是存储类别关键字，`const` 与 `volatile` 是类型限定符。

常见字面量：

| 写法 | 类型或含义 | 易错点 |
| --- | --- | --- |
| `10` | `int` 整数常量 | 前导 `0` 是八进制，如 `010` 等于十进制 8 |
| `0x10` | 十六进制整数常量 | `0x` 后只能是十六进制数字 |
| `10L`、`10U` | `long`、`unsigned int` | 后缀影响类型 |
| `3.14` | `double` | `3.14f` 才是 `float` |
| `'A'` | 字符常量，类型为 `int` | `"A"` 是含结尾 `\0` 的字符数组 |
| `"abc"` | 字符串字面量 | 不能修改字符串字面量内容 |

## 3. 基本类型与范围意识

| 类别 | 常用类型 | 考试结论 |
| --- | --- | --- |
| 字符 | `char`、`signed char`、`unsigned char` | `char` 是否有符号由实现决定；不要假定它必然等于 `signed char` |
| 整数 | `short`、`int`、`long` 及其 `unsigned` 形式 | 至少满足 `sizeof(short) <= sizeof(int) <= sizeof(long)` |
| 浮点 | `float`、`double`、`long double` | 浮点比较通常不能直接使用 `==` |
| 无值 | `void` | `void *` 可保存任意对象指针；`void` 函数不返回值 |

`sizeof` 返回对象或类型占用的字节数，结果类型为 `size_t`。它不是普通函数，`sizeof(int)` 和 `sizeof x` 都合法；若操作数不是变长数组，表达式通常不求值。

```c
#include <stdio.h>

int main(void)
{
    int x;

    x = 3;
    printf("%lu\n", (unsigned long)sizeof x);
    printf("%lu\n", (unsigned long)sizeof(int));
    return 0;
}
```

不要死记所有类型的确切字节数：`int` 是 2 字节还是 4 字节取决于实现。题目未给出环境时，应依据标准下界或 `sizeof` 推理。

## 4. 变量初始化与生命周期

| 位置/声明 | 作用域 | 存储期 | 未显式初始化时 |
| --- | --- | --- | --- |
| 函数内普通变量 | 块作用域 | 自动 | 不确定值，读取可能出错 |
| 函数参数 | 函数块 | 自动 | 调用时由实参初始化 |
| 文件作用域变量 | 从声明处到文件末尾 | 静态 | 自动初始化为 0 |
| 函数内 `static` 变量 | 块作用域 | 静态 | 仅初始化一次，初值为 0 |

```c
#include <stdio.h>

int next_id(void)
{
    static int id = 0;

    id = id + 1;
    return id;
}

int main(void)
{
    int first;
    int second;

    first = next_id();
    second = next_id();
    printf("%d %d\n", first, second);
    return 0;
}
```

上例输出 `1 2`；`id` 不会在函数返回后消失。注意：同一个 `printf` 的多个实参求值顺序在 C 中未规定，因此不要把依赖顺序的多个函数调用放在同一表达式中。

## 5. `auto`、`register`、`static`、`extern`

- `auto`：块内普通局部变量的默认存储类别，几乎不需要显式写出。
- `register`：建议编译器放入寄存器；不能对这种变量可靠地取地址，现代编译器通常自行决定优化。
- `static` 修饰局部变量：延长到整个程序运行期；修饰文件作用域变量或函数：仅在当前源文件可见。
- `extern`：声明定义在其他源文件的对象或函数，不分配新的对象存储。

## 6. `const` 与 `volatile`

`const int x = 10;` 表示不能通过 `x` 这个名字修改该对象；它不等于“编译期常量”。`volatile` 表示对象可能在程序控制之外改变，例如内存映射设备寄存器；它不是线程同步工具，也不能替代锁。

## 考试检查表

- 局部变量是否先初始化再读取？
- 是否把 `char`、`int` 的字节数当成固定常数？
- 是否把 `'a'` 和 `"a"` 混淆？
- `static` 问的是作用域，还是存储期，还是链接属性？三者要分开回答。
