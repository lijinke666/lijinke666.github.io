---
title: 用 SVG 画一个字
date: 2019-03-04 22:55:32
tags: svg
---

#### 1. 前言

---

前端实现动画 即使很炫的那种，说白了 各种 @keyframe a b c d 组合加上自己的创意，也不是很难，直到有一天看到一个 像蚯蚓一样 描边的 动画，感觉挺不错，后来发现是 svg 做的，于是学习了下 svg 的基础知识，搞了了一个显示自己名字的动画

#### 2. svg 在本文中需要的基础知识

---

##### 2.1 什么是 svg

<blockquote>
    引用 w3c
</blockquote>

- SVG 指可伸缩矢量图形 (Scalable Vector Graphics)
- SVG 用来定义用于网络的基于矢量的图形
- SVG 使用 XML 格式定义图形
- SVG 图像在放大或改变尺寸的情况下其图形质量不会有所损失
- SVG 是万维网联盟的标准
- SVG 与诸如 DOM 和 XSL 之类的 W3C 标准是一个整体

##### 2.2 路径 <path>

svg 中 定义 一个路径 , 相当于 用挖掘机修一条路，之后我们就可以沿着这条路走完全程，描边动画也就是沿着这个路径进行

```js
//大概长这样
<path d="
    M153 334
    C153 334 151 334 151 334"
    style="fill:white;stroke:red;stroke-width:2"/>
/>

```

`d` 用来描述路径，`style` 就是 定义路径的样式，不过和普通的 html 标签有微微的区别，我当时是这样来转换的，一下就明白了

- fill => background-color
- stroke => border-color
- stroke-width => border-width

我们看到 `d` 中 有很多 大写字母 `M` `C`, 是什么意思呢？大写字母代表 绝对定位，小写字母代表 相对定位

```
M = moveto 移动到
L = lineto 连接一根线到
H = horizontal lineto  水平连线
V = vertical lineto    垂直连线
C = curveto
S = smooth curveto
Q = quadratic Belzier curve
T = smooth quadratic Belzier curveto
A = elliptical Arc     椭圆的线 贝塞尔曲线
Z = closepath          结束当前路径
```

标注的 是我们 需要用到的，了解了这些 我们可以 写字了

#### 3. 开始写李金珂三个字

##### 3.1 定义样式

---

首先我们开始定义一个 svg 和 path 标签

```
<body>
<svg>
    <path></path>
</svg>
</body>
```

定义样式

```
    svg,
    body,
    html {
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }

    svg {
      background: #ccc;
    }
```

将 svg 设为全屏，背景色为灰色，分别设置三个字的颜色

```
    path {
      stroke-width: 3px;
      stroke-linecap: round;           //以圆滑的方式连接两条线
      fill: none;                      //不填充
    }

    path:nth-child(1) {
      stroke: #396;
    }

    path:nth-child(2) {
      stroke: gold;
    }

    path:nth-child(3) {
      stroke: #06a;
    }
```

##### 3.2 开始绘制坐标，写 （李） 字

由于要写三个字，为了外边，我们全用大写字母指令（绝对定位）, 运用刚才了解的知识，将起始点 在 x 50 y 50 下笔 然后 在 x120,y50 连接一根线就可以看到 李 字 的 "一" 就出来了

```
    <path d="M50 50 "/>
```

接下来我们来一点艺术范，写带点幅度的 "木" 字头首先用 A 在 "一" 上分 换一个 弧线 <A 半径 x, 半径 y,0, 大弧，终点 x 坐标，终点 y 坐标> 之后 用 "L" 写两撇

```
    <path d="M50 50
              L120 50
              A15 2 0 1 0 110 30
              L105 100
              v -50
              L 70 85
              L141 70
              L104 120"/>
```

效果如下，有一点点抽象派，需要有一点点艺术品位才能欣赏的来

<br/>
<img src="https://lijinke666.github.io/Book/src/images/20171212174632.png" style="max-width:100%"/>
<br/>

刚开始有点生疏，不过之后找到了感觉，慢慢罗位子，终于一个李字 写了出来

```
    <path d="M50 50
              L120 50
              A15 2 0 1 0 110 30
              L105 100
              v -50
              L 70 85
              L141 70
              L104 120
              v 100
              A 1 2 0 0 1 69 204
              L31 167
              L196 127"/>
```

<br/>
<img src="https://lijinke666.github.io/Book/src/images/20171212175204.png" style="max-width:100%"/>
<br/>

果然字如其人，骚的一批，

##### 3.3 写完剩下 两个字

之后就是依葫芦画瓢，写下其余的两个字，代码如下

```
  <svg>
    <path d="M50 50
              L120 50
              A15 2 0 1 0 110 30
              L105 100
              v -50
              L 70 85
              L141 70
              L104 120
              v 100
              A 1 2 0 0 1 69 204
              L31 167
              L196 127"/>
    <path d="M500 50
        L 410 136
        M457 89
        L 610 136
        M 445 155
        h 70
        M 445 175
        h 70
        M 475 155
        v 90
        M 457 232
        L 428 213
        M 520 232
        L 538 213
        M 405 245
        h 140"/>
    <path d="M780 50
        h 90
        h -45
        v 70
        h -50
        h 100
        h -50
        v 80
        L 740 233
        L 932 157
        A 4 3 0 0 1 1036 96
        L 980 130
        v 30
        h 30
        v -25
        h -30
        h 30
        v 150
        L 945 222"/>
</svg>
```

效果如下

<br/>
<img src="https://lijinke666.github.io/Book/src/images/20171212175530.png" style="max-width:100%"/>
<br/>

#### 4. 添加动画

其实 实现描边动画 就两个关键属性

```
stroke-dasharray：定义描边的虚线长度，如果提供奇数个，则会自动复制该值成偶数
stroke-dashoffset：定义虚线描边的偏移量（在路径开始的前面，看不到）
```

将这两个 值 设置为一样的值，且相对大一点，这时你会发现刚才辛辛苦苦写的字看不见了

```
stroke-dashoffset: 2000;
stroke-dasharray: 2000;
```

将值改为 0 就出来了，所以只需要一个动画 将 值 缓慢的 改为 0 就行了

```
    path {
      stroke-width: 3px;
      stroke-linecap: round;
      fill: none;
      stroke-dashoffset: 2000;
      stroke-dasharray: 2000;
       animation: path 10s linear forwards;
    }
    @keyframes path {
      to {
        stroke-dashoffset: 0;
      }
    }
```

刷新一下，大功告成

#### 结语

其实有很多工具 可以在线生成 这种 svg, 但是还是那句话，知其所以然自己去折腾一下，会发现很多乐趣
