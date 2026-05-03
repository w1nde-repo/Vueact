export interface Route {
  path: string;
  name?: string;
  component: any;
  before?: () => boolean | void;
  after?: () => void;
  children?: Route[];
  meta?: Record<string, any>;
}

export interface RouterOptions {
  routes: Route[];
  mode?: 'hash' | 'history';
}

export interface MatchedRoute {
  route: Route;
  path: string;
  params: Record<string, string>;
}

export interface CurrentRoute {
  path: string;
  name?: string;
  meta?: Record<string, any>;
  params: Record<string, string>;
  query: Record<string, string>;
  matched: MatchedRoute[];
}
