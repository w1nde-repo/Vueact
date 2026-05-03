import { ref } from '../reactive';
import { h, VNode } from '../vdom';

// 懒加载状态管理
const loadingMap = new Map<string, boolean>();
const componentCache = new Map<string, any>();

// 全局 loading/error 配置
let globalLoading: (() => VNode) | null = null;
let globalError: (() => VNode) | null = null;

// 局部配置 - 以 route 路径为 key
const localConfigs = new Map<string, { loading?: () => VNode; error?: () => VNode }>();

export interface LazyDogShowConfig {
  routes?: string[];
  loading?: () => VNode;
  error?: () => VNode;
}

// 获取 loader 的唯一 ID（使用 loader 函数的哈希，避免自增计数器导致的不稳定）
function getLoaderId(loader: () => Promise<any>, identifier?: string): string {
  if (identifier) {
    return identifier;
  }
  // 使用 loader 函数的字符串表示生成稳定 ID
  const loaderStr = loader.toString();
  let hash = 0;
  for (let i = 0; i < loaderStr.length; i++) {
    const char = loaderStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `lazydog-${Math.abs(hash).toString(36)}-${loaderStr.slice(0, 30).replace(/\s+/g, '_')}`;
}

// 获取当前路由路径（支持 hash 和 history 模式）
function getCurrentPath(): string {
  if (window.location.hash) {
    return window.location.hash.replace('#', '') || '/';
  }
  return window.location.pathname || '/';
}

// 懒加载状态存储（使用 Map 保持状态持久化，内部字段使用 ref 实现响应式）
const lazyStateMap = new Map<string, {
  isLoading: any;
  error: Error | null;
  resolvedComponent: any;
  hasError: boolean;
}>();

function getLazyState(id: string) {
  if (!lazyStateMap.has(id)) {
    lazyStateMap.set(id, {
      isLoading: ref(!componentCache.has(id)),
      error: null,
      resolvedComponent: ref(null),
      hasError: false
    });
  }
  return lazyStateMap.get(id)!;
}

// Wrapper 缓存 - 确保同一个 loader 只创建一个 wrapper
const wrapperCache = new Map<string, any>();

// 内部创建懒加载组件
function createLazyComponent(loader: () => Promise<any>, identifier?: string) {
  const id = getLoaderId(loader, identifier);

  // 如果已有缓存，直接返回
  if (wrapperCache.has(id)) {
    return wrapperCache.get(id);
  }

  // 稳定的包装组件，wrapperCache 保证同一 loader 返回同一函数引用
  // 外层 VNode key 由框架 getStableComponentKey 保证稳定，无需手动设 key
  const LazyWrapper = function(props: any = {}) {
    const state = getLazyState(id);

    if (componentCache.has(id)) {
      const cachedComp = componentCache.get(id);
      // 🔥 核心修复：给缓存组件也传递 key，保持组件实例稳定
      const propsWithKey = { ...props, key: `lazydog-${id}` };
      return h(cachedComp, propsWithKey);
    }

    if (!loadingMap.has(id) && !state.hasError) {
      loadingMap.set(id, true);

      loader()
        .then((module: any) => {
          const comp = module?.default || module;
          componentCache.set(id, comp);
          state.resolvedComponent.value = comp;
          state.isLoading.value = false;
          loadingMap.delete(id);
        })
        .catch((err: Error) => {
          state.error = err;
          state.isLoading.value = false;
          state.hasError = true;
          loadingMap.delete(id);
        });
    }

    // 获取当前路由路径，查找局部配置
    const currentPath = getCurrentPath();
    const config = findConfig(currentPath);

    // 优先使用局部配置的 loading，其次全局配置，最后默认
    if (state.isLoading.value) {
      if (config?.loading) return config.loading();
      if (globalLoading) return globalLoading();
      return h('div', { class: 'lazydog-loading', style: 'padding:20px;text-align:center;color:#999' }, '加载中...');
    }

    // 优先使用局部配置的 error，其次全局配置，最后默认
    if (state.error) {
      if (config?.error) return config.error();
      if (globalError) return globalError();
      return h('div', { class: 'lazydog-error', style: 'padding:20px;text-align:center;color:#f56c6c' }, '加载失败');
    }

    // 🔥 核心修复：如果组件还没加载完成，返回一个稳定的占位节点，避免 diff 算法混乱
    if (!state.resolvedComponent.value) {
      return h('div', { style: 'display:none' }, '');
    }
    // 🔥 核心修复：给每个懒加载组件一个唯一的 key，让 diff 算法能够区分不同的 wrapper 实例
    return h(state.resolvedComponent.value, { ...props, key: `lazydog-${id}` });
  };
  // 🔥 给 wrapper 一个稳定的名字，用于调试和标识
  Object.defineProperty(LazyWrapper, 'name', {
    value: `LazyWrapper_${id}`,
    configurable: true
  });

  // 缓存 wrapper
  wrapperCache.set(id, LazyWrapper);
  return LazyWrapper;
}

// 查找配置（支持路径匹配）
function findConfig(currentPath: string): { loading?: () => VNode; error?: () => VNode } | undefined {
  // 1. 精确匹配
  if (localConfigs.has(currentPath)) {
    return localConfigs.get(currentPath);
  }

  // 2. 前缀匹配（如 /user/123 匹配 /user）
  for (const [route, config] of localConfigs) {
    if (currentPath.startsWith(route + '/') || currentPath === route) {
      return config;
    }
  }

  return undefined;
}

/**
 * LazyDog - 标准懒加载
 * @param loader - () => import('./Page.jsx')
 * @param identifier - 可选标识符，用于确保唯一性
 */
export function LazyDog(loader: () => Promise<any>, identifier?: string) {
  return createLazyComponent(loader, identifier);
}

/**
 * LazyDog.show - 配置 loading 和 error
 * @param configs - 配置数组
 * 
 * 使用:
 * LazyDog.show([{
 *   routes: [],              // 全局配置（routes为空，只取第一个）
 *   loading: () => <div>加载中...</div>,
 *   error: () => <div>错误</div>
 * }, {
 *   routes: ['/lazy-simple'], // 局部配置，匹配路由路径
 *   loading: () => <div>自定义加载...</div>
 * }]);
 */
LazyDog.show = function(configs: LazyDogShowConfig[]) {
  if (!Array.isArray(configs) || configs.length === 0) {
    console.warn('[LazyDog] show() 需要传入配置数组');
    return;
  }

  // 处理全局配置（routes为空或未定义）
  let globalConfigSet = false;

  for (const config of configs) {
    if (!config.routes || config.routes.length === 0) {
      // 全局配置，只取第一个
      if (!globalConfigSet) {
        if (config.loading) globalLoading = config.loading;
        if (config.error) globalError = config.error;
        globalConfigSet = true;
      }
    } else {
      // 局部配置，注册所有 routes
      for (const route of config.routes) {
        if (!localConfigs.has(route)) {
          localConfigs.set(route, {
            loading: config.loading,
            error: config.error
          });
        }
      }
    }
  }
};

/**
 * 预加载
 * @param loader - 组件加载器
 * @param identifier - 必须传入标识符
 */
export function preload(loader: () => Promise<any>, identifier: string): void {
  if (!identifier) {
    console.warn('[LazyDog] preload() 必须传入 identifier');
    return;
  }
  const id = getLoaderId(loader, identifier);
  if (componentCache.has(id)) return;
  loader().then(m => componentCache.set(id, m?.default || m));
}

/**
 * 清除缓存
 */
export function clearCache(identifier?: string): void {
  if (identifier) {
    componentCache.delete(identifier);
    lazyStateMap.delete(identifier);
    wrapperCache.delete(identifier);
  } else {
    componentCache.clear();
    lazyStateMap.clear();
    wrapperCache.clear();
  }
}

/**
 * 检查缓存
 */
export function isCached(identifier: string): boolean {
  return componentCache.has(identifier);
}

export default LazyDog;
