### What's this
这是一个nodejs中间件，借鉴vue-devtools的open source code in editor能力，尝试在angular devtools实现同样的功能。该中间件的主要作用就是在src目录下根据angular的组件名称全文检索该组件路径。

### How  to use
```
npm install
```

在webpack配置中添加如下代码：
```
//Webpack5
    devServer: {
            setupMiddlewares: (middlewares, devServer) => {
                middlewares.unshift({
                    name: "open-editor",
                    path: "/__open-in-editor",
                    middleware: openInEditor("code"),
                });
                return middlewares;
            },
    },
// Webpack4 --
    devServer: {
        before(app){
            app.use('/__open-in-editor',openInEditor("code")
        }
    },
```

