import Vue from 'vue'
import VueRouter from 'vue-router'
import SellerPage from '@/views/SellerPage'  //@表示src目录

Vue.use(VueRouter)

const routes = [
  {
    path: '/sellerpage',  //输入地址后要跳转的组件
    component: SellerPage
  }
]

const router = new VueRouter({
  routes
})

export default router
