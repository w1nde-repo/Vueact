/**
 * Vueact 响应式系统
 * 
 * @example
 * ```jsx
 * import { ref, reactive, computed, effect, watch, vModel } from '@veact/vueact';
 * 
 * // ref - 基本类型响应式
 * const count = ref(0);
 * 
 * // reactive - 对象响应式
 * const state = reactive({ name: 'Vueact', version: '1.0' });
 * 
 * // computed - 计算属性
 * const double = computed(() => count.value * 2);
 * 
 * // effect - 依赖收集
 * effect(() => {
 *   console.log(`Count: ${count.value}`);
 * });
 * 
 * // watch - 监听变化
 * watch(count, (newVal, oldVal) => {
 *   console.log(`count: ${oldVal} → ${newVal}`);
 * });
 * 
 * // vModel - 双向绑定
 * <input {...vModel(count)} />
 * ```
 */

export { ref, isRef, unref } from './ref';
export type { Ref } from './ref';

export { reactive, isReactive } from './reactive';
export type { Reactive } from './reactive';

export { effect, track, trigger, activeEffect, setActiveEffect, targetMap } from './effect';

export { computed } from './computed';
export type { ComputedRef } from './computed';

export { watch, watchEffect } from './watch';
export type { WatchStopHandle } from './watch';

export { vModel } from './vModel';
export type { VModelOptions } from './vModel';
