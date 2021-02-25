<template>
  <!-- 模板中 最外层只有 -->
  <div class="com-container">
    <!-- 显示图表的div对象 -->
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle"
      >&#xe6ef;</span
    >
    <span class="iconfont arr-right" @click="toRight" :style="comStyle"
      >&#xe6ed;</span
    >
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currenIndex: 0, //当前显示的是哪一部分的数据
      titleFontSize: 0
    }
  },
  created() {
    this.$socket.registerCallBack('hotData', this.getData)
  },
  //生命周期函数，组件创建时执行
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send(
      // 发送服务器数据
      {
        action: 'getData',
        socketType: 'hotData',
        chartName: 'hot',
        value: ''
      }
    )
    //监听屏幕变化
    window.addEventListener('resize', this.screenAdapter)
    //组件创建时 也需要适配屏幕大小
    this.screenAdapter()
  },
  //生命周期函数，组件销毁时执行
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unregisterCallBack('hotData')
  },
  computed: {
    catName() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currenIndex].name
      }
    },
    comStyle() {
      return {
        //需要加px,因为在元素对象中使用，需要有px
        fontSize: this.titleFontSize + 'px'
      }
    }
  },
  methods: {
    initChart() {
      //初始化后会返回一个实例对象
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, 'chalk')
      const initOption = {
        title: {
          text: '▍热销商品的占比',
          left: 20,
          top: 20
        },
        //表示图例
        legend: {
          top: '15%',
          icon: 'circle'
        },
        tooltip: {
          show: true,
          //自定义提示框中的内容
          //值可以是一个函数
          //参数arg表示鼠标经过的扇区的信息
          //series中设置给图表的数据,就是arg中的data
          formatter: (arg) => {
            const thirdCategory = arg.data.children
            let total = 0
            thirdCategory.forEach((item) => {
              total += item.value
            })
            let retStr = ''
            thirdCategory.forEach((item) => {
              retStr += `
              ${item.name}:${parseInt((item.value / total) * 100) + '%'}
              <br/>
              `
            })
            return retStr
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            //意思是当饼图处于高亮时的 表现
            //控制某个模块名字的显示和隐藏，不是提示框
            emphasis: {
              label: {
                show: true
              },
              //   label边缘的线
              labelLine: {
                show: false
              }
            }
          }
        ]
      }

      this.chartInstance.setOption(initOption)
    },
    //获取数据
    getData(ret) {
      // const { data: ret } = await this.$http.get('hot')
      this.allData = ret

      this.updateChart()
    },
    // 更新数据  显示出图表
    updateChart() {
      const legendData = this.allData[this.currenIndex].children.map((item) => {
        return item.name
      })
      // this.allData[0] 表示是一个饼图的数据
      const seriesData = this.allData[this.currenIndex].children.map((item) => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })

      const dataOption = {
        legend: {
          data: legendData
        },
        //图表类型需要配置，不然会报错
        series: [
          {
            data: seriesData
          }
        ]
      }

      this.chartInstance.setOption(dataOption)
    },
    //屏幕尺寸变化
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize / 2,
          itemHeight: this.titleFontSize / 2,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 6,
            center: ['50%', '60%']
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      //必须调用实例对象的resize方法，才会实时变化
      this.chartInstance.resize()
    },
    // 向左切换数据
    toLeft() {
      this.currenIndex--
      if (this.currenIndex < 0) {
        this.currenIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    //向右切换数据
    toRight() {
      this.currenIndex++
      if (this.currenIndex > this.allData.length - 1) {
        this.currenIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>

<style lang='less' scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}

.cat-name {
  position: absolute;
  right: 20%;
  bottom: 20px;
  color: white;
}
</style>