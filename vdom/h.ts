// h 创建函数
import { VNode, VNodeType, VNodeData, createVNode } from './Type';

let keyCounter = 0;

function generateKey(tag: string): string {
  return `${tag}-${Date.now()}-${keyCounter++}`;
}

export function h(
  tag: string | Function,
  props: Record<string, any> | null = {},
  ...children: any[]
): VNode {
  if (typeof tag === 'function') {
    return createComponentVNode(tag, props, children);
  }

  const data: VNodeData = {};

  if (props) {
    const propertyProps: Record<string, any> = {};
    const attributeProps: Record<string, string> = {};
    const vueactFuncProps: Record<string, any> = {};
    const componentProps: Record<string, any> = {};
    const emitProps: Record<string, Function> = {};

    for (const [key, value] of Object.entries(props)) {
      if (key === 'key' || key === 'ref') {
        continue;
      }

      if (key.startsWith('onUpdate:')) {
        emitProps[key] = value;
      } else if (key.startsWith('@')) {
        vueactFuncProps[key] = value;
      } else if (key.startsWith('on') && key.length > 2) {
        vueactFuncProps[key] = value;
      } else if (key.startsWith('v-')) {
        vueactFuncProps[key] = value;
      } else if (key === 'value' || key === 'checked' || key === 'innerHTML' || key === 'textContent') {
        propertyProps[key] = value;
      } else if (key === 'class' || key === 'style' || key === 'id') {
        propertyProps[key] = value;
      } else if (key.startsWith('data-') || key.startsWith('aria-')) {
        attributeProps[key] = value;
      } else {
        componentProps[key] = value;
      }
    }

    if (Object.keys(propertyProps).length > 0) {
      data.Property = propertyProps;
    }

    if (Object.keys(attributeProps).length > 0) {
      data.Attribute = attributeProps;
    }

    if (Object.keys(vueactFuncProps).length > 0) {
      data.vueactFunc = vueactFuncProps;
    }

    if (Object.keys(componentProps).length > 0) {
      data.props = componentProps;
    }

    if (Object.keys(emitProps).length > 0) {
      data.emit = emitProps;
    }
  }

  const normalizedChildren = children
    .flat()
    .filter(child => child != null && child !== false)
    .map(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        return createVNode(
          '#text',
          VNodeType.TEXT,
          generateKey('text'),
          {
            Property: { textContent: String(child) }
          }
        );
      }
      return child as VNode;
    });

  const key = props?.key || generateKey(String(tag));

  return createVNode(
    String(tag),
    VNodeType.ELEMENT,
    key,
    data,
    normalizedChildren.length > 0 ? normalizedChildren : undefined
  );
}


function createComponentVNode(
  component: Function,
  props: Record<string, any> | null = {},
  children: any[]
): VNode {
  const data: VNodeData = {};

  if (props) {
    const componentProps: Record<string, any> = {};
    const emitProps: Record<string, Function> = {};

    for (const [key, value] of Object.entries(props)) {
      if (key === 'key' || key === 'ref') {
        continue;
      }
      if (key.startsWith('onUpdate:')) {
        emitProps[key] = value;
      } else if (typeof value === 'function' && key.startsWith('on')) {
        emitProps[key] = value;
      } else {
        componentProps[key] = value;
      }
    }

    if (Object.keys(componentProps).length > 0) {
      data.props = componentProps;
    }

    if (Object.keys(emitProps).length > 0) {
      data.emit = emitProps;
    }
  }

  // 执行组件函数，获取返回的 VNode
  // 将 props 和 children 传递给组件函数
  // 组件函数签名：function Component(props, children) { ... }
  let componentResult: any;
  try {
    // 先处理 children，转换为 VNode 数组
    const normalizedChildren = children
      .flat()
      .filter(child => child != null && child !== false)
      .map(child => {
        if (typeof child === 'string' || typeof child === 'number') {
          return createVNode(
            '#text',
            VNodeType.TEXT,
            generateKey('text'),
            {
              Property: { textContent: String(child) }
            }
          );
        }
        return child as VNode;
      });
    
    // 执行组件函数，传递 props 和 children
    componentResult = component(data.props || {}, normalizedChildren);
  } catch (error) {
    console.error(`[Vueact] Error rendering component "${component.name || 'Anonymous'}":`, error);
    // 返回错误占位 VNode
    const errorKey = generateKey('error');
    const errorTextVNode = createVNode(
      '#text',
      VNodeType.TEXT,
      generateKey('text'),
      {
        Property: {
          textContent: `Error: Component "${component.name || 'Anonymous'}" failed to render`
        }
      }
    );
    return createVNode(
      'div',
      VNodeType.ELEMENT,
      errorKey,
      {
        Property: {
          style: { color: 'red', padding: '10px', border: '1px solid red' }
        }
      },
      [errorTextVNode]
    );
  }
  
  // 处理组件返回值：支持 Fragment（数组）和单个 VNode
  let resultChildren: VNode[];
  if (Array.isArray(componentResult)) {
    // Fragment：多个根节点
    resultChildren = componentResult.filter(node => node != null && node !== false) as VNode[];
  } else if (componentResult) {
    // 单个 VNode
    resultChildren = [componentResult];
  } else {
    // 组件没有返回值，使用传入的 children（slots）
    resultChildren = children
      .flat()
      .filter(child => child != null && child !== false)
      .map(child => {
        if (typeof child === 'string' || typeof child === 'number') {
          return createVNode(
            '#text',
            VNodeType.TEXT,
            generateKey('text'),
            {
              Property: { textContent: String(child) }
            }
          );
        }
        return child as VNode;
      });
  }

  const key = props?.key || generateKey('component');

  return createVNode(
    component.name || 'Component',
    VNodeType.COMPONENT,
    key,
    data,
    resultChildren.length > 0 ? resultChildren : undefined
  );
}

export function Fragment(props: any, ...children: any[]): VNode[] {
  const normalizedChildren = children
    .flat()
    .filter(child => child != null && child !== false);
  
  return normalizedChildren.map(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      return createVNode(
        '#text',
        VNodeType.TEXT,
        generateKey('text'),
        {
          Property: { textContent: String(child) }
        }
      );
    }
    return child as VNode;
  });
}
