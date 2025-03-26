import sampleData from '@/assets/data/sampleData.json'

/**
 * 初始化系统数据
 * 检查localStorage中是否已有数据，如果没有则导入示例数据
 */
export function initializeData() {
  console.log('正在检查系统数据...')
  
  // 检查并初始化用户数据
  if (!localStorage.getItem('users') || JSON.parse(localStorage.getItem('users')).length === 0) {
    console.log('初始化用户数据...')
    localStorage.setItem('users', JSON.stringify(sampleData.users))
  }
  
  // 检查并初始化健康记录数据
  if (!localStorage.getItem('healthRecords') || JSON.parse(localStorage.getItem('healthRecords')).length === 0) {
    console.log('初始化健康记录数据...')
    localStorage.setItem('healthRecords', JSON.stringify(sampleData.healthRecords))
  }
  
  // 检查并初始化健康提醒数据
  if (!localStorage.getItem('healthReminders') || JSON.parse(localStorage.getItem('healthReminders')).length === 0) {
    console.log('初始化健康提醒数据...')
    localStorage.setItem('healthReminders', JSON.stringify(sampleData.healthReminders))
  }
  
  // 检查并初始化系统设置数据
  if (!localStorage.getItem('systemBasicSettings')) {
    console.log('初始化基本设置数据...')
    localStorage.setItem('systemBasicSettings', JSON.stringify(sampleData.settings.basicSettings))
  }
  
  if (!localStorage.getItem('systemReminderSettings')) {
    console.log('初始化提醒设置数据...')
    localStorage.setItem('systemReminderSettings', JSON.stringify(sampleData.settings.reminderSettings))
  }
  
  if (!localStorage.getItem('systemDataAnalysisSettings')) {
    console.log('初始化数据分析设置...')
    localStorage.setItem('systemDataAnalysisSettings', JSON.stringify(sampleData.settings.dataAnalysisSettings))
  }
  
  // 如果没有管理员信息，确保创建默认管理员
  ensureAdminAccount()
  
  console.log('系统数据初始化完成！')
}

/**
 * 确保系统中存在管理员账号
 */
function ensureAdminAccount() {
  // 管理员凭据是硬编码的，但我们仍然可以保存一些管理员相关的信息
  if (!localStorage.getItem('adminInfo')) {
    const adminInfo = {
      id: 'admin',
      username: 'admin',
      name: '系统管理员',
      role: 'admin',
      lastLogin: new Date().toISOString()
    }
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo))
    console.log('创建默认管理员账号信息')
  }
}

/**
 * 重置系统数据（用于开发和测试）
 */
export function resetSystemData() {
  // 清除现有数据
  localStorage.removeItem('users')
  localStorage.removeItem('healthRecords')
  localStorage.removeItem('healthReminders')
  localStorage.removeItem('systemBasicSettings')
  localStorage.removeItem('systemReminderSettings')
  localStorage.removeItem('systemDataAnalysisSettings')
  localStorage.removeItem('adminInfo')
  
  // 清除登录状态
  localStorage.removeItem('elder_health_token')
  localStorage.removeItem('elder_health_role')
  localStorage.removeItem('userInfo')
  
  // 重新初始化
  initializeData()
  
  console.log('系统数据已重置！')
  
  return true
}
