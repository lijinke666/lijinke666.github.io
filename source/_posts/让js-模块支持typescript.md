---
title: 让 js 模块支持 typescript
date: 2019-05-16 16:57:44
tags: typescript,javascript,npm
---

### 1. 前言

人类终究逃不过真香定律，曾几何时，一度反感 `ts` 的我，如今写代码不用 `ts` 的智能提示就浑身难受最近刚好维护 之前发布的一个 插件 [react-jinke-music-player](https://github.com/lijinke666/react-music-player) , 由于是 `es6` 写的学习了下 怎么让其支持 `ts`

### 2. 观察

比如我们打开一个 支持 `ts` 的模块 `scroll-into-view-if-needed`, 当我们 cmd + 鼠标左键 点击的时候 会 自动跳转到 其模块的定义

![WX20190516-170252 的副本-201951617514](https://cdn.lijinke.cn/WX20190516-170252 的副本-201951617514.png)

当我们 使用其方法时 配合 `vscode` 就有对应参数的提示

![WX20190516-170252 的副本-201951617514](https://cdn.lijinke.cn/WX20190516-170715.png)

这时候我们大概明白了，要支持 `ts` 我们只需要提供一个 类型定义文件即可 , 官方把它称作 `.d.ts` 文件，这这个文件中我们需要编写接口 `interface`, 接下来以 `react-jinke-music-player` 为例，我们编写一个 `index.d.ts` 文件

### 3. 开始动手吧

我们像往常一样

```js
yarn add react-jinke-music-player
```

然后引入，这时候会发现报错了，如图所示，提示我们 找不到声明文件

![WX20190516-171403-2019516171433](https://cdn.lijinke.cn/WX20190516-171403-2019516171433.png)

接下来开始编写 `index.d.ts` 文件

```js
import * as React from 'react';

export interface ReactJkMusicPlayerAudioList {
  name: string | React.ReactNode;
  singer?: string | React.ReactNode;
  cover: string;
  musicSrc: string;
  lyric?: string;
}

export interface ReactJkMusicPlayerProps {
  audioLists: Array<ReactJkMusicPlayerAudioList>;
  mode: 'mini' | 'full';
}
export default class ReactJkMusicPlayer extends React.PureComponent<
  ReactJkMusicPlayerProps,
  any,
> {}
```

假设我们的插件 支持一个 `audioLists` 的参数，这个参数是一个数组，每一个下标 是 `name`, `singer`, `cover`, `musicSrc`, `lyric` 组成的 object

`React.PureComponent<props, state>` 是一个泛型，我们将当  前组件的 `props` 和 `state` 声明即可，这里的 props 也就是 `ReactJkMusicPlayerProps`,

用户不需要支持 组件内部有哪些 `state` , 所以写 any 即可，这样我们就完成了 一个 `d.ts` 文件的编写，那么问题来了，编辑器怎么知道当前组件的 `d.ts` 文件在哪里呢？

### 4. 声明 typing 文件所在路径

其实很简单，在 `package.json` 中 我们都知道 `main` 字段 声明 入口文件，那么同理 `typing` 字段 声明 组件的 类型定义文件，这里我们 写 `index.d.ts` 即可

```json
{
  "name": "react-jinke-music-player",
  "version": "4.3.2",
  "description": "Maybe the best beautiful HTML5 responsive player component for react",
  "main": "lib/index.js",
  "typing": "index.d.ts"
}
```

现在将这个组件发布 重新安装，看下效果

```js
npm publish .
yarn add react-jinke-music-player
```

可以看到，编辑器已经能正确找到定义文件并推断出来，这里我们定义的 `audioLists` 是一个 必填 参数，所以报错了

![WX20190516-172709-2019516172732](https://cdn.lijinke.cn/WX20190516-172709-2019516172732.png)

有哪些参数，参数的可选项是哪些，一目了然

![WX20190516-172709-2019516172732](https://cdn.lijinke.cn/WX20190516-173017.png)

### 5. 结语

在多人协助的项目中，有完善类型定义的 `ts` 项目是非常有必要的，让你在写代码或者重构的时候 非常悠闲放松，那个参数类型不对，参数值有哪些 一目了然，当然前提别写 `any` : )
