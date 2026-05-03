import { track, trigger } from './effect';

/**
 * 响应式数组的变更方法
 */
const arrayMutationMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'] as const;

/**
 * 响应式数组的读取方法（会触发依赖收集）
 */
const arrayReadMethods = ['map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every'] as const;

/**
 * 创建响应式数组的代理
 * 重写数组的变更方法以触发响应式更新
 */
function createReactiveArrayProxy<T extends any[]>(target: T): T {
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      
      const result = Reflect.get(target, key, receiver);
      
      // 如果是数组的变更方法，包装以触发更新
      if (typeof result === 'function' && arrayMutationMethods.includes(key as any)) {
        return function(...args: any[]) {
          const result = (target as any)[key](...args);
          // 触发变更方法的依赖
          trigger(target, key);
          // 触发 __keys__ 的依赖（用于 map, filter 等方法）
          trigger(target, '__keys__');
          return result;
        };
      }
      
      // 如果是对象，递归响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key as keyof T];
      const result = Reflect.set(target, key, value, receiver);
      
      // 只有在值变化时才触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      trigger(target, key);
      return result;
    },
    
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    
    ownKeys(target) {
      track(target, '__keys__');
      return Reflect.ownKeys(target);
    }
  });
  
  (proxy as any).__v_isReactive = true;
  
  return proxy;
}

/**
 * Reactive 类型 - 响应式对象
 */
export type Reactive<T = any> = T;

/**
 * 创建对象的响应式代理
 * @param target - 目标对象
 * @returns 响应式对象
 */
export function reactive<T extends object>(target: T): T {
  // 如果已经是响应式对象，直接返回
  if ((target as any).__v_isReactive) {
    return target;
  }
  
  // 如果是数组，使用特殊的数组代理
  if (Array.isArray(target)) {
    return createReactiveArrayProxy(target);
  }
  
  // 创建 Proxy 代理
  const proxy = new Proxy<T>(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      
      // 获取值
      const result = Reflect.get(target, key, receiver);
      
      // 如果是对象，递归响应式（浅层）
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key as keyof T];
      const result = Reflect.set(target, key, value, receiver);
      
      // 只有在值变化时才触发更新
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      // 触发更新
      trigger(target, key);
      return result;
    },
    
    has(target, key) {
      // 依赖收集
      track(target, key);
      return Reflect.has(target, key);
    },
    
    ownKeys(target) {
      // 依赖收集
      track(target, '__keys__');
      return Reflect.ownKeys(target);
    }
  });
  
  // 标记为响应式对象
  (proxy as any).__v_isReactive = true;
  
  return proxy;
}

/**
 * 判断是否是响应式对象
 */
export function isReactive(value: any): boolean {
  return value && value.__v_isReactive === true;
}
