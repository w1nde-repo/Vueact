import { track, trigger } from './effect';
import { reactive } from './reactive';

/**
 * Ref 接口 - 基本类型响应式对象
 */
export interface Ref<T = any> {
  _value: T;
  value: T;
  __v_isRef: true;
}

/**
 * 组件内使用的 ref 缓存（局部 ref）
 * 直接存储在组件函数的属性上，组件卸载时自动被 GC 回收
 */
// 🔥 核心修复：使用普通 Map 而不是 WeakMap，避免组件实例被垃圾回收导致 refsMap 丢失
const componentRefs = new Map<Function, Map<string, Ref<any>>>();
let currentComponent: Function | null = null;

/**
 * 当前组件的 ref 调用顺序计数（用于自动生成 key）
 */
const refCallOrder = new WeakMap<Function, number>();

/**
 * 设置当前组件上下文（在每次渲染前调用）
 */
export function setCurrentComponent(component: Function | null) {
  currentComponent = component;
  if (component) {
    // 每次渲染前重置调用顺序计数，确保 ref 的 key 稳定
    refCallOrder.set(component, 0);
  }
}

/**
 * 创建基本类型的响应式引用
 * 在组件内使用时会自动缓存，避免每次渲染都重新创建
 * @param value - 初始值
 * @param key - 可选的唯一标识，用于缓存（组件内使用时可省略，自动基于调用顺序生成）
 * @returns Ref 对象
 */
export function ref<T>(value: T, key?: string): Ref<T> {
  // 如果在组件上下文中，使用缓存的 ref
  if (currentComponent) {
    // 如果没有提供 key，基于调用顺序自动生成
    if (key === undefined) {
      const order = refCallOrder.get(currentComponent) || 0;
      key = `ref_${order}`;
      refCallOrder.set(currentComponent, order + 1);
    }
    
    // 获取或创建该组件的 refs 缓存
    let refsMap = componentRefs.get(currentComponent);
    if (!refsMap) {
      refsMap = new Map();
      componentRefs.set(currentComponent, refsMap);
    }
    
    // 检查是否已存在（性能优化：避免二次查询）
    if (!refsMap.has(key)) {
      const newRef = createRef(value);
      refsMap.set(key, newRef);
      return newRef;
    }
    
    return refsMap.get(key)! as Ref<T>;
  }
  
  // 不在组件上下文中，直接创建普通 ref
  return createRef(value);
}

/**
 * 创建 ref 的内部函数
 * 使用 Proxy 实现：{ref.count} 自动代理到 {ref.value.count}
 */
function createRef<T>(value: T): Ref<T> {
  let innerValue: T = (typeof value === 'object' && value !== null)
    ? reactive(value as any) as T
    : value;

  const refObj = new Proxy({} as Ref<T>, {
    get(_, key) {
      if (key === '_value') return innerValue;
      if (key === '__v_isRef') return true;
      if (key === 'value') {
        track(refObj, 'value');
        // 如果 innerValue 是对象，访问其属性时也会追踪 reactive 的依赖
        return innerValue;
      }
      // 未知属性代理到 _value（对象时有效）
      if (typeof innerValue === 'object' && innerValue !== null && key in (innerValue as any)) {
        track(refObj, 'value');
        // 直接访问 innerValue[key]，会触发 reactive 的 track
        return (innerValue as any)[key];
      }
      return undefined;
    },
    set(_, key, newValue) {
      if (key === '_value' || key === 'value') {
        const oldValue = innerValue;
        innerValue = (typeof newValue === 'object' && newValue !== null)
          ? reactive(newValue) as T
          : newValue;
        // 值变化时触发更新
        if (oldValue !== innerValue) {
          trigger(refObj, 'value');
        }
        return true;
      }
      // 未知属性写入代理到 _value
      if (typeof innerValue === 'object' && innerValue !== null) {
        (innerValue as any)[key] = newValue;
        return true;
      }
      return true;
    },
    has(_, key) {
      if (key === '_value' || key === 'value' || key === '__v_isRef') return true;
      if (typeof innerValue === 'object' && innerValue !== null) return key in (innerValue as any);
      return false;
    },
    ownKeys(_) {
      const base = ['_value', 'value', '__v_isRef'];
      if (typeof innerValue === 'object' && innerValue !== null) {
        return [...base, ...Object.keys(innerValue as any)];
      }
      return base;
    },
  });

  return refObj;
}

/**
 * 判断是否是 ref 对象
 */
export function isRef(value: any): value is Ref {
  return value && value.__v_isRef === true;
}

/**
 * 解包 ref - 如果是 ref 则返回 value，否则返回原值
 */
export function unref<T>(ref: Ref<T> | T): T {
  return isRef(ref) ? ref.value : ref;
}

/**
 * 清除组件的 refs 缓存（组件卸载时调用）
 */
export function clearComponentRefs(component: Function) {
  componentRefs.delete(component);
  refCallOrder.delete(component);
}
