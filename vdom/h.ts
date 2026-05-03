// h 创建函数 - 重构版：扁平化属性，自动判断 Property/Attribute
import { VNode, VNodeType, VNodeData, createVNode, PatchFlags } from './Type';
import { isRef, unref } from '../reactive';

/**
 * 渲染上下文
 */
class RenderContext {
  path: string[] = [];
  index: number[] = [0];
  
  generateKey(tag: string): string {
    const path = [...this.path, `${tag}[${this.index[this.index.length - 1] || 0}]`].join('/');
    this.index[this.index.length - 1]++;
    return path;
  }
  
  pushContext(index: number = 0) {
    this.path.push(String(index));
    this.index.push(0);
  }
  
  popContext() {
    this.path.pop();
    this.index.pop();
  }
  
  reset() {
    this.path = [];
    this.index = [0];
  }
}

const globalRenderContext = new RenderContext();

// 组件默认 key：直接用组件名，不依赖计数器（组件重渲染时不经过 beginRender，计数器会偏移）
function getStableComponentKey(component: Function): string {
  return component.name || 'Anonymous';
}

export function beginRender() {
  globalRenderContext.reset();
}

function generateKey(tag: string): string {
  return globalRenderContext.generateKey(tag);
}

/**
 * 分析 Patch Flag
 */
function analyzePatchFlag(props: Record<string, any> | null): number {
  if (!props) return 0;
  
  if (props.skip) return PatchFlags.SKIP;
  if (props.once) return PatchFlags.ONCE;
  
  let flag = 0;
  const dynamicProps: string[] = [];
  
  for (const [key, value] of Object.entries(props)) {
    // 跳过静态值
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      continue;
    }
    
    // 函数类型（事件处理器）
    if (typeof value === 'function') {
      flag |= PatchFlags.NEED_PATCH;
      continue;
    }
    
    // 对象类型（style、class 对象等）
    if (typeof value === 'object' && value !== null) {
      if (key === 'class') {
        flag |= PatchFlags.CLASS;
        dynamicProps.push('class');
      } else if (key === 'style') {
        flag |= PatchFlags.STYLE;
        dynamicProps.push('style');
      } else {
        flag |= PatchFlags.PROPS;
        dynamicProps.push(key);
      }
    }
  }
  
  if (dynamicProps.length > 3) {
    flag = PatchFlags.FULL_PROPS;
  }
  
  return flag;
}

/**
 * 处理 v-model 指令
 */
function processVModel(props: Record<string, any>): Record<string, any> {
  if (!('v-model' in props)) return props;
  
  const value = props['v-model'];
  const refValue = unref(value);
  
  const newProps = { ...props };
  delete newProps['v-model'];
  
  // 设置 value/checked
  if (typeof refValue === 'boolean') {
    newProps.checked = refValue;
  } else {
    newProps.value = refValue;
  }
  
  // 添加事件监听
  const handler = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.type === 'checkbox' ? target.checked : target.value;
    if (isRef(value)) {
      value.value = newValue;
    }
  };
  
  newProps.onInput = handler;
  newProps.onChange = handler;
  
  return newProps;
}

/**
 * 处理 v-if/v-else-if/v-else
 */
function processCondition(props: Record<string, any>): boolean {
  if ('v-if' in props) {
    return unref(props['v-if']);
  }
  return true;
}

/**
 * 处理 v-for 指令
 */
function processVFor(
  items: any[],
  children: any[],
  props: Record<string, any> | null
): VNode[] | null {
  const renderFn = children.find(child => typeof child === 'function');
  if (!renderFn) return null;
  
  return items.map((item, index) => {
    const key = props?.key ? `${props.key}-${index}` : `v-for-${index}`;
    const result = renderFn(item, index);
    if (result && typeof result === 'object') {
      result.key = key;
    }
    return result;
  });
}

/**
 * h 函数 - 创建 VNode
 */
export function h(
  tag: string | Function,
  props: Record<string, any> | null = {},
  ...children: any[]
): VNode | null {
  // 组件处理
  if (typeof tag === 'function') {
    return createComponentVNode(tag, props, children);
  }

  // v-if 条件渲染
  if (props && !processCondition(props)) {
    return null;
  }

  // 处理 v-model
  let processedProps = props ? processVModel(props) : {};
  
  // 🔥 核心修复：先保存 key
  const originalKey = processedProps.key;
  // 提取 key（用于元素节点）
  const key = originalKey || generateKey(String(tag));
  // 处理 v-for
  let vForResult: VNode[] | null = null;
  if ('v-for' in processedProps) {
    const items = processedProps['v-for'];
    delete processedProps['v-for'];
    if (Array.isArray(items)) {
      vForResult = processVFor(items, children, props);
    }
  }
  
  // 标准化普通 children（自动解包 Ref）
  let normalizedChildren: VNode[] = [];
  if (!vForResult) {
    normalizedChildren = children
      .flat()
      .filter(child => child != null && child !== false)
      .map(child => unref(child))
      .map(child => {
        if (typeof child === 'string' || typeof child === 'number') {
          return createVNode(
            String(child),
            VNodeType.TEXT,
            generateKey('text'),
            { props: { textContent: String(child) } }
          );
        }
        return child as VNode;
      });
  }
  
  // 分析 patch flag
  const patchFlag = analyzePatchFlag(processedProps);
  
  // 构建 VNodeData
  const data: VNodeData = {};
  
  if (Object.keys(processedProps).length > 0) {
    data.props = processedProps;
  }
  
  const finalChildren = vForResult || normalizedChildren;
  
  return createVNode(
    String(tag),
    VNodeType.ELEMENT,
    key,
    data,
    finalChildren.length > 0 ? finalChildren : undefined,
    patchFlag
  );
}

/**
 * 创建组件 VNode
 */
function createComponentVNode(
  component: Function,
  props: Record<string, any> | null = {},
  children: any[]
): VNode | null {
  const data: VNodeData = {};
  
  if (props && Object.keys(props).length > 0) {
    const componentProps: Record<string, any> = {};
    const emitProps: Record<string, Function> = {};
    
    for (const [key, value] of Object.entries(props)) {
      if (key === 'key' || key === 'ref') continue;
      if (key.startsWith('onUpdate:') || (typeof value === 'function' && key.startsWith('on'))) {
        emitProps[key] = value;
      } else {
        componentProps[key] = unref(value);
      }
    }
    
    if (Object.keys(componentProps).length > 0) {
      data.props = componentProps;
    }
    if (Object.keys(emitProps).length > 0) {
      data.emit = emitProps;
    }
  }
  
  // 标准化 children（自动解包 Ref）
  const normalizedChildren = children
    .flat()
    .filter(child => child != null && child !== false)
    .map(child => unref(child))
    .map(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        return createVNode(
          String(child),
          VNodeType.TEXT,
          generateKey('text'),
          { props: { textContent: String(child) } }
        );
      }
      return child as VNode;
    });

  const vnode = createVNode(
    component.name || 'Anonymous',
    VNodeType.COMPONENT,
    props?.key || getStableComponentKey(component),
    data,
    normalizedChildren.length > 0 ? normalizedChildren : undefined
  );
  
  // 保存组件函数，用于渲染时调用
  vnode.component = component;
  
  return vnode;
}

// Fragment 支持
export function Fragment(props: any) {
  return props.children;
}