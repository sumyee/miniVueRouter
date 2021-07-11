// 函数式组件： https://cn.vuejs.org/v2/guide/render-function.html#%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BB%84%E4%BB%B6

export default {
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
