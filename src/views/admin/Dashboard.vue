\<template>
  <div class="admin-dashboard-container">
    <h2 class="page-title">系统概览</h2>
    
    <!-- 统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-value">{{ totalUsers }}</div>
            <div class="stats-title">注册用户数</div>
            <div class="stats-icon user-icon">
              <el-icon size="36"><User /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-value">{{ totalRecords }}</div>
            <div class="stats-title">健康记录数</div>
            <div class="stats-icon record-icon">
              <el-icon size="36"><Document /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-value">{{ totalReminders }}</div>
            <div class="stats-title">健康提醒数</div>
            <div class="stats-icon reminder-icon">
              <el-icon size="36"><Bell /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-value">{{ averageRecordsPerUser }}</div>
            <div class="stats-title">人均记录数</div>
            <div class="stats-icon average-icon">
              <el-icon size="36"><DataAnalysis /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 系统活跃度图表 -->
    <el-row :gutter="20" class="activity-charts">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户活跃度</span>
              <el-radio-group v-model="activityPeriod" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="userActivityChart" class="chart"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>健康记录分布</span>
            </div>
          </template>
          <div ref="recordDistributionChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 健康数据平均值 -->
    <el-card class="health-averages-card">
      <template #header>
        <div class="card-header">
          <span>系统健康数据平均值</span>
        </div>
      </template>
      
      <el-row :gutter="20" class="health-averages">
        <el-col :xs="24" :sm="8">
          <div class="health-average-item">
            <div class="health-average-icon weight-icon">
              <el-icon size="24"><ScaleToOriginal /></el-icon>
            </div>
            <div class="health-average-info">
              <div class="health-average-title">平均体重</div>
              <div class="health-average-value">{{ healthAverages.weight }} kg</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <div class="health-average-item">
            <div class="health-average-icon bp-icon">
              <el-icon size="24"><Aim /></el-icon>
            </div>
            <div class="health-average-info">
              <div class="health-average-title">平均血压</div>
              <div class="health-average-value">{{ healthAverages.systolic }}/{{ healthAverages.diastolic }} mmHg</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <div class="health-average-item">
            <div class="health-average-icon sugar-icon">
              <el-icon size="24"><MagicStick /></el-icon>
            </div>
            <div class="health-average-info">
              <div class="health-average-title">平均血糖</div>
              <div class="health-average-value">{{ healthAverages.bloodSugar }} mmol/L</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 最近注册用户 -->
    <el-card class="recent-users-card">
      <template #header>
        <div class="card-header">
          <span>最近注册用户</span>
          <router-link to="/admin/user-management">
            <el-button type="primary" size="small" plain>查看全部</el-button>
          </router-link>
        </div>
      </template>
      
      <el-table :data="recentUsers" style="width: 100%" stripe>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="address" label="住址" />
        <el-table-column label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 健康异常提醒 -->
    <el-card class="health-alerts-card">
      <template #header>
        <div class="card-header">
          <span>健康异常提醒</span>
        </div>
      </template>
      
      <div v-if="healthAlerts.length === 0" class="no-alerts">
        <el-empty description="暂无健康异常提醒" />
      </div>
      
      <el-timeline v-else>
        <el-timeline-item
          v-for="alert in healthAlerts"
          :key="alert.id"
          :type="alert.type"
          :color="getAlertColor(alert.type)"
          :timestamp="formatDate(alert.date)"
        >
          <h4>{{ alert.title }}</h4>
          <p>
            用户: <router-link :to="`/admin/user-detail/${alert.userId}`">{{ getUserName(alert.userId) }}</router-link>
          </p>
          <p>{{ alert.description }}</p>
          <div class="alert-actions">
            <el-button type="primary" size="small" plain>查看详情</el-button>
            <el-button type="danger" size="small" plain>标记已处理</el-button>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
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
  PieChart,
  CanvasRenderer
])

const store = useStore()

// 图表引用
const userActivityChart = ref(null)
const recordDistributionChart = ref(null)

// 活跃度时间周期
const activityPeriod = ref('week')

// 获取用户列表
const users = computed(() => store.state.users)

// 获取健康记录列表
const healthRecords = computed(() => store.state.healthRecords)

// 获取健康提醒列表
const healthReminders = computed(() => store.state.healthReminders)

// 计算总用户数
const totalUsers = computed(() => users.value.length)

// 计算总记录数
const totalRecords = computed(() => healthRecords.value.length)

// 计算总提醒数
const totalReminders = computed(() => healthReminders.value.length)

// 计算人均记录数
const averageRecordsPerUser = computed(() => {
  if (users.value.length === 0) return 0
  return (totalRecords.value / users.value.length).toFixed(1)
})

