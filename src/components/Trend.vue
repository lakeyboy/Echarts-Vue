<template>
  <!-- 模板中 最外层只有 -->
  <div class="com-container">
    <!-- 显示图表的div对象 -->
    <div class="com-chart" ref="trend_ref">11</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstance: null,
      allData: null
    }
  },
  //生命周期函数，组件创建时执行
  mouted() {
    this.initChart()
    this.getData()
    //监听屏幕变化
    window.addEventListener('resize', this.screenAdapter)
    //组件创建时 也需要适配屏幕大小
    this.screenAdapter()
  },
  //生命周期函数，组件销毁时执行
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    initChart() {
      //初始化后会返回一个实例对象
      this.chartInstance = this.$echarts.init(this.$refs.rend_refs)
      const initOption = {}
      this.chartInstance.setOption(initOption)
    },
    //获取数据
    async getData() {
      this.updateChart()
    },
    // 更新数据
    updateChart() {
      const dataOption = {}
      this.chartInstance.setOption(dataOption)
    },
    //屏幕尺寸变化
    screenAdapter() {
      const adapterOption = {}
      this.chartInstance.setOption(adapterOption)
      //必须调用实例对象的resize方法，才会实时变化
      this.chartInstance.resize()
    }
  }
}
</script>

<style lang='less' scoped>
</style>