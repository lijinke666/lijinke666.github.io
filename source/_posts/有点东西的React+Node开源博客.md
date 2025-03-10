---
title: 有点东西的 React+Node 开源博客
date: 2019-05-22 14:35:30
tags: react,node.js
---

### 前言

这是一个 17 年底，因为无聊做的一个 自己用的博客，想通过一条龙的方式，学习前端，后端，和部署

最初部署在 阿里云上的，一年后到期了，因为穷，我就改用 `hexo`, 想看看我的新博客吗 [点这里](https://www.lijinke.cn)

在这里分享给大家，当然，代码写的很糟糕，

如果你想知道他是怎么搭建的 请看 [李金珂的小屋诞生记](https://www.lijinke.cn/2017/05/22/%E6%9D%8E%E9%87%91%E7%8F%82%E7%9A%84%E5%B0%8F%E5%B1%8B%E8%AF%9E%E7%94%9F%E8%AE%B0/)

如果你喜欢的话，就随意折腾吧。只需保留下图的 注释即可 : )

![https://cdn.lijinke.cn/WX20190522-150913@2x.png](https://cdn.lijinke.cn/WX20190522-150913@2x.png)

[GITHUB](https://github.com/lijinke666/jinke-blog)

### 预览

> 炫酷的动画 （当时自己想的创意）

![https://cdn.lijinke.cn/ezgif.com-resize.gif](https://cdn.lijinke.cn/ezgif.com-resize.gif)

> 文章页

![https://cdn.lijinke.cn/20180518151903.png](https://cdn.lijinke.cn/20180518151903.png)

> 可以直接上传文章

![https://cdn.lijinke.cn/20180518151903.png](https://cdn.lijinke.cn/WX20190522-153529@2x.png)

> 关于页

![https://cdn.lijinke.cn/WX20190522-150749@2x.png](https://cdn.lijinke.cn/WX20190522-150749@2x.png)

> 性感的播放器

![https://cdn.lijinke.cn/WX20190522-153828@2x.png](https://cdn.lijinke.cn/WX20190522-153828@2x.png)

![https://cdn.lijinke.cn/WX20190522-153844@2x.png](https://cdn.lijinke.cn/WX20190522-153844@2x.png)

### 大致的功能

就像上图所示主要就 5 个功能

- 在线聊天 (socket.io)
- 相册，放一些你喜欢的图片
- 文章 (markdown 文章，和评论）
- 关于，写一些你的介绍
- 音乐播放器

### 使用技术栈

> 没错 年代后久远，技术栈的版本比较旧

- `React v16.X`
- `ES6,ES7`
- `webpack v3.0.0`
- `Redux`
- `React-Redux`
- `React-Router v3.x`
- `node.js`
- `yarn`
- `mongodb`
- `mongoose`
- `mocha`
- `chai`
- `less`
- `socket.io`
- `pwa`
- `web push`

### node 环境

- `v8.9+`

- 安装依赖

```
yarn
```

- 跑起来

```
yarn start
```

- 打包

```
yarn run build
```

- 开发 server

```
yarn run dev-server
```

- 生产 server

```
yarn run prod-server
```

- 连接数据库

```
yarn run connect-db
```

- 备份数据库

```
yarn run dump
```

- 写入数据库

```
yarn run restore
```

### 本地运行步骤

1. 克隆项目 `git clone https://github.com/lijinke666/lijinkeWeb.git`
2. 请确保你本地已经安装 `mongodb`, `node.js`, `nodemon` 和 `pm2`
3. 更改 `config/index.js` 的 `你自己的配置信息`
4. 切换到目录 `cd lijinkeWeb` 连接数据库 `yarn run connect-db` 然后 拷贝数据库 `yarn run restore`
5. 运行前端 `yarn start` 等待打包 自动打开浏览器 `localhost:6688`
6. 运行后端 `yarn run dev-server`

### 数据库

> 表格当时瞎设计的 就三张表格

```js
const mongoose = require('mongoose');
const debug = require('debug')('music-schema');
const Schema = mongoose.Schema;

const musicSchema = new Schema(
  {
    name: String, //音乐名
    src: String, //路径
    cover: String, //图片路径
    desc: String, //描述
    isShow: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'music',
  },
);

const articleSchema = new Schema(
  {
    title: String, //文章标题
    content: String, //文章内容   markdown 格式
    previewContent: String, //预览的文章内容
    author: String, //作者
    publishDate: {
      //发表日期
      type: Date,
      default: Date.now,
    },
    pageView: Number, //点击量
    like: Number, //喜欢数量
    approve: Boolean, //是否审核通过
    email: String, //作者邮箱  用来通知作者文章是否通过
    category: Array,
  },
  {
    collection: 'article',
  },
);

const commentSchema = new Schema(
  {
    articleId: String, //文章 id
    commentName: String, //姓名
    commentEmail: String, //邮箱
    commentContent: String, //内容
    like: String, //点赞量
    device: String, //设备
    publishDate: {
      //发布日期
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'comment',
  },
);
```
