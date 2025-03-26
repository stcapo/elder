// 健康数据相关工具函数

// 生成示例健康数据
export function generateSampleHealthData(userId, days = 30) {
  const healthData = []
  const now = new Date()
  
  // 基准数据
  const baseWeight = Math.floor(Math.random() * 25) + 50 // 50-75kg
  const baseBloodPressureSystolic = Math.floor(Math.random() * 30) + 110 // 110-140
  const baseBloodPressureDiastolic = Math.floor(Math.random() * 20) + 70 // 70-90
  const baseBloodSugar = Math.floor(Math.random() * 3) + 5 // 5-8 mmol/L
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(now.getDate() - i)
    
    // 添加一些随机波动
    const weight = +(baseWeight + (Math.random() - 0.5) * 2).toFixed(1)
    const bloodPressureSystolic = Math.floor(baseBloodPressureSystolic + (Math.random() - 0.5) * 10)
    const bloodPressureDiastolic = Math.floor(baseBloodPressureDiastolic + (Math.random() - 0.5) * 8)
    const bloodSugar = +(baseBloodSugar + (Math.random() - 0.5)).toFixed(1)
    
    healthData.push({
      id: `${userId}-${Date.now()}-${i}`,
      userId,
      date: date.toISOString().slice(0, 10),
      weight,
      bloodPressure: {
        systolic: bloodPressureSystolic,
        diastolic: bloodPressureDiastolic
      },
      bloodSugar,
      pulse: Math.floor(Math.random() * 20) + 60, // 60-80
      createdAt: date.toISOString()
    })
  }
  
  return healthData
}

// 生成健康提醒示例数据
export function generateSampleReminders(userId, count = 5) {
  const types = ['medication', 'checkup', 'exercise', 'diet', 'water']
  const titles = {
    medication: ['服用高血压药', '服用降糖药', '服用钙片', '服用维生素'],
    checkup: ['血压检查', '血糖检查', '体重测量', '定期体检'],
    exercise: ['晨间散步', '太极拳锻炼', '健身操', '户外活动'],
    diet: ['低盐饮食', '控制糖分摄入', '多吃蔬果', '限制油脂摄入'],
    water: ['饮水提醒', '补充水分']
  }
  
  const reminders = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const titleList = titles[type]
    const title = titleList[Math.floor(Math.random() * titleList.length)]
    
    // 随机时间（1-7天内）
    const reminderDate = new Date()
    reminderDate.setDate(now.getDate() + Math.floor(Math.random() * 7) + 1)
    
    reminders.push({
      id: `${userId}-reminder-${Date.now()}-${i}`,
      userId,
      title,
      type,
      description: `请记得${title}，保持健康！`,
      date: reminderDate.toISOString().slice(0, 10),
      time: `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:00`, // 8:00 - 20:00
      isCompleted: false,
      repeat: ['once', 'daily', 'weekly'][Math.floor(Math.random() * 3)],
      createdAt: now.toISOString()
    })
  }
  
  return reminders
}

// 计算健康指标评估
export function calculateHealthStatus(healthRecords) {
  if (!healthRecords || healthRecords.length === 0) return {}
  
  // 获取最新记录
  const latestRecord = healthRecords[0]
  
  // 血压评估
  let bloodPressureStatus = 'normal'
  if (latestRecord.bloodPressure) {
    const { systolic, diastolic } = latestRecord.bloodPressure
    if (systolic >= 140 || diastolic >= 90) {
      bloodPressureStatus = 'high'
    } else if (systolic <= 90 || diastolic <= 60) {
      bloodPressureStatus = 'low'
    }
  }
  
  // 血糖评估
  let bloodSugarStatus = 'normal'
  if (latestRecord.bloodSugar) {
    if (latestRecord.bloodSugar > 7.0) {
      bloodSugarStatus = 'high'
    } else if (latestRecord.bloodSugar < 3.9) {
      bloodSugarStatus = 'low'
    }
  }
  
  // BMI评估（需要用户身高数据）
  let bmiStatus = 'unknown'
  if (latestRecord.weight && latestRecord.height) {
    const heightInMeters = latestRecord.height / 100
    const bmi = latestRecord.weight / (heightInMeters * heightInMeters)
    
    if (bmi < 18.5) {
      bmiStatus = 'underweight'
    } else if (bmi >= 18.5 && bmi < 24) {
      bmiStatus = 'normal'
    } else if (bmi >= 24 && bmi < 28) {
      bmiStatus = 'overweight'
    } else {
      bmiStatus = 'obese'
    }
  }
  
  return {
    bloodPressureStatus,
    bloodSugarStatus,
    bmiStatus
  }
}

// 导出健康数据为CSV
export function exportHealthRecordsToCSV(healthRecords) {
  if (!healthRecords || healthRecords.length === 0) return ''
  
  // CSV头部
  const headers = ['日期', '体重(kg)', '收缩压(mmHg)', '舒张压(mmHg)', '血糖(mmol/L)', '脉搏(次/分)']
  
  // 转换数据为CSV行
  const rows = healthRecords.map(record => {
    return [
      record.date,
      record.weight || '',
      record.bloodPressure ? record.bloodPressure.systolic : '',
      record.bloodPressure ? record.bloodPressure.diastolic : '',
      record.bloodSugar || '',
      record.pulse || ''
    ].join(',')
  })
  
  // 合并成CSV字符串
  return [headers.join(','), ...rows].join('\n')
}

// 解析CSV导入为健康数据
export function importHealthRecordsFromCSV(csvContent, userId) {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')
  
  const records = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (values.length < 4) continue // 忽略不完整的行
    
    records.push({
      id: `${userId}-import-${Date.now()}-${i}`,
      userId,
      date: values[0],
      weight: parseFloat(values[1]) || null,
      bloodPressure: {
        systolic: parseInt(values[2]) || null,
        diastolic: parseInt(values[3]) || null
      },
      bloodSugar: parseFloat(values[4]) || null,
      pulse: parseInt(values[5]) || null,
      createdAt: new Date().toISOString()
    })
  }
  
  return records
}
