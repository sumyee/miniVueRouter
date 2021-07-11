/**
 * 创建一个 route
 * @param {*} record 记录
 * @param {*} location 路径
 * @returns
 */
export function createRoute(record, location) {
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

export default class History {
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
