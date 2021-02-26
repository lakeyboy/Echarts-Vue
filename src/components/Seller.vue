<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentPage: 1, //当亲显示为第几页
      totalPage: 0, //一共多少页
      timerId: null //定时器标识
    }
  },
  created() {
    this.$socket.registerCallBack('sellData', this.getData)
  },
  //dom元素渲染后执行
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellData',
      chartName: 'seller',
      value: ''
    })
    // 监听屏幕变化
    window.addEventListener('resize', this.screenAdapter)
    //首次加载完成时，就进行屏幕的适配
    this.screenAdapter()
  },
  destroyed() {
    clearInterval(this.timerId)
    //组件销毁时，取消监听事件，防止内存泄漏
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unregisterCallBack('sellData')
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme() {
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  methods: {
    //初始化echartd对象,第二个参数是主题
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      // 分开设置option,首先是初始option的设置
      const initOption = {
        title: {
          text: '▍商家销售数据统计',
          left: 20,
          top: 20
        },
        // 设置坐标轴位置
        grid: {
          top: '15%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          //距离计算时是否把文字也包含进图表
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          //data的数据需要是数组
          type: 'category'
        },
        //鼠标经过时提示
        tooltip: {
          //触发条件
          trigger: 'axis',
          //延时
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2d3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              //指明颜色渐变的方向(x0,y0,x1,y1)
              //指明不同百分比之下的颜色的值
              //下面表示使用渐变颜色
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 不同%值下的颜色值
                {
                  offset: 0,
                  color: '#5052ee'
                },
                {
                  offset: 1,
                  color: '#ab6ee5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      //监听鼠标的移动
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    //获取服务器数据
    getData(ret) {
      // const { data: ret } = await this.$http.get('seller')
      this.allData = ret
      this.allData.sort((a, b) => {
        return a.value - b.value //从小到大排序，，b-a是从大到小排序
      })
      // 计算页数   %就是取余
      this.totalPage =
        this.allData.length % 5 === 0
          ? this.allData.length / 5
          : this / this.allData / 5 + 1
      this.updateChart()
      //启动定时器  3s后执行
      this.startInterval()
    },
    //更新图表
    updateChart() {
      // 根据页码显示数据   记得有个方法只需要开始值以及截取长度,不需要结尾值
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)

      // map会把返回值放到数组中
      const sellerNames = showData.map((item) => {
        return item.name
      })
      const sellerValues = showData.map((item) => {
        return item.value
      })
      //数据相关的 option
      const dataOption = {
        yAxis: {
          //data的数据需要是数组
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 设置定时切换数据
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }

      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        //更新图表
        this.updateChart()
      }, 5000)
    },
    //屏幕变化函数，完成屏幕适配
    screenAdapter() {
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6
      //和分辨率大小相关的配置
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        //鼠标经过时提示
        tooltip: {
          //延时
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,

            itemStyle: {
              //当设置为宽度一半时就会是圆角效果
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      //还需要手动调用图标的resize  才能产生效果,不调用不会随着屏幕实时发生变化
      this.chartInstance.resize()
    }
  }
}
</script>

<style lang='less' scoped>
</style>