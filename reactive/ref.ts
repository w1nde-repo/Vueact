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
 * 组件内使用的 ref 缓存
 * 自动缓存 ref，避免每次渲染都重新创建
 */
const componentRefs = new WeakMap<Function, Map<string, Ref<any>>>();
let currentComponent: Function | null = null;

/**
 * 当前组件的 ref 调用顺序计数
 */
const refCallOrder = new Map<Function, number>();

/**
 * 设置当前组件上下文
 */
export function setCurrentComponent(component: Function | null) {
  currentComponent = component;
  if (component) {
    // 检测条件渲染：如果组件已有缓存但 order 归零，说明有分支未执行
    if (componentRefs.has(component)) {
      const existingRefs = componentRefs.get(component)!;
      const order = refCallOrder.get(component) || 0;
      
      if (order === 0 && existingRefs.size > 0) {
        console.warn(
          '[Vueact] 检测到条件渲染：组件内的 ref 调用顺序可能不一致，' +
          '建议为 ref 手动指定 key，例如：ref(0, "myKey")'
        );
      }
    }
    
    // 重置该组件的调用顺序计数
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
 */
function createRef<T>(value: T): Ref<T> {
  const isObject = typeof value === 'object' && value !== null;
  
  const refObj: Ref<T> = {
    _value: isObject ? reactive(value) : value,
    get value() {
      // 依赖收集
      track(refObj, 'value');
      return refObj._value;
    },
    set value(newValue) {
      const isObject = typeof newValue === 'object' && newValue !== null;
      refObj._value = isObject ? reactive(newValue) : newValue;
      // 触发更新
      trigger(refObj, 'value');
    },
    __v_isRef: true
  };
  
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
