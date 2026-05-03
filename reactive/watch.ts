import { ref, Ref } from './ref';
import { effect } from './effect';

/**
 * Watch 回调函数
 */
type WatchCallback<T = any> = (newValue: T, oldValue: T) => void;

/**
 * Watch 停止函数
 */
export type WatchStopHandle = () => void;

/**
 * 监听响应式数据的变化
 * @param source - 监听的源（ref 或 reactive 对象）
 * @param callback - 回调函数
 * @returns 停止监听的函数
 */
export function watch<T>(
  source: Ref<T> | (() => T),
  callback: WatchCallback<T>
): WatchStopHandle {
  let oldValue: T | undefined;
  
  // 创建 effect 自动追踪依赖
  const stop = effect(() => {
    // 获取新值
    const newValue = typeof source === 'function' 
      ? source() 
      : source.value;
    
    // 如果有旧值，执行回调
    if (oldValue !== undefined) {
      callback(newValue, oldValue);
    }
    
    // 更新旧值
    oldValue = newValue;
  });
  
  // 返回停止监听的函数
  return stop;
}

/**
 * 立即执行的 watch
 */
export function watchEffect(fn: () => void): WatchStopHandle {
  return effect(fn);
}
