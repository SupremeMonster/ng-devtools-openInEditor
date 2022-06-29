# 一、根据组件name匹配
#### Step1 注意一下版本，1.0.5之前 只支持根据name匹配，1.0.5支持路径和name匹配，openInEditor方法第二个参数为“path”或“name”

```
   npm install ng-devtools-open-editor-middleware@1.0.5 -d 
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
                middleware: openInEditor("code","name"),
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
                "devServer": "prepend"  //添加这一行
                "module":{
                    rules": "append",
                }
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



# 二、根据组件路径匹配

#### Step1 

```
   npm install ng-devtools-open-editor-middleware@1.0.5 -d 
```

#### Step2

extra-webpack.config.js


```
const openInEditor = require("ng-devtools-open-editor-middleware");
....
....
module.exports = {
    resolveLoader: {
        alias: {
            "add-location": path.resolve("./add-location.js"),
        },
    },
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
                middleware: openInEditor("code","name"),
            });
            return middlewares;
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "add-location",
                exclude: [/\.(spec|e2e|service|module)\.ts$/],
            },
        ],
       ...
    },
};

```

#### Step3 extra-webpack.config.js同级新建add-location.js
add-location.js
```
const path = require("path");
module.exports = function (source) {
    if (source.indexOf("constructor(") >= 0) {
        const { resourcePath, rootContext } = this;

        /**add-
         * path.relative 根据当前src路径得到源码的相对路径
         */

        const rawShortFilePath = path
            .relative(rootContext || process.cwd(), resourcePath)
            .replace(/^(\.\.[\/\\])+/, "");
        // console.log("rawShortFilePath", rawShortFilePath);
        source = source.replace(
            "constructor",
            "sourcePath ='" +
                rawShortFilePath.replace(/\\/g, "/") +
                "';\n\nconstructor"
        );
    }

    return source;
};

```

#### Step4 angular.json

```
    "customWebpackConfig": {
      "path": "./extra-webpack.config.js",
      "mergeRules": {
        "resolveLoader": "prepend",
        "devServer": "prepend",
        "module": {
          "rules": "prepend"   // rules改成prepend
        } 
      },
      "replaceDuplicatePlugins": false  //replaceDuplicatePlugins改为false
    },
```

#### Step5 app.component.ts
```
    openSourceInEditor($event) {
     if (environment.production) return;
        $event.preventDefault();
        const path = $event.path;
        let sourcePath = '';
        for (let i = 0; i < path.length; i++) {
            const { localName } = path[i];
            if (localName && localName.indexOf('app-') >= 0) {
                if (path[i].__ngContext__?.component) {
                    sourcePath = path[i].__ngContext__.component.sourcePath;
                } else {
                    const temp = path[i].__ngContext__.find(
                        (e) =>
                            e &&
                            e.sourcePath &&
                            e.sourcePath.indexOf(
                                `${localName.substring(
                                    localName.indexOf('-') + 1,
                                    localName.length - 1
                                )}`
                            )
                    );
                    sourcePath = temp.sourcePath;
                }
                break;
            }
        }
        fetch(`__open-in-editor?file=${sourcePath}`)
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

# 三、总结

同样操作，前者基本能满足95%的场景，配置也稍微简单点；后者保证存在组件名称相同的情况下能够正确打开，且基本秒打开，右键如何获取组件的属性可以调试看下。
