<template>
  <div class="h5-editor">
    <div class="tiptap-scroll" @click="handleContentTap">
      <editor-content :editor="editor" class="tiptap-content" />
    </div>

    <div v-if="dockVisible" class="keyboard-dock" :style="dockStyle">
      <div v-if="activePanel === 'insert'" class="dock-panel">
        <div
          class="insert-item insert-image-item"
          @click.stop="handleDockAction('insert', 'image')"
        >
          <div class="insert-icon insert-icon-image"></div>
          <span class="insert-label">图片</span>
        </div>
        <div
          class="insert-item"
          @mousedown.prevent="handleDockAction('insert', 'table')"
          @touchstart.prevent.stop="handleDockAction('insert', 'table')"
          @click.stop="handleDockAction('insert', 'table')"
        >
          <div class="insert-icon insert-icon-table"></div>
          <span class="insert-label">表格</span>
        </div>
        <div
          class="insert-item"
          @mousedown.prevent="handleDockAction('insert', 'divider')"
          @touchstart.prevent.stop="handleDockAction('insert', 'divider')"
          @click.stop="handleDockAction('insert', 'divider')"
        >
          <div class="insert-icon insert-icon-divider"></div>
          <span class="insert-label">分割线</span>
        </div>
      </div>

      <div v-if="activePanel === 'heading'" class="dock-panel heading-panel">
        <div class="heading-scroll">
          <div
            v-for="item in headingOptions"
            :key="item.type"
            :class="[
              'heading-card',
              formatState.header === item.type ? 'is-active' : '',
            ]"
            @mousedown.prevent="handleDockAction('heading', item.type)"
            @touchstart.prevent.stop="handleDockAction('heading', item.type)"
          >
            <span class="heading-card-name">{{ item.name }}</span>
            <span class="heading-card-size">{{ item.size }}</span>
          </div>
        </div>
      </div>

      <div v-if="activePanel === 'font'" class="dock-panel font-panel">
        <div class="text-style-row">
          <div
            :class="['text-style-btn', formatState.bold ? 'is-active' : '']"
            @mousedown.prevent="handleDockAction('textStyle', 'bold')"
            @touchstart.prevent.stop="handleDockAction('textStyle', 'bold')"
          ><span class="ts-bold">B</span></div>
          <div
            :class="['text-style-btn', formatState.italic ? 'is-active' : '']"
            @mousedown.prevent="handleDockAction('textStyle', 'italic')"
            @touchstart.prevent.stop="handleDockAction('textStyle', 'italic')"
          ><span class="ts-italic">I</span></div>
          <div
            :class="['text-style-btn', formatState.through ? 'is-active' : '']"
            @mousedown.prevent="handleDockAction('textStyle', 'strike')"
            @touchstart.prevent.stop="handleDockAction('textStyle', 'strike')"
          ><span class="ts-strike">S</span></div>
          <div
            :class="['text-style-btn', formatState.underline ? 'is-active' : '']"
            @mousedown.prevent="handleDockAction('textStyle', 'underline')"
            @touchstart.prevent.stop="handleDockAction('textStyle', 'underline')"
          ><span class="ts-underline">U</span></div>
        </div>
        <div class="font-size-head">
          <span class="panel-section-title">字号微调</span>
          <span class="panel-section-hint">14~18px</span>
        </div>
        <div class="font-size-row">
          <div class="font-stepper">
            <div
              class="stepper-btn"
              @mousedown.prevent="handleDockAction('fontStep', -2)"
              @touchstart.prevent.stop="handleDockAction('fontStep', -2)"
            >−</div>
            <span class="stepper-value">{{ formatState.fontSize }}</span>
            <div
              class="stepper-btn"
              @mousedown.prevent="handleDockAction('fontStep', 2)"
              @touchstart.prevent.stop="handleDockAction('fontStep', 2)"
            >+</div>
          </div>
          <div
            v-for="size in fontSizeOptions"
            :key="size"
            :class="[
              'size-option',
              formatState.fontSize === size ? 'is-active' : '',
            ]"
            @mousedown.prevent="handleDockAction('fontSize', size)"
            @touchstart.prevent.stop="handleDockAction('fontSize', size)"
          >{{ parseInt(size) }}</div>
        </div>

        <div class="color-section-head">
          <span class="panel-section-title">文本颜色</span>
        </div>
        <div class="color-grid">
          <div
            v-for="color in colors"
            :key="color.value"
            class="color-item"
            @mousedown.prevent="handleDockAction('color', color.value)"
            @touchstart.prevent.stop="handleDockAction('color', color.value)"
          >
            <div
              :class="[
                'color-dot',
                isColorActive(color.value) ? 'is-active' : '',
              ]"
              :style="{ backgroundColor: color.value }"
            >
              <span v-if="isColorActive(color.value)" class="color-check">✓</span>
            </div>
            <span class="color-name">{{ color.name }}</span>
          </div>
          <div
            class="color-item"
            @mousedown.prevent="handleDockAction('clearColor')"
            @touchstart.prevent.stop="handleDockAction('clearColor')"
          >
            <div class="color-clear">ø</div>
            <span class="color-name">清除格式</span>
          </div>
        </div>
      </div>

      <div v-if="activePanel === 'paragraph'" class="dock-panel paragraph-panel">
        <span class="panel-section-title">对齐</span>
        <div class="paragraph-row">
          <div
            v-for="item in alignOptions"
            :key="item.value"
            :class="[
              'paragraph-btn',
              formatState.textAlign === item.value ? 'is-active' : '',
            ]"
            @mousedown.prevent="handleDockAction('align', item.value)"
            @touchstart.prevent.stop="handleDockAction('align', item.value)"
          >
            <div :class="['align-icon', 'align-icon-' + item.value]">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <span class="panel-section-title paragraph-spacing-title">段落间距</span>
        <div class="paragraph-row">
          <div
            :class="['paragraph-btn', formatState.indent ? 'is-active' : '']"
            @mousedown.prevent="handleDockAction('indent')"
            @touchstart.prevent.stop="handleDockAction('indent')"
          >
            <span class="indent-icon">≡›</span>
          </div>
          <div
            v-for="item in lineHeightOptions"
            :key="item.value"
            :class="[
              'line-height-btn',
              formatState.lineHeight === item.value ? 'is-active' : '',
            ]"
            @mousedown.prevent="handleDockAction('lineHeight', item.value)"
            @touchstart.prevent.stop="handleDockAction('lineHeight', item.value)"
          >{{ item.label }}</div>
        </div>
      </div>

      <div v-if="activePanel === 'list'" class="dock-panel list-panel">
        <div
          :class="['insert-item', formatState.listType === 'task' ? 'is-active' : '']"
          @mousedown.prevent="handleDockAction('list', 'task')"
          @touchstart.prevent.stop="handleDockAction('list', 'task')"
        >
          <div class="list-icon list-icon-task">☑</div>
          <span class="insert-label">待办</span>
        </div>
        <div
          :class="['insert-item', formatState.listType === 'ordered' ? 'is-active' : '']"
          @mousedown.prevent="handleDockAction('list', 'ordered')"
          @touchstart.prevent.stop="handleDockAction('list', 'ordered')"
        >
          <div class="list-icon list-icon-ordered"><span>1.</span></div>
          <span class="insert-label">有序</span>
        </div>
        <div
          :class="['insert-item', formatState.listType === 'bullet' ? 'is-active' : '']"
          @mousedown.prevent="handleDockAction('list', 'bullet')"
          @touchstart.prevent.stop="handleDockAction('list', 'bullet')"
        >
          <div class="list-icon list-icon-bullet"><span>•</span></div>
          <span class="insert-label">无序</span>
        </div>
      </div>

      <div class="dock-toolbar">
        <div
          :class="['dock-tool', activePanel === 'insert' ? 'is-active' : '']"
          @mousedown.prevent="handleDockAction('panel', 'insert')"
          @touchstart.prevent.stop="handleDockAction('panel', 'insert')"
        >
          <div class="tool-add">+</div>
          <span class="dock-tool-label">添加</span>
        </div>
        <div
          :class="['dock-tool', activePanel === 'heading' ? 'is-active' : '']"
          @mousedown.prevent="handleDockAction('panel', 'heading')"
          @touchstart.prevent.stop="handleDockAction('panel', 'heading')"
        >
          <span class="tool-text tool-text-t">T</span>
          <span class="dock-tool-label">正文</span>
        </div>
        <div
          :class="['dock-tool', activePanel === 'font' ? 'is-active' : '']"
          @mousedown.prevent="handleDockAction('panel', 'font')"
          @touchstart.prevent.stop="handleDockAction('panel', 'font')"
        >
          <span class="tool-text tool-text-aa">Aa</span>
          <span class="dock-tool-label">字体</span>
        </div>
        <div
          :class="['dock-tool', activePanel === 'paragraph' ? 'is-active' : '']"
          @mousedown.prevent="handleDockAction('panel', 'paragraph')"
          @touchstart.prevent.stop="handleDockAction('panel', 'paragraph')"
        >
          <div class="tool-align">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="dock-tool-label">段落</span>
        </div>
        <div
          :class="['dock-tool', activePanel === 'list' ? 'is-active' : '']"
          @mousedown.prevent="handleDockAction('panel', 'list')"
          @touchstart.prevent.stop="handleDockAction('panel', 'list')"
        >
          <div class="tool-list">
            <div class="tool-list-row"><span class="tool-list-dot"></span><span class="tool-list-line"></span></div>
            <div class="tool-list-row"><span class="tool-list-dot"></span><span class="tool-list-line"></span></div>
            <div class="tool-list-row"><span class="tool-list-dot"></span><span class="tool-list-line"></span></div>
          </div>
          <span class="dock-tool-label">列表</span>
        </div>
        <div
          class="dock-tool"
          @mousedown.prevent="handleDockAction('hideKeyboard')"
          @touchstart.prevent.stop="handleDockAction('hideKeyboard')"
        >
          <svg class="tool-keyboard" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.75 3.75H26.25C26.5815 3.75 26.8995 3.8817 27.1339 4.11612C27.3683 4.35054 27.5 4.66848 27.5 5V25C27.5 25.3315 27.3683 25.6495 27.1339 25.8839C26.8995 26.1183 26.5815 26.25 26.25 26.25H3.75C3.41848 26.25 3.10054 26.1183 2.86612 25.8839C2.6317 25.6495 2.5 25.3315 2.5 25V5C2.5 4.66848 2.6317 4.35054 2.86612 4.11612C3.10054 3.8817 3.41848 3.75 3.75 3.75ZM6.25 8.75V11.25H8.75V8.75H6.25ZM6.25 13.75V16.25H8.75V13.75H6.25ZM6.25 18.75V21.25H23.75V18.75H6.25ZM11.25 13.75V16.25H13.75V13.75H11.25ZM11.25 8.75V11.25H13.75V8.75H11.25ZM16.25 8.75V11.25H18.75V8.75H16.25ZM21.25 8.75V11.25H23.75V8.75H21.25ZM16.25 13.75V16.25H18.75V13.75H16.25ZM21.25 13.75V16.25H23.75V13.75H21.25Z" fill="currentColor"/>
          </svg>
          <span class="dock-tool-label">收起键盘</span>
        </div>
      </div>
    </div>

    <div v-if="toastText" class="h5-editor-toast">{{ toastText }}</div>
  </div>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-2";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
