import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { initializeData } from '@/utils/initData'

// 导入开发工具（仅在开发环境使用）
import { autoResetData } from '@/utils/devTools'

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化系统数据
if (process.env.NODE_ENV === 'development') {
  // 在开发环境下，自动重置数据
  autoResetData()
} else {
  // 在生产环境下，只初始化缺失的数据
  initializeData()
}

app.use(store)
  .use(router)
  .use(ElementPlus, { size: 'default' })
  .mount('#app')
