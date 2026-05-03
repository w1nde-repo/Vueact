/**
 * DOM 属性操作 - 重构版：Vue3 自动判断 Property vs Attribute
 */

// 需要强制作为 Attribute 的特殊属性（即使它们在 DOM 元素上）
const FORCE_ATTRIBUTE = [
  'spellcheck',
  'draggable',
  'translate',
  'aria-*',  // ARIA 属性
  'data-*',  // data 属性
];

// 需要强制作为 Property 的特殊属性（处理大小写问题）
const FORCE_PROPERTY = [
  'innerHTML',
  'textContent',
  'value',
  'checked',
  'selected',
  'muted',
];

/**
 * 判断是否使用 DOM Property 方式设置
 * 核心逻辑：key in el && !isSVG && !customElement && !forceAttribute
 */
function shouldSetAsProp(el: Element, key: string): boolean {
  // 1. 强制作为 Attribute 的
  if (FORCE_ATTRIBUTE.includes(key)) return false;
  if (key.startsWith('data-') || key.startsWith('aria-')) return false;
  
  // 2. 强制作为 Property 的
  if (FORCE_PROPERTY.includes(key)) return true;
  
  // 3. 自定义元素（web components）
  if (el.tagName.includes('-')) return false;
  
  // 4. 核心判断：key 是否在 DOM 元素的原型链上
  // 例如：'value' in HTMLInputElement === true
  // 例如：'src' in HTMLImageElement === true
  // 例如：'customAttr' in HTMLElement === false
  return key in el;
}

/**
 * 设置单个属性
 */
function setProp(el: HTMLElement, key: string, value: any): void {
  // 事件处理
  if (key.startsWith('on') && typeof value === 'function') {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, value);
    return;
  }
  
  // class 特殊处理（支持对象和字符串）
  if (key === 'class' || key === 'className') {
    if (typeof value === 'string') {
      el.className = value;
    } else if (typeof value === 'object' && value !== null) {
      el.className = Object.keys(value).filter(k => value[k]).join(' ');
    }
    return;
  }
  
  // style 特殊处理（支持对象和字符串）
  if (key === 'style') {
    if (typeof value === 'string') {
      el.setAttribute('style', value);
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([k, v]) => {
        if (v != null) {
          const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
          (el.style as any)[cssKey] = v;
        }
      });
    }
    return;
  }
  
  // 判断是否使用 Property
  if (shouldSetAsProp(el, key)) {
    // DOM Property 设置
    const inputEl = el as HTMLInputElement;
    
    // 特殊处理 value（处理类型）
    if (key === 'value') {
      const type = inputEl.type || 'text';
      if (type === 'checkbox' || type === 'radio') {
        inputEl.value = String(value);
      } else {
        inputEl.value = value == null ? '' : String(value);
      }
      return;
    }
    
    // 其他 Property
    (el as any)[key] = value;
  } else {
    // HTML Attribute 设置
    if (value == null || value === false) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value === true ? '' : String(value));
    }
  }
}

/**
 * 设置元素的所有属性
 */
export function setElementProps(el: HTMLElement, props: Record<string, any> | null): void {
  if (!props) return;
  
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined && value !== null) {
      setProp(el, key, value);
    }
  }
}

/**
 * 更新元素属性（对比旧值）
 */
export function updateElementProps(
  el: HTMLElement,
  oldProps: Record<string, any> | null,
  newProps: Record<string, any> | null
): void {
  if (!newProps && !oldProps) return;
  
  oldProps = oldProps || {};
  newProps = newProps || {};
  
  // 1. 处理新增和更新的属性
  for (const [key, newValue] of Object.entries(newProps)) {
    const oldValue = oldProps[key];
    
    if (newValue !== oldValue) {
      // 事件处理：先移除旧的，再绑定新的
      if (key.startsWith('on') && typeof newValue === 'function') {
        const event = key.slice(2).toLowerCase();
        if (typeof oldValue === 'function') {
          el.removeEventListener(event, oldValue);
        }
        el.addEventListener(event, newValue);
        continue;
      }
      
      // class 更新
      if (key === 'class' || key === 'className') {
        if (typeof newValue === 'string') {
          el.className = newValue;
        } else if (typeof newValue === 'object' && newValue !== null) {
          el.className = Object.keys(newValue).filter(k => newValue[k]).join(' ');
        } else {
          el.className = '';
        }
        continue;
      }
      
      // style 更新
      if (key === 'style') {
        if (!newValue) {
          el.removeAttribute('style');
        } else if (typeof newValue === 'string') {
          el.setAttribute('style', newValue);
        } else if (typeof newValue === 'object') {
          // 清除旧样式中不存在的
          if (typeof oldValue === 'object' && oldValue) {
            Object.keys(oldValue).forEach(k => {
              if (!(k in newValue)) {
                const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
                (el.style as any)[cssKey] = '';
              }
            });
          }
          // 设置新样式
          Object.entries(newValue).forEach(([k, v]) => {
            if (v != null) {
              const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
              (el.style as any)[cssKey] = v;
            }
          });
        }
        continue;
      }
      
      // 普通属性更新
      setProp(el, key, newValue);
    }
  }
  
  // 2. 处理移除的属性
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      // 事件移除
      if (key.startsWith('on') && typeof oldProps[key] === 'function') {
        const event = key.slice(2).toLowerCase();
        el.removeEventListener(event, oldProps[key]);
        continue;
      }
      
      // 清空 class/style
      if (key === 'class' || key === 'className') {
        el.className = '';
        continue;
      }
      
      if (key === 'style') {
        el.removeAttribute('style');
        continue;
      }
      
      // 其他属性：通过 setProp 设置 null 来移除
      setProp(el, key, null);
    }
  }
}

/**
 * 设置文本内容
 */
export function setTextContent(el: HTMLElement, text: string): void {
  el.textContent = text;
}