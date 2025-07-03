import { FetchService } from "./utils/fetch-service.js";
import { h } from "./utils/hyperscript.js";

/**
 * @param {Array} items
 * @param {import("./types").VirtualListOptions} [options]
 * @param {HTMLElement} [scrollContainer]
 */
export const renderVirtualList = async (
  items,
  options,
  scrollContainer = document.getElementById("content"),
) => {
  const { VirtualList } = await import("./virtual-list.js");
  const list = new VirtualList(scrollContainer, items, options);
  return list.destroy.bind(list);
};

/** @param {Object} item */
const projectItem = (item) => {
  return h(
    "article",
    { className: "card project" },
    h("span", { className: "wip" }, "WIP"),
    h("h3", {}, item.title),
    h(
      "div",
      { className: "tags" },
      ...item.tags.map((tag) => h("span", { className: "tag" }, tag)),
    ),
    h("p", {}, item.text),
    h("span", { className: "more" }, "Read more ->"),
  );
};

export const portfolioLoader = async () => {
  const api = new FetchService("api");
  const projects = await api.get("/portfolio-projects.json");
  return renderVirtualList(projects, {
    itemHeight: 170,
    gap: 16,
    getNumCols: () => (window.innerWidth < 600 ? 1 : 2),
    renderItem: projectItem,
  });
};

/** @param {Object} item */
const blogItem = (item) => {
  return h(
    "article",
    { className: "card post" },
    h("h3", {}, item.title),
    h("time", { className: "date", dateTime: item.date }, item.date),
    h(
      "div",
      { className: "tags" },
      ...item.tags.map((tag) => h("span", { className: "tag" }, tag)),
    ),
    h("p", {}, item.summary),
  );
};

export const blogLoader = async () => {
  const api = new FetchService();
  const posts = await api.get("/posts.json");
  return renderVirtualList(posts, {
    itemHeight: 200,
    gap: 16,
    renderItem: blogItem,
  });
};
