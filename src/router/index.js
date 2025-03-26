import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken, getUserRole } from '@/utils/auth'

// 用户端路由
const userRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/user',
    component: () => import('@/views/user/Layout.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: 'dashboard',
        name: 'UserDashboard',
        component: () => import('@/views/user/Dashboard.vue'),
        meta: { title: '健康概览', icon: 'HomeFilled' }
      },
      {
        path: 'health-records',
        name: 'HealthRecords',
        component: () => import('@/views/user/HealthRecords.vue'),
        meta: { title: '健康记录', icon: 'List' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人信息', icon: 'User' }
      },
      {
        path: 'health-reminders',
        name: 'HealthReminders',
        component: () => import('@/views/user/HealthReminders.vue'),
        meta: { title: '健康提醒', icon: 'Bell' }
      }
    ]
  }
]

// 管理员端路由
const adminRoutes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue'),
    meta: { title: '管理员登录', requiresAuth: false }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '系统概览', icon: 'HomeFilled' }
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'UserFilled' }
      },
      {
        path: 'health-records',
        name: 'AdminHealthRecords',
        component: () => import('@/views/admin/HealthRecords.vue'),
        meta: { title: '健康记录管理', icon: 'Document' }
      },
      {
        path: 'system-settings',
        name: 'SystemSettings',
        component: () => import('@/views/admin/SystemSettings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      },
      {
        path: 'data-backup',
        name: 'DataBackup',
        component: () => import('@/views/admin/DataBackup.vue'),
        meta: { title: '数据备份与恢复', icon: 'Operation' }
      }
    ]
  }
]

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  ...userRoutes,
  ...adminRoutes,
  // 404 route
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 空巢老人健康管理系统` : '空巢老人健康管理系统'
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = getToken()
    const userRole = getUserRole()
    
    if (!token) {
      // 如果需要登录但没有token，重定向到登录页
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else if (to.meta.role && to.meta.role !== userRole) {
      // 如果需要特定角色但角色不匹配，重定向到对应的首页
      if (userRole === 'admin') {
        next({ path: '/admin/dashboard' })
      } else {
        next({ path: '/user/dashboard' })
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
