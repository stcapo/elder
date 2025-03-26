\<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>空巢老人健康管理系统</h2>
        <p>用户注册</p>
      </div>
      
      <el-form 
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="registerRules" 
        class="register-form" 
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerForm.username" 
            prefix-icon="User"
            placeholder="请输入用户名" 
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="registerForm.password" 
            prefix-icon="Lock" 
            type="password" 
            placeholder="请输入密码" 
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            prefix-icon="Lock" 
            type="password" 
            placeholder="请再次输入密码" 
          />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input 
            v-model="registerForm.name"
            placeholder="请输入真实姓名" 
          />
        </el-form-item>
        
        <el-form-item label="年龄" prop="age">
          <el-input-number 
            v-model="registerForm.age"
            :min="1" 
            :max="120"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="registerForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input 
            v-model="registerForm.phone"
            placeholder="请输入联系电话" 
          />
        </el-form-item>
        
        <el-form-item label="家庭住址" prop="address">
          <el-input 
            v-model="registerForm.address"
            type="textarea"
            placeholder="请输入详细家庭住址" 
          />
        </el-form-item>
        
        <div class="btn-container">
          <el-button 
            type="primary" 
            :loading="loading" 
            class="register-btn" 
            @click="handleRegister"
          >
            注册
          </el-button>
        </div>
        
        <div class="options-container">
          <router-link to="/login" class="login-link">已有账号？返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useStore()

// 注册表单引用
const registerFormRef = ref(null)

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  age: 65,
  gender: '男',
  phone: '',
  address: ''
})

// 密码验证方法
const validatePassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入家庭住址', trigger: 'blur' }
  ]
}

// 加载状态
const loading = ref(false)

// 处理注册
const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        // 检查用户名是否已存在
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const existingUser = users.find(user => user.username === registerForm.username)
        
        if (existingUser) {
          throw new Error('用户名已存在，请更换其他用户名')
        }
        
        // 注册新用户
        await store.dispatch('register', {
          username: registerForm.username,
          password: registerForm.password,
          name: registerForm.name,
          age: registerForm.age,
          gender: registerForm.gender,
          phone: registerForm.phone,
          address: registerForm.address
        })
        
        ElMessage({
          message: '注册成功，请登录',
          type: 'success'
        })
        
        // 跳转到登录页
        router.push('/login')
      } catch (error) {
        ElMessage.error(error.message || '注册失败，请稍后再试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('https://source.unsplash.com/random/1920x1080/?elderly,care') no-repeat center center;
  background-size: cover;
  padding: 20px 0;
}

.register-card {
  width: 500px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin: 20px 0;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  font-weight: bold;
  font-size: 22px;
  color: #409EFF;
  margin-bottom: 10px;
}

.register-header p {
  font-size: 16px;
  color: #606266;
}

.register-form {
  margin-top: 20px;
}

.btn-container {
  margin-top: 30px;
}

.register-btn {
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

.login-link {
  color: #409EFF;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
