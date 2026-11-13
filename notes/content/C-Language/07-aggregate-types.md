---
title: C Aggregate Types 结构体、共用体、枚举与自定义类型
date: 2026-08-27
lang: zh-cn
tags:
  - C
  - Struct
---

# C Aggregate Types 结构体、共用体、枚举与自定义类型

## 1. 结构体 `struct`

结构体将不同类型的成员组合为一个对象。使用 `.` 访问对象成员，用 `->` 访问结构体指针所指对象成员。

```c
#include <stdio.h>

struct Student {
    int id;
    char grade;
};

int main(void)
{
    struct Student student;
    struct Student *ptr;

    student.id = 1001;
    student.grade = 'A';
    ptr = &student;
    printf("%d %c\n", ptr->id, ptr->grade);
    return 0;
}
```

结构体可整体赋值、作为函数参数或返回值；这会复制成员值。结构体大小可能大于成员大小之和，因为实现可能插入对齐填充字节。考试若未说明对齐规则，不要擅自计算精确 `sizeof`。

## 2. `typedef`

`typedef` 给已有类型取别名，不会创建新类型或分配对象。

```c
typedef struct {
    int x;
    int y;
} Point;

Point origin;
```

`typedef char *String;` 中 `String a, b;` 的 `a` 和 `b` 都是指针。不要把它误读为“`b` 是 `char`”。

## 3. 共用体 `union`

共用体的成员共享同一段存储，同一时刻通常只应把其中一个成员当作有效值使用。其大小至少能容纳最大成员，并可能受对齐影响。

```c
union Number {
    int integer;
    float real;
};
```

向 `integer` 写入后再把同一存储按 `real` 读取，不是通用的数值转换方法；这类类型重解释有严格的语言与实现边界。

## 4. 枚举 `enum`

枚举为整型常量命名，未显式指定时从 0 开始递增。

```c
enum Day {
    MONDAY = 1,
    TUESDAY,
    WEDNESDAY
};
```

`TUESDAY` 的值为 2。枚举常量在 C 中是整型常量，不等同于 C++ 的强类型枚举。

## 5. 位字段

位字段可在结构体中按位分配成员，常见于硬件和协议描述：

```c
struct Flags {
    unsigned int ready : 1;
    unsigned int error : 1;
    unsigned int mode : 2;
};
```

位字段的布局、对齐与位序高度依赖实现；跨平台文件格式和网络协议不应依赖它的内存表示。

## 考试检查表

- `.` 左侧是结构体对象，`->` 左侧是结构体指针。
- `struct Student` 与 `Student` 是否已用 `typedef` 建立别名？C 中两者默认不同。
- 结构体数组、结构体指针、嵌套结构体的访问优先级是否正确？必要时写 `(*ptr).member`。
- 联合体考的是共享存储，不是“同时存放多个成员”。