// 仅用于兼容历史公告里的底色标记，不再提供编辑入口
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

const FONT_SIZE_OPTIONS = ["12px", "14px", "16px", "18px", "20px"];
const MAX_FONT_SIZE = 20;
const MIN_FONT_SIZE = 12;
const KEYBOARD_HEIGHT_THRESHOLD = 100;

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) =>
              attributes.fontSize
                ? { style: `font-size: ${attributes.fontSize}` }
                : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

const ParagraphStyle = Extension.create({
  name: "paragraphStyle",
  addOptions() {
    return { types: ["paragraph", "heading"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) =>
              attributes.lineHeight
                ? { style: `line-height: ${attributes.lineHeight}` }
                : {},
          },
          indent: {
            default: null,
            parseHTML: (element) => element.style.textIndent || null,
            renderHTML: (attributes) =>
              attributes.indent
                ? { style: `text-indent: ${attributes.indent}` }
                : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ commands }) =>
          this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight })
          ),
      unsetLineHeight:
        () =>
        ({ commands }) =>
          this.options.types.every((type) =>
            commands.resetAttributes(type, "lineHeight")
          ),
      setIndent:
        (indent) =>
        ({ commands }) =>
          this.options.types.every((type) =>
            commands.updateAttributes(type, { indent })
          ),
      unsetIndent:
        () =>
        ({ commands }) =>
          this.options.types.every((type) =>
            commands.resetAttributes(type, "indent")
          ),
    };
  },
});

