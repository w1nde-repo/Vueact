/**
 * Virtual DOM Patch 算法 - 重构版
 * 适配扁平化 VNode 结构
 */

import { VNode, VNodeType, PatchFlags } from "./Type";
import { setElementProps, updateElementProps } from "./props";
import { invokeBeforeUnmountHook, invokeUnmountedHook, clearComponentLifecycle } from "../lifecycle";

/**
 * 判断两个 VNode 是否相同
 */
function isSameVNode(n1: VNode, n2: VNode): boolean {
  if (n1.type === VNodeType.TEXT && n2.type === VNodeType.TEXT) {
    return true;
  }
  return n1.type === n2.type && n1.key === n2.key;
}

/**
 * 挂载 VNode 到容器
 */
export function mount(
  vnode: VNode,
  container: HTMLElement,
  anchor: Node | null = null
) {
  if (!vnode) return;

  // createDOM 会处理组件调用
  const el = createDOM(vnode);
  if (anchor) {
    container.insertBefore(el, anchor);
  } else {
    container.appendChild(el);
  }
}

/**
 * 卸载 VNode
 */
export function unmount(vnode: VNode | any) {
  if (!vnode || !vnode.nodeRef) return;

  // 组件生命周期
  if (vnode.type === VNodeType.COMPONENT) {
    console.log('[Vueact unmount] 调用 onBeforeUnmount:', vnode.tag);
    invokeBeforeUnmountHook(vnode.tag);
  }

  // 清理事件监听器
  if (vnode.nodeRef._vei) {
    for (const key in vnode.nodeRef._vei) {
      const invoker = vnode.nodeRef._vei[key];
      const event = key.startsWith('on') ? key.slice(2).toLowerCase() : key;
      vnode.nodeRef.removeEventListener(event, invoker);
    }
  }

  vnode.nodeRef.remove();
  vnode.nodeRef = null;

  // 组件 onUnmounted
  if (vnode.type === VNodeType.COMPONENT) {
    console.log('[Vueact unmount] 调用 onUnmounted:', vnode.tag);
    invokeUnmountedHook(vnode.tag);
    clearComponentLifecycle(vnode.tag);
  }
}

/**
 * 创建 DOM 元素
 */
export function createDOM(vnode: VNode): HTMLElement | Text {
  // 文本节点
  if (vnode.type === VNodeType.TEXT) {
    const text = vnode.data?.props?.textContent || String(vnode.tag) || "";
    const textNode = document.createTextNode(text);
    vnode.nodeRef = textNode;
    return textNode;
  }

  // 组件节点
  if (vnode.type === VNodeType.COMPONENT) {
    if (vnode.component) {
      // 调用组件函数获取渲染结果
      const componentResult = vnode.component(vnode.data?.props || {});
      if (componentResult) {
        // 递归创建组件返回的 DOM
        const el = createDOM(componentResult);
        // 保存渲染后的 VNode 用于后续更新
        vnode.children = [componentResult];
        return el;
      }
    }
    // 组件返回 null，创建空占位
    const placeholder = document.createComment('component');
    vnode.nodeRef = placeholder;
    return placeholder as any;
  }

  // 普通元素节点
  const el = document.createElement(vnode.tag);
  vnode.nodeRef = el;

  // 设置属性（使用新的扁平化结构）
  if (vnode.data?.props) {
    setElementProps(el, vnode.data.props);
  }

  // 递归渲染子节点
  if (vnode.children) {
    for (const child of vnode.children) {
      el.appendChild(createDOM(child));
    }
  }

  return el;
}

/**
 * Patch 主函数 - 对比并更新两个 VNode
 */
