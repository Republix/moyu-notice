module.exports = {
  env: {
    node: true, // 启用Node.js全局变量和Node.js作用域
    es2021: true, // 启用ES2021语法
  },
  extends: [
    'eslint:recommended', // 使用ESLint推荐的规则
  ],
  parserOptions: {
    ecmaVersion: 12, // 允许解析最新的ECMAScript语法
    sourceType: 'module', // 允许使用ES模块
  },
  rules: {
    // 在此处添加自定义规则
    'no-console': 'off', // 允许使用console
    indent: ['error', 2], // 使用2个空格进行缩进
    quotes: ['error', 'single'], // 使用单引号
    semi: ['error', 'always'], // 要求使用分号
  },
};

