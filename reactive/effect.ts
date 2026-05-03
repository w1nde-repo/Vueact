/**
 * 依赖收集和触发的核心数据结构
 */

/**
 * 当前激活的 effect
 */
export let activeEffect: (() => void) | null = null;

/**
 * 存储所有依赖的 WeakMap
 * 结构：WeakMap<目标对象，Map<属性名，Set<effect 函数>>>
 */
export const targetMap = new WeakMap<any, Map<any, Set<() => void>>>();

/**
 * 依赖收集 - 将当前 effect 添加到依赖集合
 * @param target - 响应式目标对象
 * @param key - 属性名
 */
export function track(target: any, key: string | symbol) {
  if (!activeEffect) return;
  
  // 获取或创建 depsMap（目标对象的所有属性依赖）
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  
  // 获取或创建 deps（该属性的所有依赖函数）
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  
  // 将当前 effect 添加到依赖集合（去重）
  if (!deps.has(activeEffect)) {
    deps.add(activeEffect);
  }
}

/**
 * 触发更新 - 执行所有依赖的 effect
 * @param target - 响应式目标对象
 * @param key - 属性名
 */
export function trigger(target: any, key: string | symbol) {
  // 获取 depsMap
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  
  // 收集所有需要触发的 effect
  const effectsToRun = new Set<() => void>();
  
  // 遍历所有 key 的依赖
  depsMap.forEach((deps, depKey) => {
    deps.forEach(effect => effectsToRun.add(effect));
  });
  
  // 执行所有依赖函数
  effectsToRun.forEach(effect => effect());
}

/**
 * 设置当前激活的 effect
 */
export function setActiveEffect(effect: (() => void) | null) {
  activeEffect = effect;
}

/**
 * 响应式 effect - 自动追踪依赖并在数据变化时重新执行
 * @param fn - 要执行的函数
 * @returns 清理函数
 */
export function effect(fn: () => void): () => void {
  const effectFn = () => {
    // 设置当前激活的 effect
    setActiveEffect(effectFn);
    
    try {
      // 执行函数（会触发 track 收集依赖）
      fn();
    } finally {
      // 恢复 activeEffect
      setActiveEffect(null);
    }
  };
  
  // 立即执行一次
  effectFn();
  
  // 返回停止函数
  return () => {
    setActiveEffect(null);
  };
}
