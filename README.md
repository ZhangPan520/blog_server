### 描述

个人博客后端项目

### 技术栈

nodejs express mongoose jsonwebtoken nodemon

### 环境

```
    node:18.18.2
    npm:10.2.5
```

### 安装依赖

```
    npm install
```

### 调整 mongodb 连接地址

```
    在database下面index.js 中 dbConfig对象配置你的mongodb数据库信息，请注意如果你没有给mongodb设置过权限，不要给userName和pwd设置值
```

### 启动项目

```
    npm run start
```

### 项目搭建

```
    项目使用express-generator包，快速搭建，后期有时间准备用webpack，重新搭建一下，现目前开发的感觉不太友好
```

### 遇到的问题

##### 图片验证码相关文档

https://blog.csdn.net/weixin_43972992/article/details/105853342

##### 接口描述

```
"/register"

请求方式:"post"

传参：
{
    userName:{
        type:Sring,
        required:true,
    },
    passWord:{
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true
    }
}

返回值:
    {
        status:Number,
        token:String,
        msg:string
    }
```

```
"/getCode"

    请求方式:"get"

传参：无需传参

返回值:
    {
        status:Number,
        token:String,
        msg:string
    }
```

```
"/login"

请求方式:"post"

传参：
{
    userName:{
        type:Sring,
        required:true,
    },
    passWord:{
        type:String,
        required:true,
    },
}

返回值:
    {
        status:Number,
        token:String,
        msg:string
    }
```
