\<template>
  <div class="user-management-container">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" @click="openAddUserDialog">
        <el-icon><Plus /></el-icon>添加用户
      </el-button>
    </div>
    
    <!-- 用户筛选与搜索 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="关键词搜索">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="输入姓名/电话/地址" 
            clearable
            @keyup.enter="handleFilter"
          >
            <template #suffix>
              <el-icon class="el-input__icon" @click="handleFilter"><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="性别">
          <el-select v-model="filterForm.gender" placeholder="选择性别" clearable>
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="年龄范围">
          <el-input-number 
            v-model="filterForm.minAge" 
            :min="0" 
            :max="filterForm.maxAge || 120" 
            placeholder="最小年龄"
            controls-position="right"
            style="width: 120px"
          />
          <span class="age-separator">至</span>
          <el-input-number 
            v-model="filterForm.maxAge" 
            :min="filterForm.minAge || 0" 
            :max="120" 
            placeholder="最大年龄"
            controls-position="right"
            style="width: 120px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 用户表格 -->
    <el-card class="users-card">
      <div class="table-operations">
        <div class="table-operation-buttons">
          <el-button 
            type="danger" 
            :disabled="selectedUsers.length === 0" 
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button 
            type="success" 
            @click="exportUsers"
          >
            <el-icon><Download /></el-icon>导出用户
          </el-button>
        </div>
        
        <div class="table-stats">
          共 {{ filteredUsers.length }} 位用户
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="paginatedUsers"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="name" label="姓名" width="120" />
        
        <el-table-column prop="gender" label="性别" width="80" />
        
        <el-table-column prop="age" label="年龄" width="80" />
        
        <el-table-column prop="phone" label="联系电话" width="150" />
        
        <el-table-column prop="address" label="家庭住址" show-overflow-tooltip />
        
        <el-table-column label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="记录数" width="100">
          <template #default="scope">
            {{ getUserRecordCount(scope.row.id) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewUser(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click="handleEditUser(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDeleteUser(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredUsers.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="600px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="userForm.username" 
                :disabled="isEdit"
                placeholder="请输入用户名"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="userForm.password" 
                type="password"
                show-password
                placeholder="请输入密码"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input 
                v-model="userForm.name" 
                placeholder="请输入姓名"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="userForm.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number 
                v-model="userForm.age" 
                :min="1" 
                :max="120" 
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input 
                v-model="userForm.phone" 
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="家庭住址" prop="address">
          <el-input 
            v-model="userForm.address"
            type="textarea"
            rows="3"
            placeholder="请输入家庭住址"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUser" :loading="submitLoading">
            {{ isEdit ? '保存修改' : '添加用户' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="800px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ currentUser.gender }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ currentUser.age }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentUser.phone }}</el-descriptions-item>
            <el-descriptions-item label="家庭住址">{{ currentUser.address }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(currentUser.createdAt) }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        
        <el-tab-pane label="健康记录" name="records">
          <el-table
            :data="userHealthRecords"
            style="width: 100%"
            height="400"
            border
            stripe
          >
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column label="体重(kg)" width="100">
              <template #default="scope">
                {{ scope.row.weight || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="血压(mmHg)" width="150">
              <template #default="scope">
                {{ scope.row.bloodPressure ? 
                   `${scope.row.bloodPressure.systolic}/${scope.row.bloodPressure.diastolic}` : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="血糖(mmol/L)" width="120">
              <template #default="scope">
                {{ scope.row.bloodSugar || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="脉搏(次/分)" width="120">
              <template #default="scope">
                {{ scope.row.pulse || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="健康提醒" name="reminders">
          <el-table
            :data="userHealthReminders"
            style="width: 100%"
            height="400"
            border
            stripe
          >
            <el-table-column prop="title" label="提醒标题" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="time" label="时间" width="100" />
            <el-table-column label="类型" width="120">
              <template #default="scope">
                <el-tag :type="getReminderTagType(scope.row.type)">
                  {{ getReminderTypeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.isCompleted ? 'success' : 'info'">
                  {{ scope.row.isCompleted ? '已完成' : '未完成' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="健康趋势" name="trends">
          <div class="trends-container" v-if="userHealthRecords.length > 0">
            <div ref="userTrendsChart" class="trends-chart"></div>
          </div>
          <el-empty v-else description="暂无健康记录数据" />
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEditUser(currentUser)">编辑用户</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
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

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 用户列表
const users = computed(() => store.state.users)

// 对话框控制
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)

// 表单引用
const userFormRef = ref(null)

// 用户表单数据
const userForm = reactive({
  username: '',
  password: '',
  name: '',
  gender: '男',
  age: 65,
  phone: '',
  address: ''
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入家庭住址', trigger: 'blur' }
  ]
}

// 筛选表单
const filterForm = reactive({
  keyword: '',
  gender: '',
  minAge: null,
  maxAge: null
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 选中的用户
const selectedUsers = ref([])

// 当前查看的用户
const currentUser = ref({})

// 详情标签页
const activeTab = ref('basic')

// 用户健康趋势图表
const userTrendsChart = ref(null)

// 根据筛选条件过滤用户
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // 关键词搜索
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase()
    result = result.filter(user => 
      user.name.toLowerCase().includes(keyword) ||
      user.phone.includes(keyword) ||
      user.address.toLowerCase().includes(keyword) ||
      user.username.toLowerCase().includes(keyword)
    )
  }
  
  // 性别筛选
  if (filterForm.gender) {
    result = result.filter(user => user.gender === filterForm.gender)
  }
  
  // 年龄范围筛选
  if (filterForm.minAge !== null) {
    result = result.filter(user => user.age >= filterForm.minAge)
  }
  
  if (filterForm.maxAge !== null) {
    result = result.filter(user => user.age <= filterForm.maxAge)
  }
  
  return result
})

// 分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

// 获取用户健康记录
const userHealthRecords = ref([])

// 获取用户健康提醒
const userHealthReminders = ref([])

// 提醒类型定义
const reminderTypes = [
  { label: '服药提醒', value: 'medication' },
  { label: '检查提醒', value: 'checkup' },
  { label: '运动提醒', value: 'exercise' },
  { label: '饮食提醒', value: 'diet' },
  { label: '饮水提醒', value: 'water' },
  { label: '其他提醒', value: 'other' }
]

// 获取提醒类型标签
const getReminderTypeLabel = (type) => {
  const found = reminderTypes.find(item => item.value === type)
  return found ? found.label : '其他提醒'
}

// 获取提醒标签类型
const getReminderTagType = (type) => {
  const types = {
    medication: 'danger',
    checkup: 'warning',
    exercise: 'success',
    diet: 'info',
    water: 'primary',
    other: 'info'
  }
  return types[type] || 'info'
}

// 获取用户健康记录数量
const getUserRecordCount = (userId) => {
  return store.getters.getUserHealthRecords(userId).length
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 选择变化处理
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 打开添加用户对话框
const openAddUserDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  userForm.username = ''
  userForm.password = ''
  userForm.name = ''
  userForm.gender = '男'
  userForm.age = 65
  userForm.phone = ''
  userForm.address = ''
  
  // 重置表单验证
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 提交用户
const submitUser = () => {
  userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        if (isEdit.value) {
          // 更新用户
          store.commit('UPDATE_USER', {
            id: userForm.id,
            updates: {
              name: userForm.name,
              gender: userForm.gender,
              age: userForm.age,
              phone: userForm.phone,
              address: userForm.address,
              password: userForm.password
            }
          })
          
          ElMessage({
            type: 'success',
            message: '用户更新成功'
          })
        } else {
          // 检查用户名是否已存在
          const existingUser = users.value.find(user => user.username === userForm.username)
          if (existingUser) {
            throw new Error('用户名已存在，请更换其他用户名')
          }
          
          // 添加新用户
          const newUser = {
            id: Date.now().toString(),
            username: userForm.username,
            password: userForm.password,
            name: userForm.name,
            gender: userForm.gender,
            age: userForm.age,
            phone: userForm.phone,
            address: userForm.address,
            createdAt: new Date().toISOString()
          }
          
          store.commit('ADD_USER', newUser)
          
          ElMessage({
            type: 'success',
            message: '用户添加成功'
          })
        }
        
        // 关闭对话框
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error(error.message || '操作失败，请重试')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 处理查看用户
const handleViewUser = (user) => {
  currentUser.value = { ...user }
  
  // 获取用户健康记录
  userHealthRecords.value = store.getters.getUserHealthRecords(user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  
  // 获取用户健康提醒
  userHealthReminders.value = store.getters.getUserReminders(user.id)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  
  // 打开详情对话框
  detailDialogVisible.value = true
  activeTab.value = 'basic'
  
  // 当切换到趋势标签页时初始化图表
  nextTick(() => {
    if (activeTab.value === 'trends') {
      initUserTrendsChart()
    }
  })
}

// 初始化用户健康趋势图表
const initUserTrendsChart = () => {
  if (!userTrendsChart.value || userHealthRecords.value.length === 0) return
  
  const chart = echarts.init(userTrendsChart.value)
  
  // 准备图表数据
  const sortedRecords = [...userHealthRecords.value]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10) // 最近10条记录
  
  const dates = sortedRecords.map(record => record.date)
  const weights = sortedRecords.map(record => record.weight || null)
  const bloodSugars = sortedRecords.map(record => record.bloodSugar || null)
  const systolics = sortedRecords.map(record => 
    record.bloodPressure ? record.bloodPressure.systolic : null
  )
  const diastolics = sortedRecords.map(record => 
    record.bloodPressure ? record.bloodPressure.diastolic : null
  )
  
  const option = {
    title: {
      text: `${currentUser.value.name} 的健康趋势`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['体重', '血糖', '收缩压', '舒张压'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: Math.floor(dates.length / 5),
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '体重 (kg)',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6'
          }
        }
      },
      {
        type: 'value',
        name: '血压 (mmHg) / 血糖 (mmol/L)',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#91CC75'
          }
        }
      }
    ],
    series: [
      {
        name: '体重',
        type: 'line',
        data: weights,
        smooth: true,
        yAxisIndex: 0,
        itemStyle: {
          color: '#5470C6'
        }
      },
      {
        name: '血糖',
        type: 'line',
        data: bloodSugars,
        smooth: true,
        yAxisIndex: 1,
        itemStyle: {
          color: '#FAC858'
        }
      },
      {
        name: '收缩压',
        type: 'line',
        data: systolics,
        smooth: true,
        yAxisIndex: 1,
        itemStyle: {
          color: '#EE6666'
        }
      },
      {
        name: '舒张压',
        type: 'line',
        data: diastolics,
        smooth: true,
        yAxisIndex: 1,
        itemStyle: {
          color: '#91CC75'
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    chart && chart.resize()
  })
}

// 处理编辑用户
const handleEditUser = (user) => {
  isEdit.value = true
  
  // 填充表单数据
  userForm.id = user.id
  userForm.username = user.username
  userForm.password = user.password || ''
  userForm.name = user.name
  userForm.gender = user.gender
  userForm.age = user.age
  userForm.phone = user.phone
  userForm.address = user.address
  
  // 关闭详情对话框（如果打开）
  detailDialogVisible.value = false
  
  // 打开编辑对话框
  dialogVisible.value = true
}

// 处理删除用户
const handleDeleteUser = (user) => {
  ElMessageBox.confirm(`确定要删除用户 ${user.name} 吗？此操作将同时删除该用户的所有健康记录和提醒，且不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 执行删除
    store.commit('DELETE_USER', user.id)
    
    // 同时删除该用户相关的健康记录和提醒
    const records = store.state.healthRecords.filter(record => record.userId !== user.id)
    store.commit('SET_HEALTH_RECORDS', records)
    
    const reminders = store.state.healthReminders.filter(reminder => reminder.userId !== user.id)
    store.commit('SET_HEALTH_REMINDERS', reminders)
    
    ElMessage({
      type: 'success',
      message: '用户删除成功'
    })
  }).catch(() => {})
}

// 批量删除用户
const handleBatchDelete = () => {
  if (selectedUsers.value.length === 0) return
  
  const userNames = selectedUsers.value.map(user => user.name).join('、')
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户 (${userNames}) 吗？此操作将同时删除这些用户的所有健康记录和提醒，且不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 获取要删除的用户ID列表
    const userIds = selectedUsers.value.map(user => user.id)
    
    // 批量删除用户
    userIds.forEach(id => {
      store.commit('DELETE_USER', id)
    })
    
    // 同时删除这些用户相关的健康记录和提醒
    const records = store.state.healthRecords.filter(record => !userIds.includes(record.userId))
    store.commit('SET_HEALTH_RECORDS', records)
    
    const reminders = store.state.healthReminders.filter(reminder => !userIds.includes(reminder.userId))
    store.commit('SET_HEALTH_REMINDERS', reminders)
    
    ElMessage({
      type: 'success',
      message: `成功删除 ${selectedUsers.value.length} 个用户`
    })
    
    // 清空选择
    selectedUsers.value = []
  }).catch(() => {})
}

// 导出用户数据
const exportUsers = () => {
  const userList = filteredUsers.value.map(user => {
    return {
      用户名: user.username,
      姓名: user.name,
      性别: user.gender,
      年龄: user.age,
      联系电话: user.phone,
      家庭住址: user.address,
      注册时间: formatDate(user.createdAt),
      健康记录数: getUserRecordCount(user.id)
    }
  })
  
  // 转换为CSV格式
  const headers = Object.keys(userList[0]).join(',')
  const rows = userList.map(user => Object.values(user).join(','))
  const csvContent = [headers, ...rows].join('\n')
  
  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.setAttribute('download', `用户列表_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage({
    type: 'success',
    message: '用户数据导出成功'
  })
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1 // 重置到第一页
}

// 重置筛选
const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.gender = ''
  filterForm.minAge = null
  filterForm.maxAge = null
  currentPage.value = 1
}

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

// 监听详情标签页变化
const watchActiveTab = async () => {
  if (activeTab.value === 'trends' && detailDialogVisible.value) {
    // 等待DOM更新
    await nextTick()
    // 初始化趋势图表
    initUserTrendsChart()
  }
}

// 组件挂载
onMounted(() => {
  // 模拟加载
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
  
  // 监听标签页变化
  watchActiveTab()
})
</script>

<style scoped>
.user-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-weight: bold;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.age-separator {
  margin: 0 5px;
}

.users-card {
  margin-bottom: 20px;
}

.table-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-operation-buttons {
  display: flex;
  gap: 10px;
}

.table-stats {
  font-size: 14px;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.trends-container {
  height: 400px;
  width: 100%;
}

.trends-chart {
  height: 100%;
  width: 100%;
}
</style>
