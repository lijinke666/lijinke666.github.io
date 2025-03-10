---
title: 炫酷的 MediaSession
date: 2020-04-14 20:56:56
tags: javascript
---

![2020-04-14-21-01-31-202041421132](https://cdn.lijinke.cn/2020-04-14-21-01-31-202041421132.png)

### 1. 前言

最近为我的音乐播放器新增了一个 `MediaSession` 的功能，非常的酷炫，依赖于谷歌浏览器的 [MediaSession](https://web.dev/media-session/) Api, 翻译过来就是 媒体会话，可以实现像如 `网易云音乐` app 一样播放歌曲的时候，在手机任务栏，可以看到当前播放的歌曲，也可以进行歌曲切换，快进的操作

### 2. 什么是 MediaSession

一图胜前言，比如我们使用浏览器看直播的时候，只要有视频或音频播放，浏览器就会多出来一个按钮，点击可以查看当前正在播放的视频或音频，并且可以做一些简单的操作，暂停/播放，

![2020-04-14-21-12-44-2020414211245](https://cdn.lijinke.cn/2020-04-14-21-12-44-2020414211245.png)

### 2. 基本使用

`MediaSession` API, 挂载在 `navigator` 下面，底层原理估计很复杂，浏览器的不同线程进行通信，但是封装的很简单，要实现当前歌曲的信息展示，改变 `navigator.mediaSession.metadata` 也就是元数据即可，`metadata` 对应一个 `MediaMetadata` 的实例

```js
await document.querySelector('video').play();

if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'xxx',
    artist: 'xxxx',
    album: 'xxxx',
    artwork: [
      {
        src: 'https://dummyimage.com/96x96',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: 'https://dummyimage.com/128x128',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: 'https://dummyimage.com/192x192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://dummyimage.com/256x256',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: 'https://dummyimage.com/384x384',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: 'https://dummyimage.com/512x512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  });
}
```

上面的代码只实现了基本的歌曲信息展示，如果需要扩展额外的能力，比如上一首，下一首，需要进行相应的事件注册

```js
navigator.mediaSession.setActionHandler('previoustrack', () => {
  // Play previous track.
});

navigator.mediaSession.setActionHandler('nexttrack', () => {
  // Play next track.
});
```

浏览器提供的全部事件如下：

```js
const actionHandlers = [
  [
    'play',
    () => {
      /* ... */
    },
  ],
  [
    'pause',
    () => {
      /* ... */
    },
  ],
  [
    'previoustrack',
    () => {
      /* ... */
    },
  ],
  [
    'nexttrack',
    () => {
      /* ... */
    },
  ],
  [
    'stop',
    () => {
      /* ... */
    },
  ],
  [
    'seekbackward',
    (details) => {
      /* ... */
    },
  ],
  [
    'seekforward',
    (details) => {
      /* ... */
    },
  ],
  [
    'seekto',
    (details) => {
      /* ... */
    },
  ],
];

for (const [action, handler] of actionHandlers) {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch (error) {
    console.log(`The media session action "${action}" is not supported yet.`);
  }
}
```

除了常规的以外，还有 `seekbackward`, `seekforward` 前进几秒的这种事件，非常的灵活

![2020-04-14-21-16-32-2020414211633](https://cdn.lijinke.cn/2020-04-14-21-16-32-2020414211633.png)

这样，在点击了 `MediaSession` 中的按钮后，可以自行实现业务逻辑，就可以进行愉快的玩耍了

手机效果：

![2020-04-14-21-22-27-2020414212227](https://cdn.lijinke.cn/2020-04-14-21-22-27-2020414212227.png)

### 3. 实现原理

[可以查看这篇文章](https://juejin.im/post/5b48636ae51d45198b6c7979)

### 4. 结语

作为我这种 `API` 调参工程师来说，这篇文章没啥说的，调调参数，改一改就完事了，不过真正震撼到我的是因为看了 [browser-2020](https://github.com/luruke/browser-2020)

在 2020 年的今天，浏览器可以做的事情远远超出了我的想象，作为一个前端开发，至少应该对他们有一个基本的了解
