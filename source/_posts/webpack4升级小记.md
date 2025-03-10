---
title: ' webpack4 升级小记'
date: 2018-05-18 23:00:27
tags: webpack
---

### 1. 前言

---

一转眼 `webpack` 版本已经发布到 `4.5.0`，上一次 在家折腾 `webpack1 => webpack2` 的痛苦日子，仿佛就在昨天，webpack 就仿佛是一个 熊孩子，让人又爱又恨，这周末折腾到半夜，终于把项目升级到 webpack4,babel7,react-router4, 那种 bash 一片红的酸爽，只有折腾过的人才明白，本文记录下我的爬坑之路

### 2. webpack4 升级

---

> webpack3 => webpack4.5.0 新版本 废除了一些插件，新增了一些属性和默认配置项

#### 2.1 devServer

```js
module.exports = (env) => {
    //env 是 npm script 运行 webpack 时传进来的  判断是否是开发环境
    const mode = (env && env.mode) || "development"
    const isDev = mode === "development"

    const options = {
        mode: mode,
        target: "web",

        //开发服务器
        devServer: {
            //静态资源根目录
            contentBase: [
                path.resolve(__dirname, "dist"),
                path.resolve(__dirname,"rest-mock")
            ],
            port: dev_port,           //端口
            hot: true,            //热更新
            inline: true,         //iframe 模式
            historyApiFallback: true,    //浏览器 history
            stats: {              //统计
                colors: true,      //输出有颜色的信息
                errors: true,     //显示错误信息
                version: true,    //显示版本号
                warnings: true,   //显示警告
                progress: true,   //显示进度，
                timings: true,     //显示时间
            },
            open:true,            //打开浏览器 替代 open-plugin 插件
            openPage:""
        },
    }
```

之前一直使用的 `open-browser-plugin` 在打包后 自动打开浏览器，新版 更改了 插件的注册机制 所有暂时用不起，所以使用 `{open:true}` 代替

新版增加了 `mode` 字段 默认情况如下

mode === "development"

- 使用 eval 构建 模块
- webpack.DefinePlugin 自动定义 NODE_ENV

mode === "production"

- noEmitOnErrors 错误不打断
- concatenateModules 减少包裹
- webpack.DefinePlugin 自动定义 NODE_ENV

#### 2.2 plugins

以前的 `CommonsChunkPlugin` 改成如下 的`optimization` 属性配置

```js
optimization: {
   splitChunks: {
     chunks: 'all',
     name: 'common',
   },
   runtimeChunk: {
     name: 'runtime',
   }
 }
```

js 和 css 压缩 移动至 `optimization.minimizer` 属性

```js
      optimization: {
            //代码分割
            splitChunks: {
                chunks: 'all',
                name: 'common',
            },
            runtimeChunk: {
                name: 'runtime',
            },
            minimizer: isDev
            ? []
            : [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    uglifyOptions: {
                      compress: {
                        warnings: false,
                        drop_debugger: true,
                        drop_console: false
                      }
                    }
                }),
                new CptimizeCssAssetsPlugin({          //压缩 css  与 ExtractTextPlugin 配合使用
                    cssProcessor: require('cssnano'),
                    cssProcessorOptions: { discardComments: { removeAll: true } }, //移除所有注释
                    canPrint: true        //是否向控制台打印消息
                }),
            ]
        },
```

extract-text-webpack-plugin 需要升级到 4.0.0-beta.0

#### 2.3 启动

> 安装 `webpack-cli`

```
yarn add webpack-cli -D
```

> 新版本新增 --mode 选项 指定 模式

```
  "build": "npm run clean && cross-env NODE_ENV='production' npm run clean && webpack --env.mode=production --mode production --progress --config webpack.config.js",
    "dev": "npm run clean && cross-env NODE_ENV='development' && webpack-dev-server --mode development --config webpack.config.js",
```

#### 2.4 可能报错的几个点

> 也是困惑我很久的

1. extract-text-webpack-plugin 需要 安装最新版本 `yarn add extract-text-webpack-plugin@next`
2. less,less-loader,css-loader 版本不要太高，之前 我升级到 less@3.x 始终不行

```
    "css-loader": "0.28.11",
    "less": "2.7.3",
    "less-loader": "4.1.0",
```

### 3. babel@7 的升级

---

> 首先安装 @babel 全家桶

```
    "devDependencies":{
        "@babel/core": "^7.0.0-beta.32",
        "@babel/plugin-proposal-object-rest-spread": "^7.0.0-beta.44",
        "@babel/plugin-syntax-dynamic-import": "^7.0.0-beta.44",
        "@babel/plugin-transform-runtime": "^7.0.0-beta.44",
        "@babel/preset-env": "^7.0.0-beta.32",
        "@babel/preset-react": "^7.0.0-beta.32",
        "@babel/preset-stage-0": "^7.0.0-beta.44",
        "@babel/preset-stage-3": "^7.0.0-beta.44",
        "@babel/runtime": "^7.0.0-beta.44",
        "babel-loader": "next",
        "babel-plugin-import": "^1.7.0",
        "babel-plugin-transform-class-properties": "^6.23.0",
        "babel-plugin-transform-decorators-legacy": "^1.3.4",
        "babel-register": "^6.26.0",
    }
```

