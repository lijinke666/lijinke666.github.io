---
title: VisualViewport 实现浏览器窗口的缩放检测
date: 2021-03-31 17:46:57
tags: JavaScript
---

<a name="oBKDo"></a>

### 📣 背景

最近在工作中，遇到了用户如果缩放浏览器窗口，或者使用 mac 笔记本的触摸板缩放浏览器窗口时，canvas 会模糊的问题，<br />原因很简单，缩放之后，浏览器的 `window.devicePixelRatio`  已经发生改变，所以要用最新的 `devicePixelRatio` 去绘制<br />

<a name="qLBPC"></a>

### window.resize 为什么不行？

对于用户使用键盘，比如 commond + `+`  和 common + `-`  缩放时，事情很好办，使用 `resize`  事件即可<br />

```html
<body>
  <h1>VisualViewport 测试</h1>
</body>
<script>
  window.addEventListener('resize', () => {
    console.log('resize', window.devicePixelRatio);
  });
</script>
```

<a name="wSVPf"></a>

### ![2021-03-31 16.42.38.gif](https://intranetproxy.alipay.com/skylark/lark/0/2021/gif/6356643/1617180188251-3a1ff4b2-ef2d-40a7-97d6-1192c00ad273.gif#align=left&display=inline&height=841&margin=%5Bobject%20Object%5D&name=2021-03-31%2016.42.38.gif&originHeight=841&originWidth=1503&size=218757&status=done&style=none&width=1503)

<a name="ZMVRQ"></a>

###

那么如果换成 mac 的触摸板双指缩放呢？<br />![2021-03-31 16.44.01.gif](https://intranetproxy.alipay.com/skylark/lark/0/2021/gif/6356643/1617180273355-63d6bb9a-4189-4723-9c29-2dc551fa75c0.gif#align=left&display=inline&height=797&margin=%5Bobject%20Object%5D&name=2021-03-31%2016.44.01.gif&originHeight=797&originWidth=1558&size=590749&status=done&style=none&width=1558)<br />尴尬了，window.resize 表示：大哥，超纲了？从图中可以看出来，事件没有相应<br />

<a name="3b8yc"></a>

### 给力的 VisualViewport

<br />面向 Google 编程了一段时间，总算找到了 浏览器的一个实验性功能，根据 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/VisualViewport) 的描述：

> [Visual Viewport API](https://wiki.developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API) 提供了当前页面的视觉视口接口，即 **`VisualViewport`** 。对于每个页面容器来说（如 iframe），都存在有一个独立的 window 对象。每个页面容器的 window 对象都有一个独立的 `VisualViewport` 属性。你可以使用 [`Window.visualViewport`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/visualViewport) 获得对应 window 的视觉视口 API。

<br />看起来似乎 mac 的触控板缩放也是一种视觉改变，现在来试试，根据文档，它有两个接口<br /> <br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2021/png/6356643/1617180526375-aa649979-4dc2-4cdf-aade-d8c4773f6f66.png#align=left&display=inline&height=224&margin=%5Bobject%20Object%5D&name=image.png&originHeight=447&originWidth=967&size=114385&status=done&style=none&width=483.5)<br />`resize`  似乎可以满足我们的需求，编写一点简单的代码，测试一下<br />

```html
<body>
  <h1>VisualViewport 测试</h1>
</body>
<script>
  window.visualViewport.addEventListener('resize', (e) => {
    console.log(e.target.scale, window.devicePixelRatio);
  });
</script>
```

<br />首先还是使用键盘进行缩放，发现能正常响应，但是 `e.target.scale`  始终是 1![2021-03-31 16.50.49.gif](https://intranetproxy.alipay.com/skylark/lark/0/2021/gif/6356643/1617180741356-7eca7701-4cc7-418a-9938-6fd1c13d8a6d.gif#align=left&display=inline&height=787&margin=%5Bobject%20Object%5D&name=2021-03-31%2016.50.49.gif&originHeight=787&originWidth=1306&size=123497&status=done&style=none&width=1306)<br />

<a name="eVXcl"></a>

###

接下来使用 mac 触摸板进行双指缩放，效果如下：<br />![2021-03-31 16.53.17.gif](https://intranetproxy.alipay.com/skylark/lark/0/2021/gif/6356643/1617180832659-4a93211d-2825-4b22-9b38-ca0650d018b4.gif#align=left&display=inline&height=733&margin=%5Bobject%20Object%5D&name=2021-03-31%2016.53.17.gif&originHeight=733&originWidth=1358&size=1414985&status=done&style=none&width=1358) <a name="X8PLG"></a>

###

可以看到 `e.target.scale`  随着双指的缩放在改变，`window.devicePixelRatio`  始终是 1, 看起来的效果就像，使用了 css3 的 `transform: scale`  一样，元素的实际大小没变。<br /> <br />经过测试，可以看出，双指缩放 可以使用 `e.target.scale`  获取缩放比，键盘缩放，可以使用 `window.devicePixelRatio` , 使用 `Math.max`  取最大字就可以兼容两种情况

```javascript
window.visualViewport.addEventListener('resize', (e) => {
  const scale = Math.max(e.target.scale, window.devicePixelRatio);
  console.log('scale: ', scale);
});
```

<a name="yH78b"></a>

###

<a name="w1DUP"></a>

### 兼容性

还是有点恐怖，任重而道远！<br />

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2021/png/6356643/1617181128552-3a077056-2ce2-4ce5-b3d2-f0fcf6c4c88a.png#align=left&display=inline&height=175&margin=%5Bobject%20Object%5D&name=image.png&originHeight=349&originWidth=1514&size=332503&status=done&style=none&width=757) <a name="4NNr6"></a>

### 🔭 总结

这种冷门的 API （仅对我而言）, 看似没啥用，有时却能解决大问题，看来平时还是要多积累知识才行，多看看 web.dev, 涨涨知识！
