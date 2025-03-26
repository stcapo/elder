\<template>
  <div class="app-container">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="sidebar-container">
        <div class="logo-container">
          <h1 class="logo-title">管理员系统</h1>
        </div>
        
        <!-- 菜单 -->
        <el-menu
          :default-active="activeMenu"
          router
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>系统概览</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/user-management">
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/health-records">
            <el-icon><Document /></el-icon>
            <span>健康记录管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/system-settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/data-backup">
            <el-icon><Operation /></el-icon>
            <span>数据备份与恢复</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-right">
            <span class="welcome-text">管理员，{{ userInfo.name || userInfo.username }}</span>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <el-avatar :size="32" src="https://source.unsplash.com/random/100x100/?admin" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 内容区域 -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useStore()

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 获取用户信息
const userInfo = computed(() => {
  return store.state.userInfo
})

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      store.dispatch('logout')
      router.push('/admin/login')
      ElMessage({
        type: 'success',
        message: '退出登录成功!'
      })
    }).catch(() => {})
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.layout-container {
  height: 100%;
}

/* 侧边栏样式 */
.sidebar-container {
  background-color: #304156;
  transition: width 0.28s;
  overflow-y: auto;
}

.logo-container {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #2b3649;
}

.logo-title {
  color: #fff;
  font-size: 18px;
  margin: 0;
  font-weight: bold;
}

.el-menu-vertical {
  border-right: none;
}

/* 头部样式 */
.header {
  background-color: #fff;
  color: #606266;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.welcome-text {
  margin-right: 15px;
  font-size: 14px;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* 内容区域样式 */
.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
