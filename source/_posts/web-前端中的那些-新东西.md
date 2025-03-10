---
title: web 前端中的那些"新东西"
date: 2021-06-03 16:36:15
tags: web, javascript
---

<a name="wQ457"></a>

### 背景

Web 前端发展至今，每年都有海量的新东西出来，不管是前沿的技术方向，还是各大浏览器厂商新支持的特性，又或是 ECMA 每年的新标准，内容之多，迭代速度之快，每个人并不能完全了解所有的东西，写这篇文章的动机就是我在学习的过程中，发现很多有意思的，或者从来没听说的特性，一看才发现，原来这玩意已经出来很多年了，它就静静的躺在那里，静静的等你发现，这也是标题为什么的 "新" 要加引号的原因。

我们在业务中埋头苦干的同时，也可以偶尔抬头看一看，说不定每当我们焦头烂额不知道怎么更好的实现手里的需求时，已经有很成熟，优雅的解决方案了

这篇文章就大致讲一下我觉得提有意思的点，不深入代码细节

<a name="Lgybd"></a>

### Grid 布局 Chrome: 57+

![图 0](/images/2023-12-22-8a81230383ee5a5f8fab7b5171227de431afd43143c678ff76bcddc5fcba620c.png)

<br />flex 布局已经基本普及，不管是 PC 还是 Mobile 都有很广的应用 <br />[grid 网格布局](https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid) 是一个更强大的布局语法，具体语法请查看 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid), 直接上一个案例

- 一列显示两个
- 两端对齐
- 数值和同环比默认在一行显示，同环比超过两个单独换行展示
- 上下间距 8px, 左右间距 16px

数值单独一行展示

```css
grid-column: span 2;
```

使用 flex 局部实现改需求，最大的问题就是由于是两端对齐，当是奇数个指标时，尾元素会跑到如图箭头所示的位置，使用 grid 能更优雅的实现

```css
display: grid;
grid-template-columns: repeat(2, 1fr);
grid-gap: 8px 16px;
gap: 8px 16px;
align-items: flex-end;
justify-content: space-between;
color: rgba(0, 0, 0, 0.45);
```

同时，我们希望在手机横屏的时候，能放开 `一列两个` 的限制，也就是根据手机屏幕自适应，竟可能的展示更多，我们只需要修改一行代码

```diff
- grid-template-columns: repeat(2, 1fr);
+ grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
```

```css
@supports (display: grid) {
  display: grid;
  // 最基础的 repeat 兜底
  grid-template-columns: repeat(2, 1fr);
  // 如果支持 auto-fill, 覆盖掉上一个 css, 使用 auto-fill 和 minmax, 能做到移动端竖屏一行显示两个，移动端横屏和 pc 根据容器宽度自适应
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: @cycle-compare-gap;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.45);
}

// 不支持 grid 用 column-count 兜底
@supports not (display: grid) {
  column-count: 2;
}
```

<a name="jR4NL"></a>

### Media Session Chrome: 73+

有一次，在家看斗鱼直播的时候，发现地址栏旁边有一个音乐的 icon, 点击会有一个小卡片，可以开启画中画，暂停播放等<br />

![图 1](/images/2023-12-22-6cf6df7157614b80fce4cfcbc59094d0739ffe15276f1fa6af00b2bb6147ea2e.png)

一查，好家伙，原来这是 Chorme 73 就支持的特性 [Media Session](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API), 可以实现像原生 APP 一样，在播放音乐或视频时，在地址栏有一个小卡片，很精致

![图 2](/images/2023-12-22-8aa9c0f469341883eb530526033d323b512a25720e6dc4d46640c0ebe1e1dd18.png)