// 最近注册的5个用户
const recentUsers = computed(() => {
  return [...users.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// 计算健康数据平均值
const healthAverages = computed(() => {
  if (healthRecords.value.length === 0) {
    return {
      weight: 0,
      systolic: 0,
      diastolic: 0,
      bloodSugar: 0
    }
  }
  
  // 过滤出有效数据
  const validWeightRecords = healthRecords.value.filter(r => r.weight)
  const validBpRecords = healthRecords.value.filter(r => r.bloodPressure)
  const validSugarRecords = healthRecords.value.filter(r => r.bloodSugar)
  
  // 计算平均值
  const avgWeight = validWeightRecords.length > 0
    ? validWeightRecords.reduce((sum, r) => sum + r.weight, 0) / validWeightRecords.length
    : 0
    
  const avgSystolic = validBpRecords.length > 0
    ? validBpRecords.reduce((sum, r) => sum + r.bloodPressure.systolic, 0) / validBpRecords.length
    : 0
    
  const avgDiastolic = validBpRecords.length > 0
    ? validBpRecords.reduce((sum, r) => sum + r.bloodPressure.diastolic, 0) / validBpRecords.length
    : 0
    
  const avgBloodSugar = validSugarRecords.length > 0
    ? validSugarRecords.reduce((sum, r) => sum + r.bloodSugar, 0) / validSugarRecords.length
    : 0
  
  return {
    weight: avgWeight.toFixed(1),
    systolic: Math.round(avgSystolic),
    diastolic: Math.round(avgDiastolic),
    bloodSugar: avgBloodSugar.toFixed(1)
  }
})

// 模拟健康异常提醒
const healthAlerts = ref([
  {
    id: 1,
    userId: users.value.length > 0 ? users.value[0].id : '1',
    title: '血压异常提醒',
    description: '连续3次测量血压偏高，建议进一步随访',
    type: 'danger',
    date: new Date().toISOString()
  },
  {
    id: 2,
    userId: users.value.length > 1 ? users.value[1].id : '1',
    title: '血糖异常提醒',
    description: '最近血糖波动较大，建议检查饮食习惯',
    type: 'warning',
    date: new Date(Date.now() - 86400000).toISOString() // 昨天
  }
])

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取用户名称
const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : '未知用户'
}

// 获取提醒类型颜色
const getAlertColor = (type) => {
  const colors = {
    info: '#909399',
    warning: '#E6A23C',
    danger: '#F56C6C',
    success: '#67C23A'
  }
  return colors[type] || colors.info
}

// 初始化用户活跃度图表
const initUserActivityChart = () => {
  if (!userActivityChart.value) return
  
  const chart = echarts.init(userActivityChart.value)
  
  // 生成模拟数据
  const generateActivityData = (days) => {
    const data = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      
      // 模拟活跃用户数
      const activeUsers = Math.floor(Math.random() * (users.value.length + 1))
      
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        activeUsers
      })
    }
    
    return data
  }
  
  // 根据选择的周期生成数据
  const activityData = activityPeriod.value === 'week' 
    ? generateActivityData(7)  // 一周
    : generateActivityData(30) // 一个月
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br />{a}: {c}'
    },
    xAxis: {
      type: 'category',
      data: activityData.map(item => item.date),
      axisLabel: {
        interval: activityPeriod.value === 'month' ? 5 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '活跃用户数',
      minInterval: 1
    },
    series: [
      {
        name: '活跃用户',
        type: 'line',
        data: activityData.map(item => item.activeUsers),
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '30px',
      containLabel: true
    }
  }
  
  chart.setOption(option)
  
  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    chart && chart.resize()
  })
}

// 初始化健康记录分布图表
const initRecordDistributionChart = () => {
  if (!recordDistributionChart.value) return
  
  const chart = echarts.init(recordDistributionChart.value)
  
  // 计算各类型记录数量
  const calculateRecordCounts = () => {
    // 统计有体重、血压、血糖数据的记录数
    const weightCount = healthRecords.value.filter(r => r.weight).length
    const bloodPressureCount = healthRecords.value.filter(r => r.bloodPressure).length
    const bloodSugarCount = healthRecords.value.filter(r => r.bloodSugar).length
    const pulseCount = healthRecords.value.filter(r => r.pulse).length
    
    return [
      { value: weightCount, name: '体重记录' },
      { value: bloodPressureCount, name: '血压记录' },
      { value: bloodSugarCount, name: '血糖记录' },
      { value: pulseCount, name: '脉搏记录' }
    ]
  }
  
  const recordCounts = calculateRecordCounts()
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: recordCounts.map(item => item.name)
    },
    series: [
      {
        name: '记录分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: recordCounts,
        color: ['#409EFF', '#F56C6C', '#E6A23C', '#67C23A']
      }
    ]
  }
  
  chart.setOption(option)
  
  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    chart && chart.resize()
  })
}

// 监听活跃度周期变化
const watchActivityPeriod = () => {
  // 周期变化时重新初始化图表
  initUserActivityChart()
}

// 组件挂载
onMounted(() => {
  // 初始化图表
  setTimeout(() => {
    initUserActivityChart()
    initRecordDistributionChart()
    
    // 监听活跃度周期变化
    watchActivityPeriod()
  }, 100)
})
</script>

<style scoped>
.admin-dashboard-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: bold;
  color: #303133;
}

.stats-overview {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 20px;
  height: 100%;
}

.stats-content {
  position: relative;
  padding: 20px;
  height: 100px;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stats-title {
  font-size: 14px;
  color: #606266;
}

.stats-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.user-icon {
  background-color: #409EFF;
}

.record-icon {
  background-color: #F56C6C;
}

.reminder-icon {
  background-color: #E6A23C;
}

.average-icon {
  background-color: #67C23A;
}

.activity-charts {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
  margin-bottom: 20px;
}

.chart {
  height: 340px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-averages-card {
  margin-bottom: 20px;
}

.health-averages {
  padding: 10px 0;
}

.health-average-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

.health-average-icon {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: #fff;
  margin-right: 15px;
}

.weight-icon {
  background-color: #409EFF;
}

.bp-icon {
  background-color: #F56C6C;
}

.sugar-icon {
  background-color: #E6A23C;
}

.health-average-info {
  flex: 1;
}

.health-average-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.health-average-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.recent-users-card {
  margin-bottom: 20px;
}

.health-alerts-card {
  margin-bottom: 20px;
}

.no-alerts {
  padding: 20px 0;
}

.alert-actions {
  margin-top: 10px;
}
</style>
