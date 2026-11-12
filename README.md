# mobile-editor

面向移动端 H5 的富文本编辑器，基于 [Tiptap 2](https://tiptap.dev/) + Vue 2。
没有工具栏按钮行，把格式操作收进键盘上方的浮动面板，给移动端留出更多正文空间。

> English: A mobile-first rich text editor for H5, built on Tiptap 2 and Vue 2. Format controls live in a dock above the keyboard instead of a toolbar row.

## 特性

- 移动优先：底部浮动面板 + 键盘高度自适应（`visualViewport`），iOS / Android 都不会被键盘顶飞
- 标题 H1–H5、加粗 / 斜体 / 下划线 / 删除线、字号 12–20px、文字颜色
- 对齐、行高、首行缩进、有序 / 无序 / 待办列表
- 图片、表格、分割线插入
- 中文输入法组合态下不丢行内格式（Safari stored marks 兜底）
- 纯 HTML 进出（`v-model`），无自定义 JSON 协议
- 无 UI 框架依赖，原生标签 + scoped SCSS

## 安装

```bash
npm i mobile-editor
```

Tiptap 相关依赖已作为 dependencies 一并安装；`vue` 需要宿主项目自己提供（`^2.6.14`）。

## 用法

```vue
<template>
  <div class="editor-wrap">
    <mobile-editor v-model="html" placeholder="说点什么…" :upload-image="uploadImage" />
  </div>
</template>

<script>
import MobileEditor from "mobile-editor";

export default {
  components: { MobileEditor },
  data() {
    return { html: "<p>你好</p>" };
  },
  methods: {
    async uploadImage(file) {
      const form = new FormData();
      form.append("file", file);
      const { url } = await fetch("/api/upload", { method: "POST", body: form }).then(
        (res) => res.json()
      );
      return url;
    },
  },
};
</script>

<style>
/* 组件高度撑满父容器，父容器必须有确定高度 */
.editor-wrap {
  height: 100vh;
}
</style>
```

也可以全局注册：

```js
import Vue from "vue";
import MobileEditor from "mobile-editor";

Vue.use(MobileEditor); // 注册为 <mobile-editor>
```

CDN 直接引入（需要先加载 Vue 2）：

```html
<script src="https://unpkg.com/vue@2.6.14/dist/vue.js"></script>
<script src="https://unpkg.com/mobile-editor/dist/mobile-editor.umd.min.js"></script>
<script>
  new Vue({
    el: "#app",
    template: '<mobile-editor v-model="html" style="height:100vh" />',
    data: { html: "" },
  });
</script>
```

样式由 rollup-plugin-vue 以 `inject` 方式随 JS 注入，无需额外引入 CSS 文件。

## API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` / `v-model` | `String` | `""` | HTML 内容 |
| `placeholder` | `String` | `""` | 空内容时的提示文案 |
| `uploadImage` | `(file: File) => Promise<string>` | `null` | 图片上传函数，返回图片地址。不传时图片会以 base64 内联进内容，仅适合演示 |

`uploadImage` 抛错或 reject 时，组件会把 `error.message` 显示在底部 toast；不返回地址则静默忽略。

### Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `input` | `html: String` | 内容变化，配合 `v-model` 使用 |

### 方法

通过 `ref` 可以拿到组件实例，但编辑器本身已封装；如需扩展，请直接使用 `@tiptap` 的扩展机制改造源码。

## 高度与布局

组件根节点是 `height: 100%` 的纵向 flex 容器，正文区 `flex: 1` 内部滚动，底部面板固定定位。
父容器需要给出确定高度（如 `height: 100vh` 或 flex 布局里的剩余高度），否则正文区会塌陷。

## 浏览器支持

- iOS Safari 14+、Android Chrome 90+
- 桌面 Chrome / Edge / Safari 最新版
- 依赖 `window.visualViewport` 做键盘高度计算；不支持该 API 的环境只是不会额外抬升面板，功能不受影响

## 已知限制

- 只支持 Vue 2；Vue 3 需要把 `@tiptap/vue-2` 换成 `@tiptap/vue-3` 另行适配
- 界面文案目前是中文，尚未接入 i18n
- 表格只支持插入 3×3，不支持拖拽调整列宽
- 图片以 `<img>` 存储，未做尺寸压缩

## 本地开发

```bash
npm install
npm run build   # 产出 dist/
npm run demo    # 构建后起 http://localhost:5178/demo/
```

`npm run demo` 用 Python 起静态服务；没有 Python 时可以用任意静态服务器指向仓库根目录，打开 `demo/index.html`。

## License

[MIT](./LICENSE)
