import H5Editor from "./H5Editor.vue";

H5Editor.install = function install(Vue) {
  Vue.component(H5Editor.name, H5Editor);
};

export default H5Editor;
export { H5Editor };
