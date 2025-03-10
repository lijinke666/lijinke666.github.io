---
title: 使用 Github Action 来做自动化
date: 2022-10-19 14:33:43
tags: Github Action
---

<a name="oBKDo"></a>

### 1. 🔍 背景

在日常开源运营中，对于一个 Github 仓库，使用最频繁的就是这四大金刚<br />

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665555131989-80553e28-d859-410c-80c2-bb52ef4d89f3.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=55&id=u0b2e5828&margin=%5Bobject%20Object%5D&name=image.png&originHeight=110&originWidth=398&originalType=binary&ratio=1&rotation=0&showTitle=false&size=11047&status=error&style=none&taskId=u7b3e1a44-18e6-49aa-9b57-da72cd75468&title=&width=199)![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665555141180-04876950-2b7a-4d2b-a149-4f4ddbb51073.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=78&id=uc70ad10e&margin=%5Bobject%20Object%5D&name=image.png&originHeight=156&originWidth=289&originalType=binary&ratio=1&rotation=0&showTitle=false&size=10988&status=error&style=none&taskId=u1fe4593e-b568-43ff-a262-7f8b3413416&title=&width=144.5)

- **Code** 查看源代码
- **Issues** 管理问题
- **Pull requests** 管理代码提交
- **Releases** 查看发布日志

`Issues`和 `Pull requests` 版块是开发者和用户频繁交流的地方，也是比较耗费精力的地方，往往是反复对线拉扯，我们会预设好对应的 **模板**, 用来提升提问效率<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665556058636-69e0deec-71fd-4bfb-9b5a-33df000e72df.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=488&id=ua9348b82&margin=%5Bobject%20Object%5D&name=image.png&originHeight=975&originWidth=777&originalType=binary&ratio=1&rotation=0&showTitle=false&size=103237&status=error&style=none&taskId=u5b4bab95-4892-4ffa-8b1c-4eb3ee14531&title=&width=388.5)

然而模板并没有什么卵用，我们也总是遇到这篇文章 [<<如何向开源项目提交无法解答的问题>>](https://zhuanlan.zhihu.com/p/25795393) 提到的那些 "神奇" 的用户

这篇文章就简单介绍一下 S2 是如果通过自动化的方式，来对 Issue, PR, 版本进行管理

<a name="KRT2o"></a>

### 2. 📈 Issue 管理

<a name="GrZbu"></a>

#### 2.1 打标签

在越来越多的 Issue 堆积起来后，使用 标签 对其进行分类就显得尤为重要，便于快速查找，增加辨识度 [查看完整列表](https://github.com/antvis/S2/labels)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665556869517-0e8dba33-148f-4273-b8b7-f772b2e07e05.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=163&id=u9a7197e0&margin=%5Bobject%20Object%5D&name=image.png&originHeight=671&originWidth=619&originalType=binary&ratio=1&rotation=0&showTitle=false&size=60513&status=error&style=none&taskId=ue97d7f9b-1339-4228-8c74-434727bb7f4&title=&width=150.5)

<a name="HOMjg"></a>

#### 2.2 自动回复

设置标签后，我们还可以进一步扩展，利用强大的 [Github Action](https://github.com/antvis/S2/actions/workflows/issue-labeled.yml) 和 [issues-helper](https://github.com/actions-cool/issues-helper) 来进行自动回复

- Action 提供强大的 CI 能力，可以使用各种自定义功能
- issues-helper 对 GItHub API 提供了封装，能便捷的对 issue 做各种处理 （强烈推荐）

如图，该用户采用了经典的提问方式：**"无视模板，开局一句话，内容全靠猜"**, 此时我们打上 👀 need more info 标签，机器人就会自动回复一个我们预设好的话<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665557152420-4c3d4b34-bbe9-4cfd-8835-21f0a3c4828e.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=295&id=u01587cf8&margin=%5Bobject%20Object%5D&name=image.png&originHeight=590&originWidth=940&originalType=binary&ratio=1&rotation=0&showTitle=false&size=124757&status=error&style=none&taskId=u8d2a518d-f641-45e1-a193-44eabc77883&title=&width=470)

又或是用户反馈了一个 bug, 但是我们无法复现，需要一个让其提供一个复现链接

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665558057314-4271acd1-6a66-4669-a4de-be0a56f31640.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=135&id=u6b1939d6&margin=%5Bobject%20Object%5D&name=image.png&originHeight=270&originWidth=920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=62212&status=error&style=none&taskId=u7799da20-5961-4f69-b1ff-86f1cf4d0b8&title=&width=460)

workflow 代码如下

```yaml
name: Issue Labeled

# 新增标签时触发
on:
  issues:
    types: [labeled]

jobs:
  issue-labeled:
    # 打标签和提交 issue 的不是同一个人才执行
    if: github.actor != github.event.issue.user.login
    runs-on: ubuntu-latest
    steps:
      - name: Need more info
        if: github.event.label.name == '👀 need more info'
        uses: actions-cool/issues-helper@main
        with:
          actions: 'create-comment'
          token: ${{ secrets.GITHUB_TOKEN }}
          issue-number: ${{ github.event.issue.number }}
          body: |
            你好 @${{ github.event.issue.user.login }}，你所提供的信息不足于我们排查问题，请按照 issue 模板填写相关信息 （参考 #852 #848), 提供 gif, 截图，代码片段，配置信息，版本号，可复现链接等方式，详细说明复现步骤，感谢配合，谢谢！15 天内未回复 issue 自动关闭。

            Hello, @${{ github.event.issue.user.login }}, the information you provided is not enough for us to troubleshoot the problem. Please complete the issue description (refer #852 #848), provide gifs, screenshots, config, version. And explain the reproduction steps in detail. Thanks so much for your cooperation! The issue will be closed without any replay within 15 days.
```

控制台查看：<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665558536189-c3a81a89-b6e8-463f-925d-784e09b3cc67.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=202&id=u2208c873&margin=%5Bobject%20Object%5D&name=image.png&originHeight=404&originWidth=1276&originalType=binary&ratio=1&rotation=0&showTitle=false&size=79168&status=error&style=none&taskId=uebc9a67b-c7f4-4f58-932c-4aefbdd6cc2&title=&width=638)

