import { blogItem, projectItem, renderVirtualList } from "./components.js";
import { getScrollContainer, pages } from "./main.js";
import { router } from "./router.js";
import { FetchService } from "./utils/fetch-service.js";
import { h } from "./utils/hyperscript.js";

/**
 * @param {string} location
 * @param {Element} target
 * @param {boolean} [append]
 */
const injectHtml = async (location, target, append = false) => {
  const res = await fetch(location);
  if (!res.ok) {
    throw new Error(res.status.toString());
  }

  const html = await res.text();
  if (append) {
    target.insertAdjacentHTML("beforeend", html);
  } else {
    target.innerHTML = html;
  }
};

/** @param {import("./types").Page} page */
export const loadPage = async (page) => {
  const content = getScrollContainer();
  try {
    await injectHtml(`pages/${page}.html`, content);
    document.querySelector(".sidebar li.active")?.classList.remove("active");
    document.querySelector(`li[data-page=${page}]`).classList.add("active");
  } catch (err) {
    // @TODO: we're going to need a nice failure screen
    content.innerHTML = "<h1>Error loading route</h1>";
    console.error(err);
  }
};

export const portfolioLoader = async () => {
  await loadPage(pages.PORTFOLIO);

  const api = new FetchService("api");
  const projects = await api.get("/portfolio-projects.json");
  return renderVirtualList(projects, {
    itemHeight: 170,
    gap: 16,
    getNumCols: () => (window.innerWidth < 600 ? 1 : 2),
    renderItem: projectItem,
  });
};

let scrollPos = null;

const blogListingsLoader = async () => {
  const api = new FetchService();
  const posts = await api.get("/posts.json");

  await loadPage(pages.BLOG);
  const cleanup = await renderVirtualList(posts, {
    itemHeight: 200,
    gap: 16,
    getNumCols: () => (window.innerWidth < 600 ? 1 : 2),
    renderItem: blogItem,
  });

  if (scrollPos) {
    getScrollContainer().scrollTo(0, scrollPos);
    scrollPos = null;
  }

  return cleanup;
};

/** @param {string} slug */
const blogPageLoader = async (slug) => {
  const container = getScrollContainer();
  scrollPos = container.scrollTop;
  await injectHtml(`pages/posts/${slug}.html`, container);
  container.scrollTop = 0;

  const backButton = h(
    "button",
    {
      href: router.routes[pages.BLOG].path,
      style: "margin-bottom: 1rem; margin-top: 0.4rem;",
      onclick: () => {
        router.navigateTo(router.routes[pages.BLOG].path);
      },
    },
    "<- Back",
  );
  container.prepend(backButton);
};

/** @param {string} slug */
export const blogLoader = async (slug) => {
  if (slug) {
    return await blogPageLoader(slug);
  } else {
    return await blogListingsLoader();
  }
};
