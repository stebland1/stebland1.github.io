import { Router } from "./router.js";
import { FetchService } from "./utils/fetch-service.js";

/**
 * @param {Array} items
 * @param {import("./types").VirtualListOptions} [options]
 * @param {HTMLElement} [scrollContainer]
 */
const renderVirtualList = async (
  items,
  options,
  scrollContainer = document.getElementById("content"),
) => {
  const { VirtualList } = await import("./virtual-list.js");
  const list = new VirtualList(scrollContainer, items, options);
  return list.destroy.bind(list);
};

/** @param {Object} item */
const renderProjectItem = (item) => {
  return `
		${item.wip ? '<span class="wip">WIP</span>' : ""}
		<h3>${item.title}</h3>
		${!!item.tags?.length ? '<div class="tags">' + item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("") + "</div>" : ""}
		<p>${item.text}</p>
		<span class="more">Read more -></span>
	`;
};

const portfolioLoader = async () => {
  const api = new FetchService("api");
  const projects = await api.get("/portfolio-projects.json");
  return renderVirtualList(projects, {
    className: "projects",
    itemHeight: 170,
    gap: 16,
    getNumCols: () => (window.innerWidth < 600 ? 1 : 2),
    renderItem: renderProjectItem,
  });
};

/** @param {Object} item */
const renderBlogItem = (item) => {
  return `
		<h3>${item.title}</h3>
		<time class="date" datetime="${item.date}">${item.date}</time>
		${!!item.tags?.length ? '<div class="tags">' + item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("") + "</div>" : ""}
		<p>${item.summary}</p>
	`;
};

const blogLoader = async () => {
  const api = new FetchService();
  const posts = await api.get("/posts.json");
  return renderVirtualList(posts, {
    className: "blog",
    itemHeight: 200,
    gap: 16,
    renderItem: renderBlogItem,
  });
};

/** @readonly */
export const pages = /** @type {const} */ ({
  ABOUT: "about",
  PORTFOLIO: "portfolio",
  BLOG: "blog",
  CONTACT: "contact",
});

/** @type {Record<import("./types").Page, import("./types").RouteConfig>} */
const routes = {
  [pages.ABOUT]: {
    path: "#",
    load: async () => {},
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
    load: async () => {},
  },
};

const router = new Router(routes, pages.ABOUT);

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
        e.currentTarget.dataset.page !== (location.hash.slice(1) || "about")
      ) {
        router.navigateTo(e.currentTarget.dataset.page);
      }
    },
  );
}