大致流程：<br />![](https://intranetproxy.alipay.com/skylark/lark/0/2022/jpeg/6356643/1665562324238-520480aa-cda5-4c23-b47f-7c5a93d2d292.jpeg)

更多细节请查看 [🏷 S2 Labels 使用指南](<https://yuque.antfin.com/docs/share/356a627f-be20-427c-9b6d-2d2abf6e5734>?# 《🏷 S2 Labels 使用指南》)

<a name="EQOjt"></a>

#### 2.3 定时任务

对于已经打上 👀 need more info 🤔 need reproduce 的 issue,  但是却迟迟得不到回应，我们可以使用 `定时任务` 来自动的进行批量处理

workflow 代码如下

```yaml
name: Issue Close Require

on:
  schedule:
    - cron: "0 0 * * *"

jobs:
  close-issues:
    runs-on: ubuntu-latest
    steps:
      - name: Need reproduce
        uses: actions-cool/issues-helper@main
        with:
          actions: 'close-issues'
          labels: '🤔 need reproduce'
          inactive-day: 15
          body: |
            由于该 issue 被标记为需要复现，却 15 天未收到回应。现关闭 issue，若有任何问题，可评论回复。

            Since the issue was labeled as "🤔 need reproduce" but no response was received for 15 days. Now close the issue. If you have any questions, feel free to comment.

      - name: Needs more info
        uses: actions-cool/issues-helper@main
        with:
          actions: 'close-issues'
          labels: '👀 need more info'
          inactive-day: 15
          body: |
            由于该 issue 被标记为需要更多信息，却 15 天未收到回应。现关闭 issue，若有任何问题，可评论回复。

            Since the issue was labeled as "👀 need more info" but no response was received for 15 days. Now close the issue. If you have any questions, feel free to comment.

```

此时，有弹幕肯定会问："如果打上标签后，过几天用户又突然回复了怎么办？岂不是就自动关闭了"

<a name="ADYEO"></a>

#### 2.4 按需移除

对于上面弹幕说到的问题，我们监听 Issue 的 `edited`和 `comment` 事件，只要该 `issue`是打开状态，并且是创建者编辑的，那么我们就移除对应的标签，这样定时任务就不会触发了

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665559636230-304abdf8-a9b4-449d-ac69-06f591d031af.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=115&id=u5c59fed6&margin=%5Bobject%20Object%5D&name=image.png&originHeight=229&originWidth=930&originalType=binary&ratio=1&rotation=0&showTitle=false&size=31951&status=error&style=none&taskId=uded7350c-437c-4542-8921-dbdb1f1b3f2&title=&width=465)

workflow 代码如下：

```yaml
name: Issue Remove Inactive

on:
  # issue 更新
  issues:
    types: [edited]
  # issue 新增/修改评论
  issue_comment:
    types: [created, edited]

jobs:
  issue-remove-inactive:
    runs-on: ubuntu-latest
    steps:
      - name: remove inactive
        # 当前 issue 是打开状态，并且是楼主触发的更新
        if: github.event.issue.state == 'open' && github.actor == github.event.issue.user.login
        uses: actions-cool/issues-helper@v3
        with:
          actions: 'remove-labels'
          issue-number: ${{ github.event.issue.number }}
          labels: '💤 inactive,🤔 need reproduce,👀 need more info'

```

<a name="Vha7I"></a>

### 3. 📈 PR 管理

给 S2 提交 PR 的通常都是组内的小伙伴，但是偶尔还是会有几个社区的活菩萨，通常 PR 会有场景的几个问题

- PR 没人看
- PR 不写描述，看不懂改了什么东西
- 单测挂了，没有提示

同理，和 Issue 管理一样，我们通过 `打标签`+ `自动回复` 的方式，增强了开发体验

<a name="JE0KD"></a>

#### 3. 1 PR 提醒

1. 首先是配置 webhook, 配合钉钉群机器人 进行提醒，比较简单不多赘述。

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665560769224-aad30ba9-fbd1-48ac-8968-7879d9cc4d70.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=238&id=u9fda1458&margin=%5Bobject%20Object%5D&name=image.png&originHeight=475&originWidth=422&originalType=binary&ratio=1&rotation=0&showTitle=false&size=54619&status=error&style=none&taskId=ufcda4a74-8b91-433b-9e66-6e0d2473286&title=&width=211)

2. 自动添加 Reviewer

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665560826237-b0ddc3c1-d167-4dca-b9a0-97f76073303a.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=109&id=u1e117714&margin=%5Bobject%20Object%5D&name=image.png&originHeight=218&originWidth=875&originalType=binary&ratio=1&rotation=0&showTitle=false&size=36726&status=error&style=none&taskId=u1f9b5d08-3307-4358-a66e-6eafd4c3174&title=&width=437.5)<br />当新建一个 PR 时，会自动添加预设的组内其他小伙伴，提醒他们来评审 PR, 同时会有邮件提醒

```yaml
name: 👨‍💻👩‍💻 PR Auto Assign Reviewer

on:
  pull_request_target:
    types: [opened]

jobs:
  add-reviewer:
    runs-on: ubuntu-latest
    steps:
      - name: Add assignees
        uses: actions-cool/issues-helper@main
        with:
          actions: 'add-assignees'
          token: ${{ secrets.GITHUB_TOKEN }}
          issue-number: ${{ github.event.pull_request.number }}
          assignees: ${{ github.event.pull_request.user.login }}

      - name: Add reviewers
        uses: actions-cool/pr-welcome@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          pr-emoji: '+1, rocket'
          reviewers: 'xingwanying,serializedowen,lcx-seima,YardWill,lijinke666,wjgogogo,stone-lyl,GaoFuhong'
          review-creator: false

```

<a name="IEjkD"></a>

#### 3.2 单测未通过提醒

Action CI 的执行过程，每一个 `steps` 是串行的，同时 Github 提供了 `failure`和 `success` 两个函数，用于得到当前 `step`的执行状态

因此我们将检测的代码放在所有 `step`的末尾，如下代码所示，如果 `Test` 这一部失败了，那么我们就添加一个 🚨 test failed 的标签，反之移除，同时自动添加一条评论 `maintain-one-comment`, 同时作者也会收到一条邮件<br />

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665561388092-83cd4b0f-6757-44d0-87b9-54cef2fb1eac.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=129&id=u8b216f5c&margin=%5Bobject%20Object%5D&name=image.png&originHeight=257&originWidth=914&originalType=binary&ratio=1&rotation=0&showTitle=false&size=45617&status=error&style=none&taskId=ud8781718-4399-4435-bb4c-50639c05392&title=&width=457)

