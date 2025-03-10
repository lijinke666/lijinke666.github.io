---
title: 初识 React 中的高阶组件
date: 2019-05-22 22:52:30
tags: React
---

### 1. 前言

---

好久没有写文章了，结合之前分享的资料，今天介绍一下 React 中的 高阶组件

### 2. 什么是高阶组件

---

什么是 高阶组件 (Higher-Order-Component) , 说人话其实就是 组件外面在包一个组件，用伪代码表示

```js
const 三明治 = 用刀切（面包（火腿）, {
  切几刀：1,
});
```

用面包包裹 火腿 然后用 刀切一下，变成了一个三明治，而三明治 就是最终生成的组件

### 3. 从高阶函数开始了解

---

在函数式编程里面，函数作为一等公民，函数可以作为`返回值`, 也可以作为`参数`

```js
const add = (a) => (b) => a + b;
const num = add(1)(2);
console.log(num);
```

这里的柯里化函数 add 接受一个值 `a` 然后返回一个新的函数，新的函数同样接受一个值 `b`, 最终 返回 a +b 的和，

理解了这点 之后 可以看出 所谓的 高阶组件 和 高阶函数 是一回事

### 4. 作用与基本原则 ?

---

> 作用

- 代码复用
- props 更改与组合
- 渲染劫持 通过判断条件决定渲染内容
- 装逼

> 基本原则

- props 保持一致 : 在原有 props 上面添加一些新功能 尽量不让其受影响
- 可以任意灵活组合 : 多个高阶组件 可以组合在一起
- 给组件添加一个静态的 displayName: 方便调试

### 5. 实际例子

---

#### 5.1 组件包裹

> 在原有组件的基础上包一层组件以便于添加一些元素

```js
import React, { Component } from 'react';
import footer from './components/Footer';

@footer('哈哈')
export default class FooterPage extends Component {
  render() {
    return <h2>基本用法：组件包裹</h2>;
  }
}

// export default footer('哈哈')(FooterPage)
```

```js
//Footer.js

import React, { PureComponent } from 'react';
import { getDisplayName } from '../utils';

export default (title) => (Component) => {
  return class Footer extends PureComponent {
    static displayName = `HOC(${getDisplayName(Component)})`;

    constructor(props) {
      super(props);
    }
    render() {
      return (
        <>
          <footer className="footer">{title}</footer>
          <Component />
        </>
      );
    }
  };
};
```

用`@` 装饰器的方式使用 高阶组件 第一个参数 是入参，第二个参数 是接受到的包裹组件，然后 返回一个 新的 `Componnet`, 高阶组件基本都是这种套路

代码很简单 在原有的组件继承上 添加了一个 `footer` 的标签，`displayName` 是为了方便调试，因为如果重复使用 这个组件的话，所有的名字 都是 `Footer` 到时候你都不知道对应的是哪个了，所以加一个名字 方便看

```js
//utils.js

export const getDisplayName = (component) => {
  return component.displayName || component.name || 'Component';
};
```

效果如下

<br/>
<img src="https://www.lijinke.cn/lijinkeWeb-static/images/WX20180906-171540.png" style="max-width:100%"/>
<br/>

#### 5.2 反向继承与渲染劫持

啥子事反向继承呢？其实就是 继承需要包裹的组件 拿到它的 `state` 和 `props` 进行一个判断，添加或者修改

而渲染劫持 同理 因为继承了之后 可以获取需要包裹的组件的生命周期 可以 手动的 判断是否需要 render, 而达到 渲染劫持的 效果

直接上代码，实现一个 自动显示 `Loaindg...` 的高阶组件

```
import React, { Component } from 'react';
import autoLoading from './components/AutoLoading';

@autoLoading((_, { list }) => list.length < 1)
export default class AutoLoadingPage extends Component {
  state = {
    list: []
  };
  render() {
    return (
      <div>
        <h2>加载完成</h2>
        {this.state.list.map((value, i) => {
          return <p key={i}>{value}</p>;
        })}
      </div>
    );
  }
  fetch = () => {
    //模拟一个请求
    setTimeout(() => {
      this.setState({
        list: [1, 2, 3]
      });
    }, 2000);
  };
  componentDidMount() {
    this.fetch();
  }
}
```

在 页面加载之后 发起一个 `fetch` 请求 2s（模拟） 后 数据请求完毕，页面正常渲染，在加载完成之前 显示 loading...

<br/>
<img src="https://www.lijinke.cn/lijinkeWeb-static/images/WX20180906-171714.png" style="max-width:100%"/>
<br/>

<br/>
<img src="https://www.lijinke.cn/lijinkeWeb-static/images/WX20180906-171738.png" style="max-width:100%"/>
<br/>

是不是很神奇，在业务逻辑中 并没有手动 `setState` 去改变 loading 的显示与隐藏，一切尽在 `autoLoading` 这个高阶组件中

```
// AutoLoading.js
import React from 'react';
import { getDisplayName } from '../utils';
import './styles.css';

export default checkLoading => WrappedComponent => {
  //AutoLoading 继承 了 WrappedComponent 而不是 WrappedComponent 继承 AutoLoading
  //所以叫反向继承
  return class AutoLoading extends WrappedComponent {
    static displayName = `HOC(${getDisplayName(WrappedComponent)})`;

    constructor(props) {
      super(props);
    }
    render() {
      console.log(this.props);
      if (checkLoading(this.props, this.state)) {
        return (
          <div className="flex">
            <div className="loading">Loading...</div>
          </div>
        );
      }
      return super.render();
    }
  };
};
```

