<template>
  <div class="com-page">
    <single-map />
  </div>
</template>

<script>
import Map from '@/components/Map'

export default {
  data() {
    return {}
  },
  methods: {},
  //   注册子组件
  components: {
    'single-map': Map
  }
}
</script>

<style lang='less' scoped>
</style>