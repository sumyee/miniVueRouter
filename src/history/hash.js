import History from "./base";

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

export default class HashHistory extends History {
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
