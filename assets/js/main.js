(function () {
  /** @typedef {'about' | 'portfolio' | 'snippets' | 'contact'} Pages */

  /** @constant */
  const pages = {
    ABOUT: "about",
    PORTFOLIO: "portfolio",
    SNIPPETS: "snippets",
    CONTACT: "contact",
  };
  const sidebarMenuItems = document.querySelectorAll(".sidebar .menu li");

  /** @returns {Pages} */
  function getPageFromHash() {
    return /** @type {Pages} */ (location.hash.slice(1) || pages.ABOUT);
  }

  /** @param {{ navType?: 'push' | 'replace' }} [opts] - Navigation options. */
  function loadFromHash(opts) {
    return handleRoute(getPageFromHash(), opts);
  }

  /**
   * @async
   * @param {Pages} page - The page identifier.
   * @param {{ navType?: 'push' | 'replace' }} [opts] - Navigation options.
   * @returns {Promise<void>}
   */
  async function handleRoute(page, opts = { navType: "push" }) {
    const content = document.querySelector("#content");

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
    } catch (err) {
      // @TODO: we're going to need a nice failure screen
      content.innerHTML = "<h1>Error loading page</h1>";
      console.error(err);
    }
  }

  window.addEventListener("DOMContentLoaded", () => loadFromHash());
  window.addEventListener("popstate", () =>
    loadFromHash({ navType: "replace" }),
  );

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
          e.currentTarget.dataset.page !==
            (location.hash.slice(1) || pages.ABOUT)
        ) {
          handleRoute(e.currentTarget.dataset.page);
        }
      },
    );
  }
})();
