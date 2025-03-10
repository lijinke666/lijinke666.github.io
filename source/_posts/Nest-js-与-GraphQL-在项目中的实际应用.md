---
title: Nest.js 与 GraphQL 在项目中的实际应用
date: 2019-08-07 16:29:33
tags: node.js, nest.js, graphql
---

### 前言

最近项目中在做一个 `BFF`, `nest.js` 和 `GraphQL` 这两个技术栈 是一个"新"的尝试，虽然 `GraphQL` 在 `15` 年就出来了，但是在与 `nest.js` 结合，得益于作者良好的封装，发生了奇妙的化学反应

当然这不是一篇 粘贴官方文档 然后教你如何使用的 水文，而是采坑心得的 水文

### 巨人的肩膀

- `type-graphql` 将 `typescript` 的定义转成 `graphql` 的 `schema`
- `@nestjs/graphql` 是 作者 在 [apollo-server](https://github.com/apollographql/apollo-server) 的基础上进行了 2 次封装
- `data-loader` 数据的聚合与缓存 解决 `resolver (n+1)` 的问题

### 应用入口

在这里我们以一个 `UserModule` 为例

可以通过

```
query UserList() {
  users {
    id
    name
  }
}
```

得到

```
{
  data: {
    users: [{
      id: "1",
      name: '名字'
    }]
  }
}
```

```js
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { UserModule } from './user.module'

@Module({
  imports: [
    GraphQLModule.forRoot({
      path: '/graphql',
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class',
      },
    }),
    UserModule,
  ]
})
export class AppModule
```

在这里 每次 启动应用的时候 会遍历所有的 `graphql` schema 文件 生成 `graphql.ts`

例如

```
type User {
  id: ID!
  name: String
}
```

会生成

```ts
export class User {
  id: string;
  name?: string;
}
```

然后我们写 `resolver` 和 `service` 的时候 就可以用 `graphql.ts` 生成好的类型定义，但是这种方式有一点不方便，有点不符合编程习惯

如果想要先写 `typescript` 的定义，生成 `graphql` 的 `schema` 文件，那么就要用到 `type-graphql` 了

```js
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { UserModule } from './user.module'
import { resolve } from 'path'

const schema = resolve(__dirname, 'schema.gql')

@Module({
  imports: [
    GraphQLModule.forRoot({
      path: '/graphql',
      autoSchemaFile: schema,
      typePaths: [schema],
    }),
    UserModule,
  ]
})
export class AppModule
```

最后 只需要写对应的 `model` 即可

```js
import { Field, ID } from 'type-graphql'

export class User {
  @Field(() => ID, { nullable: false })
  id: string

  @Field({ nullable: false })
  name?: string
}
```

这里可以理解 是对 `graphql` schema 的一个隐射 , `@Field` 装饰器映射的是 `schema` 里面 `id` 的类型

`Class User` 的 id 描述的 `ts` 的类型

值得注意的是 `string` | `boolean` 等 基础 类型 `@Field` 可以省略，但是 `number` 默认会转成 `float`, 所以需要显示声明，这点比较坑

另外一点是如果是枚举，需要使用 `registerEnumType` 注册一次

```js
import { registerEnumType } from 'type-graphql'

export enum Enum {
  a,
  b
}

registerEnumType(Enum, {
  name: 'RolesEnum'
})

// 使用
export class User {

  @Field(() => Enum, { nullable: false })
  name?: Enum
}
```

### Resolver

在 `nest.js` 里 一个 `Graphql` 模块 由 `resolver` 和 `service` 组成

```ts
import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  providers: [UserResolver, UserService],
})
export class UserModule {}
```

```ts
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

每个 `@Query` 装饰器 对应一个 方法 默认会将函数的名字 当成 query 的名字 , 使用 name 可以显示的指定，

这样当发起一个 `Query` 时，对应的 `Resolver` 会调用对应的 `service` 处理逻辑，即可

```graphql
query users {
  id
  name
}
```

如果想查询第三个字段 `age` 但是 `age` 又不在 `User` 的数据里，比如要调另外一个接口查询，这时候 可以用到 `@ResolveProperty`

```ts
import { Args, Resolver, ResolveProperty } from '@nestjs/graphql'

...

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService)

  @ResolveProperty(() => number)
  public async age(): Promise<number> {
    this.userService.getAge()
  }
}
```

但是别忘了 在 `model` 里面加上 `age` 字段

```js
import { Field, ID } from 'type-graphql'

