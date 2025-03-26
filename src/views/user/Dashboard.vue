\<template>
  <div class="dashboard-container">
    <h2 class="page-title">健康概览</h2>
    
    <!-- 健康指标卡片 -->
    <el-row :gutter="20" class="health-cards">
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="health-card">
          <template #header>
            <div class="card-header">
              <span>体重</span>
              <el-tag size="small" :type="getWeightStatusType">{{ getWeightStatus }}</el-tag>
            </div>
          </template>
          <div class="card-value">{{ latestWeight ? latestWeight + ' kg' : '暂无数据' }}</div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="health-card">
          <template #header>
            <div class="card-header">
              <span>血压</span>
              <el-tag size="small" :type="getBpStatusType">{{ getBpStatus }}</el-tag>
            </div>
          </template>
          <div class="card-value">
            {{ latestBp ? `${latestBp.systolic}/${latestBp.diastolic} mmHg` : '暂无数据' }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="health-card">
          <template #header>
            <div class="card-header">
              <span>血糖</span>
              <el-tag size="small" :type="getBsStatusType">{{ getBsStatus }}</el-tag>
            </div>
          </template>
          <div class="card-value">
            {{ latestBloodSugar ? latestBloodSugar + ' mmol/L' : '暂无数据' }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="health-card">
          <template #header>
            <div class="card-header">
              <span>脉搏</span>
              <el-tag size="small" type="info">参考值</el-tag>
            </div>
          </template>
          <div class="card-value">
            {{ latestPulse ? latestPulse + ' 次/分' : '暂无数据' }}
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 健康趋势图 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>最近30天健康趋势</span>
              <el-radio-group v-model="selectedChart" size="small">
                <el-radio-button label="weight">体重</el-radio-button>
                <el-radio-button label="bloodPressure">血压</el-radio-button>
                <el-radio-button label="bloodSugar">血糖</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="healthRecords.length === 0" class="no-data">
              暂无健康记录数据，请先添加健康记录
            </div>
            <div v-else ref="chartRef" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近健康记录 -->
    <el-card class="recent-records-card">
      <template #header>
        <div class="card-header">
          <span>最近健康记录</span>
          <router-link to="/user/health-records">
            <el-button type="primary" size="small" plain>查看全部</el-button>
          </router-link>
        </div>
      </template>
      
      <el-table 
        :data="recentRecords" 
        style="width: 100%" 
        :empty-text="'暂无健康记录数据'"
        stripe
      >
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="体重(kg)" width="100">
          <template #default="scope">
            {{ scope.row.weight || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="血压(mmHg)" width="140">
          <template #default="scope">
            {{ scope.row.bloodPressure ? 
               `${scope.row.bloodPressure.systolic}/${scope.row.bloodPressure.diastolic}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="血糖(mmol/L)" width="130">
          <template #default="scope">
            {{ scope.row.bloodSugar || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="脉搏(次/分)" width="130">
          <template #default="scope">
            {{ scope.row.pulse || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 最近健康提醒 -->
    <el-card class="recent-reminders-card">
      <template #header>
        <div class="card-header">
          <span>最近健康提醒</span>
          <router-link to="/user/health-reminders">
            <el-button type="primary" size="small" plain>查看全部</el-button>
          </router-link>
        </div>
      </template>
      
      <el-empty v-if="reminders.length === 0" description="暂无健康提醒" />
      
      <div v-else class="reminder-list">
        <el-tag 
          v-for="reminder in recentReminders" 
          :key="reminder.id"
          :type="getReminderTagType(reminder.type)"
          class="reminder-tag"
          :effect="reminder.isCompleted ? 'plain' : 'dark'"
        >
          <div class="reminder-content">
            <div class="reminder-title" :class="{ 'completed': reminder.isCompleted }">
              {{ reminder.title }}
            </div>
            <div class="reminder-date">{{ reminder.date }} {{ reminder.time }}</div>
          </div>
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent,
  ToolboxComponent 
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent,
  ToolboxComponent,
  LineChart,
  CanvasRenderer
])

const store = useStore()
const chartRef = ref(null)
let chart = null

// 选中的图表类型
const selectedChart = ref('weight')

// 获取用户信息
const userInfo = computed(() => {
  return store.state.userInfo
})

// 获取用户健康记录
const healthRecords = computed(() => {
  const userId = userInfo.value.id
  const records = store.getters.getUserHealthRecords(userId) || []
  return records.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 获取最近的记录
const recentRecords = computed(() => {
  return healthRecords.value.slice(0, 5)
})

// 获取最新的体重
const latestWeight = computed(() => {
  return healthRecords.value.length > 0 ? healthRecords.value[0].weight : null
})

// 获取最新的血压
const latestBp = computed(() => {
  return healthRecords.value.length > 0 ? healthRecords.value[0].bloodPressure : null
})

// 获取最新的血糖
const latestBloodSugar = computed(() => {
  return healthRecords.value.length > 0 ? healthRecords.value[0].bloodSugar : null
})

// 获取最新的脉搏
const latestPulse = computed(() => {
  return healthRecords.value.length > 0 ? healthRecords.value[0].pulse : null
})

// 计算体重状态
const getWeightStatus = computed(() => {
  if (!latestWeight.value) return '无数据'
  
  // 简单的体重状态判断
  if (latestWeight.value < 50) return '偏轻'
  if (latestWeight.value > 75) return '偏重'
  return '正常'
})

// 计算体重状态类型
const getWeightStatusType = computed(() => {
  if (!latestWeight.value) return 'info'
  
  if (latestWeight.value < 50) return 'warning'
  if (latestWeight.value > 75) return 'warning'
  return 'success'
})

// 计算血压状态
const getBpStatus = computed(() => {
  if (!latestBp.value) return '无数据'
  
  const { systolic, diastolic } = latestBp.value
  
  if (systolic >= 140 || diastolic >= 90) return '偏高'
  if (systolic <= 90 || diastolic <= 60) return '偏低'
  return '正常'
})

// 计算血压状态类型
const getBpStatusType = computed(() => {
  if (!latestBp.value) return 'info'
  
  const { systolic, diastolic } = latestBp.value
  
  if (systolic >= 140 || diastolic >= 90) return 'danger'
  if (systolic <= 90 || diastolic <= 60) return 'warning'
  return 'success'
})

// 计算血糖状态
const getBsStatus = computed(() => {
  if (!latestBloodSugar.value) return '无数据'
  
  if (latestBloodSugar.value > 7.0) return '偏高'
  if (latestBloodSugar.value < 3.9) return '偏低'
  return '正常'
})

// 计算血糖状态类型
const getBsStatusType = computed(() => {
  if (!latestBloodSugar.value) return 'info'
  
  if (latestBloodSugar.value > 7.0) return 'danger'
  if (latestBloodSugar.value < 3.9) return 'warning'
  return 'success'
})

// 获取用户健康提醒
const reminders = computed(() => {
  const userId = userInfo.value.id
  const userReminders = store.getters.getUserReminders(userId) || []
  return userReminders.sort((a, b) => new Date(a.date) - new Date(b.date))
})

// 获取最近的提醒
const recentReminders = computed(() => {
  return reminders.value.slice(0, 3)
})

// 获取提醒标签类型
const getReminderTagType = (type) => {
  const types = {
    medication: 'danger',
    checkup: 'warning',
    exercise: 'success',
    diet: 'info',
    water: 'primary'
  }
  return types[type] || 'info'
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  // 根据选择的图表类型更新图表
  updateChart()
  
  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    chart && chart.resize()
  })
}

// 更新图表数据
const updateChart = () => {
  if (!chart) return
  
  // 准备图表数据
  const sortedRecords = [...healthRecords.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  
  const xAxisData = sortedRecords.map(record => record.date)
  let seriesData = []
  let option = {}
  
  // 根据选中的图表类型设置数据
  if (selectedChart.value === 'weight') {
    seriesData = sortedRecords.map(record => record.weight || null)
    
    option = {
      title: {
        text: '体重趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} kg'
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          interval: Math.floor(xAxisData.length / 10),
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '体重(kg)'
      },
      series: [
        {
          name: '体重',
          type: 'line',
          data: seriesData,
          smooth: true,
          itemStyle: {
            color: '#409EFF'
          }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      }
    }
  } else if (selectedChart.value === 'bloodPressure') {
    const systolicData = sortedRecords.map(record => 
      record.bloodPressure ? record.bloodPressure.systolic : null
    )
    const diastolicData = sortedRecords.map(record => 
      record.bloodPressure ? record.bloodPressure.diastolic : null
    )
    
    option = {
      title: {
        text: '血压趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          let result = params[0].name + '<br/>'
          params.forEach(param => {
            result += param.seriesName + ': ' + param.value + ' mmHg<br/>'
          })
          return result
        }
      },
      legend: {
        data: ['收缩压', '舒张压'],
        bottom: 10
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          interval: Math.floor(xAxisData.length / 10),
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '血压(mmHg)'
      },
      series: [
        {
          name: '收缩压',
          type: 'line',
          data: systolicData,
          smooth: true,
          itemStyle: {
            color: '#F56C6C'
          }
        },
        {
          name: '舒张压',
          type: 'line',
          data: diastolicData,
          smooth: true,
          itemStyle: {
            color: '#67C23A'
          }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      }
    }
  } else if (selectedChart.value === 'bloodSugar') {
    seriesData = sortedRecords.map(record => record.bloodSugar || null)
    
    option = {
      title: {
        text: '血糖趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} mmol/L'
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          interval: Math.floor(xAxisData.length / 10),
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '血糖(mmol/L)'
      },
      series: [
        {
          name: '血糖',
          type: 'line',
          data: seriesData,
          smooth: true,
          itemStyle: {
            color: '#E6A23C'
          }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      }
    }
  }
  
  // 设置图表选项
  chart.setOption(option)
}

// 监听选中的图表类型变化
watch(selectedChart, () => {
  updateChart()
})

// 监听健康记录变化
watch(healthRecords, () => {
  updateChart()
})

// 组件挂载时初始化图表
onMounted(() => {
  // 初始化图表
  initChart()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: bold;
  color: #303133;
}

.health-cards {
  margin-bottom: 20px;
}

.health-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 10px 0;
  color: #303133;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

.no-data {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.recent-records-card {
  margin-bottom: 20px;
}

.reminder-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reminder-tag {
  margin-bottom: 10px;
  padding: 10px;
}

.reminder-content {
  display: flex;
  flex-direction: column;
}

.reminder-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.reminder-title.completed {
  text-decoration: line-through;
  opacity: 0.7;
}

.reminder-date {
  font-size: 12px;
}
</style>
