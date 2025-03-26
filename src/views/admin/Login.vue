\<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>空巢老人健康管理系统</h2>
        <p>管理员登录</p>
      </div>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form" 
        label-position="top"
      >
        <el-form-item label="管理员账号" prop="username">
          <el-input 
            v-model="loginForm.username" 
            prefix-icon="User"
            placeholder="请输入管理员账号" 
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            prefix-icon="Lock" 
            type="password" 
            placeholder="请输入密码" 
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <div class="btn-container">
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-btn" 
            @click="handleLogin"
          >
            登录
          </el-button>
        </div>
        
        <div class="options-container">
          <router-link to="/login" class="user-link">返回用户登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const store = useStore()

// 登录表单引用
const loginFormRef = ref(null)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 加载状态
const loading = ref(false)

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await store.dispatch('adminLogin', loginForm)
        
        // 登录成功，跳转到管理员首页
        router.push('/admin/dashboard')
        
        ElMessage({
          message: '管理员登录成功',
          type: 'success'
        })
      } catch (error) {
        ElMessage.error(error.message || '登录失败，请检查管理员账号和密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('https://source.unsplash.com/random/1920x1080/?digital,health,management') no-repeat center center;
  background-size: cover;
}

.login-card {
  width: 400px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-weight: bold;
  font-size: 22px;
  color: #409EFF;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 16px;
  color: #606266;
}

.login-form {
  margin-top: 20px;
}

.btn-container {
  margin-top: 30px;
}

.login-btn {
  width: 100%;
  font-size: 16px;
  height: 44px;
}

.options-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  font-size: 14px;
}

.user-link {
  color: #409EFF;
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}
</style>