<br />于是，我将这个很酷的功能，接入到我自己的 [音乐播放器](https://github.com/lijinke666/react-music-player) ([查看示例](https://www.lijinke.cn/react-music-player/))

![Kapture 2022-10-25 at 11.16.10.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1666667794688-ce5d94e4-dd74-441f-8155-f36b6581fe7b.gif)

```typescript
 updateMediaSessionMetadata = () => {
    if ('mediaSession' in navigator && this.props.showMediaSession) {
      const { name, cover, singer } = this.state
      const mediaMetaDataConfig = {
        title: name,
        artist: singer,
        album: name,
      }
      if (cover) {
        mediaMetaDataConfig.artwork = [
          '96x96',
          '128x128',
          '192x192',
          '256x256',
          '384x384',
          '512x512',
        ].map((size) => ({
          src: cover,
          sizes: size,
          type: 'image/png',
        }))
      }
      navigator.mediaSession.metadata = new MediaMetadata(mediaMetaDataConfig)
      this.updateMediaSessionPositionState()
    }
  }

  updateMediaSessionPositionState = () => {
    if ('setPositionState' in navigator.mediaSession) {
      try {
        const { audio } = this
        navigator.mediaSession.setPositionState({
          duration: this.audioDuration,
          playbackRate: audio.playbackRate || 1,
          position: audio.currentTime || 0,
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Update media session position state failed: ', error)
      }
    }
  }

  onAddMediaSession = () => {
    if ('mediaSession' in navigator && this.props.showMediaSession) {
      const defaultSkipTime = 10
      navigator.mediaSession.setActionHandler('play', this.onTogglePlay)
      navigator.mediaSession.setActionHandler('pause', this.onTogglePlay)
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || defaultSkipTime
        this.audio.currentTime = Math.max(this.audio.currentTime - skipTime, 0)
        this.props.onAudioSeeked &&
          this.props.onAudioSeeked(this.getBaseAudioInfo())
      })
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || defaultSkipTime
        this.audio.currentTime = Math.min(
          this.audio.currentTime + skipTime,
          this.audioDuration,
        )
        this.props.onAudioSeeked &&
          this.props.onAudioSeeked(this.getBaseAudioInfo())
      })
      navigator.mediaSession.setActionHandler(
        'previoustrack',
        this.onPlayPrevAudio,
      )
      navigator.mediaSession.setActionHandler('nexttrack', this.onPlayNextAudio)

      setTimeout(() => {
        this.updateMediaSessionMetadata()
      }, 0)

      try {
        navigator.mediaSession.setActionHandler('seekto', (event) => {
          if (event.fastSeek && 'fastSeek' in this.audio) {
            this.audio.fastSeek(event.seekTime)
            return
          }
          this.audio.currentTime = event.seekTime
          this.updateMediaSessionPositionState()
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          'Warning! The "seekto" media session action is not supported.',
        )
      }
    }
  }

```

![图 3](/images/2023-12-22-4844ec218bb8673da9a951c2e4f7da2bb8afccb20ff2d6095a3044f0a060d4cc.png)

<a name="kfdpw"></a>

### Visual Viewport Chrome: 61+

![图 16](/images/2023-12-22-802f4259b8158905369069daa44af111f126bce230479e4e9463c9a4907c5744.png)

这个东西又是做什么的呢？在实际业务开发中，mac 电脑的**触控板**可以使用**双指缩放**对浏览器视窗进行缩小放大<br />

![Kapture 2022-10-25 at 10.50.45.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1666666265863-4a7c2f20-0f2c-4ce7-b926-147e52c40b58.gif)

如果网页上包含 Canvas 会让其模糊，首先我们尝试了监听 window 的 resize 事件，发现无效，百般搜索，发现了 [Visual Viewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) 这个东西，可以对屏幕大小发生改变，或缩放做监听，同时还可以用做移动端的双指缩放，我们借助这个功能，[优化了 Canvas 模糊的问题](https://github.com/antvis/S2/blob/72575d884bcc72251736bf0744086d068df04b52/packages/s2-core/src/ui/hd-adapter/index.ts#L107) ([查看具体介绍](<https://yuque.antfin.com/docs/share/d3c34ad9-b7db-46ef-be60-6c4e2f4b86ff?#> 《✍ VisualViewport 实现浏览器窗口的缩放检测》))

```typescript
visualViewport?.visualViewport?.addEventListener(
  'resize',
  this.renderByZoomScale,
);

 private renderByDevicePixelRatio = (ratio = window.devicePixelRatio) => {
    const {
      container,
      options: { width, height, devicePixelRatio },
    } = this.spreadsheet;
    const canvas = this.spreadsheet.getCanvasElement();
    const lastRatio = container.get('pixelRatio');

    if (lastRatio === ratio || !canvas) {
      return;
    }

    // 缩放时，以向上取整后的缩放比为准
    // 设备像素比改变时，取当前和用户配置中最大的，保证显示效果
    const pixelRatio = Math.max(
      ratio,
      devicePixelRatio,
      MIN_DEVICE_PIXEL_RATIO,
    );

    container.set('pixelRatio', pixelRatio);
    container.changeSize(width, height);

    this.spreadsheet.render(false);
  };

  private renderByZoomScale = debounce(
    (event: Event & { target: VisualViewport }) => {
      const ratio = Math.ceil(event.target.scale);
      if (ratio >= 1) {
        this.renderByDevicePixelRatio(ratio);
      }
    },
    350,
  );
```

<a name="yEC81"></a>

### Place-Content Chrome: 59+

![图 4](/images/2023-12-22-0579b52294e29f98580f73f47e3d6499498f4a6c47a73de2bf4878e3d965119b.png)

这是一个 Chorme 59 就支持的 css 的属性，同时支持 Grid 和 Flex 布局，我是看 web.dev 的文章才知道的，惭愧。.. 它可以干什么呢？其实就是对 我们熟悉的 `align-content` 和 `justify-content` 两个属性简写。比如垂直水平居中，我们都是这样写

```css
.center {
  display: flex;
  justify-content: center;
  align-content: center;
}
```

可以简写成

```css
.center {
  display: flex;
  place-content: center;
}
```

<a name="sr5Bt"></a>

### EventListener Once Chrome: 55+

![图 5](/images/2023-12-22-2bd4f1c483c7a19e57d36ba144a82b1abeadc0fda239f1223ebdb2c582d6d521.png)

<br />众所周知，`addEventListener` 在远古时期第三个函数就从  `Boolean`值 变成了 `Object`, 原因是要支持 [更多的功能](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters)

```diff
+ addEventListener(type, listener, options)
- addEventListener(type, listener, useCapture)
```

我们监听一个事件，比如点击，通常会这样写

```javascript
button.addEventListener('click', () => {})
```

如果只想让它监听一次呢？在这前有很多奇奇怪怪的处理方式，我们可以这样改写，使用 `options.once` 优雅的实现

```javascript
button.addEventListener('click', () => {}, { once: true })
```

这样就优雅的实现了事件只触发一次，这个知道的人不知道多不多，现在都是三大框架，屏蔽了底层，估计也用不到这个东西吧。

<a name="TckbY"></a>

### AbortController Chrome: 66+

![图 6](/images/2023-12-22-25aa4b793bf79443c365f16fc10855fb00cfe4fd2cd982ba99ac68f93883537f.png)

<br />[AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController) 用于终止网络请求，Chorme 66 开始支持，在 Node.js 中也有相应实现<br />原生的 `fetch`请求有一个弊端就是无法中断，那么可以配置 `AbortController` 解决这个问题<br />使用方式类似于 axios 的 `CancelToken` , 比如想中断视频下载  ([查看示例](https://mdn.github.io/dom-examples/abort-api/))

![Kapture 2022-10-25 at 11.14.17.gif](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/6356643/1666667668759-f057dab8-749f-4983-95e1-4f3242418d00.gif)

```javascript
const controller = new AbortController();
let signal = controller.signal;

const downloadBtn = document.querySelector('.download');
const abortBtn = document.querySelector('.abort');

downloadBtn.addEventListener('click', fetchVideo);

abortBtn.addEventListener('click', function() {
  controller.abort();
  console.log('Download aborted');
});

function fetchVideo() {
  //...
  fetch(url, { signal }).then(function(response) {
    //...
  }).catch(function(e) {
    reports.textContent = 'Download error: ' + e.message;
  })
}
```

<a name="Os2X3"></a>

### PWA Chrome: 39+

![图 7](/images/2023-12-22-959affe2a9415e8e634f8375c88472efa5f136d9c3744ee0a7abda8fd1565563.png)

<br />PWA 全称  Progressive web apps,  17 年的时候特别火，谷歌主推的亲儿子，国内由于小程序以及科学上网的原因，一直半死不活，国内我印象中比较早用的是饿了么 HTML5 版本

简单来说就是把一个网页包装，让其看起来像一个原生 APP, 就和现在大家把一个网页，让其像小程序一样

:::info
PS: 个人观点，小程序就像一个万维网的对立，努力的把互联网变成局域网，个人很讨厌
:::

PWA 通过 `service worker` 将资源缓存，使其可以离线访问，支持 web push, 也可以添加到桌面，像一个 app 一样使用

![图 8](/images/2023-12-22-ccc1b808fdad95163f5608d06af6b7d22d6a25211925bbe1f37d270b4697a33b.png)

<br />

![图 9](/images/2023-12-22-45b6b4c6b63253637e9c8c94bbd1ac0ff91fdf5cf2d64c556302896dbb20a1c9.png)

```json
{
  "short_name": "李金珂的小屋",
  "name": "李金珂的小屋",
  "description": "李金珂的小屋，李金珂的个人网站，博客",
  "lang": "cn",
  "icons": [
    { "src": "/logos/logo_48.png", "type": "image/png", "sizes": "48x48" },
    { "src": "/logos/logo_96.png", "type": "image/png", "sizes": "96x96" },
    { "src": "/logos/logo_192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "/logos/logo_512.png", "type": "image/png", "sizes": "512x512" }
  ],
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#fff",
  "theme_color": "#fff"
}

```

```javascript
//通过 serviceWorker.register 注册了这个 js
/**
 * 全局变量
 * self: 表示 Service Worker 作用域，也是全局变量
    caches: 表示缓存
    skipWaiting: 表示强制当前处在 waiting 状态的脚本进入 activate 状态
    clients: 表示 Service Worker 接管的页面
    https://fed.renren.com/2017/10/08/service-worker-notification/
 */

//缓存的 key
const cacheKey = 'v8.6.2';
const cacheWhitelist = [];

//需要缓存的列表
const cacheList = [
  '/',
  '/js/jquery.js',
  '/js/jquery.appear.js',
  '/js/jquery-migrate-1.2.1.min.js',
  '/images/favicon.png',
  '/images/logo.png',
  '/images/logo@2x.png',
  '/images/my.jpeg',
  '/fonts/fontawesome-webfont.eot',
  '/fonts/fontawesome-webfont.svg',
  '/fonts/fontawesome-webfont.ttf',
  '/fonts/fontawesome-webfont.woff',
  '/css/blog_basic.css',
  '/css/font-awesome.min.css',
  '/css/style.css',
  '/css/style.scss',
  '/logos/logo_48.png',
  '/logos/logo_96.png',
  '/logos/logo_192.png',
  '/logos/logo_512.png',
  '/about/',
  '/archives/',
  '/links/',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(cacheKey) //将缓存写入在这个 key 中
      .then((cache) => cache.addAll(cacheList)),
    // .then(() => self.skipWaiting()) //停止等待 页面更新时  立即激活生效 service worker 脚本
  );
});

//网页赚取资源 service worker 可以捕获到 fetch 事件
self.addEventListener('fetch', (e) => {
  e.respondWith(
    //有请求来 先去缓存里找之前请求过没
    caches.match(e.request).then((res) => {
      if (res != null) return res; //如果请求过 直接返回结果
      return fetch(e.request); //否则 继续请求
    }),
  );
});

//更新静态资源
self.addEventListener('activate', function (e) {
  e.waitUntil(
    Promise.all(
      caches.keys().then((cacheNames) => {
        return cacheNames.map((name) => {
          if (cacheWhitelist.indexOf(name) === -1) {
            return caches.delete(name);
          }
        });
      }),
    ).then(() => {
      return self.clients.claim(); //取得 页面控制权 页面会使用新更新的缓存
    }),
  );
});

//接收推送消息
self.addEventListener('push', function (event) {
  const notificationData = event.data.json();
  const title = notificationData.title;
  // 弹消息框
  event.waitUntil(self.registration.showNotification(title, notificationData));
});

//推送消息点击
self.addEventListener('notificationclick', function (event) {
  let notification = event.notification;
  notification.close();
  event.waitUntil(clients.openWindow(notification.data.url));
});

self.addEventListener('error', (event) => {
  // 上报错误信息
  // 常用的属性：
  // event.message
  // event.filename
  // event.lineno
  // event.colno
  // event.error.stack
  console.log('error:', event);
});
self.addEventListener('unhandledrejection', (event) => {
  // 上报错误信息
  // 常用的属性：
  // event.reason
  console.log('unhandledrejection', event);
});

```

<a name="vvWRP"></a>

### Web Component Chrome: 90+

浏览器可以识别自定义标签，比如 `<ljk></ljk>` , 没有任何默认样式和状态<br />

![图 10](/images/2023-12-22-01a67de3ce5922b03e057d4465ed106cd4ac4a771a7e80b39bd31fd609524dd3.png)

同时，默认提供了 `<button/>` `<input/>` 等内置组件，`Web Component`就可以让我自定义代码，封装出类似的组件，使其可以在网页中复用，有两个很重要的关键点

- Shadow DOM
- HTML template

如图，我们有一个 `<input type="range"/>` 控件，审查元素，我们发现只有一个光秃秃的 `input` 标签，别无其他，那其 `range`的 ui 在哪里呢？<br />

![图 11](/images/2023-12-22-86bb0adcdd4437fe159c4f26e01b4014732f4ecbeefe596ce5a260921ad3249b.png)

我们打开 `Preferences` 的 `Show user agent shadow DOM`

<br />

![图 12](/images/2023-12-22-b3d77f22cbec986e1d1bb1ceed5e4b616e17790c862f9911f0763ab497d556be.png)

<br />

![图 13](/images/2023-12-22-4248bd4148c9e27947e712a004b1185abbaa01c7643f302a5308426ca5ccfcf1.png)

综上所述，`<input type ="range"/>` 就是一个内置的 `Web Component`, 其对应的 UI, 藏在了 `shadow-root` 中

具体怎么自定义，请查看 [官方例子](https://github.com/mdn/web-components-examples/blob/main/edit-word/main.js)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>edit-word demo</title>
    <script src="test.js" defer></script>
  </head>
  <body>
    <template id="person-template">
      <div>
        <h2>Personal ID Card</h2>
        <slot name="person-name">NAME MISSING</slot>
        <ul>
          <li><slot name="person-age">AGE MISSING</slot></li>
          <li><slot name="person-occupation">OCCUPATION MISSING</slot></li>
        </ul>
      </div>
    </template>

    <person-details>
      <p slot="person-name"><edit-word>Morgan</edit-word> Stanley</p>
      <span slot="person-age">36</span>
      <span slot="person-occupation">Accountant</span>
    </person-details>

    <p>My name is <edit-word>Chris</edit-word>, the man said.</p>
  </body>
</html>

```

```javascript
customElements.define(
  'person-details',
  class extends HTMLElement {
    constructor() {
      super();

      const template = document.getElementById('person-template');
      const templateContent = template.content;

      const shadowRoot = this.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = `
        div { padding: 10px; border: 1px solid gray; width: 200px; margin: 10px; }
        h2 { margin: 0 0 10px; }
        ul { margin: 0; }
        p { margin: 10px 0; }
      `;

      shadowRoot.appendChild(style);
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }
  },
);

customElements.define(
  'edit-word',
  class extends HTMLElement {
    constructor() {
      super();

      const shadowRoot = this.attachShadow({ mode: 'open' });
      const form = document.createElement('form');
      const input = document.createElement('input');
      const span = document.createElement('span');

      const style = document.createElement('style');
      style.textContent = 'span { background-color: #eef; padding: 0 2px }';

      shadowRoot.appendChild(style);
      shadowRoot.appendChild(form);
      shadowRoot.appendChild(span);

      span.textContent = this.textContent;
      input.value = this.textContent;

      form.appendChild(input);
      form.style.display = 'none';
      span.style.display = 'inline-block';
      input.style.width = span.clientWidth + 'px';

      this.setAttribute('tabindex', '0');
      input.setAttribute('required', 'required');
      this.style.display = 'inline-block';

      this.addEventListener('click', () => {
        span.style.display = 'none';
        form.style.display = 'inline-block';
        input.focus();
        input.setSelectionRange(0, input.value.length);
      });

      form.addEventListener('submit', (e) => {
        updateDisplay();
        e.preventDefault();
      });

      input.addEventListener('blur', updateDisplay);

      function updateDisplay() {
        span.style.display = 'inline-block';
        form.style.display = 'none';
        span.textContent = input.value;
        input.style.width = span.clientWidth + 'px';
      }
    }
  },
);

```

<a name="raGGc"></a>

### HTML

忘记在哪里看到的段子

:::info
Q: 请问有什么同时支持 Angular, React, Vue 的 UI 组件库吗？<br />A:  HTML
:::

文章的最后，想以 `HTML` 这个 "新" 东西结尾，想必大家学习前端，都是从 `HTML` 超文本标记语言这个 `简单`的东西入门，前端发展至今，HTML 也变化了很多，丰富的控件能力，丰富的特性

<br />

![图 14](/images/2023-12-22-1f3c50f2656e3c24a3b0645d347749987a4537038587d7be2cdfe52fcae57da5.png)

<br />

![图 15](/images/2023-12-22-076732b6ce694b1d0fd89126abc22987955c4747266773beb2f3baf7354fb4e4.png)

<br />光是 `input`就有这么多种

<a name="bShcy"></a>

### 推荐网站

[MDN](https://developer.mozilla.org/en-US/): 不多说，web 百科全书<br />[web.dev](https://web.dev/): Google 官网的 web 学习网站，干货很多<br />[张鑫旭博客](https://www.zhangxinxu.com/wordpress/): 不局限与 CSS , 虽然文风很尬，干货很多
