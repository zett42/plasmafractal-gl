import Vue from "vue";
import "./plugins/bootstrap-vue";

import "./registerOptComp";
import App from "./App.vue";

import "./App.scss";

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
