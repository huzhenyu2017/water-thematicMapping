// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import iView from 'iview';
import _global from './components/Global.vue';
import 'iview/dist/styles/iview.css';
import router from './router'
// import XLSX from 'xlsx';

// 全局变量的位置
Vue.prototype.__global__ = _global;

Vue.config.productionTip = false

Vue.use(iView);
// Vue.use(XLSX);


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
