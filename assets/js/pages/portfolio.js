(function () {
  async function fetchProjects() {
    try {
      // @TODO: pull from github repo readme
      const res = await fetch("api/portfolio-projects.json");

      if (!res.ok) {
        throw new Error(res.status.toString());
      }

      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function getNumberOfColumns() {
    return window.innerWidth < 600 ? 1 : 2;
  }

  /**
   * @typedef {Object} Item
   * @property {string} title
   * @property {string} text
   */

  /**
   * @param {Array<Item>} items
   */
  function initVirtualList(items) {
    const buffer = 2;
    const itemHeight = 200;
    const gap = 16;
    const numCols = getNumberOfColumns();
    const numRows = Math.floor(items.length / numCols);
    const scrollContainer = document.getElementById("content");
    const paddingLeft = parseFloat(
      getComputedStyle(scrollContainer).paddingLeft,
    );
    const paddingRight = parseFloat(
      getComputedStyle(scrollContainer).paddingRight,
    );
    const usableWidth =
      scrollContainer.clientWidth - paddingLeft - paddingRight;
    const totalGap = (numCols - 1) * gap;
    const itemWidth = (usableWidth - totalGap) / numCols;

    const listContainer = document.createElement("div");
    listContainer.style.position = "relative";
    listContainer.style.height = `${numRows * itemHeight + (numRows - 1) * gap}px`;
    document.querySelector("#content").appendChild(listContainer);

    const poolSize =
      (Math.ceil(scrollContainer.clientHeight / itemHeight) + buffer * 2) *
      numCols;

    const pool = [];
    for (let i = 0; i < poolSize; i++) {
      const div = document.createElement("div");
      listContainer.appendChild(div);
      pool.push(div);
    }

    function renderVirtualList() {
      const scrollTop = scrollContainer.scrollTop;
      const offsetTop = listContainer.offsetTop;
      const startIdx = Math.max(
        0,
        Math.floor((scrollTop - offsetTop) / itemHeight) - buffer,
      );

      for (let i = 0; i < poolSize; i++) {
        const idx = startIdx + i;
        const div = pool[i];

        if (idx >= items.length) {
          div.style.display = "none";
          continue;
        }

        const item = items[idx];
        const col = idx % numCols;
        const row = Math.floor(idx / numCols);
        div.classList.add("project");
        div.style.display = "block";
        div.style.position = "absolute";
        div.style.height = `${itemHeight}px`;
        div.style.width = `${itemWidth}px`;
        div.style.top = `${row * (itemHeight + gap)}px`;
        div.style.left = `${col * (itemWidth + gap)}px`;
        div.innerHTML = `
					<h3>${item.title}</h3>
					<p>${item.text}</p>
				`;
      }
    }

    scrollContainer.addEventListener("scroll", renderVirtualList);
    scrollContainer.addEventListener("resize", renderVirtualList);
    renderVirtualList();
  }

  async function init() {
    const projects = await fetchProjects();
    initVirtualList(projects);
  }

  init();
})();