```yaml
name: test

on: [pull_request]

concurrency:
  group: ${{github.workflow}}-${{github.event_name}}-${{github.ref}}
  cancel-in-progress: true

jobs:
  test:
    runs-on: macos-latest
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    strategy:
      matrix:
        node-version: [16]

    steps:
      - name: Test
        run: |
          yarn test:ci-coverage

      - name: Workflow failed alert
        if: ${{ failure() }}
        uses: actions-cool/maintain-one-comment@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          body: |
            你好，@${{ github.event.pull_request.user.login }} CI 执行失败，请点击 [Details] 按钮查看，并根据日志修复。

            Hello, @${{ github.event.pull_request.user.login }} CI run failed, please click the [Details] button for detailed log information and fix it.
            <!-- Created by actions-cool/maintain-one-comment -->
          emojis: 'eyes'
          body-include: '<!-- Created by actions-cool/maintain-one-comment -->'

      - name: Workflow failed add test failed label
        if: ${{ failure() && github.event.pull_request.number != '' }}
        uses: actions-cool/issues-helper@main
        with:
          actions: 'add-labels'
          token: ${{ secrets.GITHUB_TOKEN }}
          issue-number: ${{ github.event.pull_request.number }}
          labels: '🚨 test failed'

      - name: Remove test failed label
        if: ${{ success() && github.event.pull_request.number != '' }}
        uses: actions-cool/issues-helper@main
        with:
          actions: 'remove-labels'
          token: ${{ secrets.GITHUB_TOKEN }}
          issue-number: ${{ github.event.pull_request.number }}
          labels: '🚨 test failed'
```

<a name="pzDGW"></a>

### 4. 📚 敏捷看板

敏捷看板又称为产品经理快乐板，在一个一个纵向排列的泳道中，一般是：

 "待排期" => "待开发" => "进行中" => "待测试" => "测试中" => "已解决"

依葫芦画瓢，在 S2 中，我们利用  Github  自带但是特别冷门的 `Projects`, 将 Issue 和 PR 做成一个看板，通过它，我们可能很清晰直观的看到目前的一个状态，在周会上，组内的小伙伴也可以快速同步，可谓是 "一站式" 处理 :)<br />

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665559938794-9f629815-d024-46ac-801e-f3cf4a4e1e2a.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=341&id=ubc7b4842&margin=%5Bobject%20Object%5D&name=image.png&originHeight=682&originWidth=1849&originalType=binary&ratio=1&rotation=0&showTitle=false&size=283952&status=error&style=none&taskId=ubbd0207b-93ab-4feb-9bb0-a91504bfed6&title=&width=924.5)

<a name="n6etg"></a>

#### 4.1 自动同步 Issue 和 PR 到看板中

默认情况下，Issue 和 PR 是不会自动添加到看板中，需要手动添加，同理，我们可以利用 Github Action 自动添加

> Issue

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665560362147-8e8537b3-284d-4374-a9c1-63fd642cabfd.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=89&id=ub7ab56c8&margin=%5Bobject%20Object%5D&name=image.png&originHeight=178&originWidth=756&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25326&status=error&style=none&taskId=ua1a7c114-c3a5-4428-90c0-fbc2ad544c0&title=&width=378)
> PR

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665560407275-4a3ca4db-5924-48a5-818a-2e719899d7fd.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=170&id=u999507ba&margin=%5Bobject%20Object%5D&name=image.png&originHeight=340&originWidth=1043&originalType=binary&ratio=1&rotation=0&showTitle=false&size=53812&status=error&style=none&taskId=u4a9ca4a0-c9fb-4cf3-a9cf-69c4ab0a6ba&title=&width=521.5)

```yaml
name: 🚀 Auto Add Issue And PR To Project
on:
  issues:
    types:
      - opened
  pull_request_target:
    types:
      - opened

jobs:
  add-issue-to-project:
    runs-on: ubuntu-latest
    if: "github.event_name == 'issues'"
    steps:
      - uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: 👨‍💻👩‍💻  Issues & PRs 进度跟踪
          column: Pending Issues
          repo-token: ${{ secrets.GH_PROJECT_TOKEN }}
          action: add

  add-pr-to-project:
    runs-on: ubuntu-latest
    if: "github.event_name == 'pull_request_target'"
    steps:
      - uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: 👨‍💻👩‍💻  Issues & PRs 进度跟踪
          column: Pending PRs
          repo-token: ${{ secrets.GH_PROJECT_TOKEN }}
          action: add

```

<a name="SeGWe"></a>

### 5. 🚀 自动发布

S2 是 monorepo,  目前由 4 个包组成
> 含 @s2-shread 私有包 （内部使用，未发布）

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665562071466-6564fe9c-2e58-4c9f-8074-6c33c313fa3e.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=124&id=ua95f5634&margin=%5Bobject%20Object%5D&name=image.png&originHeight=248&originWidth=841&originalType=binary&ratio=1&rotation=0&showTitle=false&size=48842&status=error&style=none&taskId=u36313645-f334-4a0d-a10a-f59607fc1ff&title=&width=420.5)<br />主流的包管理方案是 `lerna`和 `pnpm`, 通常来说，发布流程如下

