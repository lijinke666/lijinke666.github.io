---
title: 写一个 Github Action
date: 2021-04-19 11:38:13
tags: Github,Javascript
---

<a name="X2dOR"></a>

### 前言

为了优化开发体验，设想的是小伙伴每次提交 PR 的时候，能够推送消息到钉钉群，提醒大家帮忙 Review, Github 提供 <br />丰富的 `web hooks` 可以做这件事<br />

<a name="YWy1g"></a>

### 为什么不用 Web Hooks

点击钉钉 -> 群设置 -> 智能群助手 添加自定义机器人<br />

![图 0](/images/2023-12-22-ad1e14120ad36873b5ea38b5484983d0a04d14b3e8a4807f38c7b52e44d6be7d.png)

<br />点击 Setting -> Webhooks 配置 event 为 pull_request 即可<br />

![图 1](/images/2023-12-22-51b3fc900134b7bf44ca9f46a5f0c61712048f8852011d1e40dcfc222781efea.png)

<br /> <br />

![图 2](/images/2023-12-22-10cbd1a61b013668678396642d86cf9a7203719dcbf45885b5f1d1034174d49b.png)

<br /> <br />配置好机器人后，一切正常，但是会有两个小问题<br />

1. 不能 @所有人
2. pull request 的钩子 不能精确到 pr 打开的时候才提醒，所以在 pr 打开，更新，有评论，关闭 等的时候都会收到提醒，太频繁了，体验不是很好，但是我发现 Github Action 可以做到这一点！

<a name="f2zc8"></a>

### Github Action 和 普通 npm 包的区别

<a name="V3ILd"></a>

#### 1. 文件构成

npm

- 源码
- package.json

<br />action

- 源码
- action.yml

<br />npm 包是通过 package.json 描述包的信息，而 action 通过 action.yml 描述，区别不大，只是形式不一样<br />

<a name="UUnwK"></a>

#### 2. 发布方式

npm

```
npm publish
```

action<br />

![图 3](/images/2023-12-22-9d0fb17757c1dc515ad6e0770b18ef25103fbcca45c409e03749d195d5443a71.png)

<a name="d6eCx"></a>

#### 3. 使用方式

npm

```bash
npm install xx@0.0.1
```

action

```yaml
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: my-actions@0.0.1
```

action 除了可以使用 release 后的具体版本号 `action@x.x.x` 之外，还可以直接使用源码的分支 `action@main` 新版本的 repo 主分支是 `main`, 老 repo 是 我们熟悉的 `master`, 所以这样使用也是可以的

```diff
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
-     - uses: my-actions@0.0.1
+     - uses: my-actions@main
```

<a name="cAYsC"></a>

### 发送钉钉消息

现在开始编写代码，发送让万千中小学生梦中惊醒的 午夜凶 Ding，这个很简单，调用 钉钉官方的 SDK 即可，这里找到个简化了的官方 SDK 的模块 `ding-robot`, 我们这里使用 @all 功能即可<br />

```typescript
const DingRobot = require('ding-robot');
const robot = new DingRobot（钉钉 TOKEN);

robot.atAll(atAll).text(content);
```

<a name="cWmzX"></a>

### 集成到 Github Action 中

<a name="ujYRT"></a>

#### 1. 钉钉消息构成

一条消息，预期要有当前 PR 的标题和链接，然后是谁的 PR, 使用官方的 `@actions/github`

```typescript
const github = require('@actions/github');
const context = github.context;
const pr = context.payload.pull_request;

pr.user.login; // 当前用户
pr.title; // 标题
pr.html_url; // 链接
```

<a name="Qry3i"></a>

#### 2. 接受用户参数

在 Action 里，参数通过 `with` 声明，在脚本中，可以通过官方的 `@actions/core` 拿到，我们这里要拿到 `钉钉 TOKEN` <br />

```typescript
const core = require('@actions/core');
const dingTalkToken = core.getInput('ding_talk_token');
```

<a name="rJ9Qm"></a>

#### 3. 完整代码

```typescript
const core = require('@actions/core');
const github = require('@actions/github');
const DingRobot = require('ding-robot');

async function run() {
  try {
    const context = github.context;
    const pr = context.payload.pull_request;
    const dingTalkToken = core.getInput('ding_talk_token');
    const extraContent = core.getInput('extra_content') || '';
    const atAll = core.getInput('at_all') || false;

    if (!dingTalkToken) {
      core.setFailed('Please set DingTalk access token!');
    }

    const robot = new DingRobot(dingTalkToken, (error) => {
      if (error) {
        core.setFailed(error.message);
      }
    });
    const prLink = pr.html_url;
    const content = `📢 ${pr.user.login} 发起 PR: (${pr.title}), 请大家帮忙 review 👀 \n🔗 链接：${prLink} \n${extraContent}`;
    robot.atAll(atAll).text(content);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
```

<a name="F07S7"></a>

#### 4. 打包源代码

使用 [ncc](https://github.com/vercel/ncc) 打包，将源码打包成单文件，提供给 Action 运行

```typescript
npm install @vercel/ncc

ncc build
```

<a name="tRAOT"></a>

#### 5. 编写 action.yml

参考 [官方文档](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions) 即可，复述一遍文档没啥意义，最后指定 `main` 为打包后的 `dist/index.js` 当别人使用你的 Action 时，其实就是运行的 index.js 文件

```bash
# https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions
name: 'Ding Talk PR Notify'
description: 'A ding talk pr notify of GitHub actions.'
author: 'lijinke666'

branding:
  # https://actions-cool.github.io/github-action-branding/
  icon: 'file'
  color: 'blue'

inputs:
  GITHUB_TOKEN:
    description: Secret GitHub API token to use for making API requests.
    default: ${{ github.token }}
    required: true

  ding_talk_token:
    description: 'dingtalk web hook token'
    required: true

  content:
    description: 'message content'

  at_all:
    description: 'at all users'

runs:
  using: 'node12'
  main: 'dist/index.js'
```

<a name="lIuHC"></a>

#### 6. 发布

发布比较简单，手动点几下就可以了，自动化的方式也有，自行搜索<br /> <br />

![图 4](/images/2023-12-22-863deff573039b1af03ae95f8b8f683369b4a5d740d9f9986f21ac46f01a584c.png)

<br /> <br />最后就可以在 Github 的 [Marketplace](https://github.com/marketplace) 搜索到你发布的 Action 了<br /> <br />

![图 5](/images/2023-12-22-4eb38e94090ed00676f77e44557a55d52b769c0f8af1c3bee3cbd9fe3989d4ef.png)

<br />

<a name="fsrup"></a>

### 使用

写完之后，我们随便找个仓库测试一下，实现编写 Action，让 PR 在打开的时候发送钉钉通知

```yaml
name: 🔊 PR Ding Talk Notify
on:
  pull_request:
  types: [opened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: lijinke666/ding-talk-pr-notify@main
        with:
          ding_talk_token: ${{ secrets.DING_TALK_ACCESS_TOKEN}}
```

![图 6](/images/2023-12-22-a35da1e422f0ae2267330e92e6d8607128aea5d08a4aff2fa253dda5f08c0b56.png)

<br />

![图 7](/images/2023-12-22-7357a711109a50c1dbfeb849384892758b0510de1e875b95f15f9c48db999d0c.png)

<br />大功告成，仓库地址 [https://github.com/lijinke666/ding-talk-pr-notify](https://github.com/lijinke666/ding-talk-pr-notify)<br />

<a name="vH1iS"></a>

### 参考链接

[https://github.com/actions-cool](https://github.com/actions-cool)<br />[https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions)
