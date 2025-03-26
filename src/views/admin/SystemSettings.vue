\<template>
  <div class="system-settings-container">
    <h2 class="page-title">系统设置</h2>
    
    <el-row :gutter="20">
      <el-col :xs="24" :md="16">
        <!-- 基本设置 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>基本设置</span>
            </div>
          </template>
          
          <el-form 
            ref="basicSettingsFormRef"
            :model="basicSettings" 
            label-width="180px"
          >
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            
            <el-form-item label="管理员联系邮箱">
              <el-input v-model="basicSettings.adminEmail" />
            </el-form-item>
            
            <el-form-item label="系统主题色">
              <el-color-picker v-model="basicSettings.themeColor" show-alpha />
            </el-form-item>
            
            <el-form-item label="允许用户自行注册">
              <el-switch v-model="basicSettings.allowUserRegistration" />
            </el-form-item>
            
            <el-form-item label="健康记录最大保存时长">
              <el-select v-model="basicSettings.recordsRetentionDays" style="width: 100%">
                <el-option :value="30" label="30天" />
                <el-option :value="90" label="90天" />
                <el-option :value="180" label="180天" />
                <el-option :value="365" label="1年" />
                <el-option :value="0" label="永久保存" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 提醒设置 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>提醒设置</span>
            </div>
          </template>
          
          <el-form 
            ref="reminderSettingsFormRef"
            :model="reminderSettings" 
            label-width="180px"
          >
            <el-form-item label="自动健康提醒">
              <el-switch v-model="reminderSettings.enableAutoReminders" />
            </el-form-item>
            
            <el-form-item label="提醒发送时间">
              <el-time-picker 
                v-model="reminderSettings.reminderTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间"
                style="width: 100%"
                :disabled="!reminderSettings.enableAutoReminders"
              />
            </el-form-item>
            
            <el-form-item label="血压异常提醒阈值">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input-number 
                    v-model="reminderSettings.bpHighThreshold" 
                    :min="120" 
                    :max="200" 
                    controls-position="right"
                    :disabled="!reminderSettings.enableAutoReminders"
                  />
                  <span class="threshold-label">/ (收缩压)</span>
                </el-col>
                <el-col :span="12">
                  <el-input-number 
                    v-model="reminderSettings.bpDiastolicThreshold" 
                    :min="80" 
                    :max="120" 
                    controls-position="right"
                    :disabled="!reminderSettings.enableAutoReminders"
                  />
                  <span class="threshold-label">(舒张压)</span>
                </el-col>
              </el-row>
            </el-form-item>
            
            <el-form-item label="血糖异常提醒阈值">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input-number 
                    v-model="reminderSettings.bloodSugarLowThreshold" 
                    :min="2" 
                    :max="4" 
                    :precision="1"
                    :step="0.1"
                    controls-position="right"
                    :disabled="!reminderSettings.enableAutoReminders"
                  />
                  <span class="threshold-label">(过低)</span>
                </el-col>
                <el-col :span="12">
                  <el-input-number 
                    v-model="reminderSettings.bloodSugarHighThreshold" 
                    :min="6" 
                    :max="15" 
                    :precision="1"
                    :step="0.1"
                    controls-position="right"
                    :disabled="!reminderSettings.enableAutoReminders"
                  />
                  <span class="threshold-label">(过高)</span>
                </el-col>
              </el-row>
            </el-form-item>
            
            <el-form-item label="定期检查提醒间隔">
              <el-select 
                v-model="reminderSettings.checkupReminderInterval" 
                style="width: 100%"
                :disabled="!reminderSettings.enableAutoReminders"
              >
                <el-option :value="7" label="每周" />
                <el-option :value="14" label="每两周" />
                <el-option :value="30" label="每月" />
                <el-option :value="90" label="每季度" />
                <el-option :value="180" label="每半年" />
                <el-option :value="0" label="不提醒" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveReminderSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 数据分析设置 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>数据分析设置</span>
            </div>
          </template>
          
          <el-form 
            ref="dataAnalysisSettingsFormRef"
            :model="dataAnalysisSettings" 
            label-width="180px"
          >
            <el-form-item label="启用数据异常检测">
              <el-switch v-model="dataAnalysisSettings.enableAnomalyDetection" />
            </el-form-item>
            
            <el-form-item label="异常波动阈值 (%)">
              <el-slider
                v-model="dataAnalysisSettings.anomalyThreshold"
                :min="5"
                :max="50"
                :step="5"
                :disabled="!dataAnalysisSettings.enableAnomalyDetection"
              />
            </el-form-item>
            
            <el-form-item label="生成健康趋势报告">
              <el-select 
                v-model="dataAnalysisSettings.healthReportInterval" 
                style="width: 100%"
              >
                <el-option :value="1" label="每天" />
                <el-option :value="7" label="每周" />
                <el-option :value="30" label="每月" />
                <el-option :value="0" label="不生成" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="数据分析窗口">
              <el-select 
                v-model="dataAnalysisSettings.analysisTimeWindow" 
                style="width: 100%"
              >
                <el-option :value="7" label="最近一周" />
                <el-option :value="30" label="最近一个月" />
                <el-option :value="90" label="最近三个月" />
                <el-option :value="180" label="最近半年" />
                <el-option :value="365" label="最近一年" />
                <el-option :value="0" label="全部数据" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveDataAnalysisSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="8">
        <!-- 系统状态 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
              <el-button type="primary" size="small" plain @click="refreshSystemStatus">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          
          <div class="system-status">
            <div class="status-item">
              <div class="status-label">数据存储使用量</div>
              <el-progress 
                :percentage="systemStatus.storageUsage" 
                :color="getStorageColor"
              />
              <div class="status-details">{{ formatStorageSize(systemStatus.storageSize) }}</div>
            </div>
            
            <div class="status-item">
              <div class="status-label">当前在线用户</div>
              <div class="status-value">{{ systemStatus.onlineUsers }}</div>
            </div>
            
            <div class="status-item">
              <div class="status-label">今日新增记录数</div>
              <div class="status-value">{{ systemStatus.todayRecords }}</div>
            </div>
            
            <div class="status-item">
              <div class="status-label">上次备份时间</div>
              <div class="status-value">{{ formatDate(systemStatus.lastBackupTime) }}</div>
            </div>
            
            <div class="system-actions">
              <el-button type="warning" plain @click="clearSystemCache">
                清理缓存
              </el-button>
              <el-button type="primary" plain @click="optimizeSystem">
                系统优化
              </el-button>
            </div>
          </div>
        </el-card>
        
        <!-- 管理员账户设置 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>管理员账户设置</span>
            </div>
          </template>
          
          <el-form 
            ref="adminSettingsFormRef"
            :model="adminSettings" 
            :rules="adminRules"
            label-width="100px"
          >
            <el-form-item label="管理员名" prop="username">
              <el-input v-model="adminSettings.username" disabled />
            </el-form-item>
            
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input 
                v-model="adminSettings.currentPassword" 
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="adminSettings.newPassword" 
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="adminSettings.confirmPassword" 
                type="password"
                show-password
                placeholder="请确认新密码"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="changeAdminPassword" :loading="passwordLoading">
                更改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 关于系统 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>关于系统</span>
            </div>
          </template>
          
          <div class="about-system">
            <div class="system-logo">
              <img src="https://source.unsplash.com/random/100x100/?health" alt="系统Logo" />
            </div>
            
            <div class="system-info">
              <div class="system-name">空巢老人健康管理系统</div>
              <div class="system-version">版本: 1.0.0</div>
              <div class="system-description">
                本系统旨在为空巢老人提供健康管理服务，包括健康记录管理、健康提醒、数据分析等功能。
              </div>
              
              <div class="system-copyright">
                © {{ new Date().getFullYear() }} 健康管理系统团队
              </div>
            </div>
            
            <div class="system-tech">
              <div class="tech-title">技术栈</div>
              <div class="tech-list">
                <el-tag size="small">Python</el-tag>
                <el-tag size="small" type="success">Element Plus</el-tag>
                <el-tag size="small" type="warning">Flask</el-tag>
                <el-tag size="small" type="danger">ECharts</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElLoading } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { 
  getBasicSettings as fetchBasicSettings, 
  saveBasicSettings as submitBasicSettings,
  getReminderSettings as fetchReminderSettings,
  saveReminderSettings as submitReminderSettings,
  getDataAnalysisSettings as fetchDataAnalysisSettings,
  saveDataAnalysisSettings as submitDataAnalysisSettings,
  getSystemStatus as fetchSystemStatus,
  clearSystemCache as apiClearCache,
  optimizeSystem as apiOptimizeSystem,
  changeAdminPassword as apiChangePassword
} from '@/api/settings'

const store = useStore()

// 密码加载状态
const passwordLoading = ref(false)

// 基本设置
const basicSettings = reactive({
  systemName: '空巢老人健康管理系统',
  adminEmail: 'admin@healthsystem.com',
  themeColor: '#409EFF',
  allowUserRegistration: true,
  recordsRetentionDays: 365
})

// 提醒设置
const reminderSettings = reactive({
  enableAutoReminders: true,
  reminderTime: '08:00',
  bpHighThreshold: 140,
  bpDiastolicThreshold: 90,
  bloodSugarLowThreshold: 3.9,
  bloodSugarHighThreshold: 7.0,
  checkupReminderInterval: 30
})

// 数据分析设置
const dataAnalysisSettings = reactive({
  enableAnomalyDetection: true,
  anomalyThreshold: 20,
  healthReportInterval: 7,
  analysisTimeWindow: 30
})

// 管理员设置
const adminSettings = reactive({
  username: 'admin',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 系统状态
const systemStatus = reactive({
  storageUsage: 45,
  storageSize: 1024 * 1024 * 2.5, // 2.5 MB
  onlineUsers: 3,
  todayRecords: 12,
  lastBackupTime: new Date().toISOString()
})

// 验证密码确认
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== adminSettings.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 管理员表单验证规则
const adminRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 表单引用
const basicSettingsFormRef = ref(null)
const reminderSettingsFormRef = ref(null)
const dataAnalysisSettingsFormRef = ref(null)
const adminSettingsFormRef = ref(null)

// 根据使用量获取颜色
const getStorageColor = computed(() => {
  if (systemStatus.storageUsage < 50) return '#67C23A'
  if (systemStatus.storageUsage < 80) return '#E6A23C'
  return '#F56C6C'
})

// 格式化存储大小
const formatStorageSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '无'
  
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 保存基本设置
const saveBasicSettings = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '保存中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    await submitBasicSettings(basicSettings)
    
    ElMessage({
      type: 'success',
      message: '基本设置保存成功'
    })
    
    loading.close()
  } catch (error) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'))
  }
}

