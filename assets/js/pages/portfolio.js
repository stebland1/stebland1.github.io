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

function getItemWidth(scrollContainer, numCols, gap) {
  const totalGap = (numCols - 1) * gap;
  const paddingLeft = parseFloat(getComputedStyle(scrollContainer).paddingLeft);
  const paddingRight = parseFloat(
    getComputedStyle(scrollContainer).paddingRight,
  );
  const usableWidth = scrollContainer.clientWidth - paddingLeft - paddingRight;
  return (usableWidth - totalGap) / numCols;
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
  const scrollContainer = document.getElementById("content");
  const buffer = 2;
  const itemHeight = 200;
  const gap = 16;
  let numCols = getNumberOfColumns();
  let itemWidth = getItemWidth(scrollContainer, numCols, gap);

  const listContainer = document.createElement("div");
  listContainer.style.position = "relative";
  let numRows = Math.ceil(items.length / numCols);
  listContainer.style.height = `${numRows * itemHeight + (numRows - 1) * gap}px`;
  document.querySelector("#content").appendChild(listContainer);

  let poolSize =
    (Math.ceil(scrollContainer.clientHeight / itemHeight) + buffer * 2) *
    numCols;

  let pool = [];
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

  function resizeVirtualList() {
    const newNumCols = getNumberOfColumns();
    itemWidth = getItemWidth(scrollContainer, newNumCols, gap);

    if (newNumCols != numCols) {
      numCols = newNumCols;
      numRows = Math.ceil(items.length / numCols);

      poolSize =
        (Math.ceil(scrollContainer.clientHeight / itemHeight) + buffer * 2) *
        numCols;
      pool.forEach((div) => div.remove());
      pool = [];
      for (let i = 0; i < poolSize; i++) {
        const div = document.createElement("div");
        listContainer.appendChild(div);
        pool.push(div);
      }

      listContainer.style.height = `${itemHeight * numRows + (numRows - 1) * gap}px`;
    }

    renderVirtualList();
  }

  scrollContainer.addEventListener("scroll", renderVirtualList);
  window.addEventListener("resize", resizeVirtualList);
  renderVirtualList();
}

export async function init() {
  const projects = await fetchProjects();
  initVirtualList(projects);
}
