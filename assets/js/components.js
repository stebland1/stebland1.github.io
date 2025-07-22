import { getScrollContainer } from "./main.js";
import { router } from "./router.js";
import { h } from "./utils/hyperscript.js";

/**
 * @param {Array} items
 * @param {import("./types").VirtualListOptions} [options]
 * @param {HTMLElement} [scrollContainer]
 */
export const renderVirtualList = async (
  items,
  options,
  scrollContainer = getScrollContainer(),
) => {
  const { VirtualList } = await import("./virtual-list.js");
  const list = new VirtualList(scrollContainer, items, options);
  return list.destroy.bind(list);
};

/** @param {Object} item */
export const projectItem = (item) => {
  return h(
    "article",
    { className: "card project" },
    h("span", { className: "wip" }, "WIP"),
    h("h3", {}, item.title),
    h(
      "div",
      { className: "tags" },
      ...(item.tags || []).map(
        /** @param {Object} tag */ (tag) =>
          h("span", { className: "tag" }, tag),
      ),
    ),
    h("p", {}, item.text),
    h("span", { className: "more" }, "Read more ->"),
  );
};

/** @param {Object} item */
export const blogItem = (item) => {
  return h(
    "article",
    {
      className: "card post",
      onclick: () => {
        router.navigateTo(`${location.hash}/${item.slug}`);
      },
    },
    h("h3", {}, item.title),
    item.date
      ? h("time", { className: "date", dateTime: item.date }, item.date)
      : null,
    h(
      "div",
      { className: "tags" },
      ...(item.tags || []).map(
        /** @param {Object} tag */ (tag) =>
          h("span", { className: "tag" }, tag),
      ),
    ),
    h("p", {}, item.summary),
  );
};