![](https://intranetproxy.alipay.com/skylark/lark/0/2022/jpeg/6356643/1665562715561-57d1bc60-9d86-4a72-ba48-471faf108fbb.jpeg)

对于 Github 这一环的流程，还有所欠缺。比如：

- 需要手动创建 Github Releases, 把生成的 changelog 粘贴过去
- 无法和 issue 进行关联，用户不清楚当前的 issue 的 bug fix 对应哪个版本

经过组内小伙伴的共同调研，最终使用了

- [semantic-release](https://github.com/semantic-release/semantic-release)  全自动的语义化发布
- [semantic-release-monorepo](https://github.com/pmowrer/semantic-release-monorepo)  semantice-release 的 monorepo 插件

```javascript
module.exports = {
  branches: [
    'latest',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
    { name: 'next', prerelease: true },
  ],
  extends: 'semantic-release-monorepo',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        message: 'chore(release): 🤖 ${nextRelease.gitTag} [skip ci]',
      },
    ],
    '@semantic-release/github',
  ],
  preset: 'angular',
};

```

相比其他方案，它可以自动创建 Github Releases<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665563527052-02bcdae1-c0b6-44c1-baea-3c860b9f9d3d.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=407&id=u128b03df&margin=%5Bobject%20Object%5D&name=image.png&originHeight=814&originWidth=842&originalType=binary&ratio=1&rotation=0&showTitle=false&size=133245&status=error&style=none&taskId=ua3830de7-e8cc-4e8f-bd12-caab3d7e7bd&title=&width=421)<br />以及自动关联发布版本 到对应 issue<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665563570279-8e43c807-73f7-48c3-81ff-b97807149678.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=199&id=u713dbf14&margin=%5Bobject%20Object%5D&name=image.png&originHeight=398&originWidth=959&originalType=binary&ratio=1&rotation=0&showTitle=false&size=61725&status=error&style=none&taskId=ua5e973ea-d915-46a2-bdb0-9366cb41b1a&title=&width=479.5)

:::info
在 CI 中，Action 会有一个 默认的 TOKEN, 即：`${{ secrets.GITHUB_TOKEN }}`, 如图<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665628518573-2a07438d-f94c-4f63-89e8-94458449be81.png#clientId=udac51be5-845e-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=71&id=NOrIh&margin=%5Bobject%20Object%5D&name=image.png&originHeight=71&originWidth=243&originalType=binary&ratio=1&rotation=0&showTitle=false&size=7389&status=error&style=none&taskId=ud67a734d-4d52-4505-9b1a-a028a2b667d&title=&width=243)<br />你也可以配置成自己的 TOKEN, 那么就会显示你的用户名和头像，所以看到这个头像不一定是我本人在操作 :)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665628629640-41bb8432-d03c-4c96-9af1-d13f91169a9c.png#clientId=udac51be5-845e-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=62&id=ue423517e&margin=%5Bobject%20Object%5D&name=image.png&originHeight=62&originWidth=158&originalType=binary&ratio=1&rotation=0&showTitle=false&size=7400&status=error&style=none&taskId=ub3267f7c-e2b1-4a4e-9cb6-f14cf92e0ec&title=&width=158)<br />[🔑 如何生成各种 TOKEN](https://yuque.antfin.com/lijinke.ljk/lcp8sk/lkgayg)
:::

<a name="Yv7Lz"></a>

#### 5.1 发布方式

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665563454421-bb1d29ed-d4a9-4dfb-8dc6-9f542ad1335c.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=224&id=Tz4wD&margin=%5Bobject%20Object%5D&name=image.png&originHeight=447&originWidth=785&originalType=binary&ratio=1&rotation=0&showTitle=false&size=129658&status=error&style=none&taskId=u1106d1b1-4b5d-4986-828b-76fc274a792&title=&width=392.5)<br />我们创建了三个分支，分别是

- `latest`正式版
- `beta`测试版
- `alpha`预览版

在任意分支提交以 `chore(release):` 开头的 commit ,  push 代码即完成发布，后续交给 CI 即可

```typescript
git commit -m "chore(release): bump version"
git push
```

