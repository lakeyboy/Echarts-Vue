<template>
  <!-- 模板中 最外层只有 -->
  <!-- dbclick双击 -->
  <div class="com-container" @dblclick="revertMap">
    <!-- 显示图表的div对象 -->
    <div class="com-chart" ref="map_ref">11</div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'

export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      mapData: {} //获取地图的省份数据
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
    async initChart() {
      //初始化后会返回一个实例对象
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, 'chalk')
      // 因为原来配置过基准地址，原来是服务器的，所以不可以使用this.$http
      //需要从本地服务器获取
      const ret = await axios.get('http://localhost:8999/static/map/china.json')
      // 注册地图数据
      this.$echarts.registerMap('china', ret.data)

      const initOption = {
        title: {
          text: '▍商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2e72bf',
            bordeeColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      // 监听图表点击
      //arg包含了时间点击的信息
      this.chartInstance.on('click', async (arg) => {
        const provinceInfo = getProvinceMapInfo(arg.name)
        //判断点击的省份的数据是否已经存在
        if (!this.mapData[provinceInfo.key]) {
          const ret = await axios.get(
            'http://localhost:8999' + provinceInfo.path
          )
          this.mapData[provinceInfo.key] = ret.data
          this.$echarts.registerMap(provinceInfo.key, ret.data)
        }

        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    //获取数据
    async getData() {
      const { data: ret } = await this.$http.get('map')
      this.allData = ret
      this.updateChart()
    },
    // 更新数据
    updateChart() {
      //图例数据
      const legendArr = this.allData.map((item) => {
        return item.name
      })

      // 处理需要的数据
      const seriesArr = this.allData.map((item) => {
        //一个return 对象就代表一个类别下的所有散点数据
        //如果在地图显示散点数据，我们需要给散点图表增加一个配置，coordinateSystem:geo,表示图表使用地图的坐标
        return {
          type: 'effectScatter',
          rippleEffect: {
            scale: 5,
            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo'
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    //屏幕尺寸变化
    screenAdapter() {
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize,
          itemHeight: titleFontSize,
          itemGap: titleFontSize,
          textStyle: {
            fontSize: titleFontSize
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      //必须调用实例对象的resize方法，才会实时变化
      this.chartInstance.resize()
    },
    // 双击返回地图
    revertMap() {
      const revertMap = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertMap)
    }
  }
}
</script>

<style lang='less' scoped>
</style>