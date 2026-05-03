// vdom 类型定义

export enum VNodeType {
  ELEMENT = 1,    // 元素节点
  TEXT = 2,       // 文本节点
  COMPONENT = 3   // 组件节点
}

/**
 * Patch Flags - 用于优化 diff 算法
 * 编译时标记动态内容，运行时跳过静态内容对比
 */
export enum PatchFlags {
  TEXT = 1,           // 动态文本内容
  CLASS = 2,          // 动态 class
  STYLE = 4,          // 动态 style
  PROPS = 8,          // 动态属性
  FULL_PROPS = 16,    // 所有属性动态
  NEED_PATCH = 32,    // 需要深度对比
  
  // 优化标记（需手动使用）
  SKIP = 64,          // 跳过 diff（纯静态）
  ONCE = 128,         // 只渲染一次（首次后跳过）
}

export interface VNodeData {
  // 统一属性（自动判断 Property vs Attribute）
  props?: Record<string, any>;
  // 组件事件
  emit?: Record<string, Function>;
}

export interface VNode {
  tag: string;
  type: VNodeType;
  key: string;
  nodeRef: any;              // DOM 引用
  data: VNodeData;
  children?: VNode[];
  patchFlag?: number;        // 动态标记
  dynamicProps?: string[];   // 动态属性名列表
  component?: Function;      // 组件函数（仅 COMPONENT 类型使用）
}

export function createVNode(
  tag: string,
  type: VNodeType,
  key: string,
  data: VNodeData = {},
  children?: VNode[],
  patchFlag?: number,
  dynamicProps?: string[]
): VNode {
  return {
    tag,
    type,
    key,
    nodeRef: null,
    data,
    children,
    patchFlag,
    dynamicProps,
  };
}