```yaml
name: 🚀 Auto Release
on:
  push:
    branches:
      - latest # 正式版
      - beta
      - alpha

jobs:
  release:
    runs-on: ubuntu-latest
    # 以 chore(release): 开头才触发
    if: "!contains(github.event.head_commit.message, '[skip ci]') && startsWith(github.event.head_commit.message , 'chore(release):')"

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js 16
        uses: actions/setup-node@v3
        with:
          node-version: 16 # semantic-release 需要 >= 16 的 Node.js 环境
          cache: 'yarn'

      - name: Install dependencies
        run: yarn

      - name: Build
        run: yarn build

      # 自动发布完成后 触发 github.release.published 事件
      # 如果是 action 自带的 机器人 token, 出于安全考虑，github 会禁止循环触发，使用真实用户的 token 可解决这个问题
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.JINKE_GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: lerna exec --concurrency 1 -- npx --no-install semantic-release

      # 发布失败通知内部开发群
      - name: Release failed ding talk dev group notify
        if: ${{ failure() }}
        uses: zcong1993/actions-ding@master
        with:
          dingToken: ${{ secrets.DING_TALK_ACCESS_TOKEN }}
          ignoreError: true
          body: |
            {
              "msgtype": "link",
              "link": {
                "title": "🚨 自动发布失败",
                "text": "🔗 请点击链接查看具体原因，及时修复，尝试点击右上角 [Re-run all jobs] 重试，或手动发布 🚑",
                "messageUrl": "https://github.com/antvis/S2/actions/workflows/auto-release.yml",
                "picUrl": "https://gw.alipayobjects.com/zos/antfincdn/JxgObjrPo/dde3c2cf-ce2f-45ab-90a7-9f5cce889227.png"
              }
            }

```

:::warning
为什么不直接在本地发布，而是要通过 CI ?
:::
:::success

1. 本地需要配置 npm 和 github 的 TOKEN, 组内小伙伴都需要配置，很麻烦，而把 TOKEN 统一配置在 CI 中，则可解决多人发布的问题
2. 通过 CI, 可以保证 lint , test 全部通过后，再进行发布，同时可以避免由于每个人的环境差异，本地 node_modules 差异造成的打包产物不同
3. 发布过程更直观，每个人都可以在控制台看到
:::
<a name="OgMpf"></a>

#### 5.2 发布分支

对于正式版发布，为什么是 `latest`分支，而不是直接使用 `master`, 原因是在自动发布后，semantice-release 会将生成的 `changelog`提交上来<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665565504893-ea16f2af-5899-40bd-9b00-5f2d714e9f61.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=559&id=u0fa839d1&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1117&originWidth=1456&originalType=binary&ratio=1&rotation=0&showTitle=false&size=234338&status=error&style=none&taskId=u3ec2b507-d8ef-4f44-96e6-e9b152793cb&title=&width=728)

由于 `master`是 **保护分支，**无法直接 push 代码，也可以取消 `master` 的保护策略，在安全性以及各种权衡之下，最终选中了这种取消救国的方式，唯一的弊端就是，在发布 `alpha`和 `beta`版本时，需要同时同步一下 `latest （同步 Tag)`和 `master （同步代码）` 分支<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665565788225-06af5df6-34b8-4314-ac3d-9e02760f337a.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=114&id=uc8fbb56d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=227&originWidth=821&originalType=binary&ratio=1&rotation=0&showTitle=false&size=139829&status=error&style=none&taskId=uf11dd747-b5d3-462b-9fe6-f8023688a95&title=&width=410.5)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665565570143-7b1ae3e0-80d1-4819-b6b4-fad067c2252a.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=449&id=ueeb407fb&margin=%5Bobject%20Object%5D&name=image.png&originHeight=898&originWidth=895&originalType=binary&ratio=1&rotation=0&showTitle=false&size=126823&status=error&style=none&taskId=ua660e6e5-a6d7-4d3c-bd4f-63de945aebe&title=&width=447.5)

<a name="FuhHZ"></a>

#### 5.3 发布通知

同理，我们使用 Action 监听  `release` 的 `released` 事件，再调用 钉钉 API 即可

