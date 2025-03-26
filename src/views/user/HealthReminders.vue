\<template>
  <div class="health-reminders-container">
    <div class="page-header">
      <h2 class="page-title">健康提醒</h2>
      <el-button type="primary" @click="openAddReminderDialog">
        <el-icon><Plus /></el-icon>添加提醒
      </el-button>
    </div>
    
    <!-- 提醒类型筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="提醒类型">
          <el-select v-model="filterForm.type" placeholder="选择提醒类型" clearable>
            <el-option
              v-for="item in reminderTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="完成状态">
          <el-select v-model="filterForm.completed" placeholder="选择完成状态" clearable>
            <el-option label="未完成" :value="false" />
            <el-option label="已完成" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 提醒卡片列表 -->
    <el-row :gutter="20" class="reminders-row">
      <el-col 
        v-for="reminder in filteredReminders" 
        :key="reminder.id"
        :xs="24" 
        :sm="12" 
        :md="8" 
        :lg="6"
      >
        <el-card 
          class="reminder-card"
          :class="{ 'completed': reminder.isCompleted }"
          shadow="hover"
        >
          <template #header>
            <div class="reminder-header">
              <el-tag :type="getReminderTagType(reminder.type)" effect="dark">
                {{ getReminderTypeLabel(reminder.type) }}
              </el-tag>
              <div class="reminder-actions">
                <el-button 
                  v-if="!reminder.isCompleted"
                  type="success" 
                  size="small" 
                  circle
                  @click="markAsCompleted(reminder)"
                >
                  <el-icon><Check /></el-icon>
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  circle
                  @click="handleEdit(reminder)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  circle
                  @click="handleDelete(reminder)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="reminder-content">
            <h3 class="reminder-title" :class="{ 'completed-text': reminder.isCompleted }">
              {{ reminder.title }}
            </h3>
            
            <div class="reminder-info">
              <p class="reminder-date">
                <el-icon><Calendar /></el-icon>
                {{ reminder.date }}
              </p>
              <p class="reminder-time">
                <el-icon><Clock /></el-icon>
                {{ reminder.time }}
              </p>
              <p class="reminder-repeat">
                <el-icon><RefreshRight /></el-icon>
                {{ getRepeatLabel(reminder.repeat) }}
              </p>
            </div>
            
            <p class="reminder-description" v-if="reminder.description">
              {{ reminder.description }}
            </p>
            
            <div class="reminder-status" v-if="reminder.isCompleted">
              <el-tag type="success" effect="plain">已完成</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 空提示 -->
      <el-col :span="24" v-if="filteredReminders.length === 0">
        <el-empty description="暂无健康提醒" />
      </el-col>
    </el-row>
    
    <!-- 添加/编辑提醒对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑健康提醒' : '添加健康提醒'"
      width="500px"
    >
      <el-form
        ref="reminderFormRef"
        :model="reminderForm"
        :rules="reminderRules"
        label-width="100px"
      >
        <el-form-item label="提醒标题" prop="title">
          <el-input 
            v-model="reminderForm.title"
            placeholder="请输入提醒标题"
          />
        </el-form-item>
        
        <el-form-item label="提醒类型" prop="type">
          <el-select
            v-model="reminderForm.type"
            placeholder="选择提醒类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in reminderTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="提醒日期" prop="date">
          <el-date-picker
            v-model="reminderForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="提醒时间" prop="time">
          <el-time-picker
            v-model="reminderForm.time"
            placeholder="选择时间"
            style="width: 100%"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        
        <el-form-item label="重复方式" prop="repeat">
          <el-select
            v-model="reminderForm.repeat"
            placeholder="选择重复方式"
            style="width: 100%"
          >
            <el-option label="不重复（仅一次）" value="once" />
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="提醒说明" prop="description">
          <el-input
            v-model="reminderForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入提醒说明"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReminder" :loading="submitLoading">
            {{ isEdit ? '保存修改' : '添加提醒' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useStore()

// 用户信息
const userInfo = computed(() => store.state.userInfo)

// 获取健康提醒
const reminders = computed(() => {
  const userId = userInfo.value.id
  const userReminders = store.getters.getUserReminders(userId) || []
  return userReminders.sort((a, b) => {
    // 优先按日期排序
    const dateComparison = new Date(a.date) - new Date(b.date)
    if (dateComparison !== 0) return dateComparison
    
    // 同一天，按时间排序
    return a.time.localeCompare(b.time)
  })
})

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

// 获取重复方式文本
const getRepeatLabel = (repeat) => {
  const labels = {
    once: '不重复',
    daily: '每天',
    weekly: '每周',
    monthly: '每月'
  }
  return labels[repeat] || '不重复'
}

// 加载状态
const submitLoading = ref(false)

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)

// 提醒表单引用
const reminderFormRef = ref(null)

// 提醒表单数据
const reminderForm = reactive({
  title: '',
  type: 'medication',
  date: '',
  time: '',
  repeat: 'once',
  description: ''
})

// 筛选表单
const filterForm = reactive({
  type: '',
  completed: ''
})

// 表单验证规则
const reminderRules = {
  title: [
    { required: true, message: '请输入提醒标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择提醒类型', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择提醒日期', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择提醒时间', trigger: 'change' }
  ],
  repeat: [
    { required: true, message: '请选择重复方式', trigger: 'change' }
  ]
}

// 根据筛选条件过滤提醒
const filteredReminders = computed(() => {
  let result = [...reminders.value]
  
  // 类型筛选
  if (filterForm.type) {
    result = result.filter(reminder => reminder.type === filterForm.type)
  }
  
  // 完成状态筛选
  if (filterForm.completed !== '') {
    result = result.filter(reminder => reminder.isCompleted === filterForm.completed)
  }
  
  return result
})

// 打开添加提醒对话框
const openAddReminderDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
  
  // 默认设置为今天日期和当前时间
  const now = new Date()
  reminderForm.date = now.toISOString().slice(0, 10)
  reminderForm.time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// 重置表单
const resetForm = () => {
  reminderForm.title = ''
  reminderForm.type = 'medication'
  reminderForm.date = ''
  reminderForm.time = ''
  reminderForm.repeat = 'once'
  reminderForm.description = ''
  
  // 重置表单验证
  if (reminderFormRef.value) {
    reminderFormRef.value.resetFields()
  }
}

// 提交提醒
const submitReminder = () => {
  reminderFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        const reminderData = {
          title: reminderForm.title,
          type: reminderForm.type,
          date: reminderForm.date,
          time: reminderForm.time,
          repeat: reminderForm.repeat,
          description: reminderForm.description,
          isCompleted: isEdit.value ? reminderForm.isCompleted : false,
          userId: userInfo.value.id
        }
        
        if (isEdit.value) {
          // 更新提醒
          store.commit('UPDATE_HEALTH_REMINDER', {
            id: reminderForm.id,
            updates: reminderData
          })
          ElMessage({
            type: 'success',
            message: '健康提醒更新成功'
          })
        } else {
          // 添加新提醒
          store.dispatch('addHealthReminder', reminderData)
          ElMessage({
            type: 'success',
            message: '健康提醒添加成功'
          })
        }
        
        // 关闭对话框
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败，请重试')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 处理编辑
const handleEdit = (reminder) => {
  isEdit.value = true
  
  // 填充表单数据
  reminderForm.id = reminder.id
  reminderForm.title = reminder.title
  reminderForm.type = reminder.type
  reminderForm.date = reminder.date
  reminderForm.time = reminder.time
  reminderForm.repeat = reminder.repeat
  reminderForm.description = reminder.description || ''
  reminderForm.isCompleted = reminder.isCompleted
  
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (reminder) => {
  ElMessageBox.confirm('确定要删除这条健康提醒吗？此操作不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.commit('DELETE_HEALTH_REMINDER', reminder.id)
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
  }).catch(() => {})
}

// 标记为已完成
const markAsCompleted = (reminder) => {
  store.commit('UPDATE_HEALTH_REMINDER', {
    id: reminder.id,
    updates: { isCompleted: true }
  })
  ElMessage({
    type: 'success',
    message: '已标记为完成'
  })
}

// 筛选处理
const handleFilter = () => {
  // 筛选逻辑在计算属性中
}

// 重置筛选
const resetFilter = () => {
  filterForm.type = ''
  filterForm.completed = ''
}

// 组件挂载
onMounted(() => {
  // 检查并添加过期提醒标记
  const today = new Date().toISOString().slice(0, 10)
  
  reminders.value.forEach(reminder => {
    if (!reminder.isCompleted && reminder.date < today) {
      // 标记过期的提醒
      store.commit('UPDATE_HEALTH_REMINDER', {
        id: reminder.id,
        updates: { isOverdue: true }
      })
    }
  })
})
</script>

<style scoped>
.health-reminders-container {
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
  align-items: flex-start;
}

.reminders-row {
  margin-top: 20px;
}

.reminder-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.reminder-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reminder-actions {
  display: flex;
  gap: 5px;
}

.reminder-content {
  position: relative;
}

.reminder-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
}

.completed-text {
  text-decoration: line-through;
  color: #909399;
}

.reminder-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

.reminder-date,
.reminder-time,
.reminder-repeat {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.reminder-description {
  font-size: 14px;
  color: #606266;
  margin-top: 10px;
  margin-bottom: 10px;
  white-space: pre-line;
}

.reminder-status {
  margin-top: 15px;
}

.completed {
  opacity: 0.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
