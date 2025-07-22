import { blogItem, projectItem, renderVirtualList } from "./components.js";
import { pages } from "./main.js";
import { FetchService } from "./utils/fetch-service.js";

/** @param {import("./types").Page} page */
export const loadPage = async (page) => {
  const content = document.querySelector("#content");
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) {
      throw new Error(res.status.toString());
    }

    const html = await res.text();
    content.innerHTML = html;

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

export const blogLoader = async () => {
  await loadPage(pages.BLOG);

  const api = new FetchService();
  const posts = await api.get("/posts.json");
  return renderVirtualList(posts, {
    itemHeight: 200,
    gap: 16,
    renderItem: blogItem,
  });
};
