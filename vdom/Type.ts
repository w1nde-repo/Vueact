// vdom 类型定义

export enum VNodeType {
  ELEMENT = 1,    // 元素节点
  TEXT = 2,       // 文本节点
  COMPONENT = 3   // 组件节点
}

export interface VNodeData {
  Property?: {
    id?: string;
    class?: string;
    style?: Record<string, string | number>;
    value?: string;
    checked?: boolean;
    innerHTML?: string;
    textContent?: string;
  };
  Attribute?: Record<string, string>;
  vueactFunc?: {
    // React 风格事件
    onClick?: Function;
    onInput?: Function;
    onChange?: Function;
    onBlur?: Function;
    onFocus?: Function;
    onKeyup?: Function;
    onKeydown?: Function;
    onSubmit?: Function;
    onMouseover?: Function;
    onMouseout?: Function;
    onMouseenter?: Function;
    onMouseleave?: Function;
    onMousemove?: Function;
    onMouseup?: Function;
    onMousedown?: Function;
    // Vue 风格事件
    '@click'?: Function;
    '@input'?: Function;
    '@change'?: Function;
    '@blur'?: Function;
    '@focus'?: Function;
    '@keyup'?: Function;
    '@keydown'?: Function;
    '@submit'?: Function;
    // Vue 指令
    'v-model'?: any;
    'v-if'?: any;
    'v-else'?: any;
    'v-else-if'?: any;
    'v-for'?: any;
    'v-bind'?: any;
    'v-html'?: any;
    'v-text'?: any;
    'v-show'?: any;
  };
  props?: Record<string, any>;
  emit?: Record<string, Function>;
}

export interface VNode {
  tag: string;
  type: VNodeType;
  key: string;
  stateRef: any;
  nodeRef: any;
  data: VNodeData;
  children?: VNode[];
  __skip__?: boolean;
  __once__?: boolean;
  __static__?: boolean;
  __isRoot__?: boolean;
  __isComment__?: boolean;
}

export function createVNode(
  tag: string,
  type: VNodeType,
  key: string,
  data: VNodeData = {},
  children?: VNode[]
): VNode {
  return {
    tag,
    type,
    key,
    stateRef: null,
    nodeRef: null,
    data,
    children,
    __skip__: false,
    __once__: false,
    __static__: false,
    __isRoot__: false,
    __isComment__: false,
  };
}
