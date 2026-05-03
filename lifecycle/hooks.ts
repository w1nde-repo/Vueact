/**
 * 生命周期钩子实现
 */

import { LifecycleHook, LifecycleHooks, createLifecycleHooks } from './Type';

let currentComponent: Function | null = null;
const componentLifecycleMap = new WeakMap<Function, LifecycleHooks>();
const mountedComponents = new WeakSet<Function>();

export function setCurrentLifecycleComponent(component: Function | null) {
  currentComponent = component;
  if (component) {
    let hooks = componentLifecycleMap.get(component);
    if (!hooks) {
      hooks = createLifecycleHooks();
      componentLifecycleMap.set(component, hooks);
    }
    // 每次渲染前只重置 update 钩子（mounted/unmount 持久保留）
    hooks.onBeforeUpdate = [];
    hooks.onUpdated = [];
  }
}

function getCurrentComponentLifecycle(): LifecycleHooks | null {
  if (!currentComponent) return null;
  return componentLifecycleMap.get(currentComponent) || null;
}

export function onMounted(fn: () => void) {
  if (currentComponent && mountedComponents.has(currentComponent)) return;
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onMounted.push(fn);
  } else {
    console.warn('[Vueact] onMounted 必须在组件内调用');
  }
}

export function onBeforeUpdate(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onBeforeUpdate.push(fn);
  } else {
    console.warn('[Vueact] onBeforeUpdate 必须在组件内调用');
  }
}

export function onUpdated(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onUpdated.push(fn);
  } else {
    console.warn('[Vueact] onUpdated 必须在组件内调用');
  }
}

export function onBeforeUnmount(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onBeforeUnmount.push(fn);
  } else {
    console.warn('[Vueact] onBeforeUnmount 必须在组件内调用');
  }
}

export function onUnmounted(fn: () => void) {
  const lifecycle = getCurrentComponentLifecycle();
  if (lifecycle) {
    lifecycle.onUnmounted.push(fn);
  } else {
    console.warn('[Vueact] onUnmounted 必须在组件内调用');
  }
}

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

export function invokeMountedHook(component: Function) {
  if (mountedComponents.has(component)) return;
  mountedComponents.add(component);

  const lifecycle = componentLifecycleMap.get(component);
  if (lifecycle?.onMounted) {
    const callbacks = [...lifecycle.onMounted];
    lifecycle.onMounted = [];
    callbacks.forEach((fn, index) => {
      safeInvokeHook(fn, `onMounted [${index}]`, component.name || 'Anonymous');
    });
  }
}

export function invokeBeforeUpdateHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  if (lifecycle?.onBeforeUpdate) {
    lifecycle.onBeforeUpdate.forEach((fn, index) => {
      safeInvokeHook(fn, `onBeforeUpdate [${index}]`, component.name || 'Anonymous');
    });
  }
}

export function invokeUpdatedHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  if (lifecycle?.onUpdated) {
    lifecycle.onUpdated.forEach((fn, index) => {
      safeInvokeHook(fn, `onUpdated [${index}]`, component.name || 'Anonymous');
    });
  }
}

export function invokeBeforeUnmountHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  if (lifecycle?.onBeforeUnmount) {
    lifecycle.onBeforeUnmount.forEach((fn, index) => {
      safeInvokeHook(fn, `onBeforeUnmount [${index}]`, component.name || 'Anonymous');
    });
  }
}

export function invokeUnmountedHook(component: Function) {
  const lifecycle = componentLifecycleMap.get(component);
  if (lifecycle?.onUnmounted) {
    lifecycle.onUnmounted.forEach((fn, index) => {
      safeInvokeHook(fn, `onUnmounted [${index}]`, component.name || 'Anonymous');
    });
  }
}

export function clearComponentLifecycle(component: Function) {
  componentLifecycleMap.delete(component);
  mountedComponents.delete(component);
}
