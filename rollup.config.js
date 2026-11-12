const path = require("path");
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs");
const replace = require("@rollup/plugin-replace");
const postcss = require("rollup-plugin-postcss");
const vue2 = require("rollup-plugin-vue");
const vue3 = require("rollup-plugin-vue3");
const { terser } = require("rollup-plugin-terser");

const name = "VueMobileEditor";
const entry = "src/index.js";

// 同一份源码，Vue 3 构建时把 tiptap 的 Vue 2 适配层换成 Vue 3 适配层
const vue3Alias = {
  name: "vue3-alias",
  resolveId(source, importer) {
    if (source === "@tiptap/vue-2") {
      return this.resolve("@tiptap/vue-3", importer, { skipSelf: true });
    }
    return null;
  },
};

const tiptapExternal = [/^@tiptap\//, /^prosemirror-/];

function browserReplace() {
  return replace({
    preventAssignment: true,
    // 浏览器直接跑的产物没有 process 对象
    "process.env.NODE_ENV": JSON.stringify("production"),
  });
}

function build(version) {
  const isVue3 = version === "vue3";
  const dir = path.join("dist", version);
  const sfc = isVue3
    ? vue3({ preprocessStyles: true })
    : vue2({ css: true });
  const plugins = [
    ...(isVue3 ? [vue3Alias] : []),
    nodeResolve({ extensions: [".js", ".vue"] }),
    // 只处理 node_modules 里的 CJS，别去解析 .vue 的虚拟模板模块
    commonjs({ include: /node_modules/ }),
    sfc,
    ...(isVue3 ? [postcss({ inject: true, extract: false })] : []),
  ];
  // 打包器场景：Vue、tiptap 都由宿主提供；Vue 适配层很小，直接打进来省得用户再装
  const libExternal = (id) => {
    if (id === "@tiptap/vue-2" || id === "@tiptap/vue-3") return false;
    return /^vue$/.test(id) || tiptapExternal.some((re) => re.test(id));
  };
  // CDN 场景：只外置 vue，tiptap 打进产物
  const umdExternal = [/^vue$/];
  const globals = { vue: "Vue" };

  return [
    {
      input: entry,
      external: libExternal,
      plugins,
      output: { file: path.join(dir, "index.common.js"), format: "cjs", exports: "named" },
    },
    {
      input: entry,
      external: libExternal,
      plugins,
      output: { file: path.join(dir, "index.esm.js"), format: "es" },
    },
    {
      input: entry,
      external: umdExternal,
      plugins: [browserReplace(), ...plugins],
      output: {
        file: path.join(dir, "index.umd.js"),
        format: "umd",
        name,
        globals,
        exports: "named",
      },
    },
    {
      input: entry,
      external: umdExternal,
      plugins: [browserReplace(), ...plugins, terser()],
      output: {
        file: path.join(dir, "index.umd.min.js"),
        format: "umd",
        name,
        globals,
        exports: "named",
      },
    },
  ];
}

module.exports = [...build("vue2"), ...build("vue3")];