```yaml
name: 🎉 Release Notify

on:
  release:
    # published: latest release 和 pre release 都会触发
    # prereleased: 只有 pre release 触发
    # released: 只有 latest release 触发
    types: [prereleased]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Sleep 10s
        uses: juliangruber/sleep-action@v1
        with:
          time: 10s

      - name: Pre Release Notify
        uses: visiky/dingtalk-release-notify@main
        with:
          DING_TALK_TOKEN: ${{ secrets.DING_TALK_ACCESS_TOKEN }}
          notify_title: '🎉 {release_tag} 发布 🎉'
          notify_body: '## { title } <hr /> ![preview](https://gw.alipayobjects.com/zos/antfincdn/ISzgBCtgR/2c5c4aaa-4f40-46f7-8f6b-427fa9ff07bb.png) <hr /> { body } <hr />'
          notify_footer: '> 前往 [**AntV/S2 Releases**]({ release_url }) 查看完整信息。'
          at_all: false
          enable_prerelease: true

```

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665566099275-defb2677-3f5e-4726-905e-a7ae1ac7d65e.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=163&id=u56d71254&margin=%5Bobject%20Object%5D&name=image.png&originHeight=325&originWidth=455&originalType=binary&ratio=1&rotation=0&showTitle=false&size=105462&status=error&style=none&taskId=u1d78c56f-b934-42cc-a4c4-e3cf9625bf8&title=&width=227.5)<br />同时，action 支持 job 依赖，即一个 action 执行完成后，再执行另外一个，我们可以利用这个特性将 action 解耦，不然全部写在一个文件，太乱，不易维护

```yaml
name: 🚀 After the release is successful

# 自动发布 action 执行完成后再执行 （无论成功失败都会执行）
on:
  workflow_run:
    workflows: ["🚀 Auto Release"]
    branches: [latest] # 只有正式版发布才同步 changelog 和 lock
    types:
      - completed

jobs:
  sync-site-lock:
    runs-on: ubuntu-latest
    # 自动发布成功后
    if: github.event.workflow_run.conclusion == 'success'
    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js 16
        uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: 'yarn'

      - name: Git bootstrap
        run: |
          git config --global user.name 'Jinke Li'
          git config --global user.email 'a1231236677287@163.com'
          git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/$GITHUB_REPOSITORY
        env:
          GITHUB_TOKEN: ${{ secrets.JINKE_GITHUB_TOKEN }}

      - name: Checkout branch
        run: |
          git checkout -b chore-sync
          git fetch --all
          git merge origin/latest --squash

      - name: Sleep 5m
        uses: juliangruber/sleep-action@v1
        with:
          time: 20m

      - name: Install dependencies
        run: yarn

      - name: Sync Locale site @antv/s2 and @antv/s2-react lock
        run: yarn site:sync-s2-lock

      - name: Push lock
        run: |
          git add .
          git commit -m "chore: 🤖 更新 lock 和 changelog 文件" -n
          git push origin chore-sync --no-verify -f

      # 使用官方的 github cli 便捷的创建 pr
      - name: Create PR
        run: |
          gh pr create --title "chore: 🤖 更新 lock 和 changelog 文件" --body "🤖 由 [[Sync Site S2 Lock And Changelog With PR](https://github.com/antvis/S2/blob/master/.github/workflows/sync-site-lock-changelog-with-pr.yml)] action 自动创建。"
        env:
          GITHUB_TOKEN: ${{ secrets.JINKE_GITHUB_TOKEN }}

      # 部署官网
      - name: Delpoy Site
        run: yarn site:deploy

      # 失败通知
      - name: 🔊 Delpoy failed notify
        if: ${{ failure() }}
        uses: zcong1993/actions-ding@master
        with:
          dingToken: ${{ secrets.DING_TALK_ACCESS_TOKEN }}
          ignoreError: true
          body: |
            {
              "msgtype": "link",
              "link": {
                "title": "🚨 官网部署失败",
                "text": "🔗 请点击链接查看具体原因，尝试点击右上角 [Re-run all jobs] 重试，或者手动部署 🚑",
                "messageUrl": "https://github.com/antvis/S2/actions/workflows/release-success.yml",
                "picUrl": "https://gw.alipayobjects.com/zos/antfincdn/JxgObjrPo/dde3c2cf-ce2f-45ab-90a7-9f5cce889227.png"
              }
            }

```

<a name="kApzH"></a>

#### 5.4 自动部署官网

我们可以使用 Action 的 `workflow_run` 属性，在指定 Action 执行完后再执行操作，然后部署官网