export class User {
  @Field(() => ID, { nullable: false })
  id: string

  @Field({ nullable: false })
  name?: string

  @Field(()=> Number, { nullable: false })
  age?: number
}
```

这样查询的时候 `Resolver` 会帮你合并在一起

```graphql
query users {
  id
  name
  age
}
```

```js
 {
   id: '1',
   name: 'xx',
   age: 18
 }
```

### DateLoader

由于 `Resolver` 的 [N+1](https://itnext.io/what-is-the-n-1-problem-in-graphql-dd4921cb3c1a) 查询问题

像上面 `this.userService.getAge()`, 会执行多次，如果是 执行一些 `sql` 可能会有性能问题，和资源浪费，但是问题不大，

我们用 `dataloader` 来解决这个问题

```ts
import DataLoader from 'dataloader';

@Injectable()
export class UserService {
  loader = new DataLoader(() => {
    return 一些查询操作；
  });
  getAge() {
    this.loader.load();

    // 查询多个 this.loader.loadMany()
  }
}
```

原理大概就是 把当前 event loop 的 请求 放在 `process.nextTick` 去执行

### Docker 部署

由于 `docker` 里面没有写入文件的权限，这样会带来一个问题，由于启动应用的时候

```Dockerfile

...

RUN node dist/index.js
```

会自动生成 `schema` 文件，也就是 `fs.writeFile` 这样会导致 `docker` 启动不了，所以需要小小修改下 `GraphqlModule` 的配置

- 方法 1 :

```ts
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

在`development`的时候 会生成 `schema.gql`, 在 `production` 环境下 关闭自动生成

同时指定 `typePaths` 为 `schema.gql` 这样既可解决

- 方法 2 :

```Dockerfile

...

COPY schema.gql /dist
RUN node dist/index.js
```

首先 使用 `type-graphql` 提供的 `buildSchema` 事实上 `nest.js` 的 `GraphqlModule` 也是使用的这个方法帮你自动生成的

```js
import { buildSchema } from 'type-graphql';

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [__dirname + '/**/*.resolver.ts'],
  });

  // other initialization code, like creating http server
}

bootstrap();
```

在每次 构建镜像的时候 将这个文件 copy 进去既可

### 权限验证

在 `express` 中 可以通过 中间键 拦截 `request` 来做权限验证，在 `nest.js` 中 可以很方便的 使用 `Guards` 实现

```ts
import { Args, Resolver, ResolveProperty } from '@nestjs/graphql'
import { AuthGuard } from './auth.guard'

...

@Resolver()
@UseGuards(AuthGuard)
export class UserResolver {
  constructor(private readonly userService: UserService)

  @ResolveProperty(() => number)
  public async age(): Promise<number> {
    this.userService.getAge()
  }
}
```

由于 `Graphql` 有一个 `context` 的概念 可以通过 `context` 拿到 当前的 `request`

```ts
// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext();
    const request = context.switchToHttp().getRequest();

    // 做一些权限验证
    // jwt 验证
    // request.headers.authorization
  }
}
```

### 转换 error response

由于使用的事 `apollo-server`, 在每次 `Query` 或 `Mutation` 报错时，发送到前端的 `错误` 层级会很深，

如果想自定义可以使用 `formatError` 和 `formatResponse`, 但由于 这两个字段 `nest.js` 并没有提供 相应详细的定义

可能要去看下 `apollo-server` 的文档才行，尽管 TMD 文档只有几行

```ts
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
      context(ctx) {
        // 在 context 里面 添加一些 东西 ctx.req
        ctx.xx  = 1
        return ctx
      }
      formatError(error) {
        return error
      },
      formatResponse(response, {context}){
        // 这里进行重写
        // data, errors 是 graphql 的规范 无法覆盖

        return {
          errors: {}
        }

        // ❌ 这样是不行的
        return {
          name: 1,
          age: 18
        }

        // ✅
        return {
          data: {
            name: 1,
            age: 18
          }
        }
      }
    }),
    UserModule,
  ]
})
export class AppModule
```

### 测试

你可能想写一点 `单元测试` 或者 `e2e 测试` , 文档都有，这里就不当搬运工了

### 最后

当然，踩坑的心酸 远不止 这一点点文字，这一次也是收获颇多，继续加油
