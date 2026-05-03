# Vueact Framework

<div align="center">

**融合 Vue 响应式与 React JSX 的创新框架**

**An Innovative Framework Combining Vue Reactivity with React JSX**

[![npm version](https://img.shields.io/npm/v/@winde/vueact.svg)](https://www.npmjs.com/package/@winde/vueact)
[![license](https://img.shields.io/npm/l/@winde/vueact.svg)](https://github.com/w1nde-repo/Vueact/blob/main/LICENSE)

---

**🌐 语言 / Language**

[简体中文](#-快速开始) | [English](#english-version)

</div>

---

<!-- zh -->
## 🌟 简介

Vueact 是一个创新型的融合框架：

- ⚡ **React JSX 语法** - 使用 JSX 编写组件，类型安全、开发体验优秀
- 🎯 **类 Vue 响应式系统** - 基于 Proxy 实现强大的响应式数据绑定
- 🚀 **高性能渲染** - 放弃 Fiber，采用组件级独立 Effect，更新更精准
- 🔧 **内置路由系统** - 支持 hash/history 模式，动态路由配置
- 📦 **完整生命周期** - 提供类 Vue 的生命周期钩子
- 🌍 **全局状态管理** - ref 支持全局访问，无需复杂配置，开箱即用
- 🎨 **灵活的 JSX 支持** - className/class 都可使用
<!-- end -->

---

## 📦 项目结构

```
vueact/
├── index.ts                 # 统一导出入口
├── package.json             # 包配置（@winde/vueact）
├── tsconfig.json            # TypeScript 配置
├── rollup.config.js         # Rollup 打包配置
├── core/                    # 核心层
│   ├── Vueact.ts            # 核心类定义
│   └── types.ts             # 类型定义
├── reactive/                # 响应式系统
│   ├── index.ts             # 响应式模块导出
│   ├── ref.ts               # 响应式引用
│   ├── reactive.ts          # 响应式对象
│   ├── computed.ts          # 计算属性
│   ├── watch.ts             # 侦听器
│   ├── effect.ts            # 副作用管理
│   └── vModel.ts            # v-model 指令
├── vdom/                    # 虚拟 DOM
│   ├── index.ts             # VDOM 模块导出
│   ├── Type.ts              # VNode 类型定义
│   ├── h.ts                 # h 创建函数
│   ├── patch.ts             # 挂载和更新
│   └── props.ts             # props 处理
├── lifecycle/               # 生命周期
│   ├── index.ts             # 生命周期模块导出
│   ├── Type.ts              # 生命周期类型定义
│   └── hooks.ts             # 生命周期钩子实现
├── Router/                  # 路由系统
│   ├── index.ts             # 路由实现
│   └── Type.ts              # 路由类型定义
└── LazyDog/                 # 懒加载组件
    └── index.ts             # 懒加载实现
```

---

## 🏗️ 模块功能说明

### 1. Core（核心层）
- **Vueact.ts**: 框架主类，负责初始化应用和协调各模块
- **types.ts**: 定义框架核心类型（Router、Route 等）

### 2. Reactivity（响应式系统）
- **index.ts**: 统一导出响应式模块所有 API
- **ref.ts**: 创建响应式引用，支持 `.value` 访问，组件内自动缓存
- **reactive.ts**: 创建响应式对象，支持深度响应
- **computed.ts**: 计算属性，支持缓存和依赖追踪
- **watch.ts**: 侦听器，监听数据变化执行回调
- **effect.ts**: 副作用管理，依赖收集和触发更新
- **vModel.ts**: 实现双向数据绑定指令

### 3. Virtual DOM（虚拟 DOM）
- **index.ts**: 统一导出 VDOM 模块所有 API
- **Type.ts**: 定义 VNode 类型和结构
- **h.ts**: 创建 VNode 的工厂函数（JSX 转换目标），支持 Fragment
- **patch.ts**: 实现 VNode 的挂载和更新逻辑，包含组件 diff 算法
- **props.ts**: 处理组件 props 传递和 DOM 属性更新

### 4. Lifecycle（生命周期）
- **index.ts**: 统一导出生命周期模块所有 API
- **Type.ts**: 定义生命周期钩子类型
- **hooks.ts**: 实现生命周期钩子
  - `onBeforeMount`: 组件挂载前
  - `onMounted`: 组件挂载后
  - `onBeforeUpdate`: 组件更新前
  - `onUpdated`: 组件更新后
  - `onBeforeUnmount`: 组件卸载前
  - `onUnmounted`: 组件卸载后

### 5. Router（路由系统）
- **index.ts**: 实现路由核心功能
  - `createRouter`: 创建路由器实例
  - `useRouter`: 获取当前路由信息和导航方法
  - `RouterView`: 路由视图组件，渲染匹配的路由组件
  - 支持 hash 和 history 两种模式
  - 支持动态路由参数（`:param` 形式）
  - 支持嵌套路由
  - 支持路由守卫（before/after）
- **Type.ts**: 定义路由相关类型（Route, RouterOptions, CurrentRoute 等）

### 6. LazyDog（懒加载组件）
- **index.ts**: 实现组件懒加载功能
  - `LazyDog`: 标准懒加载，接收组件加载器
  - `LazyDog.show`: 配置全局/局部 loading 和 error 组件
  - `preload`: 预加载指定组件
  - `clearCache`: 清除组件缓存
  - `isCached`: 检查组件是否已缓存
  - 支持路由级别的局部配置
  - 内置默认 loading 和 error 占位组件

---

## 🚀 快速开始

### 使用 create-vueact 创建项目

```bash
# npm
npm create @winde/vueact@latest

# yarn
yarn create @winde/vueact

# pnpm
pnpm create @winde/vueact
```

### 手动安装

```bash
npm install @winde/vueact
```

### 基础示例

```jsx
import { Vueact, ref, computed, onMounted } from '@winde/vueact';

function App() {
  // 响应式状态
  const count = ref(0);
  const message = ref('Hello Vueact!');
  
  // 计算属性
  const double = computed(() => count.value * 2);
  
  // 生命周期
  onMounted(() => {
    console.log('组件已挂载');
  });
  
  // 事件处理
  const handleClick = () => {
    count.value++;
  };
  
  // JSX 渲染
  return (
    <div>
      <h1>{message.value}</h1>
      <p>计数：{count.value}</p>
      <p>双倍：{double.value}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

// 挂载应用
const app = new Vueact('root');
app.render(App);
```

---

## 🎯 核心特性

### 1. 响应式系统

```javascript
import { ref, reactive, computed, watch } from '@winde/vueact';

// ref - 基础类型
const count = ref(0);
count.value++;

// reactive - 对象
const state = reactive({
  user: { name: 'John', age: 25 }
});
state.user.age = 26;

// computed - 计算属性
const double = computed(() => count.value * 2);

// watch - 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`从 ${oldVal} 变为 ${newVal}`);
});
```

### 2. 组件系统

```jsx
import { ref, onMounted } from '@winde/vueact';

function Counter(props) {
  const count = ref(0);
  
  onMounted(() => {
    console.log('Counter 组件已挂载');
  });
  
  return (
    <div>
      <p>{props.title}: {count.value}</p>
      <button onClick={() => count.value++}>+1</button>
    </div>
  );
}

// 使用组件
<Counter title="计数器" />;
```

### 3. 路由系统

#### 基础用法

```jsx
import { Vueact, RouterView, useRouter } from '@winde/vueact';

// 配置路由
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User }
];

// 在组件中使用
function Nav() {
  const router = useRouter();
  
  return (
    <nav>
      <button onClick={() => router.push('/')}>首页</button>
      <button onClick={() => router.push('/about')}>关于</button>
      <button onClick={() => router.push('/user/123')}>用户</button>
      <p>当前路径: {router.currentRoute?.path}</p>
      <p>路由名称: {router.currentRoute?.name}</p>
    </nav>
  );
}

// 根组件
function App() {
  return (
    <div>
      <Nav />
      <RouterView />
    </div>
  );
}

// 初始化应用
const app = new Vueact('root');
app.router({ routes, mode: 'hash' });  // 或 'history'
app.render(App);
```

#### 动态路由参数

```jsx
function User() {
  const router = useRouter();
  const { id } = router.currentRoute?.params || {};
  
  return <div>用户 ID: {id}</div>;
}
```

#### 嵌套路由

```jsx
const routes = [
  {
    path: '/user/:id',
    component: UserLayout,
    children: [
      { path: '', component: UserProfile },      // /user/123
      { path: 'posts', component: UserPosts },   // /user/123/posts
      { path: 'settings', component: UserSettings }  // /user/123/settings
    ]
  }
];

function UserLayout() {
  const router = useRouter();
  return (
    <div>
      <h1>用户中心</h1>
      <nav>
        <button onClick={() => router.push(`/user/${router.currentRoute?.params?.id}`)}>资料</button>
        <button onClick={() => router.push(`/user/${router.currentRoute?.params?.id}/posts`)}>文章</button>
        <button onClick={() => router.push(`/user/${router.currentRoute?.params?.id}/settings`)}>设置</button>
      </nav>
      {/* 嵌套路由出口 */}
      <RouterView />
    </div>
  );
}
```

#### 懒加载

```jsx
import { LazyDog } from '@winde/vueact';

const routes = [
  { 
    path: '/', 
    component: Home 
  },
  { 
    path: '/about', 
    component: LazyDog(() => import('./About.jsx'))  // 懒加载
  },
  { 
    path: '/user/:id', 
    component: LazyDog(() => import('./User.jsx'), 'user')   // 懒加载（带标识符）
  }
];

// 配置全局/局部 loading 和 error
LazyDog.show([
  {
    // 全局配置（routes 为空）
    loading: () => <div>加载中...</div>,
    error: () => <div>加载失败</div>
  },
  {
    // 局部配置，匹配指定路由
    routes: ['/user/:id'],
    loading: () => <div>用户页面加载中...</div>
  }
]);

// 预加载组件
preload(() => import('./About.jsx'), 'about');

// 清除缓存
clearCache('user');
```

#### 路由守卫

```jsx
const routes = [
  {
    path: '/admin',
    component: () => import('./Admin.jsx'),  // 懒加载 + 守卫
    meta: { requiresAuth: true, title: '管理后台' },
    before: () => {
      // 进入路由前执行，返回 false 阻止导航
      if (!isLoggedIn()) {
        return false;  // 阻止导航
      }
      return true;  // 允许导航
    },
    after: () => {
      // 进入路由后执行
      console.log('已进入管理后台');
    }
  }
];
```

#### 路由元数据（Meta）

```jsx
const routes = [
  {
    path: '/admin',
    component: Admin,
    name: 'admin',
    meta: {
      requiresAuth: true,
      title: '管理后台',
      icon: 'setting'
    }
  }
];

function App() {
  const router = useRouter();
  
  // 根据 meta 设置页面标题
  const title = router.currentRoute?.meta?.title;
  if (title) {
    document.title = title;
  }
  
  return (
    <div>
      <RouterView />
    </div>
  );
}
```

#### 编程式导航

```jsx
const router = useRouter();

// 跳转到路径
router.push('/user/123');

// 替换当前历史记录
router.replace('/about');

// 后退
router.push(-1);
```

#### 404 页面（通配符路由）

```jsx
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User },
  { path: '*', component: NotFound }  // 匹配所有未定义路径
];

function NotFound() {
  return <div>404 - 页面不存在</div>;
}
```

### 4. 生命周期

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from '@winde/vueact';

function MyComponent() {
  onBeforeMount(() => {
    console.log('组件挂载前');
  });
  
  onMounted(() => {
    console.log('组件已挂载');
  });
  
  onBeforeUpdate(() => {
    console.log('组件更新前');
  });
  
  onUpdated(() => {
    console.log('组件已更新');
  });
  
  onBeforeUnmount(() => {
    console.log('组件卸载前');
  });
  
  onUnmounted(() => {
    console.log('组件已卸载');
  });
  
  return <div>My Component</div>;
}
```

---

## 📝 开发规范

- ✅ 所有模块采用 TypeScript 编写
- ✅ 使用 ES Module 规范
- ✅ 遵循单一职责原则
- ✅ 保持模块间低耦合
- ✅ 组件使用 JSX 语法
- ✅ 响应式数据使用 ref/reactive

---

## 🔧 配置说明

### Vite 配置

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
```

---

## ⚠️ 注意事项

1. **开发阶段**: 当前版本 0.0.9，核心功能已稳定
2. **已知问题**: 核心功能已稳定，可用于小型项目
3. **生产环境**: 建议充分测试后再用于生产环境
4. **API 变更**: 部分 API 可能在未来版本中调整

---

## 📦 包信息

- **包名**: `@winde/vueact`
- **版本**: `0.0.9`
- **作者**: winde
- **许可证**: MIT

---

## 🔗 相关链接

- **npm**: https://www.npmjs.com/package/@winde/vueact
- **初始化工具**: https://www.npmjs.com/package/@winde/vueact
- **BUG 反馈讨论群**: 1098301545

---

<div align="center">

![求star](https://raw.githubusercontent.com/w1nde-repo/Vueact/main/starpng/givestarcn.png)

**觉得不错？点个 ⭐ 支持一下吧！**

</div>

---

## 📄 License

MIT License

---

<div align="center">

**Vueact** | Made with ❤️ by winde

</div>

---

# <a id="english-version"></a>

## 🌟 Introduction

Vueact is an innovative fusion framework:

- ⚡ **React JSX Syntax** - Write components with JSX, type-safe and excellent development experience
- 🎯 **Vue-like Reactivity System** - Powerful reactive data binding based on Proxy
- 🚀 **High Performance Rendering** - Abandons Fiber, uses component-level independent Effect for precise updates
- 🔧 **Built-in Routing System** - Supports hash/history mode, dynamic route configuration
- 📦 **Complete Lifecycle** - Provides Vue-like lifecycle hooks
- 🌍 **Global State Management** - ref supports global access, no complex configuration needed, ready to use
- 🎨 **Flexible JSX Support** - Both className/class work

---

## 📦 Project Structure

```
vueact/
├── index.ts                 # Unified export entry
├── package.json             # Package configuration (@winde/vueact)
├── tsconfig.json            # TypeScript configuration
├── rollup.config.js         # Rollup build configuration
├── core/                    # Core layer
│   ├── Vueact.ts            # Core class definition
│   └── types.ts             # Type definitions
├── reactive/                # Reactivity system
│   ├── index.ts             # Reactivity module exports
│   ├── ref.ts               # Reactive references
│   ├── reactive.ts          # Reactive objects
│   ├── computed.ts          # Computed properties
│   ├── watch.ts             # Watcher
│   ├── effect.ts            # Effect management
│   └── vModel.ts            # v-model directive
├── vdom/                    # Virtual DOM
│   ├── index.ts             # VDOM module exports
│   ├── Type.ts              # VNode type definition
│   ├── h.ts                 # h factory function
│   ├── patch.ts             # Mount and patch
│   └── props.ts             # Props handling
├── lifecycle/               # Lifecycle
│   ├── index.ts             # Lifecycle module exports
│   ├── Type.ts              # Lifecycle type definition
│   └── hooks.ts             # Lifecycle hooks implementation
├── Router/                  # Router system
│   ├── index.ts             # Router implementation
│   └── Type.ts              # Router type definitions
└── LazyDog/                 # Lazy loading component
    └── index.ts             # Lazy loading implementation
```

---

## 🏗️ Module Functions

### 1. Core
- **Vueact.ts**: Main framework class, responsible for initializing application and coordinating modules
- **types.ts**: Defines core framework types (Router, Route, etc.)

### 2. Reactivity System
- **index.ts**: Exports all reactivity module APIs
- **ref.ts**: Creates reactive references with `.value` access, auto-caching in components
- **reactive.ts**: Creates reactive objects with deep reactivity
- **computed.ts**: Computed properties with caching and dependency tracking
- **watch.ts**: Watcher for observing data changes
- **effect.ts**: Effect management, dependency collection and trigger updates
- **vModel.ts**: v-model directive for two-way binding

### 3. Virtual DOM
- **index.ts**: Exports all VDOM module APIs
- **Type.ts**: Defines VNode type and structure
- **h.ts**: VNode factory function (JSX transformation target), supports Fragment
- **patch.ts**: Implements VNode mount and patch logic, includes component diff algorithm
- **props.ts**: Handles component props passing and DOM attribute updates

### 4. Lifecycle
- **index.ts**: Exports all lifecycle module APIs
- **Type.ts**: Lifecycle type definition
- **hooks.ts**: Lifecycle hooks implementation
  - `onBeforeMount`: Before component mounts
  - `onMounted`: After component mounts
  - `onBeforeUpdate`: Before component updates
  - `onUpdated`: After component updates
  - `onBeforeUnmount`: Before component unmounts
  - `onUnmounted`: After component unmounts

### 5. Router
- **index.ts**: Core router implementation
  - `createRouter`: Create router instance
  - `useRouter`: Get current route info and navigation methods
  - `RouterView`: Route view component for rendering matched route components
  - Supports hash and history modes
  - Supports dynamic route parameters (`:param` format)
  - Supports nested routes
  - Supports route guards (before/after)
- **Type.ts**: Defines router-related types (Route, RouterOptions, CurrentRoute, etc.)

### 6. LazyDog (Lazy Loading Component)
- **index.ts**: Implements component lazy loading
  - `LazyDog`: Standard lazy loading, accepts component loader
  - `LazyDog.show`: Configure global/local loading and error components
  - `preload`: Preload specified component
  - `clearCache`: Clear component cache
  - `isCached`: Check if component is cached
  - Supports route-level local configuration
  - Built-in default loading and error placeholder components

---

## 🚀 Quick Start

### Create Project with create-vueact

```bash
# npm
npm create @winde/vueact@latest

# yarn
yarn create @winde/vueact

# pnpm
pnpm create @winde/vueact
```

### Manual Installation

```bash
npm install @winde/vueact
```

### Basic Example

```jsx
import { Vueact, ref, computed, onMounted } from '@winde/vueact';

function App() {
  // Reactive state
  const count = ref(0);
  const message = ref('Hello Vueact!');
  
  // Computed property
  const double = computed(() => count.value * 2);
  
  // Lifecycle
  onMounted(() => {
    console.log('Component mounted');
  });
  
  // Event handling
  const handleClick = () => {
    count.value++;
  };
  
  // JSX rendering
  return (
    <div>
      <h1>{message.value}</h1>
      <p>Count: {count.value}</p>
      <p>Double: {double.value}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

// Mount application
const app = new Vueact('root');
app.render(App);
```

---

## 🎯 Core Features

### 1. Reactivity System

```javascript
import { ref, reactive, computed, watch } from '@winde/vueact';

// ref - primitive types
const count = ref(0);
count.value++;

// reactive - objects
const state = reactive({
  user: { name: 'John', age: 25 }
});
state.user.age = 26;

// computed - computed properties
const double = computed(() => count.value * 2);

// watch - watcher
watch(count, (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`);
});
```

### 2. Component System

```jsx
import { ref, onMounted } from '@winde/vueact';

function Counter(props) {
  const count = ref(0);
  
  onMounted(() => {
    console.log('Counter component mounted');
  });
  
  return (
    <div>
      <p>{props.title}: {count.value}</p>
      <button onClick={() => count.value++}>+1</button>
    </div>
  );
}

// Using component
<Counter title="Counter" />;
```

### 3. Routing System

#### Basic Usage

```jsx
import { Vueact, RouterView, useRouter } from '@winde/vueact';

// Configure routes
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User }
];

// Using in component
function Nav() {
  const router = useRouter();
  
  return (
    <nav>
      <button onClick={() => router.push('/')}>Home</button>
      <button onClick={() => router.push('/about')}>About</button>
      <button onClick={() => router.push('/user/123')}>User</button>
      <p>Current path: {router.currentRoute?.path}</p>
      <p>Route name: {router.currentRoute?.name}</p>
    </nav>
  );
}

// Root component
function App() {
  return (
    <div>
      <Nav />
      <RouterView />
    </div>
  );
}

// Initialize app
const app = new Vueact('root');
app.router({ routes, mode: 'hash' });  // or 'history'
app.render(App);
```

#### Dynamic Route Parameters

```jsx
function User() {
  const router = useRouter();
  const { id } = router.currentRoute?.params || {};
  
  return <div>User ID: {id}</div>;
}
```

#### Nested Routes

```jsx
const routes = [
  {
    path: '/user/:id',
    component: UserLayout,
    children: [
      { path: '', component: UserProfile },      // /user/123
      { path: 'posts', component: UserPosts },   // /user/123/posts
      { path: 'settings', component: UserSettings }  // /user/123/settings
    ]
  }
];

function UserLayout() {
  const router = useRouter();
  return (
    <div>
      <h1>User Center</h1>
      <nav>
        <button onClick={() => router.push(`/user/${router.currentRoute?.params?.id}`)}>Profile</button>
        <button onClick={() => router.push(`/user/${router.currentRoute?.params?.id}/posts`)}>Posts</button>
        <button onClick={() => router.push(`/user/${router.currentRoute?.params?.id}/settings`)}>Settings</button>
      </nav>
      {/* Nested route outlet */}
      <RouterView />
    </div>
  );
}
```

#### Lazy Loading

```jsx
import { LazyDog } from '@winde/vueact';

const routes = [
  { 
    path: '/', 
    component: Home 
  },
  { 
    path: '/about', 
    component: LazyDog(() => import('./About.jsx'))  // Lazy loading
  },
  { 
    path: '/user/:id', 
    component: LazyDog(() => import('./User.jsx'), 'user')   // Lazy loading (with identifier)
  }
];

// Configure global/local loading and error
LazyDog.show([
  {
    // Global config (routes is empty)
    loading: () => <div>Loading...</div>,
    error: () => <div>Failed to load</div>
  },
  {
    // Local config, matches specified routes
    routes: ['/user/:id'],
    loading: () => <div>User page loading...</div>
  }
]);

// Preload component
preload(() => import('./About.jsx'), 'about');

// Clear cache
clearCache('user');
```

#### Route Guards

```jsx
const routes = [
  {
    path: '/admin',
    component: () => import('./Admin.jsx'),  // Lazy loading + guards
    meta: { requiresAuth: true, title: 'Admin Panel' },
    before: () => {
      // Execute before entering route, return false to block navigation
      if (!isLoggedIn()) {
        return false;  // Block navigation
      }
      return true;  // Allow navigation
    },
    after: () => {
      // Execute after entering route
      console.log('Entered admin panel');
    }
  }
];
```

#### Route Meta Data

```jsx
const routes = [
  {
    path: '/admin',
    component: Admin,
    name: 'admin',
    meta: {
      requiresAuth: true,
      title: 'Admin Panel',
      icon: 'setting'
    }
  }
];

function App() {
  const router = useRouter();
  
  // Set page title based on meta
  const title = router.currentRoute?.meta?.title;
  if (title) {
    document.title = title;
  }
  
  return (
    <div>
      <RouterView />
    </div>
  );
}
```

#### Programmatic Navigation

```jsx
const router = useRouter();

// Navigate to path
router.push('/user/123');

// Replace current history entry
router.replace('/about');

// Go back
router.push(-1);
```

#### 404 Page (Wildcard Route)

```jsx
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User },
  { path: '*', component: NotFound }  // Match all undefined paths
];