// 保存提醒设置
const saveReminderSettings = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '保存中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    await submitReminderSettings(reminderSettings)
    
    ElMessage({
      type: 'success',
      message: '提醒设置保存成功'
    })
    
    loading.close()
  } catch (error) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'))
  }
}

// 保存数据分析设置
const saveDataAnalysisSettings = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '保存中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    await submitDataAnalysisSettings(dataAnalysisSettings)
    
    ElMessage({
      type: 'success',
      message: '数据分析设置保存成功'
    })
    
    loading.close()
  } catch (error) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'))
  }
}

// 更改管理员密码
const changeAdminPassword = () => {
  adminSettingsFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      
      try {
        await apiChangePassword({
          currentPassword: adminSettings.currentPassword,
          newPassword: adminSettings.newPassword
        })
        
        ElMessage({
          type: 'success',
          message: '管理员密码修改成功'
        })
        
        // 重置表单
        adminSettings.currentPassword = ''
        adminSettings.newPassword = ''
        adminSettings.confirmPassword = ''
        adminSettingsFormRef.value.resetFields()
      } catch (error) {
        ElMessage.error(error.message || '密码修改失败，请重试')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// 刷新系统状态
const refreshSystemStatus = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '刷新中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    const { data } = await fetchSystemStatus()
    if (data) {
      Object.assign(systemStatus, data)
    }
    
    ElMessage({
      type: 'success',
      message: '系统状态已刷新'
    })
    
    loading.close()
  } catch (error) {
    ElMessage.error('获取系统状态失败：' + (error.message || '未知错误'))
  }
}

// 清理系统缓存
const clearSystemCache = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '清理缓存中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    await apiClearCache()
    
    ElMessage({
      type: 'success',
      message: '系统缓存已清理'
    })
    
    loading.close()
  } catch (error) {
    ElMessage.error('清理缓存失败：' + (error.message || '未知错误'))
  }
}

// 系统优化
const optimizeSystem = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '系统优化中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    await apiOptimizeSystem()
    
    // 刷新系统状态
    await refreshSystemStatus()
    
    ElMessage({
      type: 'success',
      message: '系统优化完成，已释放部分存储空间'
    })
    
    loading.close()
  } catch (error) {
    ElMessage.error('系统优化失败：' + (error.message || '未知错误'))
  }
}

// 组件挂载
onMounted(async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '加载系统设置...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 获取各项设置
    const [basicRes, reminderRes, dataAnalysisRes, statusRes] = await Promise.all([
      fetchBasicSettings(),
      fetchReminderSettings(),
      fetchDataAnalysisSettings(),
      fetchSystemStatus()
    ])
    
    // 更新基本设置
    if (basicRes.data) {
      Object.assign(basicSettings, basicRes.data)
    }
    
    // 更新提醒设置
    if (reminderRes.data) {
      Object.assign(reminderSettings, reminderRes.data)
    }
    
    // 更新数据分析设置
    if (dataAnalysisRes.data) {
      Object.assign(dataAnalysisSettings, dataAnalysisRes.data)
    }
    
    // 更新系统状态
    if (statusRes.data) {
      Object.assign(systemStatus, statusRes.data)
    }
    
    loading.close()
  } catch (error) {
    ElMessage.error('加载系统设置失败：' + (error.message || '未知错误'))
  }
})
</script>

<style scoped>
.system-settings-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: bold;
  color: #303133;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.threshold-label {
  margin-left: 5px;
  color: #909399;
  font-size: 12px;
}

.system-status {
  padding: 10px 0;
}

.status-item {
  margin-bottom: 20px;
}

.status-label {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.status-value {
  font-size: 24px;
  color: #409EFF;
  font-weight: bold;
  margin: 5px 0;
}

.status-details {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}

.system-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.about-system {
  padding: 10px 0;
}

.system-logo {
  text-align: center;
  margin-bottom: 20px;
}

.system-logo img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.system-info {
  text-align: center;
  margin-bottom: 20px;
}

.system-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.system-version {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.system-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.system-copyright {
  font-size: 12px;
  color: #909399;
  margin-top: 20px;
}

.system-tech {
  margin-top: 20px;
}

.tech-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>
