//通过 serviceWorker.register 注册了这个js
/**
 * 全局变量
 * self: 表示 Service Worker 作用域, 也是全局变量
    caches: 表示缓存
    skipWaiting: 表示强制当前处在 waiting 状态的脚本进入 activate 状态
    clients: 表示 Service Worker 接管的页面
    https://fed.renren.com/2017/10/08/service-worker-notification/
 */

//缓存的key
const cacheKey = 'v8.6.3';
const cacheWhitelist = [];

//需要缓存的列表
// TODO: 写一个脚本批量生成
const cacheList = [
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
      .open(cacheKey) //将缓存写入在这个key中
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
