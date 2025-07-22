import { blogLoader, portfolioLoader } from "./loaders.js";
import { loadPage } from "./loaders.js";
import { router } from "./router.js";

/** @readonly */
export const pages = /** @type {const} */ ({
  ABOUT: "about",
  PORTFOLIO: "portfolio",
  BLOG: "blog",
  CONTACT: "contact",
});

const containerId = "content";
export const getScrollContainer = () => document.getElementById(containerId);

/** @type {Record<import("./types").Page, import("./types").RouteConfig>} */
const routes = {
  [pages.ABOUT]: {
    path: "#",
    load: async () => loadPage(pages.ABOUT),
  },
  [pages.PORTFOLIO]: {
    path: "#portfolio",
    load: portfolioLoader,
  },
  [pages.BLOG]: {
    path: "#blog",
    load: blogLoader,
  },
  [pages.CONTACT]: {
    path: "#contact",
    load: async () => loadPage(pages.CONTACT),
  },
};

const defaultPage = pages.ABOUT;
router.initializeRoutes(routes, defaultPage);

const sidebarMenuItems = document.querySelectorAll(".sidebar .menu li");
for (const link of sidebarMenuItems) {
  link.addEventListener(
    "click",
    /** @param {Event} e */
    (e) => {
      e.preventDefault();
      if (
        e.currentTarget instanceof HTMLElement &&
        router.isPage(e.currentTarget.dataset.page) &&
        e.currentTarget.dataset.page !== (location.hash.slice(1) || defaultPage)
      ) {
        const page =
          e.currentTarget.dataset.page == defaultPage
            ? "/"
            : `#${e.currentTarget.dataset.page}`;
        router.navigateTo(page);
      }
    },
  );
}
