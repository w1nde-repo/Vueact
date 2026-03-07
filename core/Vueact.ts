// Vueact 核心类
import { h, Fragment, VNode, VNodeType } from '../vdom';

interface Plugin {
  install: (app: Vueact) => void;
}

class Vueact {
    el: HTMLDivElement;
    vnode: VNode | null;
    static h = h;
    static Fragment = Fragment;
    
    constructor(el: string) {
        this.el = document.getElementById(el)! as HTMLDivElement;
        this.vnode = null;
    }
    
    render(vnode?: VNode | Function) {
        this.el.innerHTML = '';
        
        if (vnode) {
            // 如果是函数，执行获取 VNode
            if (typeof vnode === 'function') {
                vnode = vnode() as VNode;
            }
            this.vnode = vnode;
            const dom = this.createDOM(vnode);
            this.el.appendChild(dom);
        } else {
            let defaultVnode = document.createElement('div');
            defaultVnode.innerHTML = 'hello vueact';
            this.el.appendChild(defaultVnode);
        }
    }
    
    /**
     * 创建 DOM 元素
     * @param vnode - 虚拟节点
     * @returns DOM 元素或文本节点
     */
    private createDOM(vnode: VNode): HTMLElement | Text {
        // 文本节点处理
        if (vnode.type === 2) {
            const textNode = document.createTextNode(vnode.data?.Property?.textContent || String(vnode.tag) || '');
            return textNode;
        }
        
        /**
         * 组件节点处理
         * 组件函数已经在 h.ts 中执行，children 包含组件返回的 VNode
         * 使用 wrapper div 包裹组件，便于调试和识别
         */
        if (vnode.type === 3) {
            const wrapper = document.createElement('div');
            // 添加组件名标记，便于开发调试
            wrapper.setAttribute('data-component', vnode.tag);
            // 添加 key 标记，便于追踪组件实例
            if (vnode.key) {
                wrapper.setAttribute('data-key', vnode.key);
            }
            
            // 渲染组件返回的所有 VNode（支持 Fragment 多根节点）
            if (vnode.children && vnode.children.length > 0) {
                for (const child of vnode.children) {
                    wrapper.appendChild(this.createDOM(child));
                }
            }
            
            return wrapper;
        }
        
        // 普通元素节点处理
        const el = document.createElement(vnode.tag);
        
        // 设置 Property 属性（直接映射到 DOM 属性）
        if (vnode.data?.Property) {
            const props = vnode.data.Property;
            if (props.id) el.id = props.id;
            if (props.class) {
                if (typeof props.class === 'string') {
                    el.className = props.class;
                } else if (typeof props.class === 'object') {
                    // 处理对象形式的 class（如 Vue 的 :class 绑定）
                    const classObj = props.class as Record<string, any>;
                    el.className = Object.keys(classObj).filter(k => classObj[k]).join(' ');
                }
            }
            if (props.style) Object.assign(el.style, props.style);
            if (props.value) (el as HTMLInputElement).value = props.value;
            if (props.checked) (el as HTMLInputElement).checked = props.checked;
            if (props.innerHTML) el.innerHTML = props.innerHTML;
            if (props.textContent) el.textContent = props.textContent;
        }
        
        // 设置 Attribute 属性（HTML 属性）
        if (vnode.data?.Attribute) {
            for (const [key, value] of Object.entries(vnode.data.Attribute)) {
                el.setAttribute(key, value);
            }
        }
        
        // 绑定事件处理函数（支持 React 风格和 Vue 风格）
        if (vnode.data?.vueactFunc) {
            for (const [key, handler] of Object.entries(vnode.data.vueactFunc)) {
                if (typeof handler === 'function') {
                    // 解析事件名：@click -> click, onClick -> click
                    const eventName = key.startsWith('@') ? key.slice(1) : key.toLowerCase().replace('on', '');
                    el.addEventListener(eventName, handler as EventListener);
                }
            }
        }
        
        // 递归渲染子节点
        if (vnode.children) {
            for (const child of vnode.children) {
                el.appendChild(this.createDOM(child));
            }
        }
        
        return el;
    }

    use(plugin: Plugin){
        plugin.install(this);
    }
}

export default Vueact;