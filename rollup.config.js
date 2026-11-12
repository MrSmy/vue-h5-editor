const path = require("path");
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs");
const replace = require("@rollup/plugin-replace");
const vue = require("rollup-plugin-vue");
const { terser } = require("rollup-plugin-terser");
const pkg = require("./package.json");

const name = "H5RichEditor";
const umdFile = path.join("dist", "h5-rich-editor.umd.js");

const plugins = [
  nodeResolve({ extensions: [".js", ".vue"] }),
  commonjs(),
  vue({ css: true }),
];

// 浏览器直接跑的产物没有 process 对象，tiptap / prosemirror 里的 NODE_ENV 判断需要提前替换
const browserPlugins = [
  replace({
    preventAssignment: true,
    "process.env.NODE_ENV": JSON.stringify("production"),
  }),
  ...plugins,
];

// 供打包器使用的产物：tiptap 作为依赖外置，避免与宿主重复打包
const libExternal = [/^vue$/, /^@tiptap\//, /^prosemirror-/];
// CDN 产物：只外置 vue，tiptap 全部打进来，保证单文件可用
const umdExternal = [/^vue$/];
const globals = { vue: "Vue" };

module.exports = [
  {
    input: "src/index.js",
    external: libExternal,
    plugins,
    output: { file: pkg.main, format: "cjs", exports: "named" },
  },
  {
    input: "src/index.js",
    external: libExternal,
    plugins,
    output: { file: pkg.module, format: "es" },
  },
  {
    input: "src/index.js",
    external: umdExternal,
    plugins: browserPlugins,
    output: { file: umdFile, format: "umd", name, globals, exports: "named" },
  },
  {
    input: "src/index.js",
    external: umdExternal,
    plugins: [...browserPlugins, terser()],
    output: { file: pkg.unpkg, format: "umd", name, globals, exports: "named" },
  },
];