```yaml
name: 🚀 After the release is successful

# 自动发布 action 执行完成后再执行 （无论成功失败都会执行）
on:
  workflow_run:
    workflows: ["🚀 Auto Release"]
    branches: [latest] # 只有正式版发布才同步 changelog 和 lock
    types:
      - completed

jobs:
  sync-site-lock:
    runs-on: ubuntu-latest
    # 自动发布成功后
    if: github.event.workflow_run.conclusion == 'success'
    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js 16
        uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: 'yarn'

      - name: Git bootstrap
        run: |
          git config --global user.name 'Jinke Li'
          git config --global user.email 'a1231236677287@163.com'
          git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/$GITHUB_REPOSITORY
        env:
          GITHUB_TOKEN: ${{ secrets.JINKE_GITHUB_TOKEN }}

      - name: Checkout branch
        run: |
          git checkout -b chore-sync
          git fetch --all
          git merge origin/latest --squash

      - name: Sleep 5m
        uses: juliangruber/sleep-action@v1
        with:
          time: 20m

      - name: Install dependencies
        run: yarn

      - name: Sync Locale site @antv/s2 and @antv/s2-react lock
        run: yarn site:sync-s2-lock

      - name: Push lock
        run: |
          git add .
          git commit -m "chore: 🤖 更新 lock 和 changelog 文件" -n
          git push origin chore-sync --no-verify -f

      # 使用官方的 github cli 便捷的创建 pr
      - name: Create PR
        run: |
          gh pr create --title "chore: 🤖 更新 lock 和 changelog 文件" --body "🤖 由 [[Sync Site S2 Lock And Changelog With PR](https://github.com/antvis/S2/blob/master/.github/workflows/sync-site-lock-changelog-with-pr.yml)] action 自动创建。"
        env:
          GITHUB_TOKEN: ${{ secrets.JINKE_GITHUB_TOKEN }}

      # 部署官网
      - name: Delpoy Site
        run: yarn site:deploy

      # 失败通知
      - name: 🔊 Delpoy failed notify
        if: ${{ failure() }}
        uses: zcong1993/actions-ding@master
        with:
          dingToken: ${{ secrets.DING_TALK_ACCESS_TOKEN }}
          ignoreError: true
          body: |
            {
              "msgtype": "link",
              "link": {
                "title": "🚨 官网部署失败",
                "text": "🔗 请点击链接查看具体原因，尝试点击右上角 [Re-run all jobs] 重试，或者手动部署 🚑",
                "messageUrl": "https://github.com/antvis/S2/actions/workflows/release-success.yml",
                "picUrl": "https://gw.alipayobjects.com/zos/antfincdn/JxgObjrPo/dde3c2cf-ce2f-45ab-90a7-9f5cce889227.png"
              }
            }

```

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/6356643/1665566456897-31ba8590-52ce-4dd1-9f96-d883727cdd82.png#clientId=u2d9663fb-26e8-4&crop=0&crop=0&crop=1&crop=1&errorMessage=unknown%20error&from=paste&height=74&id=uf2fecaa0&margin=%5Bobject%20Object%5D&name=image.png&originHeight=148&originWidth=426&originalType=binary&ratio=1&rotation=0&showTitle=false&size=19436&status=error&style=none&taskId=u6b0ae879-da1a-45f2-9eb0-fd569fa12b3&title=&width=213)<br />更多细节请查看 [🚀 发布规范](https://yuque.antfin.com/spreadsheet/garqs6/hednl5)

<a name="wSVPf"></a>

### 6. 🔭 总结

上述很多 Action ,  主要参考 (chao xi) 了 ant-design 仓库 的 [workflows 配置](https://github.com/ant-design/ant-design/tree/master/.github/workflows) , 通过上面简单的介绍，我们可以了解到，借助强大的 Github Action, 我们实现

- Issue 的自动回复
- PR 的自动回复，自动通知
- 定时任务管理 Issue
- semantice-release 自动发布
- 自动部署官网

如果看完这篇文章你有所收获，欢迎给我们的 [仓库](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fantvis%2Fs2) [Star⭐️](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fantvis%2Fs2) 鼓励。

S2 的相关链接：

- [GitHub](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fantvis%2Fs2)
- [官网](https://link.juejin.cn/?target=https%3A%2F%2Fs2.antv.vision%2F)
- 核心层：[@antv/s2](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40antv%2Fs2)
- 组件层：[@antv/s2-react](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40antv%2Fs2-react)

<a name="UdVE1"></a>

### 7. 🔗 参考链接

- [ant-design workflows](https://github.com/ant-design/ant-design/tree/master/.github/workflows)
- [S2 开发规范](https://yuque.antfin.com/spreadsheet/garqs6)
- [S2 Labels 使用指南](https://yuque.antfin.com/spreadsheet/garqs6/mowkwq)
- [actions-cool/issues-helper](https://github.com/actions-cool/issues-helper)
