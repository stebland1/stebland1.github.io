const pages = {
  ABOUT: "about",
  PORTFOLIO: "portfolio",
  SNIPPETS: "snippets",
  CONTACT: "contact",
};

const content = document.querySelector("#content");
const sidebarMenuItems = document.querySelectorAll(".sidebar .menu li");

window.addEventListener("DOMContentLoaded", loadFromHash);

function loadFromHash() {
  const page = location.hash.slice(1) || pages.ABOUT;
  handleLoadContent(page);
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
 */
async function handleLoadContent(page) {
  try {
    const res = await fetch(`pages/${page}.html`);

    if (!res.ok) {
      throw new Error(res.status);
    }

    const html = await res.text();
    content.innerHTML = html;
    const url = page == pages.ABOUT ? "/" : `#${page}`;

    history.pushState(null, "", url);
    document.querySelector(`.sidebar li.active`)?.classList.remove("active");
    document.querySelector(`li[data-page=${page}]`).classList.add("active");
  } catch (err) {
    content.innerHTML = "<h1>Error loading page</h1>";
  }
}
