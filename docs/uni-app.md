# uni-app 接入

## 1. 支持范围

| 平台 | 是否可用 | 说明 |
| --- | --- | --- |
| H5 | 可用 | uni-app 编译到 H5 后就是普通浏览器环境，直接用 |
| App（Android / iOS） | 不可用 | 组件依赖 `contenteditable` 与 DOM，App 端 WebView 里渲染的是原生组件树 |
| 小程序 | 不可用 | 同上，且小程序组件不允许 `contenteditable` |

App / 小程序端请降级为 `<textarea>`：

```vue
<!-- #ifdef H5 -->
<mobile-editor v-model="html" placeholder="请输入内容" />
<!-- #endif -->
<!-- #ifndef H5 -->
<textarea v-model="html" class="plain-textarea" maxlength="-1" />
<!-- #endif -->
```

## 2. 安装与注册

```bash
npm i vue-h5-editor
```

不要用 easycom 自动扫描：easycom 只扫 `components/` 目录，npm 包需要手动注册。

uni-app 的 Vue 2 项目：

```vue
<template>
  <view class="editor-wrap">
    <mobile-editor v-model="html" :upload-image="uploadImage" :pick-image="pickImage" />
  </view>
</template>

<script>
import MobileEditor from "vue-h5-editor"; // Vue 3 的 uni-app 改成 vue-h5-editor/vue3

export default {
  components: { MobileEditor },
  data() {
    return { html: "" };
  },
  methods: {
    // 选图：交给 uni 的原生能力
    pickImage() {
      return new Promise((resolve) => {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          success: (res) => resolve(res.tempFiles[0]),
          fail: () => resolve(null),
        });
      });
    },
    // 上传：返回可直接访问的图片地址
    uploadImage(file) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: "https://your-api.example.com/upload",
          filePath: file.path || file,
          name: "file",
          success: (res) => {
            let data = {};
            try {
              data = JSON.parse(res.data);
            } catch (e) {
              reject(new Error("上传返回格式错误"));
              return;
            }
            if (data.url) {
              resolve(data.url);
            } else {
              reject(new Error(data.msg || "上传失败"));
            }
          },
          fail: () => reject(new Error("上传失败")),
        });
      });
    },
  },
};
</script>

<style>
.editor-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
```

uni-app 的 Vue 3 项目在 `main.js` 里全局注册：

```js
import App from "./App.vue";
import { createSSRApp } from "vue";
import MobileEditor from "vue-h5-editor/vue3";

export function createApp() {
  const app = createSSRApp(App);
  app.component("MobileEditor", MobileEditor);
  return { app };
}
```

## 3. 页面布局

组件根节点是 `height: 100%`，页面必须给出确定高度。注意开启自定义导航栏时，顶部高度要自己留：

```vue
<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">发布公告</view>
    <scroll-view scroll-y class="body" :style="{ flex: 1, minHeight: 0 }">
      <view class="editor-wrap">
        <mobile-editor v-model="html" />
      </view>
    </scroll-view>
  </view>
</template>
```

建议：

- 不要把编辑器放进 `scroll-view` 再套一层滚动。编辑器正文区自己滚动，外层再滚动会出现双滚动条，键盘弹起时也容易错位
- 底部工具栏是 `position: fixed`，会盖在 tabBar 之上（z-index 10000）。tabBar 页面请在外层留出高度，或进入编辑态时 `uni.hideTabBar()`
- iPhone 底部安全区由组件按键盘高度处理；未弹键盘时如需留白，在页面层加 `padding-bottom: env(safe-area-inset-bottom)`

## 4. 图片链路

默认的取图方式是原生 `<input type="file">`，在 uni-app 的 H5 端可用。如果你需要调用系统相机、压缩或多选，请传 `pickImage`：

- `pickImage` 返回 `File` / `Blob` → 继续交给 `uploadImage`
- `pickImage` 返回字符串 → 视为图片地址直接插入（适合自己在 `pickImage` 里就完成上传的场景）

`uploadImage` 返回空值时不插入图片；抛错时把 `error.message` 显示在底部 toast。

## 5. 已知差异与注意事项

- **`body` 的 `user-select`**：部分 uni-app 页面样式会给 `body` 设置 `user-select: none`，导致 iOS 上 contenteditable 收不到输入。组件内部已对 `.tiptap` 恢复 `user-select: text`，若仍无输入，检查全局样式优先级
- **H5 路由与层级**：组件是普通 Vue 组件，不涉及页面栈；但 `fixed` 面板在 `uni-popup` 等原生弹层下可能被遮挡，需要时把宿主弹层 `z-index` 提到 10001 以上
- **SSR / 预渲染**：组件在模块加载时会访问 `document`，不要在 Node 端导入
- **构建**：直接用包内 `dist` 产物，不需要把 `vue-h5-editor` 加入 `transpileDependencies`
- **不要同时装载两套**：Vue 2 项目只能用默认入口或 `/vue2`

## 6. 和 uni 内置 `editor` 组件的取舍

uni-app 自带的 `<editor>` 组件在 App / 小程序端可用，但：

- 输出格式是它自己的 delta JSON，不是标准 HTML
- 样式和交互定制空间小，跨端表现差异大

如果需求只在 H5 端出现富文本（例如 PC/H5 管理端发公告，App 端只读展示），用 `vue-h5-editor` 更省事；需要三端都能编辑时，两端方案要分开维护。
