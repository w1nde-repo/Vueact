/**
 * 生命周期钩子实现
 * 提供 onMounted、onUpdated、onBeforeUnmount 等钩子函数
 */

import { LifecycleHook, LifecycleHooks, createLifecycleHooks } from './Type';

/**
 * 当前组件上下文
 */
let currentComponent: Function | null = null;

/**
 * 组件生命周期钩子缓存
 */
const componentLifecycleMap = new WeakMap<Function, LifecycleHooks>();

/**
 * 设置当前组件上下文
 */
export function setCurrentLifecycleComponent(component: Function | null) {
  currentComponent = component;
  
  if (component && !componentLifecycleMap.has(component)) {
    // 为新组件初始化生命周期钩子
    componentLifecycleMap.set(component, createLifecycleHooks());
  }
}

/**
 * 获取当前组件的生命周期钩子
 */
export function getCurrentComponentLifecycle(): LifecycleHooks | null {
  if (!currentComponent) {
    return null;
  }
  
  return componentLifecycleMap.get(currentComponent) || null;
}

/**
 * 注册 onMounted 钩子（支持多次注册，会依次执行）
 * @param fn - 挂载完成后执行的回调函数
 */
export function onMounted(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onMounted.push(fn);
  } else {
    console.warn('[Vueact] onMounted 必须在组件内调用');
  }
}

/**
 * 注册 onBeforeUpdate 钩子（支持多次注册，会依次执行）
 * @param fn - 更新前执行的回调函数
 */
export function onBeforeUpdate(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onBeforeUpdate.push(fn);
  } else {
    console.warn('[Vueact] onBeforeUpdate 必须在组件内调用');
  }
}

/**
 * 注册 onUpdated 钩子（支持多次注册，会依次执行）
 * @param fn - 更新完成后执行的回调函数
 */
export function onUpdated(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onUpdated.push(fn);
  } else {
    console.warn('[Vueact] onUpdated 必须在组件内调用');
  }
}

/**
 * 注册 onBeforeUnmount 钩子（支持多次注册，会依次执行）
 * @param fn - 卸载前执行的回调函数
 */
export function onBeforeUnmount(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onBeforeUnmount.push(fn);
  } else {
    console.warn('[Vueact] onBeforeUnmount 必须在组件内调用');
  }
}

/**
 * 注册 onUnmounted 钩子（支持多次注册，会依次执行）
 * @param fn - 卸载完成后执行的回调函数
 */
export function onUnmounted(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onUnmounted.push(fn);
  } else {
    console.warn('[Vueact] onUnmounted 必须在组件内调用');
  }
}

/**
 * 安全调用单个钩子函数（带错误处理）
 */
function safeInvokeHook(fn: LifecycleHook, hookName: string, componentName: string) {
  if (!fn) return;
  
  try {
    fn();
  } catch (error) {
    console.error(
      `[Vueact] ${hookName} 钩子错误 (${componentName}):`,
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * 调用组件的 onMounted 钩子（支持多个回调）
 */
export function invokeMountedHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  const componentName = component.name || 'Anonymous';
  
  if (lifecycle?.onMounted) {
    lifecycle.onMounted.forEach((fn, index) => {
      safeInvokeHook(fn, `onMounted [${index}]`, componentName);
    });
  }
}

/**
 * 调用组件的 onBeforeUpdate 钩子（支持多个回调）
 */
export function invokeBeforeUpdateHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  const componentName = component.name || 'Anonymous';
  
  if (lifecycle?.onBeforeUpdate) {
    lifecycle.onBeforeUpdate.forEach((fn, index) => {
      safeInvokeHook(fn, `onBeforeUpdate [${index}]`, componentName);
    });
  }
}

/**
 * 调用组件的 onUpdated 钩子（支持多个回调）
 */
export function invokeUpdatedHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  const componentName = component.name || 'Anonymous';
  
  if (lifecycle?.onUpdated) {
    lifecycle.onUpdated.forEach((fn, index) => {
      safeInvokeHook(fn, `onUpdated [${index}]`, componentName);
    });
  }
}

/**
 * 调用组件的 onBeforeUnmount 钩子（支持多个回调）
 */
export function invokeBeforeUnmountHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  const componentName = component.name || 'Anonymous';
  
  if (lifecycle?.onBeforeUnmount) {
    lifecycle.onBeforeUnmount.forEach((fn, index) => {
      safeInvokeHook(fn, `onBeforeUnmount [${index}]`, componentName);
    });
  }
}

/**
 * 调用组件的 onUnmounted 钩子（支持多个回调）
 */
export function invokeUnmountedHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  const componentName = component.name || 'Anonymous';
  
  if (lifecycle?.onUnmounted) {
    lifecycle.onUnmounted.forEach((fn, index) => {
      safeInvokeHook(fn, `onUnmounted [${index}]`, componentName);
    });
  }
}

/**
 * 清除组件的生命周期钩子（用于内存清理）
 */
export function clearComponentLifecycle(component: Function) {
  componentLifecycleMap.delete(component);
}
