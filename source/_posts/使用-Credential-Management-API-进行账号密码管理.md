---
title: 使用 Credential Management API 进行账号密码管理
date: 2023-08-09 13:16:33
tags: JavaScript
---

<a name="oBKDo"></a>

### 📣 背景

我们在登录，输入账号密码后，通常会收到 `要保存密码吗？` 的提示，保存后我们可以在 `chrome://password-manager/passwords` **Google 密码管理工具**中查看

![图 0](/images/2023-12-22-af2ccff5e705f7fe07cc0563e6736b223c8a0d891e7c38b7e9acc564d466cf0b.png)

<br />

Chrome 提供默认的密码管理工具

<br />

![图 1](/images/2023-12-22-538e996c02c5379d74f246db052c8d721bf767329d5ca6512d39e038ef287133.png)

<a name="qI5If"></a>

### 如何保存？

如果我们想在自己的网站登录时，保存信息到 Google 密码管理工具，该如何实现呢？

![图 2](/images/2023-12-22-62d4e38c914478c9233da871aa8c17a2e79c50463c90ffd7dd74272c66729673.png)

```html
<form method="get" action="#">
  <input type="text" name="username" />
  <input type="password" name="password" />
  <button id="submit">提交</button>
</form>
```

<a name="kIgfW"></a>

### Credential Management API

<a name="tVq0M"></a>

#### 保存密码

Chorme 提供 `[Credential Management API](https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API#credential_management_concepts_and_usage)`, 我们可以使用 `PasswordCredential` 对账号密码进行管理

```typescript
const cred = new PasswordCredential({
  id,
  password,
  name,
  iconURL,
});

navigator.credentials.store(cred).then(() => {
  // Do something else.
});
```

如上面的例子，我们点击 `提交` 按钮时，可以通过 `navigator.credentials.store` 保存起来

```typescript
submit.addEventListener('click', (e) => {
  e.preventDefault();

  const fm = new FormData(document.querySelector('form'));

  const cred = new PasswordCredential({
    id: fm.get('username'),
    name: fm.get('username'),
    password: fm.get('password'),
  });

  navigator.credentials
    .store(cred)
    .then((data) => {
      console.log('data: ', data);
    })
    .catch((error) => {
      console.error('error: ', error);
    });
});
```

接下来可以看到出现了保存密码的提示弹窗<br />

![图 3](/images/2023-12-22-797b9d102cd2e08f3ebfab459e34a0613eb24e55218fdb41a845b145d1162952.png)

<a name="IFa8w"></a>

#### 获取密码

保存完密码后，我们可以通过 `navigator.credentials.get` 获取到密码，这是一个异步接口 （为什么是异步下文会提到）

```typescript
navigator.credentials
  .get({
    password: true,
  })
  .then((profile) => {
    console.log('profile: ', profile);
  });
```

需要注意的是，密码是明文<br />

![图 4](/images/2023-12-22-5173857ef50f584ea88ccfa24bbe728537f039118c012627c7afee28d04fad67.png)

<a name="FAj0T"></a>

#### 多组密码

如果保存了多组密码，那么在获取密码的时候会弹窗 `登录身份`选择框，需要手动选择<br />

![图 5](/images/2023-12-22-354cfbdeb3e3b59f4e6e7c7ede1d78b60523a1462ea56df071e7b6e09767f679.png)

<br />选择后，如果绑定了指纹之类的，还会进一步进行安全验证<br />

![图 6](/images/2023-12-22-009918ae0e32c509125c6e4f7303f60956b4961f5845ca3878db73f456b304a6.png)

<br />验证通过后，返回选择的密码，这也是为什么该接口是异步的原因<br />

![图 7](/images/2023-12-22-72590f922a389182990a0ee8dcd2f715880f6e571e187865fa55a92104134330.png)

<a name="aZzTQ"></a>

### 自动填充

在选择完密码后，我们还可以再进一步，将获取到的密码直接填充到表单上

一种是直接使用 `<input/>` 组件默认的浏览器行为进行填充<br />

![图 8](/images/2023-12-22-35ebd74da42befc2c6067e40401cd3521a44b1818c81af8dfda02874bfeba64f.png)

第二种就是在获取到密码后，直接设置

```typescript
navigator.credentials
  .get({
    password: true,
  })
  .then((profile) => {
    console.log('profile: ', profile);

    if (!profile) {
      return;
    }

    document.querySelector('[name="username"]').value = profile.name;
    document.querySelector('[name="password"]').value = profile.password;
  });
```
