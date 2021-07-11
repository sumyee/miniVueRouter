/**
 * 路由映射表
 * (格式化用户传入的数据)
 * @param {*} routes
 * @param {*} oldPathList
 * @param {*} oldPathMap
 */
export default function createRouteMap(routes, oldPathList, oldPathMap) {
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
