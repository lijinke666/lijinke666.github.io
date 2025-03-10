---
title: 再识 React 高阶组件
date: 2019-03-04 22:54:48
tags: React
---

### 1. 前言

---

很久没更新博客了，皮的嘛，就不谈了，不过问题不大，今天就结合 项目中写的一个 React 高阶组件 的实例 再来讲一讲，结合上一篇文章，加深一下印象

### 2. Ant Design 的 Form 组件

---

国民组件库 `Ant-Design` 的 `Form` 库 想必大家都用过，比较强大，基于 `rc-form` 封装，功能比较齐全

最近项目中遇到了一个需求，普通的一个表单，表单字段没有 填完的时候，提交按钮 是 `disabled` 状态的，听起来很简单，由于用的是 `antd` 翻了翻文档，copy 了一下代码 , 发现需要些不少的代码

[![Edit antd reproduction template](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/jjr84mzr1w)

```
import { Form, Icon, Input, Button } from 'antd';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

@Form.create();
class Page extends React.Component<{},{}> {
  componentDidMount() {
    this.props.form.validateFields();
  }

  handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.props.form.validateFields((err:any, values:any) => {
      if (!err) {
        ...
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;

    const userNameError = isFieldTouched('userName') && getFieldError('userName');
    const passwordError = isFieldTouched('password') && getFieldError('password');
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <FormItem
          validateStatus={userNameError ? 'error' : ''}
          help={userNameError || ''}
        >
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
          )}
        </FormItem>
        <FormItem
          validateStatus={passwordError ? 'error' : ''}
          help={passwordError || ''}
        >
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
          )}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            登录
          </Button>
        </FormItem>
      </Form>
    );
  }
}

```

### 3. 那么问题来了

---

上面的代码咋一看没什么毛病，给每个字段绑定一个 `validateStatus` 去看当前字段 有没有触碰过 并且没有错，并在 组件渲染的时候 触发一次验证，通过这种方式 来达到 `disabled` 按钮的目的，但是要命的 只是 实现一个 `disabled` 的效果，多写了这么多的代码，实际遇到的场景是 有 10 多个这种需求的表单，有没有什么办法不写这么多的模板代码呢？于是我想到了 `高阶组件`

### 4. 开始干活

---

由于 `Form.create()` 后 会给 `this.props` 添加 `form` 属性 , 从而使用它提供的 api, 经过观察 我们预期想要的效果有以下几点

```js
// 使用效果

@autoBindForm //需要实现的组件
export default class FormPage extends React.PureComponent {}
```

要达到如下效果

- 1.`componentDidMount` 的时候 触发一次 字段验证
- 2. 这时候会出现错误信息，这时候需要干掉错误信息
- 3. 然后遍历当前组件所有的字段，判断 是否有错
- 4. 提供一个 `this.props.hasError` 类似的字段给当前组件。控制 按钮的 `disabled` 状态
- 5. 支持非必填字段，(igonre)
- 6. 支持编辑模式 （有默认值）

### 5. 实现 autoBindForm

```js
import * as React from 'react'
import { Form } from 'antd'

const getDisplayName = (component: React.ComponentClass) => {
  return component.displayName || component.name || 'Component'
}

export default (WrappedComponent: React.ComponentClass<any>) => {
    class AutoBindForm extends WrappedComponent {
      static displayName = `HOC(${getDisplayName(WrappedComponent)})`

      autoBindFormHelp: React.Component<{}, {}> = null

      getFormRef = (formRef: React.Component) => {
        this.autoBindFormHelp = formRef
      }

      render() {
        return (
          <WrappedComponent
            wrappedComponentRef={this.getFormRef}
          />
        )
      }

    return Form.create()(AutoBindForm)
  }
```

首先 `Form.create` 一下我们需要包裹的组件，这样就不用每一个页面都要 `create` 一次

然后我们通过 `antd` 提供的 `wrappedComponentRef` 拿到了 `form` 的引用

根据 `antd` 的文档 , 我们要实现想要的效果，需要用到 如下 api

- `validateFields` 验证字段
- `getFieldsValue` 获取字段的值
- `setFields` 设置字段的值
- `getFieldsError` 获取字段的错误信息
- `isFieldTouched` 获取字段是否触碰过

```
class AutoBindForm extends WrappedComponent
```

继承我们需要包裹的组件（也就是所谓的反向继承）, 我们可以 在初始化的时候 验证字段

```js
componentDidMount(){
  const {
    form: {
        validateFields,
        getFieldsValue,
        setFields,
      },
   } = this.props

    validateFields()
  }
}
```

由于进入页面时 用户并没有输入，所以需要手动清空 错误信息

```js
componentDidMount() {
    const {
      form: {
        validateFields,
        getFieldsValue,
        setFields,
      },
    } = this.props

    validateFields()

    Object.keys(getFieldsValue())
      .forEach((field) => {
        setFields({
          [field]: {
            errors: null,
            status: null,
          },
        })
      })

  }
}
```

通过 `getFieldsValue()` 我们可以动态的拿到当前 表单 所有的字段，然后再使用 `setFields` 遍历一下 把所有字段的 错误状态设为 `null`, 这样我们就实现了 1,2 的效果，

### 6. 实现实时的错误判断 hasError

由于子组件 需要一个 状态 来知道 当前的表单是否有错误，所以我们定义一个 `hasError` 的值 来实现，由于要是实时的，所以不难想到用 `getter` 来实现，

熟悉`Vue` 的同学 可能会想到 `Object.definedPropty` 实现的 计算属性，

本质上 `Antd` 提供的 表单字段收集也是通过 `setState`, 回触发页面渲染，在当前场景下，直接使用 `es6` 支持的`get` 属性即可实现同样的效果代码如下

```js

get hasError() {
    const {
      form: { getFieldsError, isFieldTouched }
    } = this.props

    let fieldsError = getFieldsError() as any

    return Object
      .keys(fieldsError)
      .some((field) => !isFieldTouched(field) || fieldsError[field]))
    }
```

代码很简单 , 在每次 `getter` 触发的时候，我们用 `some` 函数 去判断一下 当前的表单是否触碰过 或者有错误，在创建表单这个场景下，如果没有触碰过，一定是没输入，所以不必验证是否有错

最后 在 `render` 的时候 将 `hasError` 传给 子组件

```js
  render() {
    return (
      <WrappedComponent
        wrappedComponentRef={this.getFormRef}
        {...this.props}
        hasError={this.hasError}
      />
    )
  }

  //父组件
  console.log(this.prop.hasError)
  <Button disabled={this.props.hasError}>提交</Button>
```

同时我们定义下 type

```
export interface IAutoBindFormHelpProps {
  hasError: boolean,
}
```

写到这里，创建表单的场景，基本上可以用这个高阶组件轻松搞定，但是有一些表单有一些非必填项，这时就会出现，非必填项但是认为有错误的清空，接下来，改进一下代码

### 7. 优化组件，支持 非必填字段

---

非必填字段，即认为是一个配置项，由调用者告诉我哪些是 非必填项，当时我本来想搞成 自动去查找 当前组件哪些字段不是 `requried` 的，但是 `antd` 的文档貌似 莫得，就放弃了

首先修改函数，增加一层柯里化

```js
export default (filterFields: string[] = []) =>
  (WrappedComponent: React.ComponentClass<any>) => {};
```

```
@autoBindForm(['fieldA','fieldB'])   //需要实现的组件
export default class FormPage extends React.PureComponent {

}
```

修改 `hasError` 的逻辑

```js
    get hasError() {
      const {
        form: { getFieldsError, isFieldTouched, getFieldValue },
        defaultFieldsValue,
      } = this.props

      const { filterFields } = this.state
      const isEdit = !!defaultFieldsValue
      let fieldsError = getFieldsError()

      const needOmitFields = filterFields.filter((field) => !isFieldTouched(field)).concat(needIgnoreFields)
      if(!isEmpty(needOmitFields)) {
        fieldsError = omit(fieldsError, needOmitFields)
      }

      return Object
        .keys(fieldsError)
        .some((field) => {
          const isCheckFieldTouched = !isEdit || isEmpty(getFieldValue(field))
          return isCheckFieldTouched ? (!isFieldTouched(field) || fieldsError[field]) : fieldsError[field]
        })
    }
```

逻辑很简单粗暴，遍历一下需要过滤的字段，看它有没有触碰过，如果触碰过，就不加入错误验证

同理，在 初始化的时候也过滤一下，

首先通过 `Object.keys(getFieldsValue)` 拿到当前表单 的所有字段，由于 这时候不知道哪些字段 是 `requierd` 的，机智的我

`validateFields` 验证一下当前表单，这个函数 返回当前表单的错误值，非必填的字段 此时不会有错误，所以 只需要拿到当前错误信息，和 所有字段 比较 两者 不同的值，使用 `loadsh` 的 `xor` 函数 完成

```js
const filterFields = xor(fields, Object.keys(err || []));
this.setState({
  filterFields,
});
```

最后清空 所有错误信息

完整代码：

```js
 componentDidMount() {
      const {
        form: {
          validateFields,
          getFieldsValue,
          getFieldValue,
          setFields,
        },
      } = this.props

      const fields = Object.keys(getFieldsValue())

      validateFields((err: object) => {
        const filterFields = xor(fields, Object.keys(err || []))
        this.setState({
          filterFields,
        })

        const allFields: { [key: string]: any } = {}
        fields
          .filter((field) => !filterFields.includes(field))
          .forEach((field) => {
            allFields[field] = {
              value: getFieldValue(field),
              errors: null,
              status: null,
            }
          })

        setFields(allFields)

      })
    }
```

经过这样一波修改，支持非必填字段的需求就算完成了

### 8. 最后一波，支持默认字段

---

其实这个很简单，就是看子组件是否有默认值 , 如果有 `setFieldsValue` 一下就搞定了，子组件和父组件约定一个 `defaultFieldsValue`

完整代码如下

```js
import * as React from 'react';
import { Form } from 'antd';
import { xor, isEmpty, omit } from 'lodash';

const getDisplayName = (component: React.ComponentClass) => {
  return component.displayName || component.name || 'Component';
};

export interface IAutoBindFormHelpProps {
  hasError: boolean;
}

interface IAutoBindFormHelpState {
  filterFields: string[];
}

/**
 * @name AutoBindForm
 * @param needIgnoreFields string[] 需要忽略验证的字段
 * @param {WrappedComponent.defaultFieldsValue} object 表单初始值
 */
const autoBindForm =
  (needIgnoreFields: string[] = []) =>
  (WrappedComponent: React.ComponentClass<any>) => {
    class AutoBindForm extends WrappedComponent {
      get hasError() {
        const {
          form: { getFieldsError, isFieldTouched, getFieldValue },
          defaultFieldsValue,
        } = this.props;

        const { filterFields } = this.state;
        const isEdit = !!defaultFieldsValue;
        let fieldsError = getFieldsError();

        const needOmitFields = filterFields
          .filter((field) => !isFieldTouched(field))
          .concat(needIgnoreFields);
        if (!isEmpty(needOmitFields)) {
          fieldsError = omit(fieldsError, needOmitFields);
        }

        return Object.keys(fieldsError).some((field) => {
          const isCheckFieldTouched = !isEdit || isEmpty(getFieldValue(field));
          return isCheckFieldTouched
            ? !isFieldTouched(field) || fieldsError[field]
            : fieldsError[field];
        });
      }

      static displayName = `HOC(${getDisplayName(WrappedComponent)})`;

      state: IAutoBindFormHelpState = {
        filterFields: [],
      };

      autoBindFormHelp: React.Component<{}, {}> = null;

      getFormRef = (formRef: React.Component) => {
        this.autoBindFormHelp = formRef;
      };

      render() {
        return (
          <WrappedComponent
            wrappedComponentRef={this.getFormRef}
            {...this.props}
            hasError={this.hasError}
          />
        );
      }
      componentDidMount() {
        const {
          form: { validateFields, getFieldsValue, getFieldValue, setFields },
        } = this.props;

        const fields = Object.keys(getFieldsValue());

        validateFields((err: object) => {
          const filterFields = xor(fields, Object.keys(err || []));
          this.setState({
            filterFields,
          });

          const allFields: { [key: string]: any } = {};
          fields
            .filter((field) => !filterFields.includes(field))
            .forEach((field) => {
              allFields[field] = {
                value: getFieldValue(field),
                errors: null,
                status: null,
              };
            });

          setFields(allFields);

          // 由于继承了 WrappedComponent 所以可以拿到 WrappedComponent 的 props
          if (this.props.defaultFieldsValue) {
            this.props.form.setFieldsValue(this.props.defaultFieldsValue);
          }
        });
      }
    }

    return Form.create()(AutoBindForm);
  };

export default autoBindForm;
```

这样一来，如果子组件 有 `defaultFieldsValue` 这个 props, 页面加载完就会设置好这些值，并且不会触发错误

### 10. 使用

```js
import autoBindForm from './autoBindForm'

# 基本使用
@autoBindForm()

class MyFormPage extends React.PureComponent{
    ... 没有灵魂的表单代码
}

# 忽略字段

@autoBindForm(['filedsA','fieldsB'])

# 默认值

// MyFormPage.js
@autoBindForm()

class MyFormPage extends React.PureComponent{
    ... 没有灵魂的表单代码
}

// xx.js
const defaultFieldsValue = {
    name: 'xx',
    age: 'xx',
    rangePicker: [moment(),moment()]
}
<MyformPage defaultFieldsValue={defaultFieldsValue}/>
```

这里需要注意的是，如果使用 `autoBindForm` 包装过的组件 也就是

```
<MyformPage defaultFieldsValue={defaultFieldsValue}/>
```

这时候 想拿到 `ref` , 不要忘了 `forwardRef`

```
this.ref = React.createRef()
<MyformPage defaultFieldsValue={defaultFieldsValue} ref={this.ref}/>

```

同理修改 'autoBindForm.js'

```
render() {
  const { forwardedRef, props } = this.props
  return (
    <WrappedComponent
      wrappedComponentRef={this.getFormRef}
      {...props}
      hasError={this.hasError}
      ref={forwardedRef}
    />
  )
}
return Form.create()(
    React.forwardRef((props, ref) => <AutoBindForm {...props} forwardedRef={ref} />),
)
```

### 11. 最终代码

```js
import * as React from 'react';
import { Form } from 'antd';
import { xor, isEmpty, omit } from 'lodash';

const getDisplayName = (component: React.ComponentClass) => {
  return component.displayName || component.name || 'Component';
};

export interface IAutoBindFormHelpProps {
  hasError: boolean;
}

interface IAutoBindFormHelpState {
  filterFields: string[];
}

/**
 * @name AutoBindForm
 * @param needIgnoreFields string[] 需要忽略验证的字段
 * @param {WrappedComponent.defaultFieldsValue} object 表单初始值
 */
const autoBindForm =
  (needIgnoreFields: string[] = []) =>
  (WrappedComponent: React.ComponentClass<any>) => {
    class AutoBindForm extends WrappedComponent {
      get hasError() {
        const {
          form: { getFieldsError, isFieldTouched, getFieldValue },
          defaultFieldsValue,
        } = this.props;

        const { filterFields } = this.state;
        const isEdit = !!defaultFieldsValue;
        let fieldsError = getFieldsError();

        const needOmitFields = filterFields
          .filter((field) => !isFieldTouched(field))
          .concat(needIgnoreFields);
        if (!isEmpty(needOmitFields)) {
          fieldsError = omit(fieldsError, needOmitFields);
        }

        return Object.keys(fieldsError).some((field) => {
          const isCheckFieldTouched = !isEdit || isEmpty(getFieldValue(field));
          return isCheckFieldTouched
            ? !isFieldTouched(field) || fieldsError[field]
            : fieldsError[field];
        });
      }

      static displayName = `HOC(${getDisplayName(WrappedComponent)})`;

      state: IAutoBindFormHelpState = {
        filterFields: [],
      };

      autoBindFormHelp: React.Component<{}, {}> = null;

      getFormRef = (formRef: React.Component) => {
        this.autoBindFormHelp = formRef;
      };

      render() {
        const { forwardedRef, props } = this.props;
        return (
          <WrappedComponent
            wrappedComponentRef={this.getFormRef}
            {...props}
            hasError={this.hasError}
            ref={forwardedRef}
          />
        );
      }
      componentDidMount() {
        const {
          form: { validateFields, getFieldsValue, getFieldValue, setFields },
        } = this.props;

        const fields = Object.keys(getFieldsValue());

        validateFields((err: object) => {
          const filterFields = xor(fields, Object.keys(err || []));
          this.setState({
            filterFields,
          });

          const allFields: { [key: string]: any } = {};
          fields
            .filter((field) => !filterFields.includes(field))
            .forEach((field) => {
              allFields[field] = {
                value: getFieldValue(field),
                errors: null,
                status: null,
              };
            });

          setFields(allFields);

          // 属性劫持 初始化默认值
          if (this.props.defaultFieldsValue) {
            this.props.form.setFieldsValue(this.props.defaultFieldsValue);
          }
        });
      }
    }

    return Form.create()(
      React.forwardRef((props, ref) => (
        <AutoBindForm {...props} forwardedRef={ref} />
      )),
    );
  };

export default autoBindForm;
```

### 12. 结语

---

这样一个 对 `Form.create` 再次包装的 高阶组件，解决了一定的痛点，少写了很多模板代码，虽然封装的时候遇到了各种各样奇奇怪怪的问题，但是都解决了，没毛病，也加强了我对高阶组件的认知，溜了溜了 :)
