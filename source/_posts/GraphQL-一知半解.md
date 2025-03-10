---
title: GraphQL 一知半解
date: 2023-05-10 10:13:38
tags: GraphQL, Node.js
---

<a name="yNKL2"></a>

### ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683533812094-1c0002fd-23f6-4a94-88b0-b36b0c3091be.png#clientId=u4cc63e5b-bd83-4&from=paste&height=131&id=u7f45f664&originHeight=262&originWidth=1143&originalType=binary&ratio=1&rotation=0&showTitle=false&size=82568&status=done&style=none&taskId=u841ae61e-2a8f-467b-ac5f-3e3d4fcbf9b&title=&width=571.5)

<a name="QSUUe"></a>

### 什么是 GraphQL ?
>
> 官网描述：GraphQL 是一个用于 API 的查询语言

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683526712189-04bd1288-7c09-4478-968a-6ef88c49b6de.png#clientId=u4cc63e5b-bd83-4&from=paste&height=206&id=u2ceb378c&originHeight=411&originWidth=792&originalType=binary&ratio=1&rotation=0&showTitle=false&size=96055&status=done&style=none&taskId=uae0820b7-85ef-4533-817f-605e483714d&title=&width=396)<br />GraphQL 是 FaceBook 2015 推出的一个查询语言，它不是一门新的编程语言，而是基于 `HTTP` 协议封装的 `DSL`, 简单来说它和我们熟悉的 `RESTful API` 一样，是用来查询接口，获取数据，当然，可以肯定的是它不是 KPI 轮子，而是真实服务于 FB 的各种业务场景中，现如今都还在维护

2023 年了，还在用传统 API : ) ? 接下来让我们简单了解一下
<a name="nHfYi"></a>

### 谁在使用 ?

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683601601189-d5299964-83a2-4871-891b-a526309e87ad.png#clientId=u4cc63e5b-bd83-4&from=paste&height=235&id=u32200f63&originHeight=470&originWidth=1155&originalType=binary&ratio=1&rotation=0&showTitle=false&size=72589&status=done&style=none&taskId=u31b02ccf-0d6b-4fed-a733-cc5514645c8&title=&width=577.5)<br />目前比较知名的就是 `GitHub`, 它提供 `REST API` 和 `[GraphQL](https://docs.github.com/en/graphql/overview/about-the-graphql-api)`两套 API<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683620659343-c24ab08d-8099-4a6a-9a9e-74e2ef199568.png#clientId=u65847b4b-548c-4&from=paste&height=549&id=u5ea552e5&originHeight=1098&originWidth=702&originalType=binary&ratio=2&rotation=0&showTitle=false&size=267610&status=done&style=none&taskId=uf72bad9f-57ca-4f56-8748-a25bac54935&title=&width=351)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683533515669-d877b465-f5ae-422a-bc96-5803f3583fa9.png#clientId=u4cc63e5b-bd83-4&from=paste&height=358&id=u2c38f9f3&originHeight=716&originWidth=1361&originalType=binary&ratio=1&rotation=0&showTitle=false&size=119126&status=done&style=none&taskId=u934d16ea-d74c-47f2-8e2c-3f3b488e04c&title=&width=680.5)
<a name="my0XP"></a>

### 和 REST API 的区别 ?

我们常说的 `接口` 本质上是一个 `HTTP`资源地址，一个 `Request` 对应 一个 `Response`
:::info
GET /api/user
:::
:::info
GET /api/user/:id
:::
:::success
PATCH /api/user
:::
:::warning
POST /api/user
:::
:::danger
DELETE /api/user
:::

然后我们通过 `XMLHttpRequest`或者 `Fetch API` 来 `"调接口"`

```typescript
fetch('http://example.com/movies.json')
  .then(response => response.json())
  .then(data => console.log(data));
```

```javascript
function reqListener () {
  console.log(this.responseText);
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", "http://www.example.org/example.txt");
oReq.send();
```

然后接收后端返回的数据<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683527625744-c215c09a-c086-4fbb-a098-2053dc60f4ae.png#clientId=u4cc63e5b-bd83-4&from=paste&height=241&id=u627eee01&originHeight=320&originWidth=490&originalType=binary&ratio=1&rotation=0&showTitle=false&size=44294&status=done&style=none&taskId=u58d9e0cf-94ce-4572-82b8-cc41192a7cd&title=&width=369)

