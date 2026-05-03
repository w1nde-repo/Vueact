import { Ref } from './ref';

/**
 * vModel 选项
 */
export interface VModelOptions {
  event?: string;      // 事件名，默认 'input'
  valueKey?: string;   // 值属性名，默认 'value'
}

/**
 * v-model 运行时函数 - 实现双向绑定
 * @param refValue - 响应式引用
 * @param options - 选项
 * @returns 展开属性对象
 * 
 * @example
 * ```jsx
 * const count = ref(0);
 * <input {...vModel(count)} />
 * ```
 */
export function vModel<T>(
  refValue: Ref<T>,
  options: VModelOptions = {}
): Record<string, any> {
  const {
    event = 'input',
    valueKey = 'value'
  } = options;
  
  // 构建事件名（onInput、onChange 等）
  const eventName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
  
  return {
    // 绑定值
    [valueKey]: refValue.value,
    
    // 绑定事件监听器
    [eventName]: (e: Event) => {
      const target = e.target as HTMLInputElement;
      refValue.value = target.value as any;
    }
  };
}
