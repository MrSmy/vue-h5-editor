const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const demo = path.join(root, "demo");

// demo 页面只引用相对路径，本地和 GitHub Pages 用同一份文件
const copies = [
  ["node_modules/vue/dist/vue.min.js", "runtime/vue2.js"],
  ["node_modules/vue3/dist/vue.global.prod.js", "runtime/vue3.js"],
  ["dist/vue2/index.umd.js", "lib/vue2.js"],
  ["dist/vue3/index.umd.js", "lib/vue3.js"],
];

for (const [from, to] of copies) {
  const src = path.join(root, from);
  const dest = path.join(demo, to);
  if (!fs.existsSync(src)) {
    console.error(`缺少 ${from}，先执行 npm run build`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`${from} -> demo/${to}`);
}
