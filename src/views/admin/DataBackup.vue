\<template>
  <div class="data-backup-container">
    <h2 class="page-title">数据备份与恢复</h2>
    
    <!-- 数据概览 -->
    <el-card class="data-overview-card">
      <template #header>
        <div class="card-header">
          <span>系统数据概览</span>
          <el-button type="primary" size="small" plain @click="refreshDataStats">
            <el-icon><Refresh /></el-icon> 刷新数据
          </el-button>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-icon users-icon">
              <el-icon size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dataStats.userCount }}</div>
              <div class="stat-label">用户数据</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-icon records-icon">
              <el-icon size="24"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dataStats.recordCount }}</div>
              <div class="stat-label">健康记录</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-icon reminders-icon">
              <el-icon size="24"><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dataStats.reminderCount }}</div>
              <div class="stat-label">健康提醒</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-icon settings-icon">
              <el-icon size="24"><Setting /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dataStats.settingsCount }}</div>
              <div class="stat-label">系统设置</div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <div class="data-size-info">
        <span class="data-size-label">总数据大小：</span>
        <span class="data-size-value">{{ formatStorageSize(dataStats.totalSize) }}</span>
      </div>
    </el-card>
    
    <!-- 备份操作 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="backup-card">
          <template #header>
            <div class="card-header">
              <span>数据备份</span>
            </div>
          </template>
          
          <div class="backup-options">
            <h3 class="section-title">选择备份内容</h3>
            
            <el-form :model="backupOptions" label-position="top">
              <el-form-item>
                <el-checkbox v-model="backupOptions.selectAll" @change="handleSelectAllChange">
                  全选
                </el-checkbox>
              </el-form-item>
              
              <el-form-item label="备份范围">
                <el-checkbox-group v-model="backupOptions.dataTypes">
                  <el-checkbox label="users">用户数据</el-checkbox>
                  <el-checkbox label="healthRecords">健康记录</el-checkbox>
                  <el-checkbox label="healthReminders">健康提醒</el-checkbox>
                  <el-checkbox label="systemSettings">系统设置</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item label="备份名称">
                <el-input 
                  v-model="backupOptions.backupName" 
                  placeholder="备份名称（如：每日备份_20250326）"
                />
              </el-form-item>
              
              <el-form-item label="备份说明">
                <el-input 
                  v-model="backupOptions.description" 
                  type="textarea"
                  rows="3"
                  placeholder="备份说明（可选）"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  :loading="backupLoading" 
                  :disabled="backupOptions.dataTypes.length === 0"
                  @click="handleBackup"
                >
                  <el-icon><Download /></el-icon> 开始备份
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card class="restore-card">
          <template #header>
            <div class="card-header">
              <span>数据恢复</span>
            </div>
          </template>
          
          <div class="restore-options">
            <h3 class="section-title">从备份文件恢复</h3>
            
            <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
              <input 
                ref="fileInputRef" 
                type="file" 
                style="display: none" 
                accept=".json"
                @change="handleFileChange"
              />
              
              <el-icon size="36" class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <div class="primary-text">点击或拖拽文件到此处上传</div>
                <div class="secondary-text">支持.json格式的备份文件</div>
              </div>
            </div>
            
            <div v-if="selectedFile" class="selected-file">
              <div class="file-info">
                <el-icon><Document /></el-icon>
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">({{ formatStorageSize(selectedFile.size) }})</span>
              </div>
              <el-button 
                type="danger" 
                size="small" 
                circle
                @click="removeSelectedFile"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            
            <div class="restore-actions" v-if="selectedFile">
              <el-form :model="restoreOptions" label-position="top">
                <el-form-item label="恢复选项">
                  <el-radio-group v-model="restoreOptions.mode">
                    <el-radio label="merge">合并数据（保留现有数据）</el-radio>
                    <el-radio label="replace">完全替换（清除现有数据）</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item>
                  <el-alert
                    title="数据恢复前请确认备份文件的完整性，恢复操作无法撤销"
                    type="warning"
                    show-icon
                    :closable="false"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button 
                    type="warning" 
                    :loading="restoreLoading" 
                    @click="handleRestore"
                  >
                    <el-icon><Upload /></el-icon> 开始恢复
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 备份历史 -->
    <el-card class="backup-history-card">
      <template #header>
        <div class="card-header">
          <span>备份历史</span>
        </div>
      </template>
      
      <el-table 
        :data="backupHistory" 
        style="width: 100%" 
        border 
        stripe
      >
        <el-table-column prop="name" label="备份名称" min-width="160" />
        
        <el-table-column prop="date" label="备份时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="size" label="文件大小" width="120">
          <template #default="scope">
            {{ formatStorageSize(scope.row.size) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="dataTypes" label="备份内容" width="220">
          <template #default="scope">
            <el-tag 
              v-for="type in scope.row.dataTypes" 
              :key="type" 
              size="small"
              :type="getDataTypeTagType(type)"
              class="data-type-tag"
            >
              {{ getDataTypeLabel(type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="备份说明" show-overflow-tooltip />
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="downloadBackup(scope.row)"
            >
              下载
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click="restoreFromHistory(scope.row)"
            >
              恢复
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteBackup(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="backupHistory.length === 0" class="no-backup-history">
        <el-empty description="暂无备份历史记录" />
      </div>
    </el-card>
    
    <!-- 确认恢复对话框 -->
    <el-dialog
      v-model="restoreConfirmVisible"
      title="确认恢复"
      width="500px"
    >
      <div class="restore-confirm-content">
        <el-alert
          title="数据恢复将覆盖或合并现有数据，此操作无法撤销"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        
        <p class="confirm-message">
          您确定要从 <strong>{{ restoreConfirmInfo.name }}</strong> 恢复数据吗？
        </p>
        
        <p class="confirm-details">
          备份时间：{{ formatDate(restoreConfirmInfo.date) }}<br>
          恢复模式：{{ restoreConfirmInfo.mode === 'merge' ? '合并数据' : '完全替换' }}
        </p>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="restoreConfirmVisible = false">取消</el-button>
          <el-button 
            type="warning" 
            @click="confirmRestore" 
            :loading="restoreLoading"
          >
            确认恢复
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
const fileInputRef = ref(null)

// 加载状态
const backupLoading = ref(false)
const restoreLoading = ref(false)

// 选中的文件
const selectedFile = ref(null)

// 恢复确认对话框
const restoreConfirmVisible = ref(false)
const restoreConfirmInfo = reactive({
  name: '',
  date: '',
  mode: 'merge'
})

// 数据统计
const dataStats = reactive({
  userCount: 0,
  recordCount: 0,
  reminderCount: 0,
  settingsCount: 4,
  totalSize: 0
})

// 备份选项
const backupOptions = reactive({
  selectAll: true,
  dataTypes: ['users', 'healthRecords', 'healthReminders', 'systemSettings'],
  backupName: `健康系统备份_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
  description: ''
})

// 恢复选项
const restoreOptions = reactive({
  mode: 'merge' // merge或replace
})

// 备份历史
const backupHistory = ref([
  {
    id: '1',
    name: '每日备份_20250325',
    date: '2025-03-25T08:00:00Z',
    size: 1024 * 1024 * 1.5, // 1.5 MB
    dataTypes: ['users', 'healthRecords', 'healthReminders', 'systemSettings'],
    description: '系统每日自动备份'
  },
  {
    id: '2',
    name: '手动备份_20250320',
    date: '2025-03-20T14:30:00Z',
    size: 1024 * 1024 * 1.2, // 1.2 MB
    dataTypes: ['users', 'healthRecords'],
    description: '用户数据更新前的手动备份'
  }
])

// 计算属性
const allDataTypes = computed(() => {
  return ['users', 'healthRecords', 'healthReminders', 'systemSettings']
})

// 方法
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
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取数据类型标签
const getDataTypeLabel = (type) => {
  const labels = {
    users: '用户数据',
    healthRecords: '健康记录',
    healthReminders: '健康提醒',
    systemSettings: '系统设置'
  }
  return labels[type] || type
}

// 获取数据类型标签样式
const getDataTypeTagType = (type) => {
  const types = {
    users: 'primary',
    healthRecords: 'success',
    healthReminders: 'warning',
    systemSettings: 'info'
  }
  return types[type] || ''
}

// 全选变化处理
const handleSelectAllChange = (val) => {
  backupOptions.dataTypes = val ? [...allDataTypes.value] : []
}

// 刷新数据统计
const refreshDataStats = () => {
  // 获取用户数据
  dataStats.userCount = store.state.users.length
  
  // 获取健康记录数据
  dataStats.recordCount = store.state.healthRecords.length
  
  // 获取健康提醒数据
  dataStats.reminderCount = store.state.healthReminders.length
  
  // 计算总数据大小
  const usersSize = calculateJsonSize(store.state.users)
  const recordsSize = calculateJsonSize(store.state.healthRecords)
  const remindersSize = calculateJsonSize(store.state.healthReminders)
  const settingsSize = 1024 * 10 // 假设设置数据大小 10KB
  
  dataStats.totalSize = usersSize + recordsSize + remindersSize + settingsSize
  
  ElMessage({
    type: 'success',
    message: '数据统计已刷新'
  })
}

// 计算JSON数据大小
const calculateJsonSize = (data) => {
  try {
    const jsonString = JSON.stringify(data)
    return new Blob([jsonString]).size
  } catch (error) {
    console.error('计算数据大小错误:', error)
    return 0
  }
}

// 触发文件输入
const triggerFileInput = () => {
  fileInputRef.value.click()
}

// 文件选择变化处理
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      selectedFile.value = file
    } else {
      ElMessage.error('请选择.json格式的备份文件')
    }
  }
}

// 文件拖放处理
const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      selectedFile.value = file
    } else {
      ElMessage.error('请选择.json格式的备份文件')
    }
  }
}

// 移除选中文件
const removeSelectedFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 处理备份
const handleBackup = () => {
  if (backupOptions.dataTypes.length === 0) {
    ElMessage.warning('请至少选择一种数据类型进行备份')
    return
  }
  
  if (!backupOptions.backupName.trim()) {
    ElMessage.warning('请输入备份名称')
    return
  }
  
  backupLoading.value = true
  
  // 收集备份数据
  const backupData = {}
  
  if (backupOptions.dataTypes.includes('users')) {
    backupData.users = store.state.users
  }
  
  if (backupOptions.dataTypes.includes('healthRecords')) {
    backupData.healthRecords = store.state.healthRecords
  }
  
  if (backupOptions.dataTypes.includes('healthReminders')) {
    backupData.healthReminders = store.state.healthReminders
  }
  
  if (backupOptions.dataTypes.includes('systemSettings')) {
    // 模拟系统设置数据
    backupData.systemSettings = {
      basicSettings: JSON.parse(localStorage.getItem('systemBasicSettings') || '{}'),
      reminderSettings: JSON.parse(localStorage.getItem('systemReminderSettings') || '{}'),
      dataAnalysisSettings: JSON.parse(localStorage.getItem('systemDataAnalysisSettings') || '{}')
    }
  }
  
  // 添加元数据
  backupData.metadata = {
    name: backupOptions.backupName,
    date: new Date().toISOString(),
    dataTypes: [...backupOptions.dataTypes],
    description: backupOptions.description,
    version: '1.0.0'
  }
  
  // 计算数据大小
  const backupSize = calculateJsonSize(backupData)
  
  // 模拟备份过程
  setTimeout(() => {
    // 创建备份下载
    const backupJson = JSON.stringify(backupData, null, 2)
    const blob = new Blob([backupJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = `${backupOptions.backupName}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 添加到备份历史
    backupHistory.value.unshift({
      id: Date.now().toString(),
      name: backupOptions.backupName,
      date: new Date().toISOString(),
      size: backupSize,
      dataTypes: [...backupOptions.dataTypes],
      description: backupOptions.description
    })
    
    // 保存备份历史到localStorage
    localStorage.setItem('backupHistory', JSON.stringify(backupHistory.value))
    
    ElMessage({
      type: 'success',
      message: '数据备份成功，文件已开始下载'
    })
    
    backupLoading.value = false
  }, 1500)
}

// 处理恢复
const handleRestore = () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择备份文件')
    return
  }
  
  // 设置确认信息
  restoreConfirmInfo.name = selectedFile.value.name
  restoreConfirmInfo.date = new Date().toISOString()
  restoreConfirmInfo.mode = restoreOptions.mode
  
  // 显示确认对话框
  restoreConfirmVisible.value = true
}

// 确认恢复
const confirmRestore = () => {
  restoreLoading.value = true
  
  // 模拟从文件读取数据
  const reader = new FileReader()
  
  reader.onload = (event) => {
    try {
      const backupData = JSON.parse(event.target.result)
      
      // 检查备份数据的有效性
      if (!backupData.metadata) {
        throw new Error('无效的备份文件：缺少元数据')
      }
      
      // 根据恢复模式处理数据
      if (restoreOptions.mode === 'replace') {
        // 完全替换模式
        if (backupData.users) {
          store.commit('SET_USERS', backupData.users)
        } else {
          store.commit('SET_USERS', [])
        }
        
        if (backupData.healthRecords) {
          store.commit('SET_HEALTH_RECORDS', backupData.healthRecords)
        } else {
          store.commit('SET_HEALTH_RECORDS', [])
        }
        
        if (backupData.healthReminders) {
          store.commit('SET_HEALTH_REMINDERS', backupData.healthReminders)
        } else {
          store.commit('SET_HEALTH_REMINDERS', [])
        }
      } else {
        // 合并模式
        if (backupData.users) {
          // 合并用户数据，以用户ID为键
          const currentUsers = [...store.state.users]
          const backupUsers = [...backupData.users]
          
          // 创建ID映射
          const userMap = {}
          currentUsers.forEach(user => {
            userMap[user.id] = user
          })
          
          // 合并或添加备份用户
          backupUsers.forEach(user => {
            if (userMap[user.id]) {
              // 用户已存在，跳过
            } else {
              // 添加新用户
              currentUsers.push(user)
            }
          })
          
          store.commit('SET_USERS', currentUsers)
        }
        
        if (backupData.healthRecords) {
          // 合并健康记录，以记录ID为键
          const currentRecords = [...store.state.healthRecords]
          const backupRecords = [...backupData.healthRecords]
          
          // 创建ID映射
          const recordMap = {}
          currentRecords.forEach(record => {
            recordMap[record.id] = record
          })
          
          // 合并或添加备份记录
          backupRecords.forEach(record => {
            if (recordMap[record.id]) {
              // 记录已存在，跳过
            } else {
              // 添加新记录
              currentRecords.push(record)
            }
          })
          
          store.commit('SET_HEALTH_RECORDS', currentRecords)
        }
        
        if (backupData.healthReminders) {
          // 合并健康提醒，以提醒ID为键
          const currentReminders = [...store.state.healthReminders]
          const backupReminders = [...backupData.healthReminders]
          
          // 创建ID映射
          const reminderMap = {}
          currentReminders.forEach(reminder => {
            reminderMap[reminder.id] = reminder
          })
          
          // 合并或添加备份提醒
          backupReminders.forEach(reminder => {
            if (reminderMap[reminder.id]) {
              // 提醒已存在，跳过
            } else {
              // 添加新提醒
              currentReminders.push(reminder)
            }
          })
          
          store.commit('SET_HEALTH_REMINDERS', currentReminders)
        }
      }
      
      // 恢复系统设置
      if (backupData.systemSettings) {
        if (backupData.systemSettings.basicSettings) {
          localStorage.setItem('systemBasicSettings', JSON.stringify(backupData.systemSettings.basicSettings))
        }
        
        if (backupData.systemSettings.reminderSettings) {
          localStorage.setItem('systemReminderSettings', JSON.stringify(backupData.systemSettings.reminderSettings))
        }
        
        if (backupData.systemSettings.dataAnalysisSettings) {
          localStorage.setItem('systemDataAnalysisSettings', JSON.stringify(backupData.systemSettings.dataAnalysisSettings))
        }
      }
      
      ElMessage({
        type: 'success',
        message: '数据恢复成功'
      })
      
      // 添加到备份历史（如果不存在）
      const existingBackup = backupHistory.value.find(backup => backup.name === backupData.metadata.name)
      if (!existingBackup) {
        backupHistory.value.unshift({
          id: Date.now().toString(),
          name: backupData.metadata.name,
          date: backupData.metadata.date,
          size: calculateJsonSize(backupData),
          dataTypes: backupData.metadata.dataTypes,
          description: backupData.metadata.description
        })
        
        // 保存备份历史到localStorage
        localStorage.setItem('backupHistory', JSON.stringify(backupHistory.value))
      }
      
      // 清空选中文件
      removeSelectedFile()
      
    } catch (error) {
      console.error('恢复数据错误:', error)
      ElMessage.error('恢复失败：无效的备份文件或数据格式')
    } finally {
      restoreLoading.value = false
      restoreConfirmVisible.value = false
    }
  }
  
  reader.onerror = () => {
    ElMessage.error('读取备份文件失败')
    restoreLoading.value = false
    restoreConfirmVisible.value = false
  }
  
  reader.readAsText(selectedFile.value)
}

// 从历史中恢复
const restoreFromHistory = (backup) => {
  // 设置确认信息
  restoreConfirmInfo.name = backup.name
  restoreConfirmInfo.date = backup.date
  restoreConfirmInfo.mode = restoreOptions.mode
  
  // 显示确认对话框
  restoreConfirmVisible.value = true
}

// 下载备份
const downloadBackup = (backup) => {
  // 模拟下载过程（实际应该从服务器或localStorage获取）
  ElMessage({
    type: 'info',
    message: `正在下载备份：${backup.name}`
  })
}

// 删除备份
const deleteBackup = (backup) => {
  ElMessageBox.confirm(`确定要删除备份"${backup.name}"吗？此操作不可撤销。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中删除
    backupHistory.value = backupHistory.value.filter(item => item.id !== backup.id)
    
    // 更新localStorage
    localStorage.setItem('backupHistory', JSON.stringify(backupHistory.value))
    
    ElMessage({
      type: 'success',
      message: '备份已删除'
    })
  }).catch(() => {})
}

// 组件挂载
onMounted(() => {
  // 初始化数据统计
  refreshDataStats()
  
  // 从localStorage加载备份历史
  const savedBackupHistory = localStorage.getItem('backupHistory')
  if (savedBackupHistory) {
    try {
      backupHistory.value = JSON.parse(savedBackupHistory)
    } catch (error) {
      console.error('加载备份历史错误:', error)
    }
  }
})
</script>

<style scoped>
.data-backup-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: bold;
  color: #303133;
}

.data-overview-card,
.backup-card,
.restore-card,
.backup-history-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 4px;
  background-color: #f5f7fa;
  margin-bottom: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: #fff;
  margin-right: 15px;
}

.users-icon {
  background-color: #409EFF;
}

.records-icon {
  background-color: #67C23A;
}

.reminders-icon {
  background-color: #E6A23C;
}

.settings-icon {
  background-color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.data-size-info {
  margin-top: 20px;
  text-align: right;
  font-size: 14px;
  color: #606266;
}

.data-size-value {
  font-weight: bold;
  color: #409EFF;
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  color: #303133;
}

.upload-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 160px;
  border: 2px dashed #DCDFE6;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #409EFF;
}

.upload-icon {
  color: #909399;
  margin-bottom: 10px;
}

.upload-text {
  text-align: center;
}

.primary-text {
  font-size: 16px;
  color: #303133;
  margin-bottom: 5px;
}

.secondary-text {
  font-size: 13px;
  color: #909399;
}

.selected-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name {
  font-weight: bold;
  color: #303133;
}

.file-size {
  color: #909399;
  font-size: 13px;
}

.restore-actions {
  margin-top: 20px;
}

.data-type-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.no-backup-history {
  padding: 30px 0;
}

.restore-confirm-content {
  padding: 10px 0;
}

.confirm-message {
  font-size: 16px;
  margin-bottom: 15px;
}

.confirm-details {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
