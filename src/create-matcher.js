import createRouteMap from "./create-route-map";
import { createRoute } from "./history/base";

export default function createMatcher(routes) {
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