export function patch(n1: VNode, n2: VNode, container: HTMLElement) {
  if (n1 === n2) return;

  // 手动 skip：完全跳过 diff
  if (n2.patchFlag === PatchFlags.SKIP) return;

  // 手动 once：首次渲染后不再更新
  if (n2.patchFlag === PatchFlags.ONCE && n2.nodeRef) return;

  // 卸载旧节点
  if (!n2 && n1) {
    unmount(n1);
    return;
  }

  // 节点类型不同，直接替换
  if (!isSameVNode(n1, n2)) {
    const newEl = createDOM(n2);
    if (n1.nodeRef) {
      container.replaceChild(newEl, n1.nodeRef);
      unmount(n1);
    } else {
      container.appendChild(newEl);
    }
    n2.nodeRef = newEl;
    return;
  }

  // 节点相同，复用 DOM 引用
  n2.nodeRef = n1.nodeRef;

  // 文本节点特殊处理
  if (n2.type === VNodeType.TEXT) {
    const newText = n2.data?.props?.textContent || String(n2.tag) || "";
    const oldText = n1.data?.props?.textContent || String(n1.tag) || "";
    if (newText !== oldText && n2.nodeRef) {
      (n2.nodeRef as Text).textContent = newText;
    }
    return;
  }

  // 组件节点特殊处理 - 重新调用组件函数获取新渲染结果
  if (n2.type === VNodeType.COMPONENT && n2.component) {
    const newComponentResult = n2.component(n2.data?.props || {});
    const oldComponentResult = n1.children?.[0];
    
    if (newComponentResult && oldComponentResult) {
      patch(oldComponentResult, newComponentResult, container);
    } else if (newComponentResult) {
      mount(newComponentResult, container);
    } else if (oldComponentResult) {
      unmount(oldComponentResult);
    }
    
    n2.children = newComponentResult ? [newComponentResult] : [];
    
    // 同步 nodeRef 保持引用（显式处理 null 情况）
    n2.nodeRef = newComponentResult?.nodeRef ?? null;
    
    return;
  }

  // 更新属性（使用新的 updateElementProps）
  const el = n2.nodeRef as HTMLElement;
  const oldProps = n1.data?.props || {};
  const newProps = n2.data?.props || {};
  updateElementProps(el, oldProps, newProps);

  // 更新子节点
  if (n1.children && n2.children) {
    patchChildren(n1.children, n2.children, el);
  } else if (n2.children) {
    for (const child of n2.children) mount(child, el);
  } else if (n1.children) {
    for (const child of n1.children) unmount(child);
  }
}

/**
 * 双端 Diff 算法 - 对比子节点
 */
export function patchChildren(
  c1: VNode[],
  c2: VNode[],
  container: HTMLElement
) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = c1.length - 1;
  let newEndIdx = c2.length - 1;

  let oldStartVNode = c1[0];
  let oldEndVNode = c1[oldEndIdx];
  let newStartVNode = c2[0];
  let newEndVNode = c2[newEndIdx];

  let oldKeyToIdx: Map<string, number> | undefined;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = c1[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = c1[--oldEndIdx];
    } else if (isSameVNode(oldStartVNode, newStartVNode)) {
      // 头对头
      patch(oldStartVNode, newStartVNode, container);
      oldStartVNode = c1[++oldStartIdx];
      newStartVNode = c2[++newStartIdx];
    } else if (isSameVNode(oldEndVNode, newEndVNode)) {
      // 尾对尾
      patch(oldEndVNode, newEndVNode, container);
      oldEndVNode = c1[--oldEndIdx];
      newEndVNode = c2[--newEndIdx];
    } else if (isSameVNode(oldStartVNode, newEndVNode)) {
      // 头对尾：旧节点向右移动
      patch(oldStartVNode, newEndVNode, container);
      container.insertBefore(
        oldStartVNode.nodeRef as Node,
        (oldEndVNode.nodeRef as Node).nextSibling
      );
      oldStartVNode = c1[++oldStartIdx];
      newEndVNode = c2[--newEndIdx];
    } else if (isSameVNode(oldEndVNode, newStartVNode)) {
      // 尾对头：旧节点向左移动
      patch(oldEndVNode, newStartVNode, container);
      container.insertBefore(
        oldEndVNode.nodeRef as Node,
        oldStartVNode.nodeRef as Node
      );
      oldEndVNode = c1[--oldEndIdx];
      newStartVNode = c2[++newStartIdx];
    } else {
      // 乱序情况：在旧子节点中查找
      if (!oldKeyToIdx) {
        oldKeyToIdx = new Map();
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
          if (c1[i]?.key) {
            oldKeyToIdx.set(c1[i].key, i);
          }
        }
      }

      const idxInOld = newStartVNode?.key 
        ? oldKeyToIdx.get(newStartVNode.key) 
        : undefined;

      if (idxInOld === undefined) {
        // 全新节点，创建
        mount(newStartVNode, container, oldStartVNode.nodeRef as Node);
      } else {
        const vnodeToMove = c1[idxInOld];
        if (isSameVNode(vnodeToMove, newStartVNode)) {
          patch(vnodeToMove, newStartVNode, container);
          c1[idxInOld] = undefined as any;
          container.insertBefore(
            vnodeToMove.nodeRef as Node,
            oldStartVNode.nodeRef as Node
          );
        } else {
          mount(newStartVNode, container, oldStartVNode.nodeRef as Node);
        }
      }
      newStartVNode = c2[++newStartIdx];
    }
  }

  // 处理多余的旧节点或遗漏的新节点
  if (oldStartIdx > oldEndIdx) {
    const anchor = c2[newEndIdx + 1]?.nodeRef as Node;
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      if (c2[i]) mount(c2[i], container, anchor);
    }
  } else if (newStartIdx > newEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (c1[i]) unmount(c1[i]);
    }
  }
}