高阶组件 接受一个 checkLoading 的函数，函数我们传入 `props` 和 `state`, 交给消费者调用，只要其中一个返回 true 就是 显示 `Loading ...`, 否则则代表数据加载完毕，调用父元素 `super.render()` 渲染页面，这样一个通用的 加载高阶组件就完成了，再也不用 每个页面手动去显示和隐藏加载效果了

#### 5.3 属性代理 : 实现一个低配版的 `connect`

平时开发中 使用 `React` 难免会和 `redux` 打交道，用了 `redux` , 全家桶之一的 `react-redux` 可定再属性不过了，其中有一个 `connect` 函数 就是经典的高阶组件的实现，通过 `connect` 之后 我们可以再当前组件 拿到全局的 store 的数据 和 dispatch, 显示我们来尝试实现一个简单的

```
//Connect.js
import React, { PureComponent } from 'react';
import { getDisplayName } from '../utils';

const state = {
  name: 'js-catch-up',
  type: 'connect'
};

const dispatch = action => {
  console.log('dispatch:', action);
  alert(JSON.stringify(action, undefined, 2));
};

const action = name => {
  dispatch({
    type: 'SAY_HELLO',
    name
  });
};

const actions = {
  setName: () => action
};

export default (mapStateToProps, mapDispatchToProps) => WrappedComponent => {
  return class Connect extends PureComponent {
    static displayName = `HOC(${getDisplayName(WrappedComponent)})`;

    state = state;

    constructor(props) {
      super(props);
    }
    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...mapStateToProps(state)}
          {...mapDispatchToProps(actions)}
        />
      );
    }
  };
};
```

高阶组件接受两个函数

- `mapStateToProps()`
- `mapDispatchToProps()`

这里我们模拟一个全局的 store 的 state

```
const state = {
  name: 'js-catch-up',
  type: 'connect'
};
```

模拟一个 action

```
const dispatch = action => {
  console.log('dispatch:', action);
  alert(JSON.stringify(action, undefined, 2));
};

const action = name => {
  dispatch({
    type: 'SAY_HELLO',
    name
  });
};

const actions = {
  setName: () => action
};
```

最重要的是这里的，啥子事属性代理，将 当前的 props 传给 被包裹的组件，然后将 消费者 传入的 `mapStateToProps` 和 `mapDispatchToProps` 生成的新 props 也传给 被包裹的 组件，这样消费者（被包裹的组件的 props 里面 就有 connect 之后的东西了）

```
    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...mapStateToProps(state)}
          {...mapDispatchToProps(actions)}
        />
      );
    }
```

如何使用

```
import React, { Component } from 'react';
import connect from './components/Connect';

@connect(
  ({ name, type }) => ({
    name,
    type
  }),
  dispatch => ({
    setName: dispatch.setName()
  })
)
export default class Connect extends Component {
  onSetName = () => {
    this.props.setName('小明同学');
  };
  render() {
    const { name, type } = this.props;
    return (
      <>
        <h2>属性代理</h2>
        <div> 名字 : {type} </div>
        <p> By : {name}</p>
        <button onClick={this.onSetName}>触发 action</button>
      </>
    );
  }
}
```

是不是 和 `react-redux` 用法一模一样对不对？对你妈个猪脑壳，哈哈 这只是一个低配版的，很多细节没实现，为了便于理解（其实写不来）, 比如 观察者模式，数据改变自动同步之类的都没做，主要是理解一下用法

<br/>
<img src="https://www.lijinke.cn/lijinkeWeb-static/images/WX20180906-173759.png" style="max-width:100%"/>
<br/>

### 6. 常见问题

- disPlayName 问题
  - 高阶组件名字包裹之后需要加一个名字标识 方便调试
- 组件包裹问题
  - 由于高阶组件会在当前组件包裹一层 这回带来 传递 props 麻烦的问题 要多传递一次
- 无法获取静态方法
  - 高阶组件 可以获取到 被包裹组件的 props 和 state , 但是无法获取 静态方法 需要手动 拷贝 [https://github.com/mridgway/hoist-non-react-statics](https://github.com/mridgway/hoist-non-react-statics)

### 7. 常见的 第三方库 的 高阶组件

---

- `react-hot-loader`

```js
import { hot } from 'react-hot-loader';
@hot(module)
export default class Test extends PureComponent {}
```

- `antd-form`

```js
import { Form } from 'antd';
@Form.create()
export default class Test extends PureComponent {}
```

- `react-redux`

```js
import { connect } from 'react-redux';
@connect(mapStateToProps, mapDispatchToProps)
export default class Test extends PureComponent {}
```

### 8. 参考链接

---

- [深入理解 React 高阶组件](https://zhuanlan.zhihu.com/p/24776678)
- [聊聊 React 高阶组件 (Higher-Order Components)](https://zhuanlan.zhihu.com/p/29482095)
- [React 高阶组件实践](https://zhuanlan.zhihu.com/p/29250138)
- [demo 代码](https://github.com/lijinke666/js-catch-up/react)

### 9. 结语

---

高阶组件感觉也是个双刃剑，用法了 会少很多模板代码，比如 每个 page 都要 connect 可以搞一个高阶组件 统一 connect , 就比较方便，但是 高阶组件会导致 组件多几层嵌套，在组件传值的时候回麻烦一些，加上隐藏了实现细节，如果不是你写的高阶组件，不知道内部逻辑，调试的时候也是一大麻烦是，溜了溜了，下班
