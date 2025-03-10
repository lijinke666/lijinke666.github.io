---
title: ' 蛋疼的 MANIFEST 缓存与 PWA'
date: 2018-05-18 22:59:45
tags: pwa
---

### 1. 前言

---

这周有空 优化了下网站，

- 主要解决了 `webpack` 打包压缩 无效问题，
- 升级 `react-jinke-music-player` 的版本 优化了体验
- 解决了缓存问题，本文记录下这让人蛋疼的缓存

### 2. MANIFEST 离线缓存

---

不晓得是不是脑壳打铁，网站上线到上周，我一直用的是这个 `MANIFEST` 离线缓存，听起来很酷炫

```
应用程序缓存为应用带来三个优势：

- 离线浏览 - 用户可在应用离线时使用它们
- 速度 - 已缓存资源加载得更快
- 减少服务器负载 - 浏览器将只从服务器下载更新过或更改过的资源。
```

其实一言难尽

首先新建一个 `xx.appcache` 的文件，比如像这样

```
CACHE MANIFEST
/theme.css
/logo.gif
/main.js
```

由于 webpack 打包 加上了 hash 值 我不可能写死，所以自己又写了一个小工具去动态生成这个文件 [地址](https://github.com/lijinke666/add-static-cache-webpack-plugin)

首先 新建一个 模板 `cacheTemp.tpl` , 本来还想缓存 音乐文件的，但是大小有限制，就缓存了一些静态文件

```
CACHE MANIFEST
# {comments}
# {date}
{cssPath}
{fontsPath}
{imagesPath}

NETWORK:
*
```

```js
//webpack.config.js
const AddStaticCachePlugin = require('add-static-cache-webpack-plugin')
...
plugins:{
    new AddStaticCachePlugin({
      template:path.resolve(__dirname,'cacheTemp.tpl'),
      cacheName:"lijinkeWeb.appcache",            //缓存文件名
      comments:"lijinkeWeb appCache by add-static-cache-webpack-plugin",       //注释
      publicPath:"/"                 //公共路径
  })
}
```

然后打包出来 差不多长这样

```
CACHE MANIFEST
# lijinkeWeb appCache by add-static-cache-webpack-plugin
# 2018/5/18 14:50:16
/css/app.83131b52.css

/fonts/iconfont500b2aa8.woff
/fonts/iconfont66829b84.ttf
/fonts/iconfont44844993.eot
/fonts/iconfont07341295.svg
/fonts/iconfonteb5d3623.svg
/fonts/iconfontbf0fc2ec.woff
/fonts/iconfont9ac2cc5a.ttf
/fonts/iconfonte83ffaa9.eot

/images/banner1942579a6.jpg
/images/abouta8bf09c1.jpg
/images/defaultc08c2bfe.jpeg
/images/photo1cf8fcd45.jpg
/images/photo14604a79ea.jpg
/images/alipay6d19f782.jpg
/images/cjmle2ee6fcf.png
/images/githubf498d407.png
/images/github_sedd18534.jpg
/images/head_img6f56905f.jpg
/images/head_img_s09e1d321.jpg
/images/photo11ed311c75.jpg
/images/photo11_sf1e4408a.jpg
/images/photo125273802b.jpg
/images/photo12_sd897ee4f.jpg
/images/photo13395c0a40.jpg
/images/photo13_s252b60c3.jpg
/images/photo14_se2a642b2.jpg
/images/photo159a29915b.jpg
/images/photo15_sb7fd6059.jpg
/images/photo17e9ac3071.jpg
/images/photo17_s40a6a22e.jpg
/images/photo188a6f8ea0.jpg
/images/photo18_s60cc2f73.jpg
/images/photo19189bbdb0.jpg
/images/photo19_s07ae2e68.jpg
/images/photo206d677fc1.jpg
/images/photo20_sb599e88e.jpg
/images/photo217c236744.jpg
/images/photo21_s83e780e4.jpg
/images/photo22cbef4c48.png
/images/photo22_s5f1f372d.jpg
/images/photo3ef6edcc5.jpg
/images/photo43b47208f.jpg
/images/photo54f4b8ab5.jpg
/images/photo614dd11d3.jpg
/images/photo77f33a9a7.jpg
/images/photo897809533.jpg
/images/weChatPayf7628413.png

NETWORK:
*
```

然后在 index.html 里面引入

```
<!DOCTYPE HTML>
<html manifest="lijinkeWeb.appcache">

<body>
</body>

</html>
```

然并卵啊！!! , 首先 网站是 `SPA` 单页应用，所谓的离线可访问 根本不现实，文章页网络请求显示数据，每次更新 缓存时 , 还会阻塞 页面加载，有时候网站还访问不了，要等它更新缓存完成之后 手动刷新才行，十分的蛋疼，目前的标准这个 api 已经被废弃。真实日了狗了。..

### 3. PWA

行嘛，这个不行嘛 我换一种嘛 , 用一种潮流的 `PWA` 渐进式 webApp 总行了噻，又是一番折腾，跟着网上的教程 撸了一遍

```js
/**
 * 全局变量
 * self: 表示 Service Worker 作用域，也是全局变量
    caches: 表示缓存
    skipWaiting: 表示强制当前处在 waiting 状态的脚本进入 activate 状态
    clients: 表示 Service Worker 接管的页面
    https://fed.renren.com/2017/10/08/service-worker-notification/
 */

//缓存的 key
const cacheKey = 'testKey2';

//需要缓存的列表
const cacheList = ['/', 'index.html', 'index.css', 'fetch.json', 'demo.jpg'];

//注册 安装 service worker 时  抓取资源 写入缓存
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(cacheKey) //将缓存写入在这个 key 中
      .then((cache) => cache.addAll(cacheList))
      .then(() => self.skipWaiting()), //停止等待 页面更新时  立即激活生效 service worker 脚本
  );
});

//网页赚取资源 service worker 可以捕获到 fetch 事件
self.addEventListener('fetch', (e) => {
  console.log(e);
  e.respondWith(
    //有请求来 先去缓存里找之前请求过没
    caches.match(e.request).then((res) => {
      console.log(res);
      if (res != null) return res; //如果请求过 直接返回结果
      return fetch(e.request.url); //否则 继续请求
    }),
  );
});

//更新静态资源
self.addEventListener('activate', function (e) {
  e.waitUntil(
    Promise.all(
      caches.keys().then((cacheNames) => {
        console.log(cacheNames);
        return cacheNames.map((name) => {
          if (name !== cacheStorageKey) {
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
```

我想的有点多，想做一个 客户端的文章推送订阅，然后把静态资源 通过 `server worker` 缓存起来，结果要 HTTPS 才行，兼容性也比较差，就当学习了新知识

### 4. manifest.json

虽然 server worker 没用起，但是我给网站加上了 一个 简单炫酷的玩意，也是 `PWA` 的一部分 , 这是一个描述文件 在 pc 或者 手机时 可以在设置选择 `保存到桌面` 然后就可以得到 原生 app 一样的体验 , 肥肠酷 ! 是不是很像 `electron` 打包出来的桌面应用呢？

```
//manifest.json
{
    "short_name": "李金珂的小屋",
    "name": "李金珂的个人网站",
    "icons": [
      {
        "src": "/logos/logo_48.png",
        "type": "image/png",
        "sizes": "48x48"
      },
      {
        "src": "/logos/logo_96.png",
        "type": "image/png",
        "sizes": "96x96"
      },
      {
        "src": "/logos/logo_192.png",
        "type": "image/png",
        "sizes": "192x192"
      },
      {
        "src": "/logos/logo_512.png",
        "type": "image/png",
        "sizes": "512x512"
      }
    ],
    "start_url": "/",
    "display": "standalone",
    "background_color": "#31c27c",
    "theme_color": "#fff"
  }
```

导入

```
  <link rel="manifest" href="manifest.json" crossorigin="use-credentials">
```

效果 <br/> <img src="https://lijinke666.github.io/lijinkeWeb-static/images/20180518151830.png" style="max-width:100%"/> <br/> <br/> <img src="https://lijinke666.github.io/lijinkeWeb-static/images/20180518151903.png" style="max-width:100%"/> <br/>

### 5. 弄些花里胡哨的东西，还是没缓存

---

感觉 买了本 `图解 HTTP` 来读 . 了解到 `Cache-Control` `max-age` 字段，这是个 `HTTP/1.1` 的东东，用来控制缓存的生命周期，也就是有效期，第一次请求不会缓存，第二次 `Status Code:200 OK (from disk cache)` 可以看到已经将内容缓存在磁盘中。到有效期到了后 浏览器 会再发一次请求 如果服务器告诉它没变化 就会返回 `304` 的状态码。表示没有修改。

### 6. 结语

---

多捞啊！头皮发麻 这种简单的东西我都要搞这么久 其实归根结底还是要多看看基础知识的书！不说了。工头叫我搬砖了
