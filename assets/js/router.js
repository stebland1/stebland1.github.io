import { getScrollContainer } from "./main.js";

class Router {
  constructor() {
    this.routes = {};
    this.defaultPage = undefined;
    this.currentCleanup = null;

    window.addEventListener("DOMContentLoaded", () => this.loadFromHash());
    window.addEventListener("popstate", () =>
      this.loadFromHash({ navType: "replace" }),
    );
  }

  /**
   * @param {Record<import("./types").Page, import("./types").RouteConfig>} routes
   * @param {import("./types").Page} [defaultPage]
   */
  initializeRoutes(routes, defaultPage) {
    this.routes = routes;
    this.defaultPage = defaultPage || Object.keys(routes)[0];
  }

  /**
   * @param {string | undefined} value
   * @returns {value is import("./types").Page}
   */
  isPage(value) {
    return (
      typeof value === "string" && Object.keys(this.routes).includes(value)
    );
  }

  /** @param {string} url */
  getUrlSegments(url) {
    const [path, slug] = url.split("/");
    return { path: path.slice(1), slug };
  }

  /** @param {{ navType?: 'push' | 'replace' }} [opts] - Navigation options. */
  loadFromHash(opts) {
    return this.navigateTo(location.hash, opts);
  }

  /**
   * @async
   * @param {string} url - The page to route to.
   * @param {{ navType?: 'push' | 'replace' }} [opts] - Navigation options.
   * @returns {Promise<void>}
   */
  async navigateTo(url, opts = { navType: "push" }) {
    const segments = this.getUrlSegments(url);
    const routeConfig = this.routes[segments.path || this.defaultPage];
    const container = getScrollContainer();

    switch (opts.navType) {
      case "push":
        history.pushState(null, "", url);
        break;
      case "replace":
        history.replaceState(null, "", url);
        break;
    }

    const cleanup = await routeConfig?.load(segments.slug);
    if (typeof this.currentCleanup === "function") {
      try {
        this.currentCleanup();
      } catch (err) {
        console.warn("Route cleanup failed:", err);
      }

      this.currentCleanup = null;
    }

    if (typeof cleanup === "function") {
      this.currentCleanup = cleanup;
    }

    container.classList.remove("preload");
  }
}

const router = new Router();

export { router };
