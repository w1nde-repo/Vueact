# Vueact Framework

<div align="center">

**融合 Vue 响应式与 React JSX 的创新框架**

**An Innovative Framework Combining Vue Reactivity with React JSX**

[![npm version](https://img.shields.io/npm/v/@winde/vueact.svg)](https://www.npmjs.com/package/@winde/vueact)
[![license](https://img.shields.io/npm/l/@winde/vueact.svg)](https://github.com/w1nde-repo/Vueact/blob/main/LICENSE)
[![bundle size](https://img.shields.io/badge/bundle-6KB%20gzip-brightgreen)](https://www.npmjs.com/package/@winde/vueact)

---

**🌐 语言 / Language**

[简体中文](#-快速开始) | [English](#english-version)

</div>

---

<!-- zh -->
## 🌟 简介

Vueact 是一个创新型的融合框架：

- ⚡ **React JSX 语法** — 使用 JSX 编写组件，类型安全
- 🎯 **类 Vue 响应式系统** — Proxy 实现，ref/reactive/computed/watch
- 🚀 **组件级细粒度更新** — 每组件独立 Effect，子组件 state 变更不触发父重渲
- 🔧 **内置路由系统** — hash/history 模式，动态路由、嵌套路由、懒加载
- 📦 **完整生命周期** — onMounted / onBeforeUpdate / onUpdated / onBeforeUnmount / onUnmounted
- 🧩 **模板自动解包** — JSX 中 `{ref}` 直接使用，无需 `.value` 并且支持.value写法
- 🌍 **全局状态管理** — ref 支持全局访问，开箱即用
- 🎨 **想怎么写就怎么写** - className/class 都可使用
- 📦 **极致轻量** — 去除注释压缩后 ~17KB / gzip ~6KB，零依赖
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
│   └── Vueact.ts            # 核心类定义
├── reactive/                # 响应式系统
│   ├── index.ts             # 响应式模块导出
│   ├── ref.ts               # 响应式引用（Proxy 实现，属性代理）
│   ├── reactive.ts          # 响应式对象
│   ├── computed.ts          # 计算属性
│   ├── watch.ts             # 侦听器
│   ├── effect.ts            # 副作用管理（嵌套 effect 支持）
│   └── vModel.ts            # v-model 指令
├── vdom/                    # 虚拟 DOM
│   ├── index.ts             # VDOM 模块导出
│   ├── Type.ts              # VNode 类型定义
│   ├── h.ts                 # h 创建函数（含 Ref 自动解包）
│   ├── patch.ts             # 挂载/更新（含组件级 effect）
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
- **Vueact.ts**: 框架主类，负责初始化应用、挂载根组件、协调渲染

### 2. Reactivity（响应式系统）
- **ref.ts**: 创建响应式引用。**Proxy 实现**，`ref({count:0})` 可直接 `obj.count` 访问，属性自动代理到内部 reactive 对象
- **reactive.ts**: 创建响应式对象，基于 Proxy 深度响应式
- **computed.ts**: 计算属性，惰性求值 + 依赖缓存
- **watch.ts**: 侦听器，监听数据变化执行回调
- **effect.ts**: 副作用管理。**支持嵌套 effect**，保存/恢复父级 `activeEffect` 实现细粒度依赖追踪
- **vModel.ts**: 双向数据绑定指令

### 3. Virtual DOM（虚拟 DOM）
- **h.ts**: VNode 工厂函数。**children/props 自动解包 Ref**，JSX 中 `{count}` 无需 `.value`
- **patch.ts**: VNode 挂载/更新。**每个组件实例独立 effect**，子组件 state 变更仅 patch 自身子树
- **props.ts**: DOM 属性处理，自动判断 Property vs Attribute

### 4. Lifecycle（生命周期）
- **hooks.ts**: 生命周期钩子实现
  - `onMounted`: 挂载后触发（**仅一次**，已挂载组件重复调用为 no-op）
  - `onBeforeUpdate`: 更新前触发
  - `onUpdated`: 更新后触发
  - `onBeforeUnmount`: 卸载前触发
  - `onUnmounted`: 卸载后触发

### 5. Router（路由系统）
- **index.ts**: 路由核心，支持 hash/history 模式、动态路由 `:param`、嵌套路由、路由守卫
- **Type.ts**: 路由类型定义

### 6. LazyDog（懒加载组件）
- **index.ts**: 组件级懒加载，支持 loading/error 占位、预加载、缓存管理

---

## 🚀 快速开始

### 创建项目

```bash
npm create @winde/vueact@latest
```

### 手动安装

```bash
npm install @winde/vueact
```

### 基础示例

```jsx
import { Vueact, ref, computed, onMounted } from '@winde/vueact';

function App() {
  const count = ref(0);
  const message = ref('Hello Vueact!');
  const double = computed(() => count.value * 2);

  onMounted(() => {
    console.log('组件已挂载');
  });

  const handleClick = () => {
    count.value++;  // 脚本中仍需 .value
  };

  return (
    <div>
      <h1>{message}</h1>
      <p>计数：{count}</p>
      <p>双倍：{double}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

const app = new Vueact('root');
app.render(App);
```

> 模板中 `{count}` 无需 `.value`，框架自动解包。脚本逻辑中仍写 `count.value++`。

---

## 🎯 核心特性

### 1. 响应式系统

```javascript
import { ref, reactive, computed, watch } from '@winde/vueact';

// ref — 原始值 / 对象均可
const count = ref(0);
count.value++;

const user = ref({ name: 'John', age: 25 });
user.value.name = 'Jane';   // 脚本中 .value
// 模板中直接 {user.name} 即可

// reactive — 对象专用，无需 .value
const state = reactive({ user: { name: 'John', age: 25 } });
state.user.age = 26;

// computed — 计算属性
const double = computed(() => count.value * 2);

// watch — 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`${oldVal} → ${newVal}`);
});
```

### 2. 组件系统

```jsx
import { ref, onMounted } from '@winde/vueact';

function Counter(props) {
  const count = ref(0);

  onMounted(() => {
    console.log('Counter 挂载完成');
  });

  return (
    <div>
      <p>{props.title}: {count}</p>
      <button onClick={() => count.value++}>+1</button>
    </div>
  );
}

<Counter title="计数器" />
```

### 3. 路由系统

```jsx
import { Vueact, RouterView, useRouter, LazyDog } from '@winde/vueact';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User },
  { path: '/admin', component: LazyDog(() => import('./Admin.jsx')) },
  { path: '*', component: NotFound }
];

function App() {
  const router = useRouter();
  return (
    <div>
      <nav>
        <button onClick={() => router.push('/')}>首页</button>
        <button onClick={() => router.push('/user/123')}>用户</button>
      </nav>
      <p>当前路径：{router.currentRoute?.path}</p>
      <RouterView />
    </div>
  );
}

const app = new Vueact('root');
app.router({ routes, mode: 'history' });
app.render(App);
```

#### 嵌套路由

```jsx
const routes = [
  {
    path: '/user/:id',
    component: UserLayout,
    children: [
      { path: '', component: UserProfile },
      { path: 'posts', component: UserPosts },
    ]
  }
];

function UserLayout() {
  return (
    <div>
      <h1>用户中心</h1>
      <RouterView />
    </div>
  );
}
```

#### 路由守卫

```jsx
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: { requiresAuth: true },
    before: () => isLoggedIn() || false,
    after: () => console.log('进入 Admin')
  }
];
```

### 4. 生命周期

```jsx
import { onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from '@winde/vueact';

function LifecycleDemo() {
  onMounted(() => console.log('✅ 挂载完成'));
  onBeforeUpdate(() => console.log('⏳ 即将更新'));
  onUpdated(() => console.log('🔄 更新完成'));
  onBeforeUnmount(() => console.log('⚠️ 即将卸载'));
  onUnmounted(() => console.log('❌ 已卸载'));

  return <div>Lifecycle Demo</div>;
}
```

> `onMounted` 仅触发一次。已挂载的组件再次调用 `onMounted` 为 no-op。

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

## 📝 设计要点

- **模板 vs 脚本**：JSX 中 ref 自动解包（`{count}`），脚本中显式 `.value`（`count.value++`）
- **ref vs reactive**：原始值用 ref，对象用 reactive。ref 包裹对象时属性自动代理到内部 reactive
- **细粒度更新**：每个组件实例独立 effect，父 state 变仅父重渲，子 state 变仅子重渲
- **生命周期**：onMounted 只触发一次，update 钩子每次重渲触发，unmount 钩子卸载时触发

---

## ⚠️ 注意事项

1. **版本**: 当前 0.0.9-alpha，核心功能稳定
2. **生产**: 建议充分测试后用于生产环境
3. **API**: 部分 API 可能在后续版本调整

---

## 📦 包信息

- **包名**: `@winde/vueact`
- **版本**: `0.0.9-alpha.1`
- **作者**: winde
- **许可证**: MIT

---

## 🔗 相关链接

- **npm**: https://www.npmjs.com/package/@winde/vueact
- **反馈群**: 1098301545

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

- ⚡ **React JSX Syntax** — Write components with JSX, type-safe
- 🎯 **Vue-like Reactivity** — Proxy-based, ref/reactive/computed/watch
- 🚀 **Component-level Fine-grained Updates** — Independent effect per component; child state changes don't re-render parent
- 🔧 **Built-in Router** — hash/history mode, dynamic routes, nested routes, lazy loading
- 📦 **Full Lifecycle** — onMounted / onBeforeUpdate / onUpdated / onBeforeUnmount / onUnmounted
- 🧩 **Auto-unwrap in Templates** — `{ref}` in JSX, no `.value` needed
- 🌍 **Global State** — ref supports global access out of the box
- 🎨 **Write however you want** - Both className/class work
---

## 📦 Project Structure

```
vueact/
├── index.ts                 # Entry point
├── core/Vueact.ts           # Core class
├── reactive/                # Reactivity system
│   ├── ref.ts               # Proxy-based ref with property forwarding
│   ├── reactive.ts          # Deep reactive objects
│   ├── computed.ts          # Lazy computed with caching
│   ├── watch.ts             # Watcher
│   ├── effect.ts            # Nested effect support
│   └── vModel.ts            # Two-way binding
├── vdom/                    # Virtual DOM
│   ├── h.ts                 # VNode factory (auto-unwrap refs)
│   ├── patch.ts             # Mount/patch with per-component effect
│   └── props.ts             # DOM props handling
├── lifecycle/               # Lifecycle hooks
├── Router/                  # Router system
└── LazyDog/                 # Lazy loading
```

---

## 🚀 Quick Start

```bash
npm install @winde/vueact
```

```jsx
import { Vueact, ref, computed, onMounted } from '@winde/vueact';

function App() {
  const count = ref(0);
  const double = computed(() => count.value * 2);

  onMounted(() => console.log('Mounted'));

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={() => count.value++}>+1</button>
    </div>
  );
}

const app = new Vueact('root');
app.render(App);
```

> In templates, `{count}` works directly. In script logic, use `count.value`.

---

## 🎯 Core Features

### Reactivity

```javascript
// ref — primitives and objects
const count = ref(0);
count.value++;

// reactive — objects, no .value needed
const state = reactive({ user: { name: 'John' } });
state.user.name = 'Jane';

// computed
const double = computed(() => count.value * 2);

// watch
watch(count, (n, o) => console.log(`${o} → ${n}`));
```

### Component

```jsx
function Counter(props) {
  const count = ref(0);
  return (
    <div>
      <p>{props.title}: {count}</p>
      <button onClick={() => count.value++}>+1</button>
    </div>
  );
}
```

### Router

```jsx
const routes = [
  { path: '/', component: Home },
  { path: '/user/:id', component: User },
  { path: '*', component: NotFound }
];

const app = new Vueact('root');
app.router({ routes, mode: 'history' });
app.render(App);
```

### Lifecycle

```jsx
import { onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from '@winde/vueact';

function Demo() {
  onMounted(() => console.log('Mounted'));
  onBeforeUpdate(() => console.log('Before update'));
  onUpdated(() => console.log('Updated'));
  onBeforeUnmount(() => console.log('Before unmount'));
  onUnmounted(() => console.log('Unmounted'));
  return <div>Demo</div>;
}
```

---

## 🔧 Vite Configuration

```javascript
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
```

---

## 📦 Package

- **Package Name**: `@winde/vueact`
- **Version**: `0.0.9`
- **Author**: winde
- **License**: MIT

---

<div align="center">

**Vueact** | Made with ❤️ by winde

</div>
