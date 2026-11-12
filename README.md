# vue-h5-editor

面向移动端 H5 的富文本编辑器，基于 [Tiptap 2](https://tiptap.dev/)。
同一份源码产出 Vue 2 与 Vue 3 两套产物，uni-app（H5 端）可直接使用。

没有常驻的工具栏按钮行：格式操作收进键盘上方的浮动面板，正文区留出更大空间，面板跟着键盘高度走。

> English: A mobile-first rich text editor for H5 built on Tiptap 2. Ships Vue 2 and Vue 3 builds, works in uni-app H5 projects. Format controls live in a dock above the keyboard instead of a toolbar row.

## 特性

- **键盘友好**：底部面板随 `visualViewport` 浮动，iOS / Android 键盘弹起后不会被顶飞或遮挡
- **格式齐全**：标题 H1–H5、加粗 / 斜体 / 下划线 / 删除线、字号 12–20px、文字颜色
- **段落能力**：对齐、行高、首行缩进、有序 / 无序 / 待办列表
- **插入内容**：图片、3×3 表格、分割线
- **输入法兼容**：中文组合输入结束不丢行内格式（Safari stored marks 兜底）
- **纯 HTML 进出**：`v-model` 直接是 HTML 字符串，没有自定义 JSON 协议
- **零 UI 依赖**：原生标签 + SCSS，不绑定 Element / Vant / uView

## 兼容矩阵

| 运行时 | 入口 | 说明 |
| --- | --- | --- |
| Vue 2.6+ | `vue-h5-editor`（默认）或 `/vue2` | `v-model` 走 `value` / `input` |
| Vue 3.2+ | `vue-h5-editor/vue3` | `v-model` 走 `modelValue` / `update:modelValue` |
| uni-app（H5） | 同上，按 uni-app 的 Vue 版本选择 | 依赖 DOM，**App / 小程序端不支持** |
| 原生 H5 | `dist/vue2/index.umd.min.js` | 需要页面里先有 Vue 全局变量 |

> 默认入口是 Vue 2 产物。Vue 3 项目请务必从 `/vue3` 引入，否则会在运行时因 Vue 2 适配层报错。

## 安装

```bash
npm i vue-h5-editor
```

`vue` 作为 peer 依赖由宿主项目提供（`^2.6.14 || ^3.2.0`）。Tiptap 相关依赖已随包安装。

## 快速开始

### Vue 3

```vue
<template>
  <div class="editor-wrap">
    <mobile-editor v-model="html" placeholder="说点什么…" :upload-image="uploadImage" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import MobileEditor from "vue-h5-editor/vue3";

const html = ref("<p>你好</p>");

async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const { url } = await fetch("/api/upload", { method: "POST", body: form }).then((r) => r.json());
  return url;
}
</script>

<style>
/* 组件根节点是 height:100%，父容器必须有确定高度 */
.editor-wrap { height: 100vh; }
</style>
```

### Vue 2

```vue
<template>
  <div class="editor-wrap">
    <mobile-editor v-model="html" placeholder="说点什么…" :upload-image="uploadImage" />
  </div>
</template>

<script>
import MobileEditor from "vue-h5-editor";

export default {
  components: { MobileEditor },
  data() {
    return { html: "<p>你好</p>" };
  },
  methods: {
    async uploadImage(file) {
      const form = new FormData();
      form.append("file", file);
      const { url } = await fetch("/api/upload", { method: "POST", body: form }).then((r) => r.json());
      return url;
    },
  },
};
</script>
```

也可以全局注册：

```js
import Vue from "vue";
import MobileEditor from "vue-h5-editor";

Vue.use(MobileEditor); // 注册为 <mobile-editor>
```

### uni-app（H5）

详见 [docs/uni-app.md](./docs/uni-app.md)。最短版本：

```vue
<script>
import MobileEditor from "vue-h5-editor"; // uni-app 是 Vue 2 时

export default {
  components: { MobileEditor },
};
</script>
```

### CDN

需要先加载对应版本的 Vue 全局构建：

```html
<!-- Vue 2 -->
<script src="https://unpkg.com/vue@2.6.14/dist/vue.js"></script>
<script src="https://unpkg.com/vue-h5-editor/dist/vue2/index.umd.min.js"></script>
<script>
  Vue.use(window.VueMobileEditor.default);
  new Vue({
    el: "#app",
    template: '<mobile-editor v-model="html" style="height:100vh" />',
    data: { html: "" },
  });
</script>
```

```html
<!-- Vue 3 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script src="https://unpkg.com/vue-h5-editor/dist/vue3/index.umd.min.js"></script>
<script>
  Vue.createApp({
    components: { MobileEditor: window.VueMobileEditor.default },
    data: () => ({ html: "" }),
    template: '<mobile-editor v-model="html" style="height:100vh" />',
  }).mount("#app");
</script>
```

## API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `v-model` | `String` | `""` | HTML 内容；Vue 2 用 `value`/`input`，Vue 3 用 `modelValue`/`update:modelValue` |
| `placeholder` | `String` | `""` | 空内容时的提示文案 |
| `uploadImage` | `(file: File) => Promise<string>` | `null` | 图片上传函数，返回图片地址；不传时图片会以 base64 内联进内容 |
| `pickImage` | `() => Promise<File \| string \| null>` | `null` | 自定义取图。返回 `File`/`Blob` 会继续走 `uploadImage`，返回字符串则直接作为图片地址插入；uni-app 里可接 `uni.chooseImage` |

### Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `input` | `html: String` | 内容变化（Vue 2 `v-model` 使用） |
| `update:modelValue` | `html: String` | 内容变化（Vue 3 `v-model` 使用） |

两个事件都会同时抛出，宿主按所用版本接一个即可。

## 高度与布局

组件根节点是 `height: 100%` 的纵向 flex 容器：正文区 `flex: 1` 内部滚动，底部面板 `position: fixed`。

父容器必须有确定高度（`height: 100vh`、或 flex 布局中的剩余高度），否则正文区会塌陷。宿主页面不要给 `body` 设置 `user-select: none`，否则 iOS 上 contenteditable 可能收不到输入。

## 更多文档

- [docs/guide.md](./docs/guide.md)：图片上传、样式定制、键盘与安全区、faq
- [docs/uni-app.md](./docs/uni-app.md)：uni-app 接入方式与平台边界

## 本地开发

```bash
npm install
npm run build   # 产出 dist/vue2、dist/vue3
npm run demo    # 构建后起 http://localhost:5178/demo/
```

`npm run demo` 用 Python 起静态服务；没有 Python 时用任意静态服务器指向仓库根目录，打开 `demo/index.html`。

## 已知限制

- 只支持 H5：编辑器依赖 `contenteditable` 与 DOM，uni-app 的 App / 小程序端不可用
- 界面文案目前是中文，未接入 i18n
- 表格固定 3×3，不支持拖拽调整列宽
- 图片以 `<img>` 原样保存，未做压缩与尺寸限制
- Vue 2 与 Vue 3 是两套产物，不能在同一页面同时加载两份

## License

[MIT](./LICENSE)
