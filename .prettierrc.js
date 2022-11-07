module.exports = {
    printWidth: 180, // 超过最大值换行
    tabWidth: 2, 
    semi: false, // 结尾不用分号
    singleQuote: true, // 使用单引号
    htmlWhitespaceSensitivity: "ignore",
    // # 在多行逗号分隔的句法结构中尽可能打印尾随逗号
    // # "es5"- 在 ES5 中有效的尾随逗号（对象、数组等）。TypeScript 中的类型参数中没有尾随逗号。
    // # "none"- 没有尾随逗号。
    // # "all"- 尽可能使用尾随逗号（包括函数参数和调用）。要运行，以这种方式格式化的 JavaScript 代码需要一个支持 ES2017（Node.js 8+ 或现代浏览器）或下级编译的引擎。这还可以在 TypeScript 中的类型参数中启用尾随逗号
    trailingComma: "es5",
    // # 每行单个属性
    // # 在 HTML、Vue 和 JSX 中每行强制执行单个属性。
    // # false- 不要每行强制执行单个属性。
    // # true- 每行强制执行单个属性。    
    singleAttributePerLine: false,
}