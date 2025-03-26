\<template>
  <div class="health-records-container">
    <div class="page-header">
      <h2 class="page-title">健康记录</h2>
      <el-button type="primary" @click="openAddRecordDialog">
        <el-icon><Plus /></el-icon>添加健康记录
      </el-button>
    </div>
    
    <!-- 健康记录筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
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
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 健康记录表格 -->
    <el-card class="records-card">
      <el-table
        v-loading="loading"
        :data="paginatedRecords"
        style="width: 100%"
        row-key="id"
        border
        stripe
        :empty-text="`暂无健康记录，请点击'添加健康记录'按钮添加`"
      >
        <el-table-column
          prop="date"
          label="日期"
          sortable
          width="120"
        />
        <el-table-column
          prop="weight"
          label="体重(kg)"
          width="100"
        >
          <template #default="scope">
            {{ scope.row.weight || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="血压(mmHg)"
          width="150"
        >
          <template #default="scope">
            {{ scope.row.bloodPressure ? 
               `${scope.row.bloodPressure.systolic}/${scope.row.bloodPressure.diastolic}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="bloodSugar"
          label="血糖(mmol/L)"
          width="120"
        >
          <template #default="scope">
            {{ scope.row.bloodSugar || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="pulse"
          label="脉搏(次/分)"
          width="120"
        >
          <template #default="scope">
            {{ scope.row.pulse || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="健康状态"
          width="120"
        >
          <template #default="scope">
            <el-tag :type="getHealthStatus(scope.row).type">
              {{ getHealthStatus(scope.row).status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="150"
        >
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleEdit(scope.row)"
              text
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
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
    
    <!-- 添加/编辑健康记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑健康记录' : '添加健康记录'"
      width="500px"
    >
      <el-form
        ref="recordFormRef"
        :model="recordForm"
        :rules="recordRules"
        label-width="100px"
      >
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
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRecord" :loading="submitLoading">
            {{ isEdit ? '保存修改' : '添加记录' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 数据导入导出 -->
    <el-card class="data-operations-card">
      <template #header>
        <div class="card-header">
          <span>健康数据操作</span>
        </div>
      </template>
      <div class="operations-buttons">
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon> 导出为CSV
        </el-button>
        <el-button type="warning" @click="importDialogVisible = true">
          <el-icon><Upload /></el-icon> 导入CSV数据
        </el-button>
      </div>
    </el-card>
    
    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入健康记录"
      width="500px"
    >
      <el-alert
        title="CSV格式说明: 日期,体重,收缩压,舒张压,血糖,脉搏"
        type="info"
        :closable="false"
        show-icon
      />
      <div class="import-form">
        <el-input
          v-model="importData"
          type="textarea"
          rows="10"
          placeholder="请粘贴CSV数据，格式: 日期,体重,收缩压,舒张压,血糖,脉搏"
        />
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importLoading">
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
import { exportHealthRecordsToCSV, importHealthRecordsFromCSV } from '@/utils/healthData'

const store = useStore()

// 用户信息
const userInfo = computed(() => store.state.userInfo)

// 健康记录数据
const records = computed(() => {
  const userId = userInfo.value.id
  return store.getters.getUserHealthRecords(userId) || []
})

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)
const importLoading = ref(false)

// 对话框控制
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)

// 记录表单引用
const recordFormRef = ref(null)

// 记录表单数据
const recordForm = reactive({
  date: '',
  weight: null,
  systolic: null,
  diastolic: null,
  bloodSugar: null,
  pulse: null,
  note: ''
})

// 表单验证规则
const recordRules = {
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

// 导入数据
const importData = ref('')

// 筛选表单
const filterForm = reactive({
  dateRange: []
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 根据筛选条件过滤记录
const filteredRecords = computed(() => {
  let result = [...records.value]
  
  // 按日期排序（降序）
  result.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  // 日期范围筛选
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = filterForm.dateRange[0]
    const endDate = filterForm.dateRange[1]
    
    result = result.filter(record => {
      return record.date >= startDate && record.date <= endDate
    })
  }
  
  return result
})

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 打开添加记录对话框
const openAddRecordDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
  
  // 默认设置为今天日期
  recordForm.date = new Date().toISOString().slice(0, 10)
}

// 重置表单
const resetForm = () => {
  recordForm.date = ''
  recordForm.weight = null
  recordForm.systolic = null
  recordForm.diastolic = null
  recordForm.bloodSugar = null
  recordForm.pulse = null
  recordForm.note = ''
  
  // 重置表单验证
  if (recordFormRef.value) {
    recordFormRef.value.resetFields()
  }
}

// 处理编辑
const handleEdit = (row) => {
  isEdit.value = true
  
  // 填充表单数据
  recordForm.id = row.id
  recordForm.date = row.date
  recordForm.weight = row.weight
  recordForm.systolic = row.bloodPressure ? row.bloodPressure.systolic : null
  recordForm.diastolic = row.bloodPressure ? row.bloodPressure.diastolic : null
  recordForm.bloodSugar = row.bloodSugar
  recordForm.pulse = row.pulse
  recordForm.note = row.note || ''
  
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条健康记录吗？此操作不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.commit('DELETE_HEALTH_RECORD', row.id)
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
  }).catch(() => {})
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
          userId: userInfo.value.id
        }
        
        if (isEdit.value) {
          // 更新记录
          store.commit('UPDATE_HEALTH_RECORD', {
            id: recordForm.id,
            updates: recordData
          })
          ElMessage({
            type: 'success',
            message: '健康记录更新成功'
          })
        } else {
          // 添加新记录
          store.dispatch('addHealthRecord', recordData)
          ElMessage({
            type: 'success',
            message: '健康记录添加成功'
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

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1 // 重置到第一页
}

// 重置筛选
const resetFilter = () => {
  filterForm.dateRange = []
  currentPage.value = 1
}

// 计算健康状态
const getHealthStatus = (record) => {
  // 默认状态
  let status = '正常'
  let type = 'success'
  
  // 血压异常检查
  if (record.bloodPressure) {
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
  if (record.bloodSugar) {
    if (record.bloodSugar > 7.0) {
      status = '血糖偏高'
      type = 'danger'
    } else if (record.bloodSugar < 3.9) {
      status = '血糖偏低'
      type = 'warning'
    }
  }
  
  return { status, type }
}

// 导出数据为CSV
const exportData = () => {
  const csvContent = exportHealthRecordsToCSV(filteredRecords.value)
  
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
    message: '数据导出成功'
  })
}

// 处理导入
const handleImport = () => {
  if (!importData.value.trim()) {
    ElMessage.warning('请输入CSV数据')
    return
  }
  
  importLoading.value = true
  
  try {
    // 解析CSV数据
    const importedRecords = importHealthRecordsFromCSV(importData.value, userInfo.value.id)
    
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
    importData.value = ''
  } catch (error) {
    ElMessage.error('导入失败，请检查数据格式')
  } finally {
    importLoading.value = false
  }
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
.health-records-container {
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

.records-card {
  margin-bottom: 20px;
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

.data-operations-card {
  margin-bottom: 20px;
}

.operations-buttons {
  display: flex;
  gap: 10px;
}

.import-form {
  margin-top: 20px;
}
</style>
