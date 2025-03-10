---
title: 使用 service worker 获取 http 请求资源状态码
date: 2019-10-22 18:02:54
tags: js,serviceWorker
---

### 前言

在公司 js 社区的讨论中，有一位同学遇到了这样一个需求，在 `react` 应用中按需加载了一些 `js` 文件，这些文件有可能加载失败，需要获取到这些失败的文件状态码，做出相应的处理，那么问题来了，怎么获取状态码呢？

### 不可取的方式

同事 [a,b,c,d,e] 纷纷重拳出击，看他们都说到了 `react` 的底层实现了，却没一个回答问题同事 f 说到 直接发一个 `fetch` 请求

```js
const url = '?';
return fetch(new Request(url)).then((res) => console.log(res.status));
```

其实这会有两个问题

- 如何获取 当前请求资源的 `url`
- 页面加载本身会有次资源请求，再次 `fetch` 去获取会发两次请求

### 浏览器的 4 个线程

浏览器的运行机制 本身会有 4 个线程，用来处理不同的事情

- `主线程` 渲染 dom 执行 js 之类的
- `工作线程` Web Worker 和 Service Worker
- 排版线程
- 光栅线程

后面两个线程我不太熟悉就不乱说了 O `Web Worker` 可以用来做一些密集计算 然后使用 `postMessage` 发送给主线程 `Service Worker` 是 `PWA` 的核心，可以读取缓存，**拦截 fetch 请求**, 做本地推送 (web push), 离线应用 等等很多炫酷的事情其中拦截 `fetch` 请求就可以解决这位同学的问题

### 注册一个 Service Worker

```html
// index.html

<!DOCTYPE html>
<html lang="en">
  <body>
    <div id="root" />
  </body>
  // 其他 html-webpack-plugin append 的 script
  <script>
    navigator.serviceWorker.register('sw.js');
  </script>
</html>
```

![WX20191022-183108@2x-20191022183320](https://cdn.lijinke.cn/WX20191022-183108@2x-20191022183320.png)

如同所示 在应用启动的时候 `register` 了 一个 `Service Worker`, 这个兄弟从此开始默默的陪伴着我们，下一步就是让他帮我们拦截请求

### 拦截请求

```js
self.addEventListener('fetch', (event) => {
  event.waitUntil(
    (async function () {
      if (!event.clientId) return;

      const client = await clients.get(event.clientId);
      if (!client) return;

      return fetch(event.request.url).then((res) =>
        // 发送状态码给 客户端
        client.postMessage(res.status),
      );
    })(),
  );
});
```

这里有几点需要注意

**`self`** 表示当前线程的一个作用域

**`event.waitUntil`** 参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/ExtendableEvent/waitUntil)

> 在一个与 install 事件相关联的 EventHandler 被调用时，它延迟将被安装的 worker 视为 installing ，直到传递的 Promise 被成功地 resolve。这主要用于确保：服务工作线程在所有依赖的核心 cache 被缓存之前都不会被安装

**`client.postMessage`** 这里和 `web worker` 有一点不一样不能直接 `self.postMessage`, 需要拿到当前 主线程的 `实例` 才能 `postMessage` 到 主线程

**`event.request.url`** 表示请求的 `url` 如图所示

![WX20191022-184127@2x-20191022184140](https://cdn.lijinke.cn/WX20191022-184127@2x-20191022184140.png)

### 接收状态码

现在我们已经让 `Service Worker` 这个大兄弟帮我们把 当前请求资源状态码发过来了，接下来就是"收货"（接收）了。

```js
// 监听 sw 线程发过来的 状态码
navigator.serviceWorker.addEventListener('message', function (e) {
  console.log(e.data); // 200
});
```

![WX20191022-184452@2x-20191022184515](https://cdn.lijinke.cn/WX20191022-184452@2x-20191022184515.png)

接下来就可以拿到这个状态码 做对应的业务逻辑了

### 结语

Service Worker 已经出来很久了，前两年 由于 `PWA` 火了一把，当时我也是玩了很久，踩了很多坑由于兼容性等等因素，现在又变得不温不火了，不过作为知识储备也是很香的。
