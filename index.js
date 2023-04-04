const url = require("url");
const path = require("path");
var fs = require("fs");
const launch = require("../launch-editor");
const bigArr = [];
let lookingForString = null;
module.exports = (specifiedEditor, srcRoot, onErrorCallback) => {
    if (typeof specifiedEditor === "function") {
        onErrorCallback = specifiedEditor;
        specifiedEditor = undefined;
    }

    if (typeof srcRoot === "function") {
        onErrorCallback = srcRoot;
        srcRoot = undefined;
    }

    srcRoot = srcRoot || process.cwd();
    return function launchEditorMiddleware(req, res, next) {
        const { file } = url.parse(req.url, true).query || {};
        if (!file) {
            res.statusCode = 500;
            res.end(`请检查file参数！`);
        } else {
            //路由
            const filePath = path.resolve("./src");
            //关键字
            lookingForString = new RegExp(`(['"])${file}\\1`, "g")
            bigArr.length = 0;
            recursiveReadFile(filePath);
            const newArr = [...new Set(bigArr)];
            console.log("data—-->", newArr);
            if (newArr.length > 0) {
                launch(newArr[0], specifiedEditor, onErrorCallback);
            }
            res.end();
        }
    };
};

function recursiveReadFile(fileName) {
    if (!fs.existsSync(fileName)) return;
    if (isFile(fileName)) {
        check(fileName);
    }
    if (isDirectory(fileName)) {
        var files = fs.readdirSync(fileName);
        files.forEach(function (val, key) {
            var temp = path.join(fileName, val);
            if (isDirectory(temp)) recursiveReadFile(temp);
            if (isFile(temp)) check(temp);
        });
    }
}
function check(fileName) {
    var data = readFile(fileName);
    var exc = lookingForString;
    const arr = data.match(exc);
    if (!arr) return;
    bigArr.push(fileName);
}
function isDirectory(fileName) {
    if (fs.existsSync(fileName)) return fs.statSync(fileName).isDirectory();
}
function isFile(fileName) {
    if (fs.existsSync(fileName)) return fs.statSync(fileName).isFile();
}
function readFile(fileName) {
    if (fs.existsSync(fileName)) return fs.readFileSync(fileName, "utf-8");
}
