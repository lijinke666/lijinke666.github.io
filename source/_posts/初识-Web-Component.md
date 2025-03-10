---
title: 初识 Web Component
date: 2019-01-31 22:51:48
tags: web component
---

### 1. 前言

---

组件化这个词 应该大家耳朵都听起茧巴了在 `Vue` `React` `Angular` 三个大佬 的带领下 , 我们前端 是否终于告别了 粘贴复制的 "组件化" 时代

`Antd` `ElementUi` 这些高质量 且开箱即用 的 ui 库更是让组件化开发更上一层楼。如果不编译 或者 原生可以实现所谓的组件化吗？w3c 给了我们 `web component` 的解决方案

### 2. 什么是 Web Component

---

> mdn 文档

作为开发者，我们都知道尽可能多的重用代码是一个好主意。这对于自定义标记结构来说通常不是那么容易 — 想想复杂的 HTML（以及相关的样式和脚本），有时您不得不写代码来呈现自定义 UI 控件，并且如果您不小心的话，多次使用它们会使您的页面变得一团糟。

Web Components 旨在解决这些问题 — 它由四项主要技术组成，它们可以一起使用来创建封装功能的定制元素，可以在你喜欢的任何地方重用，不必担心代码冲突。

> 核心的四大要素

- `Custom elements（自定义元素）`：一组 JavaScript API，允许您定义 custom elements 及其行为，然后可以在您的用户界面中按照需要使用它们。

- `Shadow DOM（影子 DOM）`：一组 JavaScript API，用于将封装的“影子”DOM 树附加到元素（与主文档 DOM 分开呈现）并控制其关联的功能。通过这种方式，您可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。

- `HTML templates（HTML 模板`）`：<template> 和 <slot> 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。

- `HTML Imports（HTML 导入）`：一旦定义了自定义组件，最简单的重用它的方法就是使其定义细节保存在一个单独的文件中，然后使用导入机制将其导入到想要实际使用它的页面中。HTML 导入就是这样一种机制，尽管存在争议 — Mozilla 根本不同意这种方法，并打算在将来实现更合适的。

### 3. Shadow DOM

浏览器为我们内置了很多组件 , 比如 最常用的

input,button,select, 这也是最屌的 兼容三大框架的 ui 库 :)

以 一个 范围选择条为例

```js
<input type="range" />
```

<br/>
<img src="https://lijinke666.github.io/lijinkeWeb-static/images/WX20180815-155644@2x.png" style="max-width:100%"/>
<br/>

那么问题来了 调试器上面只显示了一个元素 它的拖拽把手（小圆点） 是哪来的呢？

接下来 打开 控制面版 (Settings) => Elements => 勾选 (Show user agent shadow DOM)

<br/>
<img src="https://lijinke666.github.io/lijinkeWeb-static/images/WX20180815-160020@2x.png" style="max-width:100%"/>
<br/>

可以清楚的看到 有一些额外的 div 元素 被隐藏掉了 小圆点 和 silder 这些样式就是从这里来的 这就是所谓的 `shadow DOM`,

### Custom elements 自定义元素

---

在网页中 我们可以写 一些内置的标记 , 他们有自带的一些样式 padding ,margin 之类的

```
<div/>
<p/>
```

也可以写 自定义的 , 比如

```
<lijinke>666</lijinke>
```

还是可以被正常解析 只不过没有任何样式

### 4. 开始写一个简单的 Web Component

认识了 上面两点，我们就可以 开始动手写代码了，我们以一个卡片 (Card) 组件为例

##### 4.1 首先我们定义 dom 结构

```
  <template id="my-card-template">
    <div class="my-card">
      <div class="title">
        <slot name="title">代码标题</slot>
      </div>
      <pre>
        <slot name="content">代码内容</slot>
      </pre>
    </div>
  </template>
```

定义一个 template 模板再定义两个 slot 用于占位 , 可以理解成 调用组件的时候 里面的值会被替换，放心 这不是在写 `Vue`

这时候 保存 刷新网页，大功告成

当然 这是不可能 接下来就是 利用 `Vue-loader`

```
new Vue({
    el:"#my-card-template"
})
```

好吧，这是不可能的 , 这时候页面时一片空白

##### 4.2 接下来 用 js 提供的接口 把 `template` 渲染出来

首先 写一个类

```
  class MyCard extends HTMLElement {
    constructor(props) {
      super();
     }
  }
```

第一步：然后 拿到 template 里面的内容 注意这里 不是 innerHTML,

第二步：将 template 挂载在 shadow DOM 上面 （默认打开）

如果 mode 设为 false 会没有样式

```js
class MyCard extends HTMLElement {
  constructor(props) {
    super();
    const { content: temp } = document.querySelector('#my-card-template');
    this.attachShadow({ mode: 'open' }).appendChild(temp.cloneNode(true));
  }
}
```

##### 4.3 注册 自定义组件

```js
customElements.define('my-card', MyCard);
```

之后就可以在 html 里面写

```
  <my-card>
    <span slot="title">我是代码标题</span>
    <p slot="content">
      const a = 1;
      console.log(a)
    </p>
  </my-card>
```

可以看到 template 里面的 元素 变成了 shadow DOM 实现了 和 <input type="range"> 一样的 shadow DOM 的效果 , 只是还没有样式

<br/>
<img src="https://lijinke666.github.io/lijinkeWeb-static/images/WX20180815-162326@2x.png" style="max-width:100%"/>
<br/>

##### 4.4 编写组件样式

接下来编写样式 写一点简单的 style

```
  <template id="my-card-template">
    <style>
      .my-card {
        width: 300px;
        height: 300px;
        background: #fff;
        box-shadow: 1px 2px 10px rgba(0, 0, 0, .3);
        margin: 10px
      }
      .title {
        height:40px;
        background: #dcdcdc;
        line-height: 40px;
        text-align: center;
      }
      pre {
        padding: 20px;
      }
    </style>
    <div class="my-card">
      <div class="title">
        <slot name="title">代码标题</slot>
      </div>
      <pre>
        <slot name="content">代码内容</slot>
      </pre>
    </div>
  </template>
```

说真的 像 `Vue` 的三段式代码 哈哈。

##### 4.5 预览效果

<br/>
<img src="https://lijinke666.github.io/lijinkeWeb-static/images/WX20180815-162326@2x.png" style="max-width:100%"/>
<br/>

### 5. 结语

Web Component 我也是出于好奇玩了玩 感觉 API 很不稳定 , 兼容性很差

比如 导入组件的 方法 随时存在废除的可能性

```
<link type="import" href="./xx.html">
```

不过这确实是一个新的方向 和 新的可能性 作为前端 应该了解，最近 w3c 推出来了很多新东西 , --自定义变量，css 版的 canvas api, 叫啥子我忘了，自定义组件 , 原生模块加载，前端的生态 是越来越好了，所以

我还是用 `React` + `Node.js` 哈哈

[本文 DEMO](https://github.com/lijinke666/HTML5-demos/blob/master/web-component/code.html)

### 参考资源

- [https://developer.mozilla.org/zh-CN/docs/Web/Web_Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)
