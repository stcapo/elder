import { createStore } from 'vuex'
import { getToken, setToken, removeToken, getUserRole, setUserRole, removeUserRole } from '@/utils/auth'

export default createStore({
  state: {
    token: getToken(),
    userRole: getUserRole(),
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    healthRecords: JSON.parse(localStorage.getItem('healthRecords') || '[]'),
    healthReminders: JSON.parse(localStorage.getItem('healthReminders') || '[]'),
    users: JSON.parse(localStorage.getItem('users') || '[]'),
  },
  getters: {
    isLoggedIn: state => !!state.token,
    isAdmin: state => state.userRole === 'admin',
    currentUser: state => state.userInfo,
    getUserHealthRecords: state => userId => {
      return state.healthRecords.filter(record => record.userId === userId)
    },
    getUserReminders: state => userId => {
      return state.healthReminders.filter(reminder => reminder.userId === userId)
    }
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      setToken(token)
    },
    SET_USER_ROLE(state, role) {
      state.userRole = role
      setUserRole(role)
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    SET_HEALTH_RECORDS(state, records) {
      state.healthRecords = records
      localStorage.setItem('healthRecords', JSON.stringify(records))
    },
    ADD_HEALTH_RECORD(state, record) {
      state.healthRecords.push(record)
      localStorage.setItem('healthRecords', JSON.stringify(state.healthRecords))
    },
    UPDATE_HEALTH_RECORD(state, { id, updates }) {
      const index = state.healthRecords.findIndex(record => record.id === id)
      if (index !== -1) {
        state.healthRecords[index] = { ...state.healthRecords[index], ...updates }
        localStorage.setItem('healthRecords', JSON.stringify(state.healthRecords))
      }
    },
    DELETE_HEALTH_RECORD(state, id) {
      state.healthRecords = state.healthRecords.filter(record => record.id !== id)
      localStorage.setItem('healthRecords', JSON.stringify(state.healthRecords))
    },
    SET_HEALTH_REMINDERS(state, reminders) {
      state.healthReminders = reminders
      localStorage.setItem('healthReminders', JSON.stringify(reminders))
    },
    ADD_HEALTH_REMINDER(state, reminder) {
      state.healthReminders.push(reminder)
      localStorage.setItem('healthReminders', JSON.stringify(state.healthReminders))
    },
    UPDATE_HEALTH_REMINDER(state, { id, updates }) {
      const index = state.healthReminders.findIndex(reminder => reminder.id === id)
      if (index !== -1) {
        state.healthReminders[index] = { ...state.healthReminders[index], ...updates }
        localStorage.setItem('healthReminders', JSON.stringify(state.healthReminders))
      }
    },
    DELETE_HEALTH_REMINDER(state, id) {
      state.healthReminders = state.healthReminders.filter(reminder => reminder.id !== id)
      localStorage.setItem('healthReminders', JSON.stringify(state.healthReminders))
    },
    SET_USERS(state, users) {
      state.users = users
      localStorage.setItem('users', JSON.stringify(users))
    },
    ADD_USER(state, user) {
      state.users.push(user)
      localStorage.setItem('users', JSON.stringify(state.users))
    },
    UPDATE_USER(state, { id, updates }) {
      const index = state.users.findIndex(user => user.id === id)
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updates }
        localStorage.setItem('users', JSON.stringify(state.users))
      }
    },
    DELETE_USER(state, id) {
      state.users = state.users.filter(user => user.id !== id)
      localStorage.setItem('users', JSON.stringify(state.users))
    },
    RESET_STATE(state) {
      removeToken()
      removeUserRole()
      state.token = null
      state.userRole = null
      state.userInfo = {}
    }
  },
  actions: {
    // 用户登录
    login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        // 模拟后端验证
        const { username, password } = userInfo
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const user = users.find(u => u.username === username && u.password === password)
        
        if (user) {
          commit('SET_TOKEN', username) // 简单token
          commit('SET_USER_ROLE', 'user')
          commit('SET_USER_INFO', {
            id: user.id,
            username: user.username,
            name: user.name,
            age: user.age,
            gender: user.gender,
            phone: user.phone,
            address: user.address
          })
          resolve()
        } else {
          reject(new Error('用户名或密码错误'))
        }
      })
    },
    
    // 管理员登录
    adminLogin({ commit }, adminInfo) {
      return new Promise((resolve, reject) => {
        // 模拟后端验证 (使用硬编码的管理员)
        const { username, password } = adminInfo
        if (username === 'admin' && password === 'admin123') {
          commit('SET_TOKEN', 'admin-token')
          commit('SET_USER_ROLE', 'admin')
          commit('SET_USER_INFO', {
            id: 'admin',
            username: 'admin',
            name: '系统管理员'
          })
          resolve()
        } else {
          reject(new Error('管理员账号或密码错误'))
        }
      })
    },
    
    // 用户注册
    register({ commit }, userInfo) {
      return new Promise((resolve) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const newUser = {
          id: Date.now().toString(),
          ...userInfo,
          createdAt: new Date().toISOString()
        }
        users.push(newUser)
        localStorage.setItem('users', JSON.stringify(users))
        commit('SET_USERS', users)
        resolve()
      })
    },
    
    // 退出登录
    logout({ commit }) {
      commit('RESET_STATE')
    },
    
    // 获取用户健康记录
    getUserHealthRecords({ state }, userId) {
      return state.healthRecords.filter(record => record.userId === userId)
    },
    
    // 添加健康记录
    addHealthRecord({ commit }, record) {
      const newRecord = {
        id: Date.now().toString(),
        ...record,
        createdAt: new Date().toISOString()
      }
      commit('ADD_HEALTH_RECORD', newRecord)
    },
    
    // 添加健康提醒
    addHealthReminder({ commit }, reminder) {
      const newReminder = {
        id: Date.now().toString(),
        ...reminder,
        createdAt: new Date().toISOString()
      }
      commit('ADD_HEALTH_REMINDER', newReminder)
    }
  }
})
