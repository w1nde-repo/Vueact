/**
 * Virtual DOM Patch 算法 - 终极版
 * 引入 Component Instance 解决多组件状态冲突与重置问题
 * 【修复版】增加 safeInsert 解决 Failed to execute 'insertBefore' 问题
 */

import { VNode, VNodeType, PatchFlags } from "./Type";
import { setElementProps, updateElementProps } from "./props";
import { invokeBeforeUnmountHook, invokeUnmountedHook, clearComponentLifecycle, setCurrentLifecycleComponent, invokeMountedHook, invokeBeforeUpdateHook, invokeUpdatedHook } from "../lifecycle";
import { clearComponentRefs, setCurrentComponent } from "../reactive/ref";
import { effect } from "../reactive/effect";
import { reactive } from "../reactive/reactive";

// 🔥 全局 Map：key → component instance
const keyToInstanceMap = new Map<string, Function>();

// 🔥 组件实例数据：细粒度 effect
interface InstanceData {
  props: Record<string, any>;
  dispose: (() => void) | null;
  result: VNode | null;
  prevResult: VNode | null;
  el: HTMLElement | Text | null;
}
const instanceDataMap = new WeakMap<Function, InstanceData>();

/**
 * 获取或创建组件的唯一实例标识 (🔥 核心升级)
 */
function getComponentInstance(vnode: any): Function {
  if (vnode.key) {
    if (!keyToInstanceMap.has(vnode.key)) {
      const instance = function ComponentInstance() {};
      Object.defineProperty(instance, 'name', {
        value: (vnode.component?.name || 'Component') + `_instance_${vnode.key}`,
        configurable: true
      });
      keyToInstanceMap.set(vnode.key, instance);
    }
    vnode.componentInstance = keyToInstanceMap.get(vnode.key);
    return vnode.componentInstance;
  }
  
  if (!vnode.componentInstance) {
    const instance = function ComponentInstance() {};
    Object.defineProperty(instance, 'name', {
      value: (vnode.component?.name || 'Component') + '_instance',
      configurable: true
    });
    vnode.componentInstance = instance;
  }
  return vnode.componentInstance;
}

/**
 * 判断两个 VNode 是否相同
 */
function isSameVNode(n1: VNode, n2: VNode): boolean {
  if (n1.type === VNodeType.TEXT && n2.type === VNodeType.TEXT) {
    return true;
  }
  if (n1.type === VNodeType.COMPONENT && n2.type === VNodeType.COMPONENT) {
    return n1.component === n2.component && n1.key === n2.key;
  }
  return n1.type === n2.type;
}

/**
 * 🔥 核心修复：安全插入 DOM 节点
 * 解决 Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node
 */
function safeInsert(child: Node, container: Node, anchor: Node | null) {
  if (!child || !container) return;
  // 如果提供了 anchor，但 anchor 的父节点不是目标 container，说明结构发生漂移
  // 直接置空 anchor 降级为追加插入，防止 DOMException 崩溃
  if (anchor && anchor.parentNode !== container) {
    anchor = null;
  }
  if (anchor) {
    container.insertBefore(child, anchor);
  } else {
    container.appendChild(child);
  }
}

export function mount(vnode: VNode, container: HTMLElement, anchor: Node | null = null) {
  if (!vnode) return;
  const el = createDOM(vnode);
  // 使用安全插入替换原生的 container.insertBefore / container.appendChild
  safeInsert(el, container, anchor);
}

export function unmount(vnode: VNode | any) {
  if (!vnode) return;

  if (vnode.type === VNodeType.COMPONENT && vnode.component) {
    console.warn('[Vueact unmount] 卸载组件:', vnode.component?.name || 'Anonymous', 'key:', vnode.key, 'tag:', vnode.tag, 'nodeRef:', !!vnode.nodeRef);
  }

  if (vnode.children) {
    for (const child of vnode.children) unmount(child);
  }

  if (vnode.type === VNodeType.COMPONENT && vnode.component) {
    const instance = vnode.componentInstance || vnode.component;
    invokeBeforeUnmountHook(instance);
  }

  if (vnode.nodeRef) {
    if (vnode.nodeRef._vei) {
      for (const key in vnode.nodeRef._vei) {
        const invoker = vnode.nodeRef._vei[key];
        const event = key.startsWith('on') ? key.slice(2).toLowerCase() : key;
        vnode.nodeRef.removeEventListener(event, invoker);
      }
    }
    if (vnode.nodeRef.parentNode) {
      vnode.nodeRef.parentNode.removeChild(vnode.nodeRef);
    }
    vnode.nodeRef = null;
  }

  if (vnode.type === VNodeType.COMPONENT && vnode.component) {
    const instance = vnode.componentInstance || vnode.component;
    invokeUnmountedHook(instance);
    clearComponentLifecycle(instance);
    clearComponentRefs(instance);
    const data = instanceDataMap.get(instance);
    if (data?.dispose) {
      data.dispose();
      instanceDataMap.delete(instance);
    }
    if (vnode.key) {
      keyToInstanceMap.delete(vnode.key);
    }
  }
}

export function createDOM(vnode: VNode): HTMLElement | Text {
  if (vnode.type === VNodeType.TEXT) {
    const textNode = document.createTextNode(vnode.data?.props?.textContent || String(vnode.tag) || "");
    vnode.nodeRef = textNode;
    return textNode;
  }

  if (vnode.type === VNodeType.COMPONENT) {
    if (vnode.component) {
      const instance = getComponentInstance(vnode);

      const componentFn = vnode.component;
      let data = instanceDataMap.get(instance);
      if (!data) {
        data = {
          props: reactive({ ...(vnode.data?.props || {}) }),
          dispose: null,
          result: null,
          prevResult: null,
          el: null,
        };
        instanceDataMap.set(instance, data);

        data.dispose = effect(() => {
          const isUpdate = !!data!.prevResult;
          if (isUpdate) invokeBeforeUpdateHook(instance as any);

          setCurrentComponent(instance as any);
          setCurrentLifecycleComponent(instance as any);
          try {
            data!.result = componentFn(data!.props);
          } finally {
            setCurrentComponent(null);
            setCurrentLifecycleComponent(null);
          }

          if (isUpdate && data?.el && data?.result) {
            const container = data.el.parentElement;
            if (container) {
              // 保存局部引用，防止 patch 内重入导致 data.result 被覆盖
              const prevResult = data.prevResult!;
              const nextResult = data.result!;
              patch(prevResult, nextResult, container);
              data.prevResult = nextResult;
              if (nextResult.nodeRef) data.el = nextResult.nodeRef;
              invokeUpdatedHook(instance as any);
            }
          }
        });
      }

      const result = data.result!;
      if (result) {
        const el = createDOM(result);
        data.el = el;
        data.prevResult = result;
        vnode.children = [result];
        vnode.nodeRef = el;
        invokeMountedHook(instance as any);
        return el;
      }
    }
    const placeholder = document.createComment('component');
    vnode.nodeRef = placeholder;
    return placeholder as any;
  }

  const el = document.createElement(vnode.tag);
  vnode.nodeRef = el;

  if (vnode.data?.props) setElementProps(el, vnode.data.props);

  if (vnode.children) {
    for (const child of vnode.children) el.appendChild(createDOM(child));
  }
  return el;
}

export function patch(n1: VNode, n2: VNode, container: HTMLElement) {
  if (n1 === n2) return;
  if (!n2) { if (n1) unmount(n1); return; }
  if (n2.patchFlag === PatchFlags.SKIP) return;
  if (n2.patchFlag === PatchFlags.ONCE && n2.nodeRef) return;

  if (!isSameVNode(n1, n2)) {
    console.warn('[Vueact patch] !isSameVNode → unmount old + mount new.');
    const newEl = createDOM(n2);
    if (n1.nodeRef) {
      // 使用 safeInsert 保护插入
      safeInsert(newEl, n1.nodeRef.parentNode || container, n1.nodeRef);
      unmount(n1);
    } else {
      safeInsert(newEl, container, null);
    }
    n2.nodeRef = newEl;
    return;
  }

  n2.nodeRef = n1.nodeRef;

  if (n2.type === VNodeType.TEXT) {
    const newText = n2.data?.props?.textContent || String(n2.tag) || "";
    const oldText = n1.data?.props?.textContent || String(n1.tag) || "";
    if (newText !== oldText && n2.nodeRef) (n2.nodeRef as Text).textContent = newText;
    return;
  }

  if (n2.type === VNodeType.COMPONENT && n2.component) {
    if (n1.component && n1.component !== n2.component) {
      const anchor = n1.nodeRef?.nextSibling || null;
      const parent = n1.nodeRef?.parentNode || container;
      unmount(n1);
      mount(n2, parent as HTMLElement, anchor);
      invokeMountedHook(getComponentInstance(n2) as any);
      return;
    }

    (n2 as any).componentInstance = (n1 as any).componentInstance;
    const instance = getComponentInstance(n2);
    const data = instanceDataMap.get(instance);
    if (data) {
      const newProps = n2.data?.props || {};
      for (const key of Object.keys(data.props)) {
        if (!(key in newProps)) delete data.props[key];
      }
      Object.assign(data.props, newProps);
    }
    n2.nodeRef = n1.nodeRef;
    n2.children = data?.result ? [data.result] : n1.children;
    return;
  }

  const el = n2.nodeRef as HTMLElement;
  const oldProps = n1.data?.props || {};
  const newProps = n2.data?.props || {};
  updateElementProps(el, oldProps, newProps);

  if (n1.children && n2.children) patchChildren(n1.children, n2.children, el);
  else if (n2.children) for (const child of n2.children) mount(child, el);
  else if (n1.children) for (const child of n1.children) unmount(child);
}

function patchChildren(c1: VNode[], c2: VNode[], container: HTMLElement) {
  let oldStartIdx = 0, newStartIdx = 0;
  let oldEndIdx = c1.length - 1, newEndIdx = c2.length - 1;
  let oldStartVNode = c1[0], oldEndVNode = c1[oldEndIdx];
  let newStartVNode = c2[0], newEndVNode = c2[newEndIdx];
  let oldKeyToIdx: Map<string, number> | undefined;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) oldStartVNode = c1[++oldStartIdx];
    else if (!oldEndVNode) oldEndVNode = c1[--oldEndIdx];
    else if (isSameVNode(oldStartVNode, newStartVNode)) {
      patch(oldStartVNode, newStartVNode, container);
      oldStartVNode = c1[++oldStartIdx];
      newStartVNode = c2[++newStartIdx];
    } else if (isSameVNode(oldEndVNode, newEndVNode)) {
      patch(oldEndVNode, newEndVNode, container);
      oldEndVNode = c1[--oldEndIdx];
      newEndVNode = c2[--newEndIdx];
    } else if (isSameVNode(oldStartVNode, newEndVNode)) {
      patch(oldStartVNode, newEndVNode, container);
      // 🔥 修复点：使用 safeInsert 替代原生的 insertBefore
      // ⚠️ 添加 nodeRef 空值检查
      if (oldStartVNode.nodeRef) {
        safeInsert(oldStartVNode.nodeRef as Node, container, (oldEndVNode.nodeRef as Node)?.nextSibling || null);
      }
      oldStartVNode = c1[++oldStartIdx];
      newEndVNode = c2[--newEndIdx];
    } else if (isSameVNode(oldEndVNode, newStartVNode)) {
      patch(oldEndVNode, newStartVNode, container);
      if (oldEndVNode.nodeRef) {
        safeInsert(oldEndVNode.nodeRef as Node, container, (oldStartVNode.nodeRef ?? null) as Node | null);
      }
      oldEndVNode = c1[--oldEndIdx];
      newStartVNode = c2[++newStartIdx];
    } else {
      if (!oldKeyToIdx) {
        oldKeyToIdx = new Map();
        for (let i = oldStartIdx; i <= oldEndIdx; i++) if (c1[i]?.key) oldKeyToIdx.set(c1[i].key, i);
      }
      const idxInOld = newStartVNode?.key ? oldKeyToIdx.get(newStartVNode.key) : undefined;
      if (idxInOld === undefined) {
        // ⚠️ 添加 nodeRef 空值检查
        if (oldStartVNode.nodeRef) {
          mount(newStartVNode, container, oldStartVNode.nodeRef as Node);
        } else {
          mount(newStartVNode, container, null);
        }
      } else {
        const vnodeToMove = c1[idxInOld];
        if (isSameVNode(vnodeToMove, newStartVNode)) {
          patch(vnodeToMove, newStartVNode, container);
          c1[idxInOld] = undefined as any;
          if (vnodeToMove.nodeRef) {
            safeInsert(vnodeToMove.nodeRef as Node, container, (oldStartVNode.nodeRef ?? null) as Node | null);
          }
        } else {
          // ⚠️ 添加 nodeRef 空值检查
          if (oldStartVNode.nodeRef) {
            mount(newStartVNode, container, oldStartVNode.nodeRef as Node);
          } else {
            mount(newStartVNode, container, null);
          }
        }
      }
      newStartVNode = c2[++newStartIdx];
    }
  }

  if (oldStartIdx > oldEndIdx) {
    const anchor = c2[newEndIdx + 1]?.nodeRef as Node;
    for (let i = newStartIdx; i <= newEndIdx; i++) if (c2[i]) mount(c2[i], container, anchor);
  } else if (newStartIdx > newEndIdx) {
    console.warn('[Vueact patchChildren] 卸载多余的旧子节点, oldStartIdx:', oldStartIdx, 'oldEndIdx:', oldEndIdx);
    for (let i = oldStartIdx; i <= oldEndIdx; i++) if (c1[i]) unmount(c1[i]);
  }
}