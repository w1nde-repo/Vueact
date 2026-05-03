/**
 * 生命周期钩子类型定义
 */

/**
 * 生命周期钩子函数类型
 */
export type LifecycleHook = (() => void) | null;

/**
 * 生命周期钩子集合
 * 每个钩子都支持多个回调函数（数组形式）
 */
export interface LifecycleHooks {
  /**
   * 挂载完成后调用
   * 此时组件已经渲染到 DOM 中，可以访问 DOM 元素
   * 支持多个回调函数，按注册顺序依次执行
   */
  onMounted: LifecycleHook[];
  
  /**
   * 更新前调用
   * 在数据变化导致 DOM 更新之前调用
   * 支持多个回调函数，按注册顺序依次执行
   */
  onBeforeUpdate: LifecycleHook[];
  
  /**
   * 更新完成后调用
   * 在 DOM 更新完成后调用
   * 支持多个回调函数，按注册顺序依次执行
   */
  onUpdated: LifecycleHook[];
  
  /**
   * 卸载前调用
   * 在组件被移除之前调用，用于清理定时器、取消订阅等
   * 支持多个回调函数，按注册顺序依次执行
   */
  onBeforeUnmount: LifecycleHook[];
  
  /**
   * 卸载完成后调用
   * 组件被移除后调用
   * 支持多个回调函数，按注册顺序依次执行
   */
  onUnmounted: LifecycleHook[];
}

/**
 * 创建默认的生命周期钩子对象
 * 所有钩子初始化为空数组，支持多次注册
 */
export function createLifecycleHooks(): LifecycleHooks {
  return {
    onMounted: [],
    onBeforeUpdate: [],
    onUpdated: [],
    onBeforeUnmount: [],
    onUnmounted: []
  };
}
