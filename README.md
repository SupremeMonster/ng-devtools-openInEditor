### What's this
这是一个nodejs中间件，借鉴vue-devtools的open source code in editor能力，尝试在angular devtools实现同样的功能。该中间件的主要作用就是在src目录下根据angular的组件名称全文检索该组件路径。


#### Step1 

```
   npm install ng-devtools-open-editor-middleware -d 
```


#### Step2

  看下你的项目是否支持自定义webpack，如果没有需要自行配置，（Cxcloud大部分是有的），在extra-webpack.config.js里添加devServer如下配置：
```
const openInEditor = require("ng-devtools-open-editor-middleware");
....
....
module.exports = {
    devServer: {
    // Webpack5以下
        before(app) {
            app.use("/__open-in-editor", openInEditor("code"));
        },  
    // Webpack5 
      setupMiddlewares: (middlewares, devServer) => {
            middlewares.unshift({
                name: "open-editor",
                path: "/__open-in-editor",
                middleware: openInEditor("code"),
            });
            return middlewares;
        },
    },
    module: {
       ...
    },
};

```

#### Step3

需要在angular.json中找到如下配置，添加 "devServer": "prepend"：

```
   "build":{
       ...
       "options":{
           "customWebpackConfig": {
              "path": "./extra-webpack.config.js",
              "mergeStrategies": {
                "module.rules": "append",
                "devServer": "prepend"  //添加这一行
              },
              "replaceDuplicatePlugins": true
            }, 
       }
   }
```

#### Step4
在应用的app.component.ts中添加如下：

```
    openSourceInEditor($event) {
        if (environment.production) return;
        $event.preventDefault();
        const path = $event.path;
        let componentName = '';
        for (let i = 0; i < path.length; i++) {
            const { localName } = path[i];
            if (localName && localName.indexOf('app-') >= 0) {
                componentName = localName;
                break;
            }
        }
        fetch(`__open-in-editor?file=${componentName}`)
            .then((res) => {})
            .catch((err) => {});
    }

      ...
      ngOnInit(): void {
           ...
            const listener = new WeakMap();
            listener.set(document.body, this.openSourceInEditor);
            document.body.addEventListener(
                'contextmenu',
                listener.get(document.body),
                false
            );
        }
```

#### Step5
重启项目，只需要在页面上右击你想打开的组件，会自动跳转到vscode中对应的组件源文件。
注意vscode terminal会打印：

```
正在查找，请稍等...
data---> [ ...]
```


注意： 由于nz-modal是脱离body的，因此暂不支持，正在寻找解决办法....
