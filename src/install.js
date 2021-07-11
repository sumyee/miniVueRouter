import RouterView from './components/view'

export let _Vue;

export default function install(Vue) {
  _Vue = Vue;

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
  Vue.component('RouterView', RouterView)
}
