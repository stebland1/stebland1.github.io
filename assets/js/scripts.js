const pages = {
  ABOUT: "about",
  PORTFOLIO: "portfolio",
  SNIPPETS: "snippets",
  CONTACT: "contact",
};

const content = document.querySelector("#content");
const sidebarMenuItems = document.querySelectorAll(".sidebar .menu li");

window.addEventListener("DOMContentLoaded", loadFromHash);
window.addEventListener("popstate", () => loadFromHash({ navType: "replace" }));

function loadFromHash(opts) {
  const page = location.hash.slice(1) || pages.ABOUT;
  handleLoadContent(page, opts);
}

for (const link of sidebarMenuItems) {
  link.addEventListener(
    "click",
    /** @param {Event} e */ (e) => {
      const page = e.currentTarget.dataset.page;
      if (page !== (location.hash.slice(1) || pages.ABOUT)) {
        handleLoadContent(page);
      }
    },
  );
}

/**
 * @param {string} page
 * @param {Object} opts
 * @param {string} [opts.navType]
 */
async function handleLoadContent(page, opts = { navType: "push" }) {
  try {
    const res = await fetch(`pages/${page}.html`);

    if (!res.ok) {
      throw new Error(res.status);
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

    document.querySelector(`.sidebar li.active`)?.classList.remove("active");
    document.querySelector(`li[data-page=${page}]`).classList.add("active");
  } catch (err) {
    content.innerHTML = "<h1>Error loading page</h1>";
  }
}
