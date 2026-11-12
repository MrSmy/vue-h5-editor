# 使用指南

## 1. 产物与入口

包内提供两套产物，共用同一份 `src/MobileEditor.vue`：

```text
dist/vue2/index.common.js     CJS，Vue 2
dist/vue2/index.esm.js        ESM，Vue 2
dist/vue2/index.umd.min.js    浏览器直连，Vue 2
dist/vue3/index.common.js     CJS，Vue 3
dist/vue3/index.esm.js        ESM，Vue 3
dist/vue3/index.umd.min.js    浏览器直连，Vue 3
```

引入方式：

```js
import MobileEditor from "vue-h5-editor";       // Vue 2（默认入口）
import MobileEditor from "vue-h5-editor/vue2";  // Vue 2（显式）
import MobileEditor from "vue-h5-editor/vue3";  // Vue 3
```

样式随 JS 注入，不需要额外引入 CSS 文件。

## 2. 内容读写

组件对外就是 HTML 字符串：

```vue
<mobile-editor v-model="html" />
```

- 初始值来自 `v-model`，首次挂载时写入编辑器
- 用户编辑后通过 `input`（Vue 2）和 `update:modelValue`（Vue 3）回传
- 外部修改 `v-model` 时，仅在编辑器**未聚焦**的情况下同步进编辑器，避免打断正在输入的用户

如果需要在聚焦状态下强制覆盖内容，先让编辑器失焦：

```js
this.$refs.editor.hideKeyboard();
this.html = "<p>新的内容</p>";
```

## 3. 图片上传

### 3.1 默认行为（不配置）

不传 `uploadImage` 时，选中的图片会被读成 base64 直接写进 HTML。适合本地演示，不适合生产：内容体积会随图片线性增长。

### 3.2 上传到自己的服务

```js
async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const { url } = await res.json();
  return url; // 必须是可直接放进 <img src> 的地址
}
```

- 返回空值：静默忽略，不插入图片
- 抛错或 reject：把 `error.message` 显示在底部 toast
- 返回非字符串（如 `{ url }`）：当前版本不解析，请直接在函数里返回字符串

### 3.3 自定义取图

有些环境拿不到标准的 `File`（例如 uni-app App 端、需要先压缩、需要多选），用 `pickImage` 接管取图：

```js
async function pickImage() {
  const { tempFiles } = await uni.chooseImage({ count: 1 });
  return tempFiles[0]; // Blob/File：继续走 uploadImage
  // return "https://cdn.example.com/a.png"; // 字符串：直接作为图片地址插入
}
```

`pickImage` 返回 `File` / `Blob` 时会继续交给 `uploadImage`，返回字符串则跳过上传直接插入。

## 4. 样式定制

组件没有使用 scoped 样式，所有规则都挂在根类 `.mobile-editor` 下，宿主可以用更高优先级覆盖：

```css
/* 正文行高 */
.mobile-editor .tiptap {
  line-height: 1.8;
}

/* 底部工具栏高度 */
.mobile-editor .dock-toolbar {
  height: 64px;
}

/* 图片最大高度 */
.mobile-editor .tiptap img {
  max-height: 320px;
}
```

常用类名：

| 类名 | 作用 |
| --- | --- |
| `.mobile-editor` | 根容器（`height: 100%` 的纵向 flex） |
| `.tiptap-scroll` | 正文滚动区 |
| `.tiptap` | ProseMirror 编辑区 |
| `.keyboard-dock` | 键盘上方浮层容器 |
| `.dock-panel` | 面板内容区 |
| `.dock-toolbar` | 底部入口栏 |
| `.mobile-editor-toast` | 内部 toast |

浮层 `z-index`：面板 10000，toast 10001。宿主弹窗层级需要高于这个值。

## 5. 键盘与安全区

- 面板使用 `position: fixed` + `bottom: 键盘高度`，键盘高度通过 `window.visualViewport` 实时计算
- Android WebView 调起键盘会缩高布局视口，因此不能依赖挂载时记录的初始高度
- 底部工具栏没有加 `env(safe-area-inset-bottom)`，宿主如需适配 iPhone 底部安全区，请在外层容器留出内边距

## 6. 常见问题

**Q：Vue 3 项目报 `vue.defineComponent is not a function`？**
引入错入口了。Vue 3 必须用 `vue-h5-editor/vue3`。

**Q：编辑器区域一片空白 / 高度只有几像素？**
根节点是 `height: 100%`，父容器必须有确定高度。参考：

```css
.editor-wrap { height: 100vh; }
/* 或者在 flex 布局里 */
.page { display: flex; flex-direction: column; height: 100vh; }
.editor-wrap { flex: 1; min-height: 0; }
```

**Q：iOS 上点了编辑区但键盘不出来、也输不进字？**
检查宿主页面是否给 `body` 设置了 `user-select: none`。组件内部已对 `.tiptap` 恢复 `user-select: text`，但部分全局样式会连带禁用 contenteditable 的输入。

**Q：粘贴进来的 HTML 会原样保留吗？**
不会。内容经过 Tiptap schema 过滤，只保留组件支持的节点和标记（标题、列表、表格、图片、行内样式等）。

**Q：能加更多格式（引用、代码块、链接）吗？**
需要改源码：在 `createEditor()` 的 `extensions` 里加对应扩展，再在 `.dock-panel` 里加入口。组件没有暴露插槽式工具栏，这是有意的取舍——移动端面板空间有限。

**Q：同一个页面能同时用 Vue 2 和 Vue 3 产物吗？**
不能。两套产物各自依赖对应版本的 Tiptap 适配层，同时加载会冲突。

## 7. 测试与验证建议

- 真机重点验证：iOS Safari 键盘弹起/收起、Android WebView 键盘遮挡、中文输入法组合输入
- 内容往返：把组件输出的 HTML 再赋值回 `v-model`，确认样式与结构不丢失
- 图片链路：上传失败、返回空、返回非图片地址三种异常

## 8. 已知限制

- 仅支持 H5，依赖 `contenteditable`
- 表格固定 3×3，不支持调整列宽与增删行列
- 界面文案为中文，未提供 i18n
- 图片不压缩，不校验尺寸与体积
- 没有提供 TypeScript 类型声明
