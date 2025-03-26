// Token相关操作 - 使用localStorage模拟
const TOKEN_KEY = 'elder_health_token'
const USER_ROLE_KEY = 'elder_health_role'

// 获取token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// 设置token
export function setToken(token) {
  return localStorage.setItem(TOKEN_KEY, token)
}

// 移除token
export function removeToken() {
  return localStorage.removeItem(TOKEN_KEY)
}

// 获取用户角色
export function getUserRole() {
  return localStorage.getItem(USER_ROLE_KEY)
}

// 设置用户角色
export function setUserRole(role) {
  return localStorage.setItem(USER_ROLE_KEY, role)
}

// 移除用户角色
export function removeUserRole() {
  return localStorage.removeItem(USER_ROLE_KEY)
}