这里折腾了一会 babel-loader 因为版本问题 一直报错 需要安装 最新的 babel-laoder

```
yarn add babel-loader@next -D
```

接下来更新 `.babelrc`

```
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ],
    "@babel/preset-react",
    "@babel/preset-stage-0"
  ],
  "plugins": [
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-transform-runtime",
    "transform-async-to-generator",
    "transform-decorators-legacy",
    "transform-class-properties",
    "react-hot-loader/babel",
    [
      "import",
      {
        "libraryName": "antd",
        "style": true
      }
    ]
  ]
}
```

接下来就可以享受以下语法

```js
import React,{PureComponent} from "react"
import errorBoundary from "shared/components/ErrorBoundary"

@errorBoundary
export default class Home extends PureComponent {
  constructor(props){
    super(props)
  }
  render() {

    return (
        <>
            <h2>11</h2>
            <h3>33<h3></h3>
        </>
    )
  }
}
```

### 4. react-router4 的升级

---

首先安装相关依赖

```
  "dependencies": {
    "history": "^4.7.2",
    "react-loadable": "^5.3.1",
    "react-redux": "^5.0.7",
    "react-router-config": "^1.0.0-beta.4",
    "react-router-dom": "^4.2.2",
    "react-router-redux": "5.0.0-alpha.9",
    "react-router-transition": "^1.2.1",
    "redux": "^3.7.2",
    "redux-thunk": "^2.2.0"
  },
```

router4 现在变成了 组件化的了 `react-router` => `react-router-dom` 相对来说更符合 react 的思想 升级过程没有我想象的麻烦

#### 4.1 history

```
import {BrowserHistory} from "react-router"
```

在新版 history 没有集成在 react-router 里面，所以需要单独 安装，以上方式不再适用

```js
// shared/libs/history.js
//选用 HTML5 history api 模式
import createBrowserHistory from 'history/createBrowserHistory';

export default createBrowserHistory({
  basename: '', // The base URL of the app (see below)
  forceRefresh: false, // Set true to force full page refreshes
});
```

#### 4.2 动态路由

```js
import Loadable from 'react-loadable'; //异步加载  react-router3 可以使用 getComponent react-router4 没这个 api 了
import React from 'react';
import { Spin } from 'antd';

//按需加载路由
const loadRoute = (loader) => {
  return Loadable({
    loader: () => loader,
    loading: () => <Spin />,
  });
};

//这里引入你的路由
const Root = loadRoute(import('app/components/Root')); //母版
const Home = loadRoute(import('Home')); //主页
const Test = loadRoute(import('app/test')); //测试组件路由

export { Root, Home, Test };
```

这里 动态加载路由 使用了 `react-loadable` 这个库，没打算用的，之前那个 webpack 写法 react-router4 不支持 react-router3 的 `getComponent` 方法 配合下面的导入方式

```js
const Home = () =>
  import(
    /* webpackChunkName: "Home" */
    'Home'
  );
```

所以改用了 库 来实现

#### 4.3 路由配置

```js
import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter, Redirect, Route, Link } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux'; //5.0 移除了 history 需要手动引入 history 依赖
import { AnimatedSwitch } from 'react-router-transition';
import { Home, Root, Test } from 'libs/routes';
import NotFound from 'app/components/NotFound';
import history from 'libs/history';

import './styles.less';

class App extends PureComponent {
  render() {
    return (
      <ConnectedRouter history={history}>
        <BrowserRouter>
          <AnimatedSwitch
            atEnter={{ opacity: 0 }}
            atLeave={{ opacity: 0 }}
            atActive={{ opacity: 1 }}
            className="switch-wrapper"
          >
            <Route exact path="/" component={Home} />
            <Route
              exact
              path="/home"
              render={() => <Redirect to="/" />}
              component={Home}
            />
            <Route path="/test" component={Test} />
            <Route path="*" component={NotFound} />
          </AnimatedSwitch>
        </BrowserRouter>
      </ConnectedRouter>
    );
  }
}

export default hot(module)(App);
```

- react-router-transition 路由切换的动画过渡
- <BrowserRouter/> 指定项目使用哪种路由方式 有 BrowserRouter 和 HashRouter 套路和 react-router3 差不多，这里选用的是 HTML5 的 history 模式
- <ConnectedRouter> 保持 store 和 router 的同步 在 redux-tools 比较有用
- AnimatedSwitch 和 <Route> 同时使用 表示同时只能匹配其中一个路由
- <Link/> 组件 用法没变

到这里升级的就差不多了

### 5. 完整项目 Github 链接

[https://github.com/lijinke666/react-project-template](https://github.com/lijinke666/react-project-template)

### 6. 结语

---

也许是我太笨吧，升级这些花了一周的下班时间 才勉强搞好，真的是很心累，而且感觉没啥实际价值，但就像着了魔一样 想把他搞好，报错了，跑不起来 心里就特别难受，感觉自己真的要当上 webpack 工程师了，webpack 的 dll 多线程编译 这些也没搞，在如今百花齐放的库和轮子涌现的时代，升级或者不升，这是一个问题

### 参考链接

[webpack4 升级指南](https://zhuanlan.zhihu.com/p/34421707) [Webpack 4 进阶--从前的日色变得慢 ，一下午只够打一次包](https://zhuanlan.zhihu.com/p/35407642)
