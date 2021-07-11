import install from "./install";
import createMatcher from "./create-matcher";
import HashHistory from "./history/hash";

export default class MiniVueRouter {
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
