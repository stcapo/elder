// 系统设置相关API

import axios from 'axios'
import { getToken } from '@/utils/auth'

// 创建一个axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送前添加token
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

// 模拟API调用
const mockApiCall = (data, delay = 500) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '操作成功',
        data
      })
    }, delay)
  })
}

// 获取系统基本设置
export function getBasicSettings() {
  // 从localStorage获取
  const settings = localStorage.getItem('systemBasicSettings')
  return mockApiCall(settings ? JSON.parse(settings) : null)
}

// 保存系统基本设置
export function saveBasicSettings(data) {
  // 保存到localStorage
  localStorage.setItem('systemBasicSettings', JSON.stringify(data))
  return mockApiCall({ success: true })
}

// 获取提醒设置
export function getReminderSettings() {
  const settings = localStorage.getItem('systemReminderSettings')
  return mockApiCall(settings ? JSON.parse(settings) : null)
}

// 保存提醒设置
export function saveReminderSettings(data) {
  localStorage.setItem('systemReminderSettings', JSON.stringify(data))
  return mockApiCall({ success: true })
}

// 获取数据分析设置
export function getDataAnalysisSettings() {
  const settings = localStorage.getItem('systemDataAnalysisSettings')
  return mockApiCall(settings ? JSON.parse(settings) : null)
}

// 保存数据分析设置
export function saveDataAnalysisSettings(data) {
  localStorage.setItem('systemDataAnalysisSettings', JSON.stringify(data))
  return mockApiCall({ success: true })
}

// 获取系统状态
export function getSystemStatus() {
  return mockApiCall({
    storageUsage: Math.floor(Math.random() * 20) + 40, // 40-60%
    storageSize: 1024 * 1024 * 2.5, // 2.5 MB
    onlineUsers: Math.floor(Math.random() * 5) + 1, // 1-5
    todayRecords: Math.floor(Math.random() * 15) + 5, // 5-20
    lastBackupTime: new Date().toISOString()
  })
}

// 清理系统缓存
export function clearSystemCache() {
  return mockApiCall({ success: true }, 1000)
}

// 系统优化
export function optimizeSystem() {
  return mockApiCall({ success: true }, 1500)
}

// 更改管理员密码
export function changeAdminPassword(data) {
  // 模拟密码验证
  if (data.currentPassword !== 'admin123') {
    return Promise.reject({
      code: 400,
      message: '当前密码不正确'
    })
  }
  
  return mockApiCall({ success: true }, 1000)
} 