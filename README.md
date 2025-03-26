# 空巢老人健康管理系统

这是一个专为空巢老人设计的健康管理系统，旨在帮助老年人记录和监控健康数据，提供健康提醒，促进健康生活方式。

## 项目介绍

空巢老人健康管理系统是一个基于 Vue 3 开发的 Web 应用程序，为老年人提供简单易用的健康管理工具。系统分为用户端和管理员端两部分，用户可以记录和查看自己的健康数据，管理员可以管理系统用户和数据。

### 主要功能

**用户端**
- 健康数据记录：记录体重、血压、血糖等健康指标
- 健康趋势分析：通过图表可视化展示健康数据趋势
- 健康提醒：设置药物、检查等健康提醒
- 个人信息管理：管理个人基本信息

**管理员端**
- 用户管理：管理系统用户信息
- 健康数据管理：管理所有用户的健康记录
- 系统设置：配置系统参数和提醒规则
- 数据备份与恢复：系统数据的备份和恢复功能

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **UI 组件库**：Element Plus
- **状态管理**：Vuex 4
- **路由管理**：Vue Router 4
- **图表库**：ECharts
- **网络请求**：Axios（模拟）
- **数据存储**：使用 localStorage 模拟数据库

## 项目结构

```
front/
├── public/                   # 静态资源
├── src/                      # 源代码
│   ├── api/                  # API 请求
│   ├── assets/               # 项目资源文件
│   ├── components/           # 公共组件
│   ├── router/               # 路由配置
│   ├── store/                # Vuex 状态管理
│   ├── utils/                # 工具函数
│   ├── views/                # 页面视图
│   │   ├── admin/            # 管理员页面
│   │   └── user/             # 用户页面
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── package.json              # 项目依赖
└── README.md                 # 项目说明
```

## 开发和运行

### 安装依赖

```bash
cd front
npm install
```

### 开发模式运行

```bash
npm run serve
```

### 生产环境构建

```bash
npm run build
```

## 登录信息

### 用户端
- 用户名：user1
- 密码：123456

### 管理员端
- 用户名：admin
- 密码：admin123

## 注意事项

- 本项目使用 localStorage 存储数据，没有后端服务器
- 系统主要演示前端功能，不包含实际的数据存储和安全验证
- 所有操作都在浏览器本地完成，关闭浏览器或清除缓存会导致数据丢失

## 功能截图

### 用户端截图

![用户登录](https://source.unsplash.com/random/800x500/?login)

![用户健康概览](https://source.unsplash.com/random/800x500/?health,dashboard)

![健康记录](https://source.unsplash.com/random/800x500/?medical,record)

### 管理员端截图

![管理员面板](https://source.unsplash.com/random/800x500/?admin,dashboard)

![用户管理](https://source.unsplash.com/random/800x500/?user,management)

## 许可证

[MIT License](LICENSE)
