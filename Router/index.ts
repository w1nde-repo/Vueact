import { ref, Ref, reactive } from '../reactive';
import { h } from '../vdom';
import { Route, RouterOptions, MatchedRoute, CurrentRoute } from './Type';

let _routerViewDepth = 0;
let _currentRoute: Ref<CurrentRoute> = ref({
  path: '/',
  params: {},
  query: {},
  matched: []
});
let _activeRouter: Router | null = null;

export function resetRouterViewDepth() {
  _routerViewDepth = 0;
}

// useRouter 单例缓存，避免每次渲染创建新 reactive 对象
let _routerAPI: ReturnType<typeof createRouterAPI> | null = null;

// Parse URL query string: "a=1&b=2" → { a: '1', b: '2' }
function parseQuery(search: string): Record<string, string> {
  const query: Record<string, string> = {};
  if (!search) return query;

  search.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k) {
      query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
  });
  return query;
}

// Split path into segments, filtering empty strings
function getPathSegments(path: string): string[] {
  return path.split('/').filter(Boolean);
}

// Match route pattern against URL path
// matchSegments(['user', ':id'], ['user', '123']) → { id: '123' }
// matchSegments(['home'], ['about']) → null
// matchSegments(['user'], ['user', 'profile'], true) → { matchedCount: 1, params: {} }
function matchSegments(
  patternSegments: string[],
  urlSegments: string[],
  isPrefix: boolean = false
): Record<string, string> | null {
  // 空路径 '' 始终匹配（用于默认子路由）
  if (patternSegments.length === 0) return {};
  if (!isPrefix && patternSegments.length !== urlSegments.length) return null;
  if (isPrefix && patternSegments.length > urlSegments.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternSegments.length; i++) {
    if (patternSegments[i].startsWith(':')) {
      // Dynamic param
      params[patternSegments[i].slice(1)] = urlSegments[i];
    } else if (patternSegments[i] !== urlSegments[i]) {
      return null;
    }
  }
  return params;
}

// Resolve a path through route tree, returning matched route array or null
function resolveRoute(
  path: string,
  routes: Route[],
  parentPath: string = '/'
): MatchedRoute[] | null {
  const urlSegments = getPathSegments(path);
  let wildcardMatch: MatchedRoute[] | null = null;

  for (const route of routes) {
    // Determine full path for this route
    let fullPath: string;
    if (route.path === '*') {
      // Wildcard — save for last resort
      wildcardMatch = [{ route, path: '*', params: {} }];
      continue;
    } else if (route.path.startsWith('/')) {
      // Absolute path
      fullPath = route.path;
    } else {
      // Relative path — append to parent
      if (parentPath === '/') {
        fullPath = '/' + route.path;
      } else {
        fullPath = parentPath + '/' + route.path;
      }
    }

    const patternSegments = getPathSegments(fullPath);

    // For parent routes with children, use prefix matching
    const hasChildren = route.children && route.children.length > 0;
    const params = matchSegments(patternSegments, urlSegments, hasChildren);

    if (params !== null) {
      // Match found
      const matched: MatchedRoute = {
        route,
        path: fullPath,
        params
      };

      if (hasChildren) {
        // Try to match child routes with remaining path segments
        const childMatches = resolveRoute(path, route.children!, fullPath);
        if (childMatches) {
          return [matched, ...childMatches];
        }
        // If no child matches and pattern fully matches, return parent
        if (patternSegments.length === urlSegments.length) {
          return [matched];
        }
        // Parent matched as prefix but no child matched, continue to next route
        continue;
      }

      // Leaf route must fully match
      if (patternSegments.length === urlSegments.length) {
        return [matched];
      }
    }
  }

  // No match found, use wildcard if available
  return wildcardMatch;
}

// Run guards in sequence
function runGuards(
  matched: MatchedRoute[],
  direction: 'before' | 'after'
): boolean {
  if (direction === 'before') {
    // Before: parent → child
    for (const m of matched) {
      if (m.route.before && m.route.before() === false) {
        return false;
      }
    }
  } else {
    // After: child → parent
    for (let i = matched.length - 1; i >= 0; i--) {
      if (matched[i].route.after) {
        matched[i].route.after!();
      }
    }
  }
  return true;
}

// Get current URL based on mode
function getCurrentPath(mode: 'hash' | 'history'): string {
  if (mode === 'hash') {
    return window.location.hash.slice(1) || '/';
  }
  return window.location.pathname || '/';
}

// Update browser URL based on mode
function updateURL(path: string, mode: 'hash' | 'history', replace: boolean = false) {
  if (mode === 'hash') {
    window.location.hash = path;
  } else {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
  }
}

