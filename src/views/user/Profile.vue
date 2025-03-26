\<template>
  <div class="profile-container">
    <h2 class="page-title">个人信息</h2>
    
    <el-row :gutter="20">
      <!-- 个人信息卡片 -->
      <el-col :xs="24" :md="16">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button 
                type="primary" 
                plain
                @click="switchToEdit"
                v-if="!isEditing"
              >
                编辑信息
              </el-button>
            </div>
          </template>
          
          <!-- 查看模式 -->
          <div class="profile-info" v-if="!isEditing">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="姓名">
                {{ userInfo.name }}
              </el-descriptions-item>
              <el-descriptions-item label="年龄">
                {{ userInfo.age }}
              </el-descriptions-item>
              <el-descriptions-item label="性别">
                {{ userInfo.gender }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ userInfo.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="家庭住址">
                {{ userInfo.address }}
              </el-descriptions-item>
              <el-descriptions-item label="账号">
                {{ userInfo.username }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          
          <!-- 编辑模式 -->
          <div class="profile-edit" v-else>
            <el-form 
              ref="profileFormRef"
              :model="profileForm" 
              :rules="profileRules" 
              label-width="100px"
            >
              <el-form-item label="姓名" prop="name">
                <el-input v-model="profileForm.name" />
              </el-form-item>
              
              <el-form-item label="年龄" prop="age">
                <el-input-number v-model="profileForm.age" :min="1" :max="120" style="width: 100%" />
              </el-form-item>
              
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio label="男">男</el-radio>
                  <el-radio label="女">女</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="profileForm.phone" />
              </el-form-item>
              
              <el-form-item label="家庭住址" prop="address">
                <el-input 
                  v-model="profileForm.address"
                  type="textarea"
                  rows="3"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="submitProfile" :loading="loading">保存</el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
        
        <!-- 修改密码卡片 -->
        <el-card class="password-card">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>
          
          <el-form 
            ref="passwordFormRef"
            :model="passwordForm" 
            :rules="passwordRules" 
            label-width="120px"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input 
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请确认新密码"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="changePassword" 
                :loading="passwordLoading"
              >
                更新密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <!-- 个人统计卡片 -->
      <el-col :xs="24" :md="8">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>健康统计</span>
            </div>
          </template>
          
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon size="24"><DataLine /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ healthRecords.length }}</div>
                <div class="stat-label">健康记录总数</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon size="24"><Bell /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ activeReminders.length }}</div>
                <div class="stat-label">当前活动提醒</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon size="24"><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ lastRecordDays }}</div>
                <div class="stat-label">最近记录天数</div>
              </div>
            </div>
            
            <div class="health-trends" v-if="healthRecords.length > 0">
              <div class="trend-header">最近健康趋势</div>
              <div class="trend-item">
                <span class="trend-label">体重</span>
                <span class="trend-value">{{ lastWeight }} kg</span>
                <span class="trend-change" :class="weightTrend.class">
                  <el-icon><component :is="weightTrend.icon" /></el-icon>
                  {{ weightTrend.text }}
                </span>
              </div>
              
              <div class="trend-item">
                <span class="trend-label">血压</span>
                <span class="trend-value">{{ lastBp }}</span>
                <span class="trend-change" :class="bpTrend.class">
                  <el-icon><component :is="bpTrend.icon" /></el-icon>
                  {{ bpTrend.text }}
                </span>
              </div>
              
              <div class="trend-item">
                <span class="trend-label">血糖</span>
                <span class="trend-value">{{ lastBloodSugar }} mmol/L</span>
                <span class="trend-change" :class="sugarTrend.class">
                  <el-icon><component :is="sugarTrend.icon" /></el-icon>
                  {{ sugarTrend.text }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 操作选项卡片 -->
        <el-card class="actions-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          
          <div class="actions-content">
            <router-link to="/user/health-records">
              <el-button type="primary" plain block class="action-btn">
                <el-icon><DocumentAdd /></el-icon>添加健康记录
              </el-button>
            </router-link>
            
            <router-link to="/user/health-reminders">
              <el-button type="warning" plain block class="action-btn">
                <el-icon><AlarmClock /></el-icon>设置健康提醒
              </el-button>
            </router-link>
            
            <el-button type="danger" plain block class="action-btn" @click="confirmLogout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useStore()
const router = useRouter()

// 获取用户信息
const userInfo = computed(() => store.state.userInfo)

// 获取健康记录
const healthRecords = computed(() => {
  const userId = userInfo.value.id
  const records = store.getters.getUserHealthRecords(userId) || []
  return records.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 获取活动提醒
const activeReminders = computed(() => {
  const userId = userInfo.value.id
  const reminders = store.getters.getUserReminders(userId) || []
  return reminders.filter(reminder => !reminder.isCompleted)
})

// 计算上次健康记录的天数
const lastRecordDays = computed(() => {
  if (healthRecords.value.length === 0) return 0
  
  const lastDate = new Date(healthRecords.value[0].date)
  const today = new Date()
  const diffTime = Math.abs(today - lastDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
})

// 最近的体重
const lastWeight = computed(() => {
  if (healthRecords.value.length === 0) return '无数据'
  return healthRecords.value[0].weight || '无数据'
})

// 最近的血压
const lastBp = computed(() => {
  if (healthRecords.value.length === 0 || !healthRecords.value[0].bloodPressure) return '无数据'
  const bp = healthRecords.value[0].bloodPressure
  return `${bp.systolic}/${bp.diastolic} mmHg`
})

// 最近的血糖
const lastBloodSugar = computed(() => {
  if (healthRecords.value.length === 0) return '无数据'
  return healthRecords.value[0].bloodSugar || '无数据'
})

// 计算体重趋势
const weightTrend = computed(() => {
  if (healthRecords.value.length < 2 || !healthRecords.value[0].weight || !healthRecords.value[1].weight) {
    return { text: '无变化', class: 'neutral', icon: 'Minus' }
  }
  
  const current = healthRecords.value[0].weight
  const previous = healthRecords.value[1].weight
  const diff = current - previous
  
  if (Math.abs(diff) < 0.1) {
    return { text: '持平', class: 'neutral', icon: 'Minus' }
  } else if (diff > 0) {
    return { text: `增加 ${diff.toFixed(1)}kg`, class: 'increase', icon: 'Top' }
  } else {
    return { text: `减少 ${Math.abs(diff).toFixed(1)}kg`, class: 'decrease', icon: 'Bottom' }
  }
})

// 计算血压趋势
const bpTrend = computed(() => {
  if (
    healthRecords.value.length < 2 || 
    !healthRecords.value[0].bloodPressure || 
    !healthRecords.value[1].bloodPressure
  ) {
    return { text: '无变化', class: 'neutral', icon: 'Minus' }
  }
  
  const current = healthRecords.value[0].bloodPressure.systolic
  const previous = healthRecords.value[1].bloodPressure.systolic
  const diff = current - previous
  
  if (Math.abs(diff) < 2) {
    return { text: '持平', class: 'neutral', icon: 'Minus' }
  } else if (diff > 0) {
    return { text: `上升 ${diff}mmHg`, class: 'increase', icon: 'Top' }
  } else {
    return { text: `下降 ${Math.abs(diff)}mmHg`, class: 'decrease', icon: 'Bottom' }
  }
})

// 计算血糖趋势
const sugarTrend = computed(() => {
  if (
    healthRecords.value.length < 2 || 
    !healthRecords.value[0].bloodSugar || 
    !healthRecords.value[1].bloodSugar
  ) {
    return { text: '无变化', class: 'neutral', icon: 'Minus' }
  }
  
  const current = healthRecords.value[0].bloodSugar
  const previous = healthRecords.value[1].bloodSugar
  const diff = current - previous
  
  if (Math.abs(diff) < 0.1) {
    return { text: '持平', class: 'neutral', icon: 'Minus' }
  } else if (diff > 0) {
    return { text: `上升 ${diff.toFixed(1)}`, class: 'increase', icon: 'Top' }
  } else {
    return { text: `下降 ${Math.abs(diff).toFixed(1)}`, class: 'decrease', icon: 'Bottom' }
  }
})

// 编辑模式控制
const isEditing = ref(false)
const loading = ref(false)
const passwordLoading = ref(false)

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

// 个人信息表单
const profileForm = reactive({
  name: '',
  age: 0,
  gender: '',
  phone: '',
  address: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证方法
const validatePassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入家庭住址', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ]
}

// 切换到编辑模式
const switchToEdit = () => {
  // 填充表单数据
  profileForm.name = userInfo.value.name
  profileForm.age = userInfo.value.age
  profileForm.gender = userInfo.value.gender
  profileForm.phone = userInfo.value.phone
  profileForm.address = userInfo.value.address
  
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
}

// 提交个人信息
const submitProfile = () => {
  profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        // 更新用户信息
        const updatedInfo = {
          ...userInfo.value,
          name: profileForm.name,
          age: profileForm.age,
          gender: profileForm.gender,
          phone: profileForm.phone,
          address: profileForm.address
        }
        
        // 更新用户状态
        store.commit('SET_USER_INFO', updatedInfo)
        
        // 更新用户列表中的用户
        store.commit('UPDATE_USER', {
          id: userInfo.value.id,
          updates: {
            name: profileForm.name,
            age: profileForm.age,
            gender: profileForm.gender,
            phone: profileForm.phone,
            address: profileForm.address
          }
        })
        
        ElMessage({
          type: 'success',
          message: '个人信息更新成功'
        })
        
        isEditing.value = false
      } catch (error) {
        ElMessage.error('更新失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 修改密码
const changePassword = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      
      try {
        // 获取用户列表
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        // 查找当前用户
        const userIndex = users.findIndex(user => user.id === userInfo.value.id)
        
        if (userIndex === -1) {
          throw new Error('用户不存在')
        }
        
        // 验证当前密码
        if (users[userIndex].password !== passwordForm.currentPassword) {
          throw new Error('当前密码不正确')
        }
        
        // 更新密码
        users[userIndex].password = passwordForm.newPassword
        
        // 保存回localStorage
        localStorage.setItem('users', JSON.stringify(users))
        
        ElMessage({
          type: 'success',
          message: '密码修改成功'
        })
        
        // 重置表单
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        
        if (passwordFormRef.value) {
          passwordFormRef.value.resetFields()
        }
      } catch (error) {
        ElMessage.error(error.message || '密码修改失败，请重试')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// 确认退出登录
const confirmLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 执行退出登录
    store.dispatch('logout')
    router.push('/login')
    
    ElMessage({
      type: 'success',
      message: '已退出登录'
    })
  }).catch(() => {})
}

// 组件挂载
onMounted(() => {
  // 可以添加一些初始化逻辑
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-card {
  margin-bottom: 20px;
}

.password-card {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.actions-card {
  margin-bottom: 20px;
}

.stats-content {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #ecf5ff;
  color: #409EFF;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.health-trends {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.trend-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.trend-label {
  font-weight: bold;
  color: #303133;
}

.trend-value {
  color: #606266;
}

.trend-change {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.increase {
  color: #f56c6c;
}

.decrease {
  color: #67c23a;
}

.neutral {
  color: #909399;
}

.actions-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
</style>