function NotFound() {
  return <div>404 - Page Not Found</div>;
}
```

### 4. Lifecycle

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from '@winde/vueact';

function MyComponent() {
  onBeforeMount(() => {
    console.log('Before component mounts');
  });
  
  onMounted(() => {
    console.log('Component mounted');
  });
  
  onBeforeUpdate(() => {
    console.log('Before component updates');
  });
  
  onUpdated(() => {
    console.log('Component updated');
  });
  
  onBeforeUnmount(() => {
    console.log('Before component unmounts');
  });
  
  onUnmounted(() => {
    console.log('Component unmounted');
  });
  
  return <div>My Component</div>;
}
```

---

## 📝 Development Standards

- ✅ All modules written in TypeScript
- ✅ Uses ES Module standards
- ✅ Follows single responsibility principle
- ✅ Maintains low coupling between modules
- ✅ Components use JSX syntax
- ✅ Reactive data uses ref/reactive

---

## 🔧 Configuration

### Vite Configuration

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
```

---

## ⚠️ Notes

1. **Development Stage**: Current version 0.0.9, core features are stable
2. **Known Issues**: Core features are stable, suitable for small projects
3. **Production Environment**: Recommended to test thoroughly before production use
4. **API Changes**: Some APIs may be adjusted in future versions

---

## 📦 Package Information

- **Package Name**: `@winde/vueact`
- **Version**: `0.0.9`
- **Author**: winde
- **License**: MIT

---

## 🔗 Related Links

- **npm**: https://www.npmjs.com/package/@winde/vueact
- **Initialization Tool**: https://www.npmjs.com/package/@winde/vueact
- **BUG Feedback Group**: 1098301545

---

<div align="center">

![Give me the star](https://raw.githubusercontent.com/w1nde-repo/Vueact/main/starpng/givestaren.png)

**Enjoy it? Give us a ⭐!**

</div>

---

## 📄 License

MIT License

---

<div align="center">

**Vueact** | Made with ❤️ by winde

</div>
