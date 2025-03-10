---
title: 一个 npm 包的自述
date: 2020-07-03 15:21:47
tags: 前端工程化，npm, github
---

### 自我介绍

我叫 [react-jinke-music-player](https://github.com/lijinke666/react-music-player), 是一个 npm 包，叫我 `jk` 就好。我名下有三套房产，一套是 [github](https://github.com/), 一套是 [npm](https://www.npmjs.com/), 还有一套是 [packages](https://github.com/lijinke666/react-music-player/packages), 但买来就没住进去过，没办法，谁叫我这么有钱呢！平时请了个管家 `microsoft` 帮我打理，自己平时很少过问。

### README

为了防止老年痴呆，我给自己写了个使用说明书，叫 `README.md`, 上面写明了如果安装我，使用我，还有一些我的才艺，特长等。好家伙，足足写了几天几夜。把我累的够呛

### 严格的自我要求

我对自己有着非常苛刻的要求，隔壁小王的身体由水构成，我的身体由 `javascript`, `less`, `html`, `webpack`, `Node.js`, `jest`, `react` 等构成，我感觉自己就是天选之子，于是我花重金请来了助手 `小骚` 来监督我，好家伙，他直接来了一车人过来，分别是

- `eslint`
- `prettier`
- `jest`
- `enzyme`
- `commitlint`
- `bundlesize`
- `webpack`
- `babel`

当我出错时，`eslint` 帮我纠错，贴心的告诉我。还给我介绍了套餐 [fabric](https://github.com/umijs/fabric)

当我下笔如有神，字写的横七竖八时，`prettier` 帮我重新排版格式化，提升我的颜值，多亏了他，我才交到了女朋友。

`jest` 和 `enzyme` 是医生，每天就帮我检查身体，告诉我哪里可能有隐患，还给我定了指标 (coverage), 不达标还要生气，身体都气红了。

`commitlint` 也挺过分的，每次我给我女朋友发短信，没按照他要求的格式写，还不让我发，每次都要写 `feat(xx)`, `fix(xx)` 才行，他说是让女朋友一眼就知道我大概发的什么。

`bundlesize` 天天给我称体重，给我定的不能超过 `100 kB` 的指标，还好我比较廋，这个没啥毛病。

`babel` 有点东西，每次我写了点浏览器看不懂的 `外语`, 他免费帮我翻译，省时又省力。

最后是 `webpack`, 每次都帮我跑腿，一有更新，就去通知浏览器，不用我手动刷新，我要出门了，帮我把所有代码都整理打包好 交给我。

### 出租房子

日复一日的练习，我感觉自己已然是一个成功人士，决定衣锦还乡，好好打扮一下，去看看我买的房子 (npm), 出门前，`babel` 和 `webpack` 给了我三包东西，分别是

| 目录 | 模块规范   | 含义                                           |
| ---- | ---------- | ---------------------------------------------- |
| dist | UMD        | 兼容 AMD,CMD 的模块，可以直接在浏览器中使用    |
| lib  | CommonJS   | 一个文件即一个模块，Node.js 采用的就是这个规范 |
| es   | ES modules | ES6 模块规范                                   |

好不容易来到小区，一个叫法老的保安不让我进，喊我出示身份证 (package.json), 看了下我的个人信息，这才放我进去

```json
{
  "name": "react-jinke-music-player",
  "version": "4.16.1",
  "description": "...",
  "main": "lib/index.js",
  "module": "es/index.js",
  "unpkg": "dist/react-jinke-music-player.min.js",
  "typings": "index.d.ts",
  "files": [
    "lib",
    "es",
    "dist",
    "assets",
    "index.d.ts"
  ],
  "scripts": {...}
}
```

看了一圈，我的房子还是豪华依旧，于是我绝对挂牌给房产中介 (npm, github), 让他们帮我出租房子，发布房源，在他们的网站上展示 (npm, github pages) 想租我的房子，只需要输入命令即可

```bash
yarn add react-jinke-music-player
npm i react-jinke-music-player --save
```

### 更新住房信息

挂牌在中介后，来找我看房的很多，但是我太有钱了，住房隔断时间就要重新装修，这导致我每次都要重新上传住房信息，太麻烦了，于是我找到个简单的方法，

[semantic-release](https://github.com/semantic-release/semantic-release) 和 `github actions` 配合

> CI CD

```yaml
name: Node CI

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[ci skip]')"
    strategy:
      matrix:
        node-version: [12.x, 13.x, 14.x]

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}

      - name: Get commit message
        run: |
          echo ::set-env name=commitmsg::$(git log --format=%B -n 1 ${{ github.event.after }})
      - name: Show commit message
        run: echo $commitmsg

      - name: Install dependencies
        run: yarn

      - name: Build, and test
        run: |
          yarn lint
          yarn build
          yarn test
          yarn ci:coverage
        env:
          CI: true
          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}

      - name: Build example page
        if: github.event_name == 'push' && startsWith( env.commitmsg , 'chore(release):' )
        run: yarn build:demo

      - name: Deploy github pages
        if: github.event_name == 'push' && startsWith( env.commitmsg , 'chore(release):' )
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: example/dist
```

> 自动发布 npm

触发条件：`git commit -m "chore(release): xx"`

```yaml
name: Node CI

on:
  push:
    branches:
      - master

env:
  CI: true

jobs:
  release:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[ci skip]')"
    strategy:
      matrix:
        node-version: [12.x]

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}

      - name: Get commit message
        run: |
          echo ::set-env name=commitmsg::$(git log --format=%B -n 1 ${{ github.event.after }})
      - name: Show commit message
        run: echo $commitmsg

      - name: Install dependencies
        run: yarn

      - name: Build, and test
        run: |
          yarn lint
          yarn build
          yarn test
        env:
          CI: true

      - name: Release
        if: startsWith( env.commitmsg , 'chore(release):' )
        run: yarn release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

> semantic-release 配置

自动更新 tag, 生成 changelog, 关闭相关联 pr 和 issue 等

```js
module.exports = {
  branch: 'master',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/git',
      {
        message: 'chore(release): 🤖 ${nextRelease.version} [ci skip]',
      },
    ],
    '@semantic-release/npm',
    '@semantic-release/github',
  ],
  preset: 'angular',
};
```

### 贴标签

大家都喜欢给对方贴标签，我就不一样，我喜欢给自己贴标签，[shields.io](https://shields.io/) 可以帮我做这些事情

![npm](https://img.shields.io/npm/dm/react-jinke-music-player.svg?style=flat-square) ![npm](https://img.shields.io/npm/l/react-jinke-music-player.svg?style=flat-square) ![npm](https://github.com/lijinke666/react-music-player/workflows/Node%20CI/badge.svg) ![npm](https://img.shields.io/npm/v/react-jinke-music-player.svg?style=flat-square) ![npm](https://img.shields.io/lgtm/alerts/g/lijinke666/react-music-player.svg?logo=lgtm&logoWidth=18) ![npm](https://codecov.io/gh/lijinke666/react-music-player/branch/master/graph/badge.svg) ![npm](https://api.netlify.com/api/v1/badges/2a5d8639-9d2a-46ee-a504-10b7846a57e4/deploy-status) ![npm](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

### 最后

这是一篇非常意识流的文章，其实就是对我日常开发 npm 包的一个总结，用到了很多工具来提高我的效率和幸福感，当然，都 2020 了，这些工具都比较常用，所以没有像一些文章那样把官网的文档粘贴过来凑成一篇专业的教程，日常开发中，也是参考了许多开源项目，看他们是怎么实现的，然后慢慢试着实践

### 参考链接

[react-music-player](https://github.com/lijinke666/react-music-player) [semantic-release 集成](https://zqblog.beaf.tech/semantic-release/) [taro](https://github.com/NervJS/taro) [老板，麻烦打包](https://www.lijinke.cn/2020/06/04/%E8%80%81%E6%9D%BF-%E9%BA%BB%E7%83%A6%E6%89%93%E5%8C%85/)
