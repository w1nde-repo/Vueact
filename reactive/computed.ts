import { ref, Ref } from './ref';
import { track, trigger } from './effect';

/**
 * Computed 接口 - 计算属性
 */
export interface ComputedRef<T = any> extends Ref<T> {
  _dirty: boolean;
  _value: T;
  _getter: () => T;
}

/**
 * 创建计算属性
 * @param getter - 计算函数
 * @returns ComputedRef 对象
 */
export function computed<T>(getter: () => T): ComputedRef<T> {
  let dirty = true;
  let value: T;
  
  // 创建计算属性的 ref
  const computedRef: ComputedRef<T> = {
    _dirty: true,
    _value: undefined as T,
    _getter: getter,
    get value() {
      if (computedRef._dirty) {
        // 重新计算
        computedRef._value = getter();
        computedRef._dirty = false;
      }
      // 依赖收集
      track(computedRef, 'value');
      return computedRef._value;
    },
    set value(_newValue) {
      // 计算属性默认是只读的
      console.warn('Computed property is read-only');
    },
    __v_isRef: true
  };
  
  return computedRef;
}
