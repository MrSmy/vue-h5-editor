import MobileEditor from "./MobileEditor.vue";

MobileEditor.install = function install(Vue) {
  Vue.component(MobileEditor.name, MobileEditor);
};

export default MobileEditor;
export { MobileEditor };
