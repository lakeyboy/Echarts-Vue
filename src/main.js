import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import SocketService from '@/utils/socket_service'

// 对服务端进行websocket的连接
SocketService.Instance.connect()
// 挂载到vue原型
Vue.prototype.$socket = SocketService.Instance
import axios from 'axios'
// 引入字体样式
import './assets/font/iconfont.css'
//引入css样式
import './assets/css/global.less'

// 配置请求基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
Vue.prototype.$http = axios

// 将全局echarts对象挂载到vue原型，
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