class Router {
  private _options: RouterOptions;
  private _mode: 'hash' | 'history';

  constructor(options: RouterOptions) {
    this._options = options;
    this._mode = options.mode || 'history';
    this._setupListeners();
    this._navigate(getCurrentPath(this._mode));
  }

  private _setupListeners() {
    if (this._mode === 'hash') {
      window.addEventListener('hashchange', () => {
        this._navigate(getCurrentPath(this._mode));
      });
    } else {
      window.addEventListener('popstate', () => {
        this._navigate(getCurrentPath(this._mode));
      });
    }
  }

  private _navigate(path: string, replace: boolean = false) {
    const matched = resolveRoute(path, this._options.routes) || [];
    
    // Run before guards
    if (!runGuards(matched, 'before')) {
      return; // Navigation blocked
    }

    // Update URL
    updateURL(path, this._mode, replace);

    // Parse query from path
    const [pathname, search] = path.split('?');
    const query = parseQuery(search || '');
    
    const params = matched.reduce((acc: Record<string, string>, m: MatchedRoute) => ({ ...acc, ...m.params }), {});
    const name = matched[matched.length - 1]?.route?.name;
    const meta = matched[matched.length - 1]?.route?.meta;

    // 整体替换 value 触发单次 effect，避免 Object.assign 逐属性多次 trigger
    _currentRoute.value = {
      path: pathname,
      name,
      meta,
      params,
      query,
      matched
    } as CurrentRoute;

    // Run after guards
    runGuards(matched, 'after');
  }

  push(target: string | { name?: string; params?: Record<string, string>; query?: Record<string, string> } | -1) {
    if (target === -1) {
      window.history.back();
      return;
    }

    if (typeof target === 'string') {
      this._navigate(target);
    } else {
      // Named navigation: search for route by name
      const findByName = (routes: Route[], name: string, parentPath: string = '/'): string | null => {
        for (const route of routes) {
          let fullPath: string;
          if (route.path.startsWith('/')) {
            fullPath = route.path;
          } else {
            fullPath = parentPath === '/' ? '/' + route.path : parentPath + '/' + route.path;
          }

          if (route.name === name) {
            // Build path with params
            let result = fullPath;
            if (target.params) {
              for (const [key, value] of Object.entries(target.params)) {
                result = result.replace(`:${key}`, String(value));
              }
            }

            // Append query
            if (target.query && Object.keys(target.query).length > 0) {
              const qs = Object.entries(target.query)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join('&');
              result += '?' + qs;
            }

            return result;
          }

          if (route.children) {
            const found = findByName(route.children, name, fullPath);
            if (found) return found;
          }
        }
        return null;
      };

      const path = findByName(this._options.routes, target.name || '');
      if (path) {
        this._navigate(path);
      }
    }
  }

  replace(path: string) {
    this._navigate(path, true);
  }
}

export function createRouter(options: RouterOptions): Router {
  const router = new Router(options);
  _activeRouter = router;
  return router;
}

function createRouterAPI() {
  const router = {
    get path() { 
      // 直接访问 _currentRoute.value，确保依赖追踪正确
      return _currentRoute.value.path; 
    },
    get name() { 
      return _currentRoute.value.name; 
    },
    get params() { 
      // 返回普通对象，避免 reactive 包装
      const p = _currentRoute.value.params;
      return p ? { ...p } : {};
    },
    get query() { 
      // 返回普通对象，避免 reactive 包装
      const q = _currentRoute.value.query;
      return q ? { ...q } : {};
    },
    get meta() { 
      return _currentRoute.value.meta; 
    },
    push: (target: any) => _activeRouter ? _activeRouter.push(target) : console.warn('[Vueact Router] push called before router initialized'),
    replace: (path: string) => _activeRouter ? _activeRouter.replace(path) : console.warn('[Vueact Router] replace called before router initialized')
  };
  
  // 不要包装成 reactive，让 getter 直接追踪 _currentRoute.value
  return router;
}

export function useRouter() {
  if (!_routerAPI) {
    _routerAPI = createRouterAPI();
  }
  return _routerAPI;
}

export function RouterView() {
  const depth = _routerViewDepth++;
  const routeValue = _currentRoute.value;
  const matched = routeValue?.matched || [];

  if (depth >= matched.length) {
    return null;
  }

  const route = matched[depth];
  if (!route) {
    return null;
  }

  const params = matched.slice(0, depth + 1).reduce((acc: Record<string, string>, m: MatchedRoute) => ({ ...acc, ...m.params }), {});

  // 用 route.path 作为 key，不同路由不用同一个组件实例
  return h(route.route.component, { key: route.path, ...params });
}
