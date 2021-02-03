import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 将全局echarts对象挂载到Vue原型对象上
Vue.prototype.$echarts = window.echarts

createApp(App).use(store).use(router).mount('#app')