const DEFAULT_FORMAT_STATE = {
  header: "paragraph",
  fontSize: "16px",
  color: "#1F2329",
  bold: false,
  italic: false,
  underline: false,
  through: false,
  listType: "",
  textAlign: "left",
  lineHeight: "1.5",
  indent: false,
};

export default {
  name: "H5Editor",
  components: {
    EditorContent,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    // (file) => Promise<url>；不传则把图片转成 base64 内联进内容
    uploadImage: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      innerValue: this.value,
      editor: null,
      editorFocused: false,
      activePanel: "",
      toastText: "",
      toastTimer: null,
      fileInput: null,
      keyboardHeight: 0,
      lastDockAction: null,
      lastSelection: null,
      pendingImageSelection: null,
      formatState: { ...DEFAULT_FORMAT_STATE },
      headingOptions: [
        { name: "正文", type: "paragraph", size: "15px" },
        { name: "H1", type: "header1", size: "26px" },
        { name: "H2", type: "header2", size: "22px" },
        { name: "H3", type: "header3", size: "18px" },
        { name: "H4", type: "header4", size: "16px" },
        { name: "H5", type: "header5", size: "14px" },
      ],
      fontSizeOptions: FONT_SIZE_OPTIONS,
      alignOptions: [
        { value: "left" },
        { value: "center" },
        { value: "right" },
      ],
      lineHeightOptions: [
        { value: "1.5", label: "1.5x" },
        { value: "1.75", label: "1.75x" },
        { value: "2", label: "2.0x" },
      ],
      colors: [
        { name: "墨灰", value: "#1F2329" },
        { name: "企业蓝", value: "#1E6FFF" },
        { name: "警告红", value: "#D93026" },
        { name: "醒目橙", value: "#B35C00" },
        { name: "常青绿", value: "#1F7A3D" },
        { name: "灵感紫", value: "#6B3FA0" },
        { name: "曜石青", value: "#0F6B6B" },
        { name: "副标题灰", value: "#5C6470" },
      ],
    };
  },
  computed: {
    dockVisible() {
      return this.editorFocused || !!this.activePanel;
    },
    dockStyle() {
      // 始终 fixed：Android WebView 调起键盘后布局视口整体缩高，
      // 此时 bottom: 0 就是键盘上沿；absolute 会跟随 100vh 页面落到键盘后面。
      return {
        position: "fixed",
        left: "0",
        right: "0",
        bottom: `${this.keyboardHeight}px`,
        zIndex: 10000,
      };
    },
  },
  watch: {
    value(val) {
      if (val !== this.innerValue) {
        this.innerValue = val;
        if (this.editor && !this.editor.isFocused) {
          this.editor.commands.setContent(val || "", false);
          this.pendingMarks = null;
        }
      }
    },
  },
  created() {
    this.pendingMarks = null;
    this.restoreMarksTimer = null;
    this.compositionStartPos = null;
  },
  mounted() {
    this.createEditor();
    this.bindKeyboardListener();
  },
  beforeDestroy() {
    if (this.restoreMarksTimer) {
      clearTimeout(this.restoreMarksTimer);
      this.restoreMarksTimer = null;
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.removeFileInput();
    this.unbindKeyboardListener();
    this.unbindEditorFocusEvents();
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  },
  methods: {
    createEditor() {
      this.editor = new Editor({
        content: this.value || "",
        extensions: [
          StarterKit.configure({
            heading: { levels: [1, 2, 3, 4, 5] },
          }),
          Underline,
          TextStyle,
          Color,
          Highlight.configure({ multicolor: true }),
          TextAlign.configure({ types: ["heading", "paragraph"] }),
          Image.configure({ inline: false, allowBase64: true }),
          Placeholder.configure({ placeholder: this.placeholder || "" }),
          Table.configure({ resizable: false }),
          TableRow,
          TableHeader,
          TableCell,
          TaskList,
          TaskItem.configure({ nested: true }),
          FontSize,
          ParagraphStyle,
        ],
        editorProps: {
          attributes: {
            class: "tiptap",
          },
        },
        onUpdate: ({ editor }) => {
          const html = editor.getHTML();
          this.innerValue = html;
          this.$emit("input", html);
          this.syncFormatState();
        },
        onSelectionUpdate: () => {
          this.rememberSelection();
          this.syncFormatState();
          if (this.editor && this.editor.isFocused) {
            this.editorFocused = true;
          }
        },
        onCreate: () => {
          this.syncFormatState();
        },
      });
      this.bindEditorFocusEvents();
    },
    bindEditorFocusEvents() {
      const dom = this.editor && this.editor.view && this.editor.view.dom;
      if (!dom) {
        return;
      }
      dom.addEventListener("focus", this.handleEditorFocus);
      dom.addEventListener("blur", this.handleEditorBlur);
      dom.addEventListener("compositionstart", this.handleCompositionStart);
      dom.addEventListener("compositionend", this.handleCompositionEnd);
    },
    handleContentTap() {
      // iOS 上偶尔点空白区域不会把光标落进编辑器，这里兜底聚焦
      if (this.editor && !this.editor.isFocused) {
        this.editor.chain().focus("end").run();
      }
    },
    unbindEditorFocusEvents() {
      const dom = this.editor && this.editor.view && this.editor.view.dom;
      if (!dom) {
        return;
      }
      dom.removeEventListener("focus", this.handleEditorFocus);
      dom.removeEventListener("blur", this.handleEditorBlur);
      dom.removeEventListener("compositionstart", this.handleCompositionStart);
      dom.removeEventListener("compositionend", this.handleCompositionEnd);
    },
    handleEditorFocus() {
      this.editorFocused = true;
      this.syncKeyboardHeight();
      // 等浏览器把选区落到点击位置后，再恢复上次选择的行内格式
      this.scheduleMarksRestore();
    },
    handleEditorBlur() {
      this.editorFocused = false;
    },
    handleCompositionStart() {
      if (!this.editor) {
        return;
      }
      this.compositionStartPos = this.editor.state.selection.from;
    },
    handleCompositionEnd() {
      if (!this.editor || !this.pendingMarks || !this.pendingMarks.length) {
        this.compositionStartPos = null;
        return;
      }
      const start = this.compositionStartPos;
      this.compositionStartPos = null;
      if (start == null) {
        return;
      }
      // Safari 组合输入结束会丢失 stored marks，待 ProseMirror 落库后补回
      setTimeout(() => this.applyPendingMarksAfterComposition(start), 30);
    },
    applyPendingMarksAfterComposition(start) {
      if (!this.editor || !this.pendingMarks || !this.pendingMarks.length) {
        return;
      }
      const { selection } = this.editor.state;
      if (!selection.empty) {
        return;
      }
      const to = selection.from;
      const from = Math.max(0, Math.min(start, to));
      if (to <= from) {
        return;
      }
      const pendingColor = this.getMarksColor(this.pendingMarks);
      const currentColor = this.normalizeColor(
        this.editor.getAttributes("textStyle").color || ""
      );
      if (pendingColor && currentColor && pendingColor !== currentColor) {
        return;
      }
      this.editor
        .chain()
        .command(({ tr }) => {
          this.pendingMarks.forEach((mark) => tr.addMark(from, to, mark));
          return true;
        })
        .setTextSelection(to)
        .run();
      this.scheduleMarksRestore();
    },
    rememberTypingMarks() {
      if (!this.editor) {
        return;
      }
      const { selection, storedMarks } = this.editor.state;
      if (selection.from !== selection.to) {
        this.pendingMarks = null;
        return;
      }
      this.pendingMarks = (storedMarks || selection.$from.marks()).slice();
      this.scheduleMarksRestore();
    },
    scheduleMarksRestore() {
      if (this.restoreMarksTimer) {
        clearTimeout(this.restoreMarksTimer);
      }
      this.restoreTypingMarks();
      this.restoreMarksTimer = setTimeout(() => {
        this.restoreMarksTimer = null;
        this.restoreTypingMarks();
      }, 120);
    },
    restoreTypingMarks() {
      if (!this.editor || !this.pendingMarks) {
        return;
      }
      const { selection, tr } = this.editor.state;
      if (selection.from !== selection.to) {
        return;
      }
      const pendingColor = this.getMarksColor(this.pendingMarks);
      const currentColor = this.normalizeColor(
        this.editor.getAttributes("textStyle").color || ""
      );
      // 光标已在明确设置过其他颜色的文字里时，不覆盖该文字的颜色
      if (pendingColor && currentColor && pendingColor !== currentColor) {
        return;
      }
      this.editor.view.dispatch(tr.setStoredMarks(this.pendingMarks));
      this.syncFormatState();
    },
    getMarksColor(marks) {
      const mark = (marks || []).find((item) => item.type.name === "textStyle");
      return this.normalizeColor((mark && mark.attrs && mark.attrs.color) || "");
    },
    bindKeyboardListener() {
      if (typeof window === "undefined" || !window.visualViewport) {
        return;
      }
      window.visualViewport.addEventListener("resize", this.syncKeyboardHeight);
      window.visualViewport.addEventListener("scroll", this.syncKeyboardHeight);
      window.addEventListener("resize", this.syncKeyboardHeight);
    },
    unbindKeyboardListener() {
      if (typeof window === "undefined" || !window.visualViewport) {
        return;
      }
      window.visualViewport.removeEventListener("resize", this.syncKeyboardHeight);
      window.visualViewport.removeEventListener("scroll", this.syncKeyboardHeight);
      window.removeEventListener("resize", this.syncKeyboardHeight);
    },
    syncKeyboardHeight() {
      if (typeof window === "undefined" || !window.visualViewport) {
        return;
      }
      const viewport = window.visualViewport;
      // 布局视口必须实时读取：Android WebView 调起键盘时整个窗口会缩高，
      // 再用挂载时的初始高度相减会把键盘高度算两遍，工具栏被顶到页面顶部。
      const layoutHeight = Math.max(
        window.innerHeight || 0,
        document.documentElement ? document.documentElement.clientHeight : 0
      );
      const visibleHeight = viewport.height + viewport.offsetTop;
      const keyboardHeight = Math.max(0, layoutHeight - visibleHeight);
      this.keyboardHeight =
        keyboardHeight > KEYBOARD_HEIGHT_THRESHOLD
          ? Math.round(keyboardHeight)
          : 0;
    },
    handleDockAction(action, value) {
      if (!this.editor) {
        return;
      }
      // 只拦截同一次点击里 touchstart/mousedown 的重复触发，不能阻塞下一次点击
      const actionKey = `${action}:${value === undefined ? "" : value}`;
      const now = Date.now();
      if (
        this.lastDockAction &&
        this.lastDockAction.key === actionKey &&
        now - this.lastDockAction.time < 150
      ) {
        return;
      }
      this.lastDockAction = { key: actionKey, time: now };
      switch (action) {
        case "panel":
          this.rememberSelection();
          this.activePanel = this.activePanel === value ? "" : value;
          this.syncFormatState();
          break;
        case "heading":
          this.applyHeader(value);
          break;
        case "fontStep":
          this.stepFontSize(value);
          break;
        case "fontSize":
          this.applyFontSize(value);
          break;
        case "color":
          this.applyColor(value);
          break;
        case "clearColor":
          this.clearColor();
          break;
        case "align":
          this.applyAlign(value);
          break;
        case "indent":
          this.toggleIndent();
          break;
        case "lineHeight":
          this.applyLineHeight(value);
          break;
        case "textStyle":
          this.toggleMark(value);
          break;
        case "list":
          this.handleList(value);
          break;
        case "insert":
          this.handleInsert(value);
          break;
        case "hideKeyboard":
          this.hideKeyboard();
          break;
        default:
          break;
      }
    },
    syncFormatState() {
      const editor = this.editor;
      if (!editor) {
        return;
      }
      const headLevel = [1, 2, 3, 4, 5].find((level) =>
        editor.isActive("heading", { level })
      );
      const blockAttrs = headLevel
        ? editor.getAttributes("heading")
        : editor.getAttributes("paragraph");
      const textStyle = editor.getAttributes("textStyle") || {};
      this.formatState = {
        header: headLevel ? `header${headLevel}` : "paragraph",
        fontSize: textStyle.fontSize || "16px",
        color: textStyle.color || "#1F2329",
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        through: editor.isActive("strike"),
        listType: editor.isActive("taskList")
          ? "task"
          : editor.isActive("orderedList")
          ? "ordered"
          : editor.isActive("bulletList")
          ? "bullet"
          : "",
        textAlign: blockAttrs.textAlign || "left",
        lineHeight: blockAttrs.lineHeight || "1.5",
        indent: !!blockAttrs.indent,
      };
    },
    applyHeader(type) {
      const editor = this.editor;
      if (!editor) {
        return;
      }
      if (type === "paragraph") {
        editor.chain().focus().setParagraph().run();
      } else {
        const level = Number(String(type).replace("header", ""));
        if (editor.isActive("heading", { level })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().setHeading({ level }).run();
        }
      }
      this.syncFormatState();
    },
    applyFontSize(size) {
      if (!this.editor) {
        return;
      }
      this.editor.chain().focus().setFontSize(size).run();
      this.rememberTypingMarks();
      this.syncFormatState();
    },
    stepFontSize(delta) {
      const current = parseInt(this.formatState.fontSize, 10) || 16;
      const next = Math.min(
        MAX_FONT_SIZE,
        Math.max(MIN_FONT_SIZE, current + delta)
      );
      this.applyFontSize(`${next}px`);
    },
    applyColor(value) {
      if (!this.editor) {
        return;
      }
      this.editor.chain().focus().setColor(value).run();
      this.rememberTypingMarks();
      this.syncFormatState();
    },
    clearColor() {
      if (!this.editor) {
        return;
      }
      this.editor.chain().focus().unsetColor().run();
      this.rememberTypingMarks();
      this.syncFormatState();
    },
    isColorActive(value) {
      const current = this.formatState.color;
      return (
        !!current && this.normalizeColor(current) === this.normalizeColor(value)
      );
    },
    normalizeColor(value) {
      if (!value) {
        return "";
      }
      const color = String(value).trim().toLowerCase();
      if (color.startsWith("#")) {
        return color;
      }
      const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `#${[1, 2, 3]
          .map((index) => Number(match[index]).toString(16).padStart(2, "0"))
          .join("")}`;
      }
      return color;
    },
    applyAlign(value) {
      if (!this.editor) {
        return;
      }
      this.editor.chain().focus().setTextAlign(value).run();
      this.syncFormatState();
    },
    applyLineHeight(value) {
      if (!this.editor) {
        return;
      }
      this.editor.chain().focus().setLineHeight(value).run();
      this.syncFormatState();
    },
    toggleIndent() {
      if (!this.editor) {
        return;
      }
      if (this.formatState.indent) {
        this.editor.chain().focus().unsetIndent().run();
      } else {
        this.editor.chain().focus().setIndent("2em").run();
      }
      this.syncFormatState();
    },
    toggleMark(key) {
      if (!this.editor) {
        return;
      }
      const commands = {
        bold: "toggleBold",
        italic: "toggleItalic",
        underline: "toggleUnderline",
        strike: "toggleStrike",
      };
      const command = commands[key];
      if (!command) {
        return;
      }
      this.editor.chain().focus()[command]().run();
      this.rememberTypingMarks();
      this.syncFormatState();
    },
    handleList(type) {
      if (!this.editor) {
        return;
      }
      const chain = this.editor.chain().focus();
      if (type === "task") {
        chain.toggleTaskList().run();
      } else if (type === "ordered") {
        chain.toggleOrderedList().run();
      } else if (type === "bullet") {
        chain.toggleBulletList().run();
      }
      this.syncFormatState();
    },
    handleInsert(type) {
      if (!this.editor) {
        return;
      }
      // 选区在打开面板时已记录，这里不能覆盖：移动端失焦后 live selection 可能已被重置
      this.activePanel = "";
      if (type === "table") {
        const chain = this.editor.chain().focus();
        this.applySavedSelection(chain, this.lastSelection);
        chain.insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run();
        this.scrollEditorToSelection();
        return;
      }
      if (type === "divider") {
        this.insertDivider();
        return;
      }
      if (type === "image") {
        this.chooseImage();
      }
    },
    rememberSelection() {
      if (!this.editor) {
        return;
      }
      const { from, to } = this.editor.state.selection;
      this.lastSelection = { from, to };
    },
    applySavedSelection(chain, selection) {
      if (!chain || !this.editor) {
        return chain;
      }
      const saved = selection || this.lastSelection;
      if (!saved) {
        return chain;
      }
      const max = this.editor.state.doc.content.size;
      const from = Math.max(0, Math.min(saved.from, max));
      const to = Math.max(from, Math.min(saved.to, max));
      chain.setTextSelection({ from, to });
      return chain;
    },
    insertDivider() {
      try {
        const chain = this.editor.chain().focus();
        this.applySavedSelection(chain, this.lastSelection);
        if (chain.setHorizontalRule().run()) {
          this.showToast("已插入分割线");
          this.scrollEditorToSelection();
          return;
        }
      } catch (error) {
        // 特殊选区下 tiptap 可能抛 Position out of range，走兜底插入
      }
      if (
        this.insertBlockAfterSelection(
          { type: "horizontalRule" },
          this.lastSelection
        )
      ) {
        this.showToast("已插入分割线");
      }
    },
    insertImage(src) {
      if (!this.editor) {
        return;
      }
      const saved = this.pendingImageSelection || this.lastSelection;
      try {
        const chain = this.editor.chain().focus();
        this.applySavedSelection(chain, saved);
        if (chain.setImage({ src }).run()) {
          this.pendingImageSelection = null;
          this.scrollEditorToSelection();
          return;
        }
      } catch (error) {
        // 选区异常时走兜底插入
      }
      this.insertBlockAfterSelection({ type: "image", attrs: { src } }, saved);
      this.pendingImageSelection = null;
    },
    insertBlockAfterSelection(node, selection) {
      if (!this.editor) {
        return false;
      }
      try {
        const editor = this.editor;
        const docSize = editor.state.doc.content.size;
        const saved = selection || this.lastSelection;
        const from = saved
          ? Math.max(0, Math.min(saved.from, docSize))
          : editor.state.selection.from;
        const $pos = editor.state.doc.resolve(from);
        const pos = $pos.depth > 0 ? $pos.after(1) : docSize;
        const inserted = editor
          .chain()
          .focus()
          .insertContentAt(pos, [node, { type: "paragraph" }])
          .run();
        if (inserted) {
          this.scrollEditorToSelection();
        }
        return inserted;
      } catch (error) {
        this.showToast("当前位置无法插入，请换一行再试");
        return false;
      }
    },
    scrollEditorToSelection() {
      this.$nextTick(() => this.revealSelectionInEditor());
      setTimeout(() => this.revealSelectionInEditor(), 200);
    },
    getSelectionDomNode() {
      if (!this.editor) {
        return null;
      }
      const { selection } = this.editor.state;
      if (selection.node) {
        return this.editor.view.nodeDOM(selection.from) || null;
      }
      const at = this.editor.view.domAtPos(selection.from);
      const node = at && at.node;
      return node && node.nodeType === 3 ? node.parentElement : node;
    },
    revealSelectionInEditor() {
      if (!this.editor) {
        return;
      }
      const container = this.$el.querySelector(".tiptap-scroll");
      const target = this.getSelectionDomNode();
      if (!container || !target) {
        this.editor.commands.scrollIntoView();
        return;
      }
      const dock = this.$el.querySelector(".keyboard-dock");
      const dockHeight = dock ? dock.getBoundingClientRect().height : 0;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const padding = 16;
      // 固定工具栏（以及 iOS 键盘）会遮住容器底部，用实际可视底边计算滚动量
      const visibleTop = containerRect.top + padding;
      const visibleBottom = Math.min(
        containerRect.bottom,
        window.innerHeight - this.keyboardHeight
      ) - dockHeight - padding;
      if (targetRect.bottom > visibleBottom) {
        container.scrollTop += targetRect.bottom - visibleBottom;
      } else if (targetRect.top < visibleTop) {
        container.scrollTop -= visibleTop - targetRect.top;
      }
    },
    chooseImage() {
      this.activePanel = "";
      this.pendingImageSelection = this.lastSelection
        ? { ...this.lastSelection }
        : null;
      // 必须挂在 body 上：iOS Safari 里游离的 file input 点不动
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";
      input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        this.removeFileInput();
        if (file) {
          this.handleImageSelected(file);
        }
      });
      document.body.appendChild(input);
      this.fileInput = input;
      input.click();
    },
    removeFileInput() {
      if (this.fileInput && this.fileInput.parentNode) {
        this.fileInput.parentNode.removeChild(this.fileInput);
      }
      this.fileInput = null;
    },
    async handleImageSelected(file) {
      if (!file.type || !String(file.type).startsWith("image/")) {
        this.showToast("请选择图片文件");
        return;
      }
      try {
        const src = this.uploadImage
          ? await this.uploadImage(file)
          : await this.readFileAsDataUrl(file);
        if (src) {
          this.insertImage(src);
        }
      } catch (error) {
        this.showToast((error && error.message) || "上传失败");
      }
    },
    readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("读取图片失败"));
        reader.readAsDataURL(file);
      });
    },
    showToast(title) {
      this.toastText = title;
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
      this.toastTimer = setTimeout(() => {
        this.toastText = "";
        this.toastTimer = null;
      }, 1500);
    },
    hideKeyboard() {
      this.activePanel = "";
      this.editorFocused = false;
      if (this.editor) {
        this.editor.commands.blur();
      }
      if (typeof document !== "undefined" && document.activeElement) {
        document.activeElement.blur();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.h5-editor {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.tiptap-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.tiptap-content {
  flex: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.h5-editor ::v-deep .tiptap {
  flex: 1;
  min-height: 100%;
  padding: 8px 12px 24px;
  box-sizing: border-box;
  outline: none;
  color: #1f2329;
  /* 小于 16px 时 iOS 聚焦 contenteditable 会自动放大页面，固定定位浮层会随之错位 */
  font-size: 16px;
  line-height: 1.6;
  word-break: break-word;
  /* 部分移动端基础样式会给 body 设 user-select: none，iOS 上会连带让 contenteditable 收不到输入 */
  -webkit-user-select: text;
  user-select: text;
}

.h5-editor ::v-deep .tiptap p {
  margin: 0 0 8px;
}

.h5-editor ::v-deep .tiptap h1 {
  margin: 12px 0 8px;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.35;
}

.h5-editor ::v-deep .tiptap h2 {
  margin: 12px 0 8px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
}

.h5-editor ::v-deep .tiptap h3 {
  margin: 10px 0 6px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.h5-editor ::v-deep .tiptap h4 {
  margin: 10px 0 6px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.h5-editor ::v-deep .tiptap h5 {
  margin: 8px 0 6px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.h5-editor ::v-deep .tiptap ul,
.h5-editor ::v-deep .tiptap ol {
  margin: 0 0 8px;
  padding-left: 22px;
}

.h5-editor ::v-deep .tiptap ul[data-type="taskList"] {
  padding-left: 0;
  list-style: none;
}

.h5-editor ::v-deep .tiptap ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.h5-editor ::v-deep .tiptap ul[data-type="taskList"] li > label {
  flex-shrink: 0;
  margin-top: 4px;
}

.h5-editor ::v-deep .tiptap ul[data-type="taskList"] li > div {
  flex: 1;
  min-width: 0;
}

.h5-editor ::v-deep .tiptap ul[data-type="taskList"] li > div > p {
  margin: 0;
}

.h5-editor ::v-deep .tiptap ul[data-type="taskList"] input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.h5-editor ::v-deep .tiptap img {
  max-width: 100%;
  /* 限制图片高度，避免一张大图把编辑区占满、看不到输入位置 */
  max-height: 240px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.h5-editor ::v-deep .tiptap hr {
  /* 移动端 1px border 容易渲染不可见，改用 2px 背景条 */
  height: 2px;
  margin: 14px 0;
  border: none;
  border-radius: 1px;
  background: #c0c4cc;
}

.h5-editor ::v-deep .tiptap .tableWrapper {
  width: 100%;
  overflow-x: auto;
}

.h5-editor ::v-deep .tiptap table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.h5-editor ::v-deep .tiptap td,
.h5-editor ::v-deep .tiptap th {
  min-width: 80px;
  padding: 6px 8px;
  border: 1px solid #e5e6eb;
  vertical-align: top;
  box-sizing: border-box;
}

.h5-editor ::v-deep .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: #c0c4cc;
  pointer-events: none;
}

.keyboard-dock {
  background: #fff;
  border-top: 1px solid #e5e6eb;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
}

.dock-panel {
  /* 不用 vh：键盘弹起后部分容器会把版心高度算进 vh，导致面板被截断/出滚动 */
  max-height: 360px;
  padding: 10px 12px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #f3f6fb;
}

.panel-section-title {
  color: #1f2329;
  font-size: 12px;
  font-weight: 600;
}

.panel-section-hint {
  color: #8a9099;
  font-size: 10px;
}

.insert-item {
  position: relative;
  overflow: hidden;
  width: 31%;
  height: 64px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-right: 2%;
  border-radius: 8px;
  background: #fff;
  vertical-align: top;
}

.insert-item:last-child {
  margin-right: 0;
}

.insert-label {
  color: #1f2329;
  font-size: 11px;
}

.insert-icon {
  width: 24px;
  height: 24px;
  box-sizing: border-box;
}

.insert-icon-image {
  border: 1.5px solid #1f2329;
  border-radius: 4px;
  position: relative;
}

.insert-icon-image::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #1f2329;
}

.insert-icon-image::after {
  content: "";
  position: absolute;
  left: 3px;
  bottom: 4px;
  width: 10px;
  height: 7px;
  background: #1f2329;
  clip-path: polygon(0 100%, 40% 30%, 65% 60%, 100% 0, 100% 100%);
}

.insert-icon-table {
  border: 1.5px solid #1f2329;
  border-radius: 3px;
  background-image: linear-gradient(#1f2329, #1f2329),
    linear-gradient(#1f2329, #1f2329);
  background-size: 1.5px 100%, 100% 1.5px;
  background-position: center, center;
  background-repeat: no-repeat;
}

.insert-icon-divider {
  display: flex;
  align-items: center;
}

.insert-icon-divider::before {
  content: "";
  width: 24px;
  height: 1.5px;
  background: #1f2329;
}

.heading-panel {
  padding: 8px 6px;
}

.heading-scroll {
  display: flex;
  align-items: stretch;
  gap: 4px;
  overflow-x: auto;
}

.heading-card {
  flex: 1 1 0;
  min-width: 0;
  height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 8px;
  background: transparent;
}

.heading-card-name {
  color: #3d434b;
  font-size: 14px;
  font-weight: 500;
}

.heading-card-size {
  color: #8a9099;
  font-size: 10px;
}

.heading-card.is-active {
  background: #fff;
  box-shadow: 0 2px 8px rgba(30, 111, 255, 0.12);
}

.heading-card.is-active .heading-card-name {
  color: #1e6fff;
  font-weight: 700;
}

.heading-card.is-active .heading-card-size {
  color: #1e6fff;
}

.font-size-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.text-style-row {
  height: 38px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  background: #fff;
}

.text-style-btn {
  flex: 1;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 6px;
  color: #1f2329;
}

.text-style-btn.is-active {
  background: #e8f0ff;
  color: #1e6fff;
}

.ts-bold {
  font-size: 15px;
  font-weight: 700;
}

.ts-italic {
  font-size: 15px;
  font-style: italic;
}

.ts-strike {
  font-size: 15px;
  text-decoration: line-through;
}

.ts-underline {
  font-size: 15px;
  text-decoration: underline;
}

.font-size-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.font-stepper {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 8px;
  background: #fff;
}

.stepper-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f2329;
  font-size: 16px;
}

.stepper-value {
  min-width: 36px;
  text-align: center;
  color: #1f2329;
  font-size: 12px;
}

.size-option {
  width: 30px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #e8edf6;
  color: #5c6470;
  font-size: 12px;
}

.size-option.is-active {
  background: #1e6fff;
  color: #fff;
}

.color-section-head {
  margin-top: 10px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 6px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.color-dot,
.color-clear {
  width: 28px;
  height: 28px;
  box-sizing: border-box;
  border-radius: 50%;
}

.color-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}

.color-dot.is-active {
  border-color: #1e6fff;
  box-shadow: 0 0 0 2px #fff;
}

.color-check {
  color: #fff;
  font-size: 12px;
}

.color-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #5c6470;
  font-size: 14px;
}

.color-name {
  color: #5c6470;
  font-size: 10px;
}

.paragraph-panel .panel-section-title {
  display: block;
  margin-bottom: 8px;
}

.paragraph-spacing-title {
  margin-top: 10px;
}

.list-panel .insert-item {
  height: 64px;
}

.insert-item.is-active {
  background: #e8f0ff;
}

.insert-item.is-active .insert-label {
  color: #1e6fff;
  font-weight: 600;
}

.list-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f2329;
  font-size: 16px;
  font-weight: 600;
}

.list-icon-ordered,
.list-icon-bullet {
  font-size: 15px;
}

.paragraph-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.paragraph-btn {
  width: 36px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #fff;
}

.paragraph-btn.is-active {
  background: #1e6fff;
}

.align-icon {
  width: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.align-icon span {
  display: block;
  height: 2px;
  border-radius: 1px;
  background: #3d434b;
}

.align-icon-left span:nth-child(2) {
  width: 10px;
}

.align-icon-center span:nth-child(2) {
  width: 10px;
  align-self: center;
}

.align-icon-right span:nth-child(2) {
  width: 10px;
  align-self: flex-end;
}

.paragraph-btn.is-active .align-icon span {
  background: #fff;
}

.indent-icon {
  color: #3d434b;
  font-size: 15px;
  font-weight: 600;
}

.paragraph-btn.is-active .indent-icon {
  color: #fff;
}

.line-height-btn {
  min-width: 42px;
  height: 32px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #fff;
  color: #3d434b;
  font-size: 11px;
}

.line-height-btn.is-active {
  background: #1e6fff;
  color: #fff;
}

.dock-toolbar {
  display: flex;
  align-items: stretch;
  height: 56px;
  background: #fff;
}

.dock-tool {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #3d434b;
}

.dock-tool-label {
  font-size: 10px;
  line-height: 14px;
  color: #5c6470;
}

.dock-tool.is-active .dock-tool-label {
  color: #1e6fff;
}

.tool-add {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1.5px solid #3d434b;
  border-radius: 50%;
  color: #3d434b;
  font-size: 18px;
  line-height: 1;
}

.tool-text {
  height: 22px;
  line-height: 22px;
  color: #3d434b;
}

.tool-text-t {
  font-size: 17px;
  font-weight: 700;
}

.tool-text-aa {
  font-size: 15px;
  font-weight: 500;
}

.dock-tool.is-active .tool-text,
.dock-tool.is-active .tool-add {
  color: #1e6fff;
}

.dock-tool.is-active .tool-add {
  border-color: #1e6fff;
}

.tool-align {
  width: 18px;
  height: 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}

.tool-align span {
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 1px;
  background: #3d434b;
}

.tool-align span:nth-child(2) {
  width: 12px;
}

.dock-tool.is-active .tool-align span {
  background: #1e6fff;
}

.tool-list {
  width: 20px;
  height: 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}

.tool-list-row {
  display: flex;
  align-items: center;
  gap: 3px;
}

.tool-list-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #3d434b;
}

.tool-list-line {
  width: 12px;
  height: 2px;
  border-radius: 1px;
  background: #3d434b;
}

.dock-tool.is-active .tool-list-dot,
.dock-tool.is-active .tool-list-line {
  background: #1e6fff;
}

.tool-keyboard {
  width: 22px;
  height: 22px;
  display: block;
  color: #8a8a8f;
}

.h5-editor-toast {
  position: fixed;
  left: 50%;
  bottom: 96px;
  z-index: 10001;
  max-width: 70%;
  padding: 8px 14px;
  transform: translateX(-50%);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
}
</style>
