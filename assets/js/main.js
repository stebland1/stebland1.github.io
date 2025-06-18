import { FetchService } from "./utils/fetch-service.js";

/** @typedef {'about' | 'portfolio' | 'blog' | 'contact'} Pages */

/** @constant */
const pages = {
  ABOUT: "about",
  PORTFOLIO: "portfolio",
  BLOG: "blog",
  CONTACT: "contact",
};
const sidebarMenuItems = document.querySelectorAll(".sidebar .menu li");
const api = new FetchService("/api");

/** @returns {Pages} */
function getPageFromHash() {
  return /** @type {Pages} */ (location.hash.slice(1) || pages.ABOUT);
}

/** @param {{ navType?: 'push' | 'replace' }} [opts] - Navigation options. */
function loadFromHash(opts) {
  return handleRoute(getPageFromHash(), opts);
}

/** @param {Pages} page */
async function handleLoadScripts(page) {
  switch (page) {
    case pages.PORTFOLIO: {
      const { VirtualList } = await import("./virtual-list.js");
      const projects = await api.get("/portfolio-projects.json");
      new VirtualList(document.getElementById("content"), projects, {
        className: "projects",
        itemHeight: 170,
        gap: 16,
        getNumCols: () => (window.innerWidth < 600 ? 1 : 2),
        renderItem: (item) => {
          return `
						<h3>${item.title}</h3>
						${!!item.tags?.length ? '<div class="tags">' + item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("") + "</div>" : ""}
						<p>${item.text}</p>
					`;
        },
      });
      break;
    }
  }
}

/**
 * @async
 * @param {Pages} page - The page identifier.
 * @param {{ navType?: 'push' | 'replace' }} [opts] - Navigation options.
 * @returns {Promise<void>}
 */
async function handleRoute(page, opts = { navType: "push" }) {
  const content = document.querySelector("#content");
  content.classList.add("preload");

  try {
    const res = await fetch(`pages/${page}.html`);

    if (!res.ok) {
      throw new Error(res.status.toString());
    }

    const html = await res.text();
    content.innerHTML = html;

    const url = page == pages.ABOUT ? "/" : `#${page}`;
    switch (opts.navType) {
      case "push":
        history.pushState(null, "", url);
        break;
      case "replace":
        history.replaceState(null, "", url);
        break;
    }

    document.querySelector(".sidebar li.active")?.classList.remove("active");
    document.querySelector(`li[data-page=${page}]`).classList.add("active");

    await handleLoadScripts(page);
    content.classList.remove("preload");
  } catch (err) {
    // @TODO: we're going to need a nice failure screen
    content.innerHTML = "<h1>Error loading page</h1>";
    console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", () => loadFromHash());
window.addEventListener("popstate", () => loadFromHash({ navType: "replace" }));

/**
 * @param {string | undefined} value
 * @returns {value is Pages}
 */
function isPage(value) {
  return typeof value === "string" && Object.values(pages).includes(value);
}

for (const link of sidebarMenuItems) {
  link.addEventListener(
    "click",
    /** @param {Event} e */
    (e) => {
      if (
        e.currentTarget instanceof HTMLElement &&
        isPage(e.currentTarget.dataset.page) &&
        e.currentTarget.dataset.page !== (location.hash.slice(1) || pages.ABOUT)
      ) {
        e.preventDefault();
        handleRoute(e.currentTarget.dataset.page);
      }
    },
  );
}
