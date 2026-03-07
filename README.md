# Vueact Framework

Vueact 史无前例的融合形式框架，
通过 react 底层的jsx语法糖进行实现，
使用vue的响应系统，
底层放弃fiber,转而使用proxy，实现强大高性能可拓展的响应系统，
提供类 Vue 和类似 React 的开发体验.
特别适合react 转 vue 的新手或者vue转react的用户，提供平滑的迁移路径


## 📦 项目结构

```
vueact/
├── index.ts                 # 统一导出入口
├── package.json             # 包配置
├── tsconfig.json            # TypeScript 配置
├── core/                    # 核心层
│   ├── Vueact.ts            # 核心类定义
│   ├── types.ts             # 类型定义
│   └── index.ts             # 核心导出
├── reactivity/              # 响应式系统
│   ├── ref.ts               # 响应式引用
│   ├── reactive.ts          # 响应式对象
│   ├── computed.ts          # 计算属性
│   ├── watch.ts             # 侦听器
│   ├── effect.ts            # 副作用管理
│   └── index.ts             # 响应式导出
├── vdom/                    # 虚拟 DOM
│   ├── vnode.ts             # VNode 类型定义
│   ├── h.ts                 # h 创建函数
│   └── index.ts             # vdom 导出
├── renderer/                # 渲染器
│   ├── mount.ts             # 挂载逻辑
│   ├── patch.ts             # 补丁更新
│   ├── unmount.ts           # 卸载逻辑
│   └── index.ts             # 渲染器导出
├── diff/                    # Diff 算法
│   ├── diff.ts              # Diff 核心算法
│   ├── list.ts              # 列表更新（最长递增子序列）
│   └── index.ts             # Diff 导出
├── component/               # 组件系统
│   ├── component.ts         # 组件定义
│   ├── props.ts             # props 处理
│   ├── emit.ts              # emit 事件
│   └── index.ts             # 组件导出
├── lifecycle/               # 生命周期
│   ├── lifecycle.ts         # 生命周期钩子
│   └── index.ts             # 生命周期导出
├── directives/              # 指令系统
│   ├── vModel.ts            # v-model 指令
│   ├── vIf.ts               # v-if 指令
│   ├── vFor.ts              # v-for 指令
│   └── index.ts             # 指令导出
├── event/                   # 事件系统
│   ├── event.ts             # 事件绑定
│   └── index.ts             # 事件导出
├── utils/                   # 工具函数
│   ├── nextTick.ts          # nextTick
│   ├── toRefs.ts            # toRefs
│   └── index.ts             # 工具导出
└── vueact-dom.ts            # DOM 操作工具
```

## 🏗️ 模块功能说明

### 1. Core (核心层)
- **Vueact.ts**: 框架主类，负责初始化和协调各模块
- **types.ts**: 定义框架核心类型（VNode、Component、Effect 等）
- **index.ts**: 统一导出核心模块

### 2. Reactivity (响应式系统)
- **ref.ts**: 创建响应式引用，支持 `.value` 访问
- **reactive.ts**: 创建响应式对象，支持深度响应
- **computed.ts**: 计算属性，支持缓存和依赖追踪
- **watch.ts**: 侦听器，监听数据变化执行回调
- **effect.ts**: 副作用管理，依赖收集和触发更新
- **index.ts**: 导出所有响应式 API

### 3. Virtual DOM (虚拟 DOM)
- **vnode.ts**: 定义 VNode 类型和结构
- **h.ts**: 创建 VNode 的工厂函数（JSX 转换目标）
- **index.ts**: 导出虚拟 DOM 相关 API

### 4. Renderer (渲染器)
- **mount.ts**: 将 VNode 挂载到真实 DOM
- **patch.ts**: 对比新旧 VNode 并更新 DOM
- **unmount.ts**: 卸载组件和清理资源
- **index.ts**: 导出渲染器 API

### 5. Diff Algorithm (Diff 算法)
- **diff.ts**: 实现虚拟 DOM 对比算法
- **list.ts**: 列表更新算法（最长递增子序列优化）
- **index.ts**: 导出 Diff 相关函数

### 6. Component (组件系统)
- **component.ts**: 组件定义和实例管理
- **props.ts**: 处理组件 props 传递和验证
- **emit.ts**: 处理组件事件发射
- **index.ts**: 导出组件相关 API

### 7. Lifecycle (生命周期)
- **lifecycle.ts**: 实现生命周期钩子
  - `onBeforeMount`: 组件挂载前
  - `onMounted`: 组件挂载后
  - `onBeforeUpdate`: 组件更新前
  - `onUpdated`: 组件更新后
  - `onBeforeUnmount`: 组件卸载前
  - `onUnmounted`: 组件卸载后
- **index.ts**: 导出所有生命周期钩子

### 8. Directives (指令系统)
- **vModel.ts**: 实现双向数据绑定
- **vIf.ts**: 实现条件渲染
- **vFor.ts**: 实现列表渲染
- **index.ts**: 导出所有指令

### 9. Event (事件系统)
- **event.ts**: 事件绑定、卸载和委托
- **index.ts**: 导出事件相关 API（on, off）

### 10. Utils (工具函数)
- **nextTick.ts**: 异步更新工具
- **toRefs.ts**: 将响应式对象转换为普通对象
- **index.ts**: 导出工具函数

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 构建
```bash
npm run build

## 📝 开发规范

- 所有模块采用 TypeScript 编写
- 使用 ES Module 规范
- 遵循单一职责原则
- 保持模块间低耦合

## 🔧 配置说明

### TypeScript (tsconfig.json)
- Target: ES2020
- Module: ESNext
- JSX: preserve (由 Babel 处理)
- 严格模式：开启

### Babel 配置
- JSX 工厂函数：`h`
- JSX Fragment：`Fragment`

## 📄 License

ISC
