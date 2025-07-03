import { FetchService } from "./utils/fetch-service.js";

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
const renderProjectItem = (item) => {
  return `
		${item.wip ? '<span class="wip">WIP</span>' : ""}
		<h3>${item.title}</h3>
		${!!item.tags?.length ? '<div class="tags">' + item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("") + "</div>" : ""}
		<p>${item.text}</p>
		<span class="more">Read more -></span>
	`;
};

export const portfolioLoader = async () => {
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

export const blogLoader = async () => {
  const api = new FetchService();
  const posts = await api.get("/posts.json");
  return renderVirtualList(posts, {
    className: "blog",
    itemHeight: 200,
    gap: 16,
    renderItem: renderBlogItem,
  });
};
