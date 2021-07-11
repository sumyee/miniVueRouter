(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.miniVueRouter = factory());
}(this, (function () { 'use strict';

  // 函数式组件： https://cn.vuejs.org/v2/guide/render-function.html#%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BB%84%E4%BB%B6

  var RouterView = {
    functional: true,
    render(h, { parent, data }) {
      console.log(this, h, data);

      let route = parent.$route;
      let matched = route.matched;
      // 标记当前组件是 RouterView
      data.routerView = true;

      let depth = 0;
      // 寻找 routerview 深度，向上查找有 routerview 父亲
      while (parent) {
        if (parent.$vnode && parent.$vnode.data.routerView) {
          depth++;
        }

        parent = parent.$parent;
      }

      let record = matched[depth];
      if (!record) {
        return h();
      }

      let component = record.component;
      return h(component, data);
    }
  };

  function install(Vue) {

    // 把 router 注入 所有组件实例
    Vue.mixin({
      beforeCreate() {
        // console.log(this.$options.name, this.$options);
        // console.log(Vue.util.defineReactive);

        // 有 router 属性， 代表是 根实例
        if (this.$options.router) {
          this._routerRoot = this;
          this._router = this.$options.router;

          // init
          this._router.init(this);

          // 响应式 _route
          Vue.util.defineReactive(this, "_route", this._router.history.current);
        } else {
          this._routerRoot = this.$parent && this.$parent._routerRoot;
        }
      }
    });

    Object.defineProperty(Vue.prototype, "$route", {
      get() {
        return this._routerRoot._route;
      }
    });

    Object.defineProperty(Vue.prototype, "$router", {
      get() {
        return this._routerRoot._router;
      }
    });

    // 注册全局组件
    Vue.component('RouterView', RouterView);
  }

  /**
   * 路由映射表
   * (格式化用户传入的数据)
   * @param {*} routes
   * @param {*} oldPathList
   * @param {*} oldPathMap
   */
  function createRouteMap(routes, oldPathList, oldPathMap) {
    let pathList = oldPathList || [];
    let pathMap = oldPathMap || Object.create(null);

    routes.forEach(route => {
      addRouteRecord(route, pathList, pathMap);
    });

    console.log(pathList, pathMap);

    return {
      pathList,
      pathMap
    };
  }

  /**
   * 添加路由记录
   * @param {*} route
   * @param {*} pathList
   * @param {*} pathMap
   */
  function addRouteRecord(route, pathList, pathMap, parent) {
    let path = parent ? `${parent.path}/${route.path}` : route.path;

    // 记录
    let record = {
      path,
      component: route.component,
      parent,
      // TODO: components
    };

    if (!pathMap[path]) {
      // 添加路径到 pathList 中
      pathList.push(path);
      pathMap[path] = record;
    }

    // 处理多级路由
    if (route.children) {
      route.children.forEach(childRoute => {
        addRouteRecord(childRoute, pathList, pathMap, record);
      });
    }
  }

  /**
   * 创建一个 route
   * @param {*} record 记录
   * @param {*} location 路径
   * @returns
   */
  function createRoute(record, location) {
    let res = [];

    if (record) {
      while (record) {
        res.unshift(record);
        record = record.parent;
      }
    }

    return {
      ...location,
      matched: res
    };
  }

  class History {
    constructor(router) {
      this.router = router;

      // 默认路由中 保存当前路径
      this.current = createRoute(null, {
        path: "/"
      });
    }

    /**
     * 跳转核心
     * @param {*} location 跳转目的地
     * @param {*} onComplete 跳转成功回调
     */
    transitionTo(location, onComplete) {
      let route = this.router.match(location);
      console.log(route);

      // 如果相同路径 返回
      if (
        this.current.path === location &&
        route.matched.length === this.current.matched.length
      ) {
        return;
      }

      // 如果新路径 更新
      this.updateRoute(route);

      // 成功回调
      onComplete && onComplete();
    }

    updateRoute(route) {
      this.current = route;

      // 将最新路径传递给 listen
      this.cb && this.cb(route);
    }

    listen(cb) {
      this.cb = cb;
    }
  }

  function createMatcher(routes) {
    // 创建路由映射表（初始化）
    const { pathList, pathMap } = createRouteMap(routes);

    // 动态添加路由 方法
    function addRoutes(routes) {
      // 重新创建映射
      createRouteMap(routes, pathList, pathMap);
    }

    // 匹配路由 方法
    function match(location) {
      let record = pathMap[location];
      let local = {
        path: location
      };

      // 找到对应路由
      if (record) {
        return createRoute(record, local)
      }

      // 没匹配到 创建一个默认
      return createRoute(null, local);
    }

    return {
      match,
      addRoutes
    };
  }

  // 获取 hash
  function getHash() {
    return window.location.hash.slice(1);
  }

  // 确保有 路径
  function ensureSlash() {
    if (!window.location.hash) {
      window.location.hash = "/";
    }
  }

  class HashHistory extends History {
    constructor(router) {
      super(router);
      ensureSlash();
    }

    getCurrentLocation() {
      return getHash();
    }

    setupListener() {
      window.addEventListener("hashchange", () => {
        this.transitionTo(getHash());
      });
    }
  }

  class MiniVueRouter {
    constructor(options) {
      this.routes = options.routes;

      this.matcher = createMatcher(options.routes || []);
      console.log("matcher", this.matcher);

      // 创建路由系统
      this.mode = options.mode || "hsah";
      this.history = new HashHistory(this);
      // TODO: history History
    }

    // 初始化
    init(app) {
      console.log("init", app);
      const history = this.history;
      const setupHashListener = () => {
        history.setupListener();
      };
      // 路由变化
      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener() // 成功回调
      );

      // 监听路由变化 刷新视图
      history.listen(route => {
        app._route = route;
      });
    }

    // 匹配
    match(location) {
      return this.matcher.match(location);
    }

    // push
    push() {}

    // replace
    replace() {}

    // ...
  }

  MiniVueRouter.install = install;

  return MiniVueRouter;

})));
