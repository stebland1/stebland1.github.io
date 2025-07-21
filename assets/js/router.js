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

  /** @returns {import("./types").Page} */
  getRouteFromHash() {
    return /** @type {import("./types").Page} */ (
      location.hash.slice(1) || this.defaultPage
    );
  }

  /** @param {{ navType?: 'push' | 'replace' }} [opts] - Navigation options. */
  loadFromHash(opts) {
    return this.navigateTo(this.getRouteFromHash(), opts);
  }

  /**
   * @async
   * @param {import("./types").Page} route - The page to route to.
   * @param {{ navType?: 'push' | 'replace' }} [opts] - Navigation options.
   * @returns {Promise<void>}
   */
  async navigateTo(route, opts = { navType: "push" }) {
    const routeConfig = this.routes[route];
    const content = document.querySelector("#content");
    content.classList.add("preload");

    if (typeof this.currentCleanup === "function") {
      try {
        this.currentCleanup();
      } catch (err) {
        console.warn("Route cleanup failed:", err);
      }

      this.currentCleanup = null;
    }

    try {
      const res = await fetch(`pages/${route}.html`);
      if (!res.ok) {
        throw new Error(res.status.toString());
      }

      const html = await res.text();
      content.innerHTML = html;

      const url = route == this.defaultPage ? "/" : routeConfig?.path;
      switch (opts.navType) {
        case "push":
          history.pushState(null, "", url);
          break;
        case "replace":
          history.replaceState(null, "", url);
          break;
      }

      if (routeConfig) {
        document
          .querySelector(".sidebar li.active")
          ?.classList.remove("active");
        document
          .querySelector(`li[data-page=${route}]`)
          .classList.add("active");
      }

      const cleanup = await routeConfig?.load();
      if (typeof cleanup === "function") {
        this.currentCleanup = cleanup;
      }

      content.classList.remove("preload");
    } catch (err) {
      // @TODO: we're going to need a nice failure screen
      content.innerHTML = "<h1>Error loading route</h1>";
      console.error(err);
    }
  }
}

const router = new Router();

export { router };
