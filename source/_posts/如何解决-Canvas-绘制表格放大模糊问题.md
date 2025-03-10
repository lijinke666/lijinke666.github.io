---
title: 如何解决 Canvas 绘制表格放大模糊问题
date: 2023-08-09 14:01:01
tags: Canvas
---

S2 基于 `Canvas` 开发，在实际的业务场景开发中，我们发现有 2 种使用场景会导致 **表格渲染模糊**

1. 不同 `DPR` 的设备之间来回切换：比如一台 Mac （视网膜屏）, 外接一台显示器 （普通 2k 屏）, 将浏览器移到外接设备查看
2. 使用 `Mac` 触控板对页面进行缩放：双指缩放，来放大显示，而不是传统的 `cmd` + `+`, `cmd` + `-` 缩放浏览器窗口大小

默认开启高清适配，可以手动关闭

```typescript
const s2Options = {
  hdAdapter: false
}
```

首先看一下开启前后的对比图

关闭高清适配

![](https://gw.alipayobjects.com/zos/antfincdn/mc5rt%24aNB/128c0063-67a5-4d06-a5a5-fe5f341fa94e.png#height=329&id=yVgpa&originHeight=1162&originWidth=2116&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=&width=600)

开启高清适配

![](https://gw.alipayobjects.com/zos/antfincdn/TtuUHO%26Pb/d32dc287-af59-4b1c-ba7d-17dacd4ffa24.png#height=322&id=OsMmc&originHeight=1130&originWidth=2104&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=&width=600)

<a name="18cf7b9c"></a>

## 不同 DPR 设备间切换

对于这种场景，我们使用 [matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) 来监听 DPR 的变化，更新 canvas 的尺寸，从而达到高清的效果

```typescript
const { width, height } = s2Options
const devicePixelRatioMedia = window.matchMedia(
  `(resolution: ${window.devicePixelRatio}dppx)`,
);

devicePixelRatioMedia.addEventListener('change', renderByDevicePixelRatio)

const renderByDevicePixelRatio = (ratio = window.devicePixelRatio) => {
  const newWidth = Math.floor(width * ratio);
  const newHeight = Math.floor(height * ratio);

  // 内部的更新容器大小方法
  changeSheetSize(newWidth, newHeight);
};
```

<a name="2916bf62"></a>

## Mac 触控板双指缩放

区别于浏览器的放大缩小，普通的 `resize` 事件是无法触发的<br />![](https://gw.alipayobjects.com/zos/antfincdn/gBRpqwZkj/a14f1e5a-540e-4bb8-a6a4-2ff693542296.png#id=LVag0&originHeight=78&originWidth=448&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

```typescript
// 触摸板双指缩放 无法触发
window.addEventListener('resize', ...)
```

普通浏览器窗口放大缩小

![](https://gw.alipayobjects.com/zos/antfincdn/%24vCHFUDnZ/Kapture%2525202021-10-19%252520at%25252014.24.19.gif#id=wrHSn&originHeight=706&originWidth=2026&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

触控板双指缩放

![](https://gw.alipayobjects.com/zos/antfincdn/ZDSjxFBGd/Kapture%2525202021-10-19%252520at%25252014.27.00.gif#id=vfY9G&originHeight=706&originWidth=2026&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

那么如果解决呢？答案就是 使用 [VisualViewport API](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport), `VisualViewport` 可以被用做移动端的双指缩放监听，同样适用于 `mac 触摸板`

```typescript
window.viewport?.visualViewport?.addEventListener(
  'resize',
  this.renderByZoomScale,
);

const renderByZoomScale = debounce((e) => {
  // 拿到缩放比 更新容器大小
  const ratio = Math.max(e.target.scale, window.devicePixelRatio);
  if (ratio > 1) {
    const { width, height } = s2Options
    const newWidth = Math.floor(width * ratio);
    const newHeight = Math.floor(height * ratio);

    // 内部的更新容器大小方法
    changeSheetSize(newWidth, newHeight);
  }
}, 350);
```

关闭高清适配

![](https://gw.alipayobjects.com/zos/antfincdn/vHvA02Vj0/Kapture%2525202021-10-19%252520at%25252014.38.53.gif#id=tZqag&originHeight=444&originWidth=892&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

开启高清适配

![](https://gw.alipayobjects.com/zos/antfincdn/Q1782WWQ3/Kapture%2525202021-10-19%252520at%25252014.36.05.gif#id=TXnwv&originHeight=646&originWidth=938&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

[完整代码](https://github.com/antvis/S2/blob/master/packages/s2-core/src/ui/hd-adapter/index.ts)
<a name="b228fd8e"></a>

## 自定义设备像素比

表格默认使用设备当前像素比渲染，也就是 `window.devicePixelRatio`, 如果你觉得初始渲染就很模糊，可以手动指定表格按照 2 倍设备像素比来渲染

```typescript
const s2Options = {
  devicePixelRatio: 2
}
```