那么问题来了，如图为例，如果现在我不想接口中返回 `traceId`, 那么流程如下：
:::info

- 前端：后端大哥，麻烦把 `/api/xx/xx` 这个接口的 `traceId`去掉，我们前端现在业务不消费了，太冗余了
- 后端：好的，等我改一下，"找到对应的 Controller/Service, 然后去掉 traceId"
- 后端：我改了，部署好你试试
- 前端：好的，谢谢哥
:::

那么一个标准的 `GraphQL`查询是怎样的？

```typescript
{
  user {
    name
    traceId
  }
}

// 返回 （标准 JSON)

{
  "user": {
    "name": "ljk",
    "traceId": "xxx"
  }
}
```

可以看到，非常的简洁，只需要声明你想查询的实体和需要的字段即可，那么如果想实现上面的诉求，去掉 `traceId` 我们只需要去掉查询即可

```diff
{
  user {
    name
-   traceId
  }
}

// 返回 （标准 JSON)

{
  "user": {
    "name": "ljk",
-   "traceId": "xxx"
  }
}
```

![所有查询底层都通过 /graphql 这个 HTTP 接口](https://intranetproxy.alipay.com/skylark/lark/0/2023/gif/6356643/1683602345445-fa2b92f3-b9ca-4106-a7c3-cae419359fb7.gif#clientId=u4cc63e5b-bd83-4&from=paste&height=504&id=u61099af3&originHeight=1008&originWidth=1536&originalType=binary&ratio=1&rotation=0&showTitle=true&size=3191536&status=done&style=none&taskId=u57b129de-883a-4ec6-aa75-8e212009516&title=%E6%89%80%E6%9C%89%E6%9F%A5%E8%AF%A2%E5%BA%95%E5%B1%82%E9%83%BD%E9%80%9A%E8%BF%87%20%2Fgraphql%20%E8%BF%99%E4%B8%AA%20HTTP%20%E6%8E%A5%E5%8F%A3&width=768 "所有查询底层都通过 /graphql 这个 HTTP 接口")

:::info
这个例子引出 GraphQL 很重要的一个特性，**那就是查询返回的结果是**`**前端**`**说了算，即按需返回，查询和返回接口一致**
:::

<a name="u9xBt"></a>

### GraphQL Schema

如上面的例子，我们想查询 `user.name`和`user.traceId`, 这两个字段不是随心所欲，凭空猜测出来的，在 GraphQL 中，我们不再有一个一个 `接口` 的概念，而是对应实体的 `Scheme`, 有了它，我们可以对实体任意的 `增删改查`

```graphql
type User {
  name: String!
  traceId: String
}
```

这里的 `name`, `traceId` 在 `GraphQL` 中被称为 `Field`

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683530187605-49b5b80f-4524-4bb9-b4e2-2094e479b490.png#clientId=u4cc63e5b-bd83-4&from=paste&height=167&id=ufeadff67&originHeight=334&originWidth=798&originalType=binary&ratio=1&rotation=0&showTitle=false&size=44938&status=done&style=none&taskId=u3c1b7ea8-eaab-45aa-b5e8-95b544e6662&title=&width=399)<br />类型系统大同小异，在 GraphQL 中也有自己的一套类型系统，对于 TypeScript 体操运动员们应该说不再话下，这里就不再赘述，[查看详情](https://graphql.cn/learn/schema/#type-system)
<a name="DVYGG"></a>

### 查询 (Query)

GraphQL 中的 `Query`可以类别 `REST API`中的 `GET`请求，但能力更丰富<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683537735494-a0a99ed0-986a-4e0b-bf70-ceadad855255.png#clientId=u4cc63e5b-bd83-4&from=paste&height=114&id=u84d8bfb2&originHeight=114&originWidth=500&originalType=binary&ratio=1&rotation=0&showTitle=false&size=11289&status=done&style=none&taskId=uefb707fb-abba-40dc-b1b7-ec37fbeae9f&title=&width=500)
<a name="bS8WY"></a>

#### 获取一组数据

```typescript
GET /api/users
```

```graphql
{
  users: {
    id
    name
  }
}
```

<a name="so37Z"></a>

#### 获取单个数据

```typescript
GET /api/user/1
```

```graphql
{
  user(id: "1"){
     id
     name
  }
}
```

<a name="XQLXs"></a>

#### 根据条件获取数据

在传统 `REST API`场景，比如我们想调用一个接口，接口信息中返回这个用户的工资，但是工资只给老板看，一种是给后端标识，让后端来动态返回，一种是全量请求后，前端手动隐藏

```typescript
GET /api/user/1

Playload
{
  isOwner: true
}
```

而在 GraphQL 中，我们可以通过 `指令` `@include()` `@skip` 来实现在**前端查询时就动态控制字段**的返回

- `@include(if: Boolean)` 白名单，满足则返回
- `@skip(if: Boolean)` 黑名单，满足则跳过

```graphql
query User($isOwner: Boolean!, $isMyXiaoJin: Boolean = false) {
  user {
   id
   name @skip(if: $isMyXiaoJin)
   salary @include(if: $isOwner) {
     original
     extra
   }
  }
}

# isOwner = false

{
  id: '1',
  name: "xx"
}

# isOwner = true

{
  id: '1',
  name: "xx",
  salary: {
    original: 100000000000
    extra: 0.1
  }
}

# 比如在蚂蚁消金环境下，我们不希望显示用户名 （乱举的例子）
# isOwner = false isMyXiaoJin = true

{
  id: '1'
}
```

当然，查询还有很多有意思的玩法，如：`别名`, `片段复用`,  `操作名`, 篇幅有限不一一列举 [查看更多](https://graphql.cn/learn/queries/#fragments)
<a name="Hk93h"></a>

### 变更 (Mutations)

GraphQL 中的 `Query`可以类别 `REST API`中的 `POST`请求，用来做数据的变更，对于前端的话，用过 `Vuex`的话会比较熟悉 `Mutation`这个概念<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683538009294-9dd16070-fc8d-48c1-8a27-459002ae205d.png#clientId=u4cc63e5b-bd83-4&from=paste&height=132&id=ufc1554d4&originHeight=132&originWidth=507&originalType=binary&ratio=1&rotation=0&showTitle=false&size=12042&status=done&style=none&taskId=u27443570-c290-4520-8c65-f8890ba83c2&title=&width=507)
<a name="SGBYm"></a>

#### 插入一条数据

```typescript
POST /api/user/add

Body

{
  name: 'xxx',
  sex: "男",
  age: 18
}
```

```graphql
mutation AddUser($user: User!) {
  addUser(user: $user) {
    name
    sex
    age
  }
}

{
  user: {
    name: 'xxx',
    sex: "男",
    age: 18
  }
}
```

<a name="cBOLq"></a>

### 解析器 (Resolver)

不管是 query 还是 mutation, 我们的数据不可能凭空而来，我们也需要和数据库建立连接，然后 CRUD 一波，这一部就通过 `Resolver`完成

```typescript
import { Args, Resolver, Query } from '@nestjs/graphql'
import { UserService } from './user.service'

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService)

  @Query(() => User[], {
    name: 'users'
  })
  public async users(): Promise<User[]> {
    this.userService.xxxxx()
  }
}
```

<a name="TZGRq"></a>

### GraphQL 在实际项目中如何使用？

:::info
本地 Playground 演示地址：[http://localhost:3000/graphql](http://localhost:3000/graphql)
:::
<a name="ez3YT"></a>

#### 生态

GraphQL 最开始只有 `Node.js` 的实现，后经过慢慢发展，在很多编程语言中都有了对应实现，分为 `客户端`和 `服务端`<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683533884632-53fcc171-3026-4e3c-9da5-52f934d1b0af.png#clientId=u4cc63e5b-bd83-4&from=paste&height=322&id=ufc1b061f&originHeight=643&originWidth=1093&originalType=binary&ratio=1&rotation=0&showTitle=false&size=47026&status=done&style=none&taskId=ue2d56536-bc8d-4408-9396-40a401cf77a&title=&width=546.5)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683534643136-9c1ad0cb-8cb3-49ce-bd10-2fcb2a85a114.png#clientId=u4cc63e5b-bd83-4&from=paste&height=483&id=u8c374194&originHeight=966&originWidth=1117&originalType=binary&ratio=1&rotation=0&showTitle=false&size=176871&status=done&style=none&taskId=u11d3b2ee-92c0-4616-af90-26b6c6f3ebf&title=&width=558.5)<br />我们这里使用 [Nest.js](https://github.com/nestjs/nest) （一个基于 Node.js 后端框架，注意不是 Next.js) 做演示

:::warning
注意：不要对框架和其他细节过多在意，文中大部分为伪代码，仅供示意
:::

<a name="kDxc6"></a>

#### 与 TypeScript 结合

不管前端还是后端 (Node.js 生态）, 目前主流的都是使用 `TypeScript`, 那么与 `GraphQL`结合首先会遇到第一个问题，那就是**类型，**上面讲到了 `GraphQL Schema`, **有自己的一套类型系统，也就意味着通常来说写两套类型，一套 **`**xx.ts**`**, 一套**`**xx.gql**`

```graphql
interface Salary {
  original: Int
  extra: Int
}

# 用户实体-演示
type User {
  id: ID!
  name: String!
  salary: Salary
}
```

一个笨方法就是写两套，但是不管是维护成本还是开发成本都会大大增加，好在 `Nest.js`中集成了根据 `TS`类型自动生成 `GraphQL`类型的方案 - [type-graphql](https://github.com/MichalLytek/type-graphql)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683544949340-75b70911-7a05-4c85-81c0-3e14b97569ad.png#clientId=u4cc63e5b-bd83-4&from=paste&height=848&id=u8657cb1b&originHeight=848&originWidth=1330&originalType=binary&ratio=1&rotation=0&showTitle=false&size=305611&status=done&style=none&taskId=u80c1e6df-096e-4f17-b1f4-534ef90eb62&title=&width=1330)

上面例子中的 `User` , 如下图，是一个普通的 `Ts Class`, 那么 `@Field` 装饰器就对应 GraphQL 的 `Field`<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683596882336-cebbc04f-1014-4afd-b8c8-1c291f1299d7.png#clientId=u4cc63e5b-bd83-4&from=paste&height=449&id=u35e58e87&originHeight=898&originWidth=1546&originalType=binary&ratio=1&rotation=0&showTitle=false&size=302855&status=done&style=none&taskId=u11749235-b464-4d62-b044-85330db1e56&title=&width=773)

然后 Node 服务启动的时候，会自动生成，不需要关心 GraphQL 层面的类型<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683596987627-e5edb32b-a319-4ec6-a3c0-141d9952c0ae.png#clientId=u4cc63e5b-bd83-4&from=paste&height=234&id=ue6931605&originHeight=277&originWidth=381&originalType=binary&ratio=1&rotation=0&showTitle=false&size=15467&status=done&style=none&taskId=ucfbe88dd-3994-4f1e-a955-febfcf5f59b&title=&width=321.5)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683597031099-b320c225-e62d-4829-ab0c-5fb92fa622e3.png#clientId=u4cc63e5b-bd83-4&from=paste&height=925&id=uace3978e&originHeight=1850&originWidth=1870&originalType=binary&ratio=1&rotation=0&showTitle=false&size=737023&status=done&style=none&taskId=u81052de6-38b1-4e38-84aa-7d4a3919ed2&title=&width=935)
<a name="kC7FE"></a>

#### Resolver

GraphQL 的 Resolver 可以理解成，传统 REST 的 Controller<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683597501568-b0378679-765d-4f93-8ba2-38b004758040.png#clientId=u4cc63e5b-bd83-4&from=paste&height=477&id=u702839b1&originHeight=954&originWidth=1436&originalType=binary&ratio=1&rotation=0&showTitle=false&size=383314&status=done&style=none&taskId=u62cdb42f-450c-4547-842b-5a3b2b5a2ab&title=&width=718)<br />当一个 Query 发起查询时

```graphql
{
  user {
     id
    name
  }
}
```

Resolver 需要做的就是处理这个查询，查询 `user` 这个实体，返回 `id`和 `name`这个数据，需要返回什么前端说了算

而 Query 是可以嵌套的，想象一下 如果我还想查询 `user`下的 `salary` 通常这些数据不会存存在一张数据表中，那么 salary 通常对应 `Salary`实体，那么 salary 也可以对应一个 `Resolver`, 也就是 `salary`是 `user`的一个子查询，而不是传统的通过 `left join`之类的处理方式聚合数据，最后 `GraphQL`会帮你聚合其他，统一在 `user` 查询中返回

```graphql
{
  id
  name
  salary: {
    original
    extra
  }
}
```

```typescript
@Resolver()
export class UserResolver {
  constructor(private readonly salaryService: SalaryService)

  @ResolveProperty(() => Salary)
  public async salary(): Promise<number> {
    this.salaryService.get()
  }
}

```

如果按照非常变态的领域模型来看的话，Query 的 Field 可以拆的很细，其对应的 Resolver 也可以很多，也就意味着 一个 Field 对应数据库的一条查询。

如果是批量查询话，也就意味着 query 会查询多次，想象一下如果我们现在查询所有的 `users`, 对应的 `Resolver`如下

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683598607910-aacdc180-4da4-4836-a2d1-9af96a80a10e.png#clientId=u4cc63e5b-bd83-4&from=paste&height=184&id=ucc8113ab&originHeight=368&originWidth=1356&originalType=binary&ratio=1&rotation=0&showTitle=false&size=136967&status=done&style=none&taskId=u6d795058-712d-4af5-bb9f-34a72e04f5f&title=&width=678)<br />query 如下：

```graphql
{
  users {
    id
    name
    salary: {
      original
      extra
    }
  }
}
```

那么每一条 `salary`对应的 query 会查询多次，比较冗余，（也就是 N+1 问题） , 有问题就有解法，GraphQL 官方提供了 [dataloader](https://github.com/graphql/dataloader) 来解决这个问题，它可以对查询进行缓存和聚合，可以简单的理解成它是一个防抖函数，当所有 Field 的 Query 完成后，统一触发一次批量查询，这里简单了解即可。

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683598940867-9624225b-a8bc-4a83-815b-4315961a1c06.png#clientId=u4cc63e5b-bd83-4&from=paste&height=428&id=u3448e043&originHeight=855&originWidth=897&originalType=binary&ratio=1&rotation=0&showTitle=false&size=146243&status=done&style=none&taskId=uc3338905-3342-4908-ba4e-6d56ce1c76b&title=&width=448.5)
<a name="rb6sJ"></a>

#### Query 查询

![查询全部/单个查询](https://intranetproxy.alipay.com/skylark/lark/0/2023/gif/6356643/1683536580392-227e11dc-8c7b-4704-b46e-987168113a09.gif#clientId=u4cc63e5b-bd83-4&from=paste&height=439&id=u981dd534&originHeight=878&originWidth=1368&originalType=binary&ratio=1&rotation=0&showTitle=true&size=2887406&status=done&style=none&taskId=u9d8728c5-b256-480a-9d80-02ce9b8c3f9&title=%E6%9F%A5%E8%AF%A2%E5%85%A8%E9%83%A8%2F%E5%8D%95%E4%B8%AA%E6%9F%A5%E8%AF%A2&width=684 "查询全部/单个查询")

<a name="FLVm4"></a>

#### Mutations 变更

![新增一个用户，并返回当前用户的信息](https://intranetproxy.alipay.com/skylark/lark/0/2023/gif/6356643/1683599253560-e81a40bd-dbfb-4a6f-9e06-9fd5348f493a.gif#clientId=u4cc63e5b-bd83-4&from=paste&height=422&id=udb4babeb&originHeight=844&originWidth=1422&originalType=binary&ratio=1&rotation=0&showTitle=true&size=1560734&status=done&style=none&taskId=u665b2ea5-9597-47b8-ae7a-3c688e86521&title=%E6%96%B0%E5%A2%9E%E4%B8%80%E4%B8%AA%E7%94%A8%E6%88%B7%2C%20%E5%B9%B6%E8%BF%94%E5%9B%9E%E5%BD%93%E5%89%8D%E7%94%A8%E6%88%B7%E7%9A%84%E4%BF%A1%E6%81%AF&width=711 "新增一个用户，并返回当前用户的信息")
<a name="OqyHU"></a>

#### Docker 部署

由于 docker 里面没有写入文件的权限，这样会带来一个问题，由于启动应用的时候

```bash
...

RUN node dist/index.js
```

会自动生成 schema 文件，也就是 fs.writeFile 这样会导致 docker 启动不了，所以需要小小修改下 GraphqlModule 的配置

- 方法 1 :

```typescript
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { UserModule } from './user.module'

const schema = resolve(__dirname, 'schema.gql')

@Module({
  imports: [
    GraphQLModule.forRoot({
      path: '/graphql',
      autoSchemaFile: process.env.NODE_ENV === 'development' ? schema : false,
      typePaths: [schema],
    }),
    UserModule,
  ]
})
export class AppModule

```

在 development 的时候 会生成 schema.gql, 在 production 环境下 关闭自动生成<br />同时指定 typePaths 为 schema.gql 这样既可解决

- 方法 2 :

首先 使用 type-graphql 提供的 buildSchema, 在每次 构建镜像的时候 将这个文件 copy 进去既可

```typescript
import { buildSchema } from "type-graphql";

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [__dirname + "/**/*.resolver.ts"],
  });

  // other initialization code, like creating http server
}

bootstrap();
```

<a name="fv0WT"></a>

#### 权限验证

:::warning
这个不同的框架/库处理方式，仅做简单介绍，不过过多在意代码细节
:::
在 `express`中 可以通过 中间键 拦截 request 来做权限验证，在 `Nest.js`中 可以很方便的 使用 `Guards` 实现

```typescript
import { Args, Resolver, ResolveProperty } from '@nestjs/graphql'
import { AuthGuard } from './auth.guard'

...

@Resolver()
@UseGuards(AuthGuard)
export class UserResolver {}
```

由于 GraphQL 有一个 `context` 的概念 可以通过 `context` 拿到 当前的 request, 然后可以配合常用的 `JWT`做一些权限验证，在每次 Resolver 处理 Query 的时候，没有权限就直接返回 401 之类的处理

```typescript
// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext()
    const request = context.switchToHttp().getRequest()

    // 做一些权限验证
    // jwt 验证
    // request.headers.authorization
  }
}
```

<a name="YRGtm"></a>

### 道理我都懂，为什么 GraphQL 不火？

这里引用 2016 年，一个连 Vue 都不会的楼主的回答<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/6356643/1683600030561-a43f46ff-658d-45d4-8698-4f4d0bb957fb.png#clientId=u4cc63e5b-bd83-4&from=paste&height=405&id=u9d76efad&originHeight=810&originWidth=711&originalType=binary&ratio=1&rotation=0&showTitle=false&size=179315&status=done&style=none&taskId=ueeed2a5d-7387-4680-bd16-50bfdcc4279&title=&width=355.5)

说下自己的理解：

- 可以但没必要：想象一下大部分业务场景，我如果就是一个后端管理系统，倘若我前端 React 全家桶，后端 Java SpringBoot 全家桶 JPA/lombok 一把唆，分分钟搞定 CRUD, 阁下该如何应对？生态摆在这里，正所谓当你不知道你该不该用 GraphQL 时，那么就是不需要，为了用而用，大可不必。
- 就差一个程序猿了：如果业务特别复杂，场景特别适合用 GraphQL, 那么问题来了，哪个倒霉蛋来接？
  - 前端：后端你接一下吧，帮我写好 Resolver, 我直接想查啥就查啥，不是爽歪歪？
  - 后端：你爽了，那业务逻辑是放在我这边还是你这边？听下来我只需要分好模型，每个模型写好各自的 Resolver, 你来写业务逻辑，自己拼 query 就好了
  - 前端：那这样吧，你加一个 BFF, 保证你后端逻辑的干净，业务逻辑在 BFF 处理
  - 后端：那你用 Node 搭一个 BFF 吧，这些事情你们来做要好一点
  - ...

如果是全栈团队，前后端都自己来搞，用 GraphQL 还是比较舒服，一旦分工明确，通常的一种妥协方案就是加 BFF, 而且是前端用 Node 搭 BFF, 来做各种适配和转换，这些都是属于前端的工作，个人认为是得不偿失

<a name="R2KpR"></a>

### 最后

本文简单介绍了 GraphQL 的一些基本概念 和一些实际的使用场景，除此之外还有很多炫酷的 [特性](https://graphql.org/learn/), 篇幅有限，就不一一列举了，文中示例代码，可在 GitHub 中 [查看](https://github.com/lijinke666/graphql-share-demo).

<a name="TRQg9"></a>

#### 🔗 参考链接

- [Nest.js 与 GraphQL 在项目中的实际应用](https://juejin.cn/post/6844903908427448328)
- [GraphQL 为何没有火起来？](https://www.zhihu.com/question/38596306/answer/79714979)
- [Nest.js](https://docs.nestjs.com/graphql/interfaces)
- [GraphQL 官网](https://graphql.org/learn/)
