<template>
  <!-- 模板中 最外层只有 -->
  <div class="com-container">
    255
    <!-- 显示图表的div对象 -->
    <div class="com-chart" ref="rank_ref"></div>
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
  mounted() {
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
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref)
      const initOption = {
        xAxis: {
          type: 'category'
        }
      }
      this.chartInstance.setOption(initOption)
    },
    //获取数据
    async getData() {
      const { data: ret } = await this.$http.get('rank')
      this.allData = ret

      this.updateChart()
    },
    // 更新数据
    updateChart() {
      // 省份数据  x轴
      const provinceArr = this.allData.map((item) => {
        return item.name
      })
      //省份对应的销售金额
      const valueArr = this.allData.map((item) => {
        return item.value
      })

      const dataOption = {
        xAxis: {
          data: provinceArr
        }
      }
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