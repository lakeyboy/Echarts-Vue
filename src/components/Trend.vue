<template>
  <!-- 模板中 最外层只有 -->
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '▍' + showTitle }}</span>
      <!-- 类名就是导入的css字体名称 -->
      <span
        class="iconfont title-icon"
        @click="showChoice = !showChoice"
        :style="comStyle"
        >&#xe6eb;</span
      >
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div
          class="select-item"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handleSelect(item.key)"
        >
          <!-- 冒号加属性名表示动态属性绑定 -->
          {{ item.text }}
        </div>
      </div>
    </div>
    <!-- 显示图表的div对象 -->
    <div class="com-chart" ref="trend_ref">11</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      showChoice: false,
      choiceType: 'map',
      // 文字尺寸
      titleFontSize: 0
    }
  },
  created() {
    this.$socket.registerCallBack('trendData', this.getData)
  },
  //生命周期函数，组件创建时执行
  mounted() {
    this.initChart()
    this.$socket.send(
      // 发送服务器数据
      {
        action: 'getData',
        socketType: 'trendData',
        chartName: 'trend',
        value: ''
      }
    )
    // this.getData()
    //监听屏幕变化
    window.addEventListener('resize', this.screenAdapter)
    //组件创建时 也需要适配屏幕大小
    this.screenAdapter()
  },
  //生命周期函数，组件销毁时执行
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('trendData')
  },
  // 增加计算属性保存下拉菜单  的数据
  computed: {
    //下拉菜单的数据
    selectTypes() {
      if (!this.allData) {
        return []
      } else {
        // return 可以返回一个对象{ }
        return this.allData.type.filter((item) => {
          return item.key !== this.choiceType
        })
      }
    },
    showTitle() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    },
    // 设置标题文字大小
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    // 控制左边margin
    marginStyle() {
      return {
        // 左边间距正好是一个字体
        marginLeft: this.titleFontSize / 1.5 + 'px'
      }
    },
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
    initChart() {
      //初始化后会返回一个实例对象
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      const initOption = {
        //控制坐标轴大小
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          //要设置包含文字,否者文字会显示不出来
          containLabel: true
        },
        // 鼠标经过时提示
        tooltip: {
          trigger: 'axis'
        },
        // 控制图例的位置和形状
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          //设置与x轴的间隔
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      this.chartInstance.setOption(initOption)
    },
    //获取数据
    getData(ret) {
      // ret 就是服务端发给客户端的数据
      //const { data: ret } = await this.$http.get('trend')
      this.allData = ret
      console.log(ret)
      this.updateChart()
    },
    // 更新数据
    updateChart() {
      // 设置颜色渐变的两个数组
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      // 获取类目轴数据，即是x轴
      const timeArr = this.allData.common.month
      //y轴数据   series数据
      const valueArr = this.allData[this.choiceType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          //每个折线都需要配置,是为了和图表的数据对应起来
          name: item.name,
          type: 'line',
          data: item.data,
          //stack 设置为同一个值就会产生堆叠效果，堆叠图是以 前一个值为起点
          stack: this.choiceType,
          //设置折线面积颜色
          // 可以为空,也可以设置渐变颜色
          areaStyle: {
            //表示从上向下渐变，向下为y的正方向
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index]
              }, // 分别表示0%和100%时的状态
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })

      // 图例的数据
      const legendArr = valueArr.map((item) => {
        return item.name
      })

      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        //series是一个数组，里面每个对象代表一个折线
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    //屏幕尺寸变化
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            //表示图例字体大小
            fontSize: this.titleFontSize / 1.5
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      //必须调用实例对象的resize方法，才会实时变化
      this.chartInstance.resize()
    },

    handleSelect(currentType) {
      this.choiceType = currentType
      this.updateChart()
      this.showChoice = false
    }
  }
}
</script>

<style lang='less' scoped>
.title {
  position: absolute;
  // 定位后就不占位置
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;
}
.title-icon {
  margin-left: 10px;
  cursor: pointer;
}

.select-item {
  cursor: pointer;
}

.select-con {
  background-color: #222733;
}
</style>