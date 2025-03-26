\<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-title">页面未找到</div>
      <div class="error-message">抱歉，您访问的页面不存在或已被移除</div>
      
      <div class="actions">
        <el-button type="primary" @click="goBack">
          <el-icon><Back /></el-icon>返回上一页
        </el-button>
        <el-button @click="goHome">
          <el-icon><HomeFilled /></el-icon>返回首页
        </el-button>
      </div>
      
      <div class="illustration">
        <img src="https://source.unsplash.com/random/600x400/?elderly,health" alt="404 Illustration" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 返回首页
const goHome = () => {
  const userRole = store.state.userRole
  
  if (userRole === 'admin') {
    router.push('/admin/dashboard')
  } else {
    router.push('/user/dashboard')
  }
}
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1.2;
  margin-bottom: 20px;
}

.error-title {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
}

.error-message {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.illustration {
  margin-top: 30px;
}

.illustration img {
  max-width: 100%;
  border-radius: 8px;
  height: 200px;
  object-fit: cover;
}
</style>
