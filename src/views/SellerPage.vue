// 该组件是针对/sellerpage这个路径显示的
// 在这个组件中通过组件注册的方式，显示Seller.vue这个组件,也就是父子组件关系

<template>
  <div class="com-page">
    <seller></seller>
  </div>
</template>

<script>
// @表示src
import Seller from '@/components/Seller'

export default {
  data() {
    return {}
  },
  methods: {},
  components: {
    seller: Seller
  }
}
</script>

<style lang='less' scoped>
</style>