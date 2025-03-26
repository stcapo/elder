import { resetSystemData } from '@/utils/initData'

/**
 * 开发工具函数，在生产环境中应被移除
 */

// 将重置函数挂载到window对象，便于通过控制台调用
if (process.env.NODE_ENV === 'development') {
  console.log('开发模式：设置开发工具')
  window.devTools = {
    resetData: resetSystemData,
    viewLocalStorage: () => {
      // 显示所有localStorage数据
      const data = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        try {
          data[key] = JSON.parse(localStorage.getItem(key))
        } catch (e) {
          data[key] = localStorage.getItem(key)
        }
      }
      console.log('当前localStorage数据:', data)
      return data
    },
    clearAllData: () => {
      localStorage.clear()
      console.log('所有localStorage数据已清除！')
      return true
    }
  }
  
  console.log('开发工具已启用，可以通过以下命令使用:')
  console.log('- window.devTools.resetData() - 重置所有系统数据')
  console.log('- window.devTools.viewLocalStorage() - 查看所有存储的数据')
  console.log('- window.devTools.clearAllData() - 清除所有数据')
}

// 开发工具 - 仅在开发环境下使用
export const devTools = {
  // 重置所有系统数据
  resetAllData: () => {
    console.log('=== 重置系统所有数据 ===')
    const result = resetSystemData()
    console.log('系统数据重置结果:', result ? '成功' : '失败')
    console.log('===========================')
    return result
  },
  
  // 清除登录状态
  clearLoginState: () => {
    console.log('=== 清除登录状态 ===')
    localStorage.removeItem('elder_health_token')
    localStorage.removeItem('elder_health_role')
    localStorage.removeItem('userInfo')
    console.log('登录状态已清除')
    console.log('=================')
    return true
  }
}

// 自动重置数据（开发环境下）
export function autoResetData() {
  if (process.env.NODE_ENV === 'development') {
    console.log('开发环境：自动重置系统数据')
    resetSystemData()
  }
}
