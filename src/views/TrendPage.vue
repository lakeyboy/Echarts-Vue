<template>
  <div class="com-page">
    <trend/>
  </div>
</template>

<script>
import Trend from '@/components/Trend'

export default {
  data() {
    return {}
  },
  methods: {},
  //进行组件注册后才可以使用，前提是要注册的组件需要导入才可以
  components: {
    trend: Trend
  }
}
</script>

<style lang='less' scoped>
</style>