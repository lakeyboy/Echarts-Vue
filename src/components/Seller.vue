<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref">1</div>
  </div>
</template>

<script>
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
  //dom元素渲染后执行
  mounted() {
    this.initChart()
    this.getData()
  },
  destroyed() {
    clearInterval(this.timerId)
  },
  methods: {
    //初始化echartd对象,第二个参数是主题
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, 'chalk')
      //监听鼠标的移动
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    //获取服务器数据
    async getData() {
      const { data: ret } = await this.$http.get('seller')
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
      const option = {
        title: {
          text: '▍商家销售数据统计',
          textStyle: {
            fontSize: 50
          },
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
          type: 'category',
          data: sellerNames
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
              width: 66,
              color: '#2d3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: sellerValues,
            barWidth: 66,
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              barBorderRadius: [0, 33, 33, 0],
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
      this.chartInstance.setOption(option)
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
    }
  }
}
</script>

<style lang='less' scoped>
</style>