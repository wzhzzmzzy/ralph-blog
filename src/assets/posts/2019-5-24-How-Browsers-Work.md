---
layout: post
title: 浏览器工作原理
author: wzhzzmzzy
date: 2019-5-24
categories: Tech
tags: 
    - 前端
    - TypeScript
description: 当下的主流浏览器工作原理。
---

> [How Browsers Work](<http://taligarsiel.com/Projects/howbrowserswork1.htm>)

## 浏览器的高层结构 ##

![浏览器的主要组件](layers.png)

浏览器的主要构件有：

- UI —— 地址栏、前后按钮、书签栏等。
- 浏览器引擎 —— 控制渲染引擎的接口。
- 渲染引擎 —— 负责显示请求到的内容。例如请求到的内容是 HTML，那么渲染引擎就需要负责解析 HTML 和CSS，并且在屏幕上显示解析到的内容。
- 网络 —— 用于发起 HTTP 请求。
- UI 后端 —— 使用操作系统底层 API 渲染 UI。
- JS 解释器 —— 用于解析并运行 JavaScript 代码。
- 数据存储 —— 持久化层，用于将所有的数据存储在硬盘上，例如 Cookies。

顺便提一下，Chrome的渲染引擎策略与其他主流浏览器不同，每一个标签页都有一个独立的渲染引擎实例。

## 渲染引擎 ##

这里，我们只提及用于显示 HTML 和图片，以及 CSS的渲染引擎。

### 渲染引擎类型 ###

Firefox 使用 Mozilla 自研的 Gecko，Safari 和 Chrome 使用 Webkit。Webkit是一个开源的渲染引擎，最初是用于 Linux，后被 Apple 修改用于支持 Mac 和 Windows。

### 核心工作流 ###

![Rendering engine basic flow](flow.png)

渲染引擎从网络层获取到请求得到的文档，一般文档以 8K 大小的块组成。

渲染引擎从 HTML 中解析出 DOM 元素，组织为 Content Tree，然后从 HTML 标签样式以及 CSS 中解析出样式信息，最终组成 Render Tree。

Render Tree 由许多可视矩形组成，这些矩形有着颜色、尺寸的属性。这些矩形会以正确的顺序显示在屏幕上。

Render Tree 构建完成之后，就可以开始布局。也就是给每一个节点一个特定的坐标，以便于它能够在屏幕上显示。下一步是绘图，UI 后端会将Render Tree的每一个节点渲染出来。

为了用户体验考虑，整个流程是一个渐进的过程，也就是说，渲染引擎不会等待整个 HTML 文档被解析完成，而是解析一部分渲染一部分，然后继续处理文档剩余的部分，或是等待网络加载。

以下是 Webkit 和 Gecko 的工作流程：

![Webkit Main Flow](webkitflow.png)

![Gecko Rendering Enging Main Flow](image008.jpg)

从上面两张图可以看出，除了术语之外，基本流程都大致相同。

#### 通用解析原理 ####

一般而言，从代码文档到解析树，需要经历语法分析和词法分析。词法分析会辨识出哪些是有效的代码，哪些是无效的。

整个解析过程是迭代进行的，解析器通常会与词法分析器协同工作，辨识语法和标识符，进行匹配。如果匹配成功，解析树上就会多出一个与标识符相关的节点，然后进行下一个标识符的解析。如果匹配失败，解析器会在内部保存这个标识符，然后不停地询问词法分析器，直到完全匹配。如果无法匹配，那么就会报错。

解析树也不是最终产物，需要转化为机器码才可以被执行。一个常见的例子就是编译。编译器将源代码编译为机器码文档。

