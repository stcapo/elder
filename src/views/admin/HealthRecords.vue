\<template>
  <div class="health-records-management-container">
    <div class="page-header">
      <h2 class="page-title">健康记录管理</h2>
    </div>
    
    <!-- 健康记录筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="用户筛选">
          <el-select 
            v-model="filterForm.userId" 
            placeholder="选择用户" 
            clearable
            filterable
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.name} (${user.username})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="健康指标">
          <el-select 
            v-model="filterForm.healthIndex" 
            placeholder="选择健康指标" 
            clearable
          >
            <el-option label="体重" value="weight" />
            <el-option label="血压" value="bloodPressure" />
            <el-option label="血糖" value="bloodSugar" />
            <el-option label="脉搏" value="pulse" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="健康状态">
          <el-select 
            v-model="filterForm.healthStatus" 
            placeholder="选择健康状态" 
            clearable
          >
            <el-option label="正常" value="normal" />
            <el-option label="异常" value="abnormal" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 健康记录统计 -->
    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-icon record-icon">
              <el-icon size="24"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ filteredRecords.length }}</div>
              <div class="stat-label">筛选出的记录数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-icon user-icon">
              <el-icon size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ countUniqueUsers }}</div>
              <div class="stat-label">涉及用户数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-icon normal-icon">
              <el-icon size="24"><Select /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ countNormalRecords }}</div>
              <div class="stat-label">正常记录数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-icon abnormal-icon">
              <el-icon size="24"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ countAbnormalRecords }}</div>
              <div class="stat-label">异常记录数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 数据导入导出 -->
    <el-card class="data-operations-card">
      <template #header>
        <div class="card-header">
          <span>数据操作</span>
        </div>
      </template>
      <div class="operations-buttons">
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon> 导出选中记录
        </el-button>
        <el-button type="warning" @click="importDialogVisible = true">
          <el-icon><Upload /></el-icon> 导入健康数据
        </el-button>
        <el-button type="danger" :disabled="selectedRecords.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
      </div>
    </el-card>
    
    <!-- 健康记录表格 -->
    <el-card class="records-card">
      <el-table
        v-loading="loading"
        :data="paginatedRecords"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
        stripe
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="用户信息" width="150">
          <template #default="scope">
            <div class="user-info">
              <div class="user-name">{{ getUserName(scope.row.userId) }}</div>
              <div class="user-id">ID: {{ scope.row.userId }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="date" label="日期" sortable width="120" />
        
        <el-table-column label="体重(kg)" width="100">
          <template #default="scope">
            <span 
              :class="{ 'abnormal-value': isWeightAbnormal(scope.row.weight) }"
            >
              {{ scope.row.weight || '-' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="血压(mmHg)" width="150">
          <template #default="scope">
            <span 
              v-if="scope.row.bloodPressure"
              :class="{ 'abnormal-value': isBloodPressureAbnormal(scope.row.bloodPressure) }"
            >
              {{ `${scope.row.bloodPressure.systolic}/${scope.row.bloodPressure.diastolic}` }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="血糖(mmol/L)" width="120">
          <template #default="scope">
            <span 
              :class="{ 'abnormal-value': isBloodSugarAbnormal(scope.row.bloodSugar) }"
            >
              {{ scope.row.bloodSugar || '-' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="脉搏(次/分)" width="120">
          <template #default="scope">
            <span 
              :class="{ 'abnormal-value': isPulseAbnormal(scope.row.pulse) }"
            >
              {{ scope.row.pulse || '-' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="健康状态" width="120">
          <template #default="scope">
            <el-tag :type="getHealthStatus(scope.row).type">
              {{ getHealthStatus(scope.row).status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewRecord(scope.row)"
              text
            >
              查看
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click="handleEditRecord(scope.row)"
              text
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDeleteRecord(scope.row)"
              text
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
          :total="filteredRecords.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 查看/编辑健康记录对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      :title="isEdit ? '编辑健康记录' : '查看健康记录'"
      width="600px"
    >
      <el-form
        ref="recordFormRef"
        :model="recordForm"
        :rules="recordRules"
        label-width="100px"
        :disabled="!isEdit"
      >
        <el-form-item label="用户" prop="userId">
          <el-select 
            v-model="recordForm.userId" 
            placeholder="选择用户" 
            filterable
            :disabled="true"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.name} (${user.username})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="recordForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="体重(kg)" prop="weight">
          <el-input-number
            v-model="recordForm.weight"
            :min="30"
            :max="150"
            :precision="1"
            :step="0.1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="血压(mmHg)">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="systolic">
                <el-input-number
                  v-model="recordForm.systolic"
                  :min="60"
                  :max="200"
                  :step="1"
                  controls-position="right"
                  style="width: 100%"
                  placeholder="收缩压"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="diastolic">
                <el-input-number
                  v-model="recordForm.diastolic"
                  :min="40"
                  :max="120"
                  :step="1"
                  controls-position="right"
                  style="width: 100%"
                  placeholder="舒张压"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item label="血糖(mmol/L)" prop="bloodSugar">
          <el-input-number
            v-model="recordForm.bloodSugar"
            :min="2"
            :max="20"
            :precision="1"
            :step="0.1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="脉搏(次/分)" prop="pulse">
          <el-input-number
            v-model="recordForm.pulse"
            :min="40"
            :max="180"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="recordForm.note"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="!isEdit" 
            type="primary" 
            @click="switchToEdit"
          >
            编辑
          </el-button>
          <el-button 
            v-else 
            type="primary" 
            @click="submitRecord" 
            :loading="submitLoading"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入健康记录"
      width="600px"
    >
      <el-form :model="importForm" label-width="120px">
        <el-form-item label="选择用户" prop="userId">
          <el-select 
            v-model="importForm.userId" 
            placeholder="选择用户" 
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.name} (${user.username})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        
        <el-alert
          title="CSV格式说明: 日期,体重,收缩压,舒张压,血糖,脉搏"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        
        <el-form-item label="CSV数据">
          <el-input
            v-model="importForm.data"
            type="textarea"
            rows="10"
            placeholder="请粘贴CSV数据，格式: 日期,体重,收缩压,舒张压,血糖,脉搏"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleImport" 
            :loading="importLoading"
            :disabled="!importForm.userId || !importForm.data"
          >
            导入数据
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
import { importHealthRecordsFromCSV } from '@/utils/healthData'

const store = useStore()

// 用户列表
const users = computed(() => store.state.users)

// 健康记录列表
const healthRecords = computed(() => store.state.healthRecords)

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)
const importLoading = ref(false)

// 对话框控制
const recordDialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)

// 表单引用
const recordFormRef = ref(null)

// 记录表单数据
const recordForm = reactive({
  userId: '',
  date: '',
  weight: null,
  systolic: null,
  diastolic: null,
  bloodSugar: null,
  pulse: null,
  note: ''
})

// 导入表单数据
const importForm = reactive({
  userId: '',
  data: ''
})

// 表单验证规则
const recordRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

// 筛选表单
const filterForm = reactive({
  userId: '',
  dateRange: [],
  healthIndex: '',
  healthStatus: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 选中的记录
const selectedRecords = ref([])

// 根据筛选条件过滤记录
const filteredRecords = computed(() => {
  let result = [...healthRecords.value]
  
  // 用户筛选
  if (filterForm.userId) {
    result = result.filter(record => record.userId === filterForm.userId)
  }
  
  // 日期范围筛选
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = filterForm.dateRange[0]
    const endDate = filterForm.dateRange[1]
    
    result = result.filter(record => {
      return record.date >= startDate && record.date <= endDate
    })
  }
  
  // 健康指标筛选
  if (filterForm.healthIndex) {
    switch (filterForm.healthIndex) {
      case 'weight':
        result = result.filter(record => record.weight !== null && record.weight !== undefined)
        break
      case 'bloodPressure':
        result = result.filter(record => record.bloodPressure !== null && record.bloodPressure !== undefined)
        break
      case 'bloodSugar':
        result = result.filter(record => record.bloodSugar !== null && record.bloodSugar !== undefined)
        break
      case 'pulse':
        result = result.filter(record => record.pulse !== null && record.pulse !== undefined)
        break
    }
  }
  
  // 健康状态筛选
  if (filterForm.healthStatus) {
    result = result.filter(record => {
      const status = getHealthStatus(record)
      return filterForm.healthStatus === 'normal' ? status.type === 'success' : status.type !== 'success'
    })
  }
  
  // 按日期排序（降序）
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 统计涉及的唯一用户数
const countUniqueUsers = computed(() => {
  const userIds = new Set(filteredRecords.value.map(record => record.userId))
  return userIds.size
})

// 统计正常记录数
const countNormalRecords = computed(() => {
  return filteredRecords.value.filter(record => getHealthStatus(record).type === 'success').length
})

// 统计异常记录数
const countAbnormalRecords = computed(() => {
  return filteredRecords.value.filter(record => getHealthStatus(record).type !== 'success').length
})

// 获取用户名称
const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : '未知用户'
}

// 检查体重是否异常
const isWeightAbnormal = (weight) => {
  if (weight === null || weight === undefined) return false
  return weight < 45 || weight > 90
}

// 检查血压是否异常
const isBloodPressureAbnormal = (bp) => {
  if (!bp) return false
  return bp.systolic > 140 || bp.systolic < 90 || bp.diastolic > 90 || bp.diastolic < 60
}

// 检查血糖是否异常
const isBloodSugarAbnormal = (bloodSugar) => {
  if (bloodSugar === null || bloodSugar === undefined) return false
  return bloodSugar > 7.0 || bloodSugar < 3.9
}

// 检查脉搏是否异常
const isPulseAbnormal = (pulse) => {
  if (pulse === null || pulse === undefined) return false
  return pulse > 100 || pulse < 60
}

// 计算健康状态
const getHealthStatus = (record) => {
  // 默认状态
  let status = '正常'
  let type = 'success'
  
  // 体重异常检查
  if (isWeightAbnormal(record.weight)) {
    status = '体重异常'
    type = 'warning'
  }
  
  // 血压异常检查
  if (record.bloodPressure && isBloodPressureAbnormal(record.bloodPressure)) {
    const { systolic, diastolic } = record.bloodPressure
    if (systolic >= 140 || diastolic >= 90) {
      status = '血压偏高'
      type = 'danger'
    } else if (systolic <= 90 || diastolic <= 60) {
      status = '血压偏低'
      type = 'warning'
    }
  }
  
  // 血糖异常检查
  if (isBloodSugarAbnormal(record.bloodSugar)) {
    if (record.bloodSugar > 7.0) {
      status = '血糖偏高'
      type = 'danger'
    } else if (record.bloodSugar < 3.9) {
      status = '血糖偏低'
      type = 'warning'
    }
  }
  
  // 脉搏异常检查
  if (isPulseAbnormal(record.pulse)) {
    status = '脉搏异常'
    type = record.pulse > 100 ? 'danger' : 'warning'
  }
  
  return { status, type }
}

// 选择变化处理
const handleSelectionChange = (selection) => {
  selectedRecords.value = selection
}

// 查看记录
const handleViewRecord = (record) => {
  isEdit.value = false
  
  // 填充表单数据
  recordForm.id = record.id
  recordForm.userId = record.userId
  recordForm.date = record.date
  recordForm.weight = record.weight
  recordForm.systolic = record.bloodPressure ? record.bloodPressure.systolic : null
  recordForm.diastolic = record.bloodPressure ? record.bloodPressure.diastolic : null
  recordForm.bloodSugar = record.bloodSugar
  recordForm.pulse = record.pulse
  recordForm.note = record.note || ''
  
  // 打开对话框
  recordDialogVisible.value = true
}

// 切换到编辑模式
const switchToEdit = () => {
  isEdit.value = true
}

// 编辑记录
const handleEditRecord = (record) => {
  isEdit.value = true
  
  // 填充表单数据
  recordForm.id = record.id
  recordForm.userId = record.userId
  recordForm.date = record.date
  recordForm.weight = record.weight
  recordForm.systolic = record.bloodPressure ? record.bloodPressure.systolic : null
  recordForm.diastolic = record.bloodPressure ? record.bloodPressure.diastolic : null
  recordForm.bloodSugar = record.bloodSugar
  recordForm.pulse = record.pulse
  recordForm.note = record.note || ''
  
  // 打开对话框
  recordDialogVisible.value = true
}

// 提交记录
const submitRecord = () => {
  recordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        const recordData = {
          date: recordForm.date,
          weight: recordForm.weight,
          bloodPressure: (recordForm.systolic && recordForm.diastolic) ? {
            systolic: recordForm.systolic,
            diastolic: recordForm.diastolic
          } : null,
          bloodSugar: recordForm.bloodSugar,
          pulse: recordForm.pulse,
          note: recordForm.note,
          userId: recordForm.userId
        }
        
        // 更新记录
        store.commit('UPDATE_HEALTH_RECORD', {
          id: recordForm.id,
          updates: recordData
        })
        
        ElMessage({
          type: 'success',
          message: '健康记录更新成功'
        })
        
        // 关闭对话框
        recordDialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败，请重试')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 删除记录
const handleDeleteRecord = (record) => {
  ElMessageBox.confirm('确定要删除这条健康记录吗？此操作不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.commit('DELETE_HEALTH_RECORD', record.id)
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
  }).catch(() => {})
}

// 批量删除记录
const handleBatchDelete = () => {
  if (selectedRecords.value.length === 0) return
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRecords.value.length} 条健康记录吗？此操作不可恢复`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 批量删除记录
    selectedRecords.value.forEach(record => {
      store.commit('DELETE_HEALTH_RECORD', record.id)
    })
    
    ElMessage({
      type: 'success',
      message: `成功删除 ${selectedRecords.value.length} 条健康记录`
    })
    
    // 清空选择
    selectedRecords.value = []
  }).catch(() => {})
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1 // 重置到第一页
}

// 重置筛选
const resetFilter = () => {
  filterForm.userId = ''
  filterForm.dateRange = []
  filterForm.healthIndex = ''
  filterForm.healthStatus = ''
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

// 导出数据
const exportData = () => {
  const dataToExport = selectedRecords.value.length > 0 ? selectedRecords.value : filteredRecords.value
  
  if (dataToExport.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  // 转换为CSV格式
  const headers = ['用户ID', '用户姓名', '日期', '体重(kg)', '收缩压(mmHg)', '舒张压(mmHg)', '血糖(mmol/L)', '脉搏(次/分)', '备注', '健康状态'].join(',')
  
  const rows = dataToExport.map(record => {
    const status = getHealthStatus(record).status
    return [
      record.userId,
      getUserName(record.userId),
      record.date,
      record.weight || '',
      record.bloodPressure ? record.bloodPressure.systolic : '',
      record.bloodPressure ? record.bloodPressure.diastolic : '',
      record.bloodSugar || '',
      record.pulse || '',
      record.note || '',
      status
    ].join(',')
  })
  
  const csvContent = [headers, ...rows].join('\n')
  
  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.setAttribute('download', `健康记录_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage({
    type: 'success',
    message: `成功导出 ${dataToExport.length} 条健康记录`
  })
}

// 处理导入
const handleImport = () => {
  if (!importForm.userId || !importForm.data.trim()) {
    ElMessage.warning('请选择用户并输入CSV数据')
    return
  }
  
  importLoading.value = true
  
  try {
    // 解析CSV数据
    const importedRecords = importHealthRecordsFromCSV(importForm.data, importForm.userId)
    
    if (importedRecords.length === 0) {
      ElMessage.warning('未能解析到有效数据，请检查格式')
      importLoading.value = false
      return
    }
    
    // 添加导入的记录
    const currentRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]')
    const newRecords = [...currentRecords, ...importedRecords]
    
    // 更新存储
    store.commit('SET_HEALTH_RECORDS', newRecords)
    
    ElMessage({
      type: 'success',
      message: `成功导入 ${importedRecords.length} 条健康记录`
    })
    
    // 关闭对话框并清空数据
    importDialogVisible.value = false
    importForm.userId = ''
    importForm.data = ''
  } catch (error) {
    ElMessage.error('导入失败，请检查数据格式')
  } finally {
    importLoading.value = false
  }
}

// 组件挂载
onMounted(() => {
  // 模拟加载
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.health-records-management-container {
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

.stats-card {
  margin-bottom: 20px;
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

.record-icon {
  background-color: #409EFF;
}

.user-icon {
  background-color: #67C23A;
}

.normal-icon {
  background-color: #909399;
}

.abnormal-icon {
  background-color: #F56C6C;
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

.data-operations-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operations-buttons {
  display: flex;
  gap: 10px;
}

.records-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  color: #303133;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.abnormal-value {
  color: #F56C6C;
  font-weight: bold;
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
</style>
