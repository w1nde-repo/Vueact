// Vueact 核心类
import { h, Fragment, VNode, beginRender } from '../vdom';
// 虚拟 DOM 系统
import { patch, mount } from '../vdom/patch';
// 响应式系统
import { effect } from '../reactive';
import { setCurrentComponent } from '../reactive/ref';
// 生命周期
import {
  setCurrentLifecycleComponent,
  invokeMountedHook,
  invokeBeforeUpdateHook,
  invokeUpdatedHook
} from '../lifecycle';
// 路由系统
import { createRouter, resetRouterViewDepth } from '../Router';
import type { RouterOptions } from '../Router/Type';

interface Plugin {
  install: (app: Vueact) => void;
}

/**
 * 复制旧 VNode 树的 nodeRef 到新 VNode 树
 * 基于树的路径进行匹配（前序遍历）
 */
function copyNodeRefs(oldVNode: VNode, newVNode: VNode, path: string = '') {
  // 生成当前节点的路径 key
  const currentPath = path ? `${path}/${oldVNode.tag}` : oldVNode.tag;
  
  // 将旧节点的 nodeRef 复制到新节点
  if (oldVNode.nodeRef) {
    newVNode.nodeRef = oldVNode.nodeRef;
    // 保存路径到 nodeRef，用于后续匹配
    (oldVNode.nodeRef as any).__vueact_path = currentPath;
  }
  
  // 递归处理子节点
  if (oldVNode.children && newVNode.children) {
    const len = Math.min(oldVNode.children.length, newVNode.children.length);
    for (let i = 0; i < len; i++) {
      copyNodeRefs(oldVNode.children[i], newVNode.children[i], `${currentPath}[${i}]`);
    }
  }
}

class Vueact {
    el: HTMLDivElement;
    vnode: VNode | null;
    static h = h;
    static Fragment = Fragment;
    private _router: any = null;

    constructor(el: string) {
        this.el = document.getElementById(el)! as HTMLDivElement;
        this.vnode = null;
    }

    router(options: RouterOptions): this {
        this._router = createRouter(options);
        return this;
    }
    
    render(vnode?: VNode | Function) {
        if (vnode) {
            // 如果是函数组件，用 effect 包裹实现响应式更新
            if (typeof vnode === 'function') {
                const componentFn = vnode;
                let isFirstRender = true;
                
                // 用 effect 包裹组件渲染
                effect(() => {
                    try {
                        // 重置渲染上下文，生成稳定的 key
                        beginRender();
                        
                        // 重置 RouterView 深度计数器
                        resetRouterViewDepth();
                        
                        // 设置当前组件上下文，让 useRef 可以缓存 ref
                        setCurrentComponent(componentFn);
                        
                        // 设置生命周期上下文
                        setCurrentLifecycleComponent(componentFn);
                        
                        const newVNode = componentFn() as VNode;
                        
                        if (this.vnode) {
                            // 调用 onBeforeUpdate 钩子
                            invokeBeforeUpdateHook(componentFn);
                            
                            // 保留旧的 nodeRef 引用，用于 isSameVNode 比较
                            copyNodeRefs(this.vnode, newVNode);
                            // 已有 vnode，使用 patch 更新
                            patch(this.vnode, newVNode, this.el);
                            
                            // 调用 onUpdated 钩子
                            invokeUpdatedHook(componentFn);
                        } else {
                            // 首次渲染，使用 mount 挂载
                            this.el.innerHTML = '';
                            mount(newVNode, this.el);
                            
                            // 调用 onMounted 钩子（只在首次渲染时调用）
                            if (isFirstRender) {
                                invokeMountedHook(componentFn);
                                isFirstRender = false;
                            }
                        }
                        
                        this.vnode = newVNode;
                    } catch (error) {
                        console.error('[Vueact] 渲染错误:', error);
                        // 显示错误 UI
                        this.el.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red;">
                            <h3>渲染错误</h3>
                            <pre>${error instanceof Error ? error.message : String(error)}</pre>
                        </div>`;
                    } finally {
                        // 渲染完成后清除组件上下文
                        setCurrentComponent(null);
                        setCurrentLifecycleComponent(null);
                    }
                });
            } else {
                // VNode 直接渲染
                if (this.vnode) {
                    // 已有 vnode，使用 patch 更新
                    patch(this.vnode, vnode, this.el);
                } else {
                    // 首次渲染，使用 mount 挂载
                    this.el.innerHTML = '';
                    mount(vnode, this.el);
                }
                this.vnode = vnode;
            }
        } else {
            let defaultVnode = document.createElement('div');
            defaultVnode.innerHTML = 'hello vueact';
            this.el.appendChild(defaultVnode);
        }
    }

    use(plugin: Plugin){
        plugin.install(this);
    }
}

export default Vueact;