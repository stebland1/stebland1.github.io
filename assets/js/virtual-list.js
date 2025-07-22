import { h } from "./utils/hyperscript.js";

export class VirtualList {
  /**
   * @param {HTMLElement} scrollContainer
   * @param {Array<Object>} items
   * @param {import("./types").VirtualListOptions} [opts]
   */
  constructor(
    scrollContainer,
    items,
    {
      itemHeight = 200,
      buffer = 2,
      gap = 16,
      getNumCols = () => 1,
      renderItem = null,
    } = {},
  ) {
    this.scrollContainer = scrollContainer;
    this.items = items;
    this.getNumCols = getNumCols;
    this.numCols = getNumCols();
    this.itemHeight = itemHeight;
    this.buffer = buffer;
    this.gap = gap;
    this.pool = [];
    this.renderItem = renderItem || this.defaultRenderItem;

    this.listContainer = document.createElement("div");
    this.listContainer.style.position = "relative";
    this.listContainer.style.height = `${this.listHeight}px`;
    this.scrollContainer.appendChild(this.listContainer);

    this.createPool();
    this.render();

    this.onScroll = this.render.bind(this);
    this.onResize = this.resize.bind(this);
    this.scrollContainer.addEventListener("scroll", this.onScroll);
    window.addEventListener("resize", this.onResize);
  }

  get itemWidth() {
    const totalGap = (this.numCols - 1) * this.gap;
    const style = getComputedStyle(this.scrollContainer);
    const usableWidth =
      this.scrollContainer.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    return (usableWidth - totalGap) / this.numCols;
  }

  get numRows() {
    return Math.ceil(this.items.length / this.numCols);
  }

  get poolSize() {
    const maxItems = Math.ceil(
      this.scrollContainer.clientHeight / this.itemHeight,
    );
    return (maxItems + this.buffer * 2) * this.numCols;
  }

  get listHeight() {
    return this.numRows * this.itemHeight + (this.numRows - 1) * this.gap;
  }

  /** @type {import("./types").RenderItemCallback} */
  defaultRenderItem(item) {
    return h("article", {}, h("h3", {}, item.title), h("p", {}, item.text));
  }

  createPool() {
    for (let i = 0; i < this.poolSize; i++) {
      const div = document.createElement("div");
      this.listContainer.appendChild(div);
      this.pool.push(div);
    }
  }

  render() {
    const scrollTop = this.scrollContainer.scrollTop;
    const offsetTop = this.listContainer.offsetTop;
    const scrolled = scrollTop - offsetTop;
    const gap = ((this.numRows - 1) * this.gap) / this.numRows;
    const itemsScrolled =
      Math.ceil(scrolled / (this.itemHeight + gap)) * this.numCols;
    const startIdx = Math.max(0, itemsScrolled - this.buffer);

    for (let i = 0; i < this.poolSize; i++) {
      const idx = startIdx + i;
      const domEl = this.pool[i];

      if (idx >= this.items.length) {
        domEl.style.display = "none";
        continue;
      }

      const item = this.items[idx];
      const col = idx % this.numCols;
      const row = Math.floor(idx / this.numCols);

      domEl.style.display = "block";
      domEl.style.position = "absolute";
      domEl.style.height = `${this.itemHeight}px`;
      domEl.style.width = `${this.itemWidth}px`;
      domEl.style.top = `${row * (this.itemHeight + this.gap)}px`;
      domEl.style.left = `${col * (this.itemWidth + this.gap)}px`;
      domEl.innerHTML = "";
      domEl.appendChild(this.renderItem(item, idx));
    }
  }

  clearPool() {
    this.pool.forEach((div) => div.remove());
    this.pool = [];
  }

  resize() {
    const newNumCols = this.getNumCols();

    if (newNumCols !== this.numCols) {
      this.numCols = newNumCols;
      this.clearPool();
      this.createPool();
      this.listContainer.style.height = `${this.listHeight}px`;
    }

    this.render();
  }

  destroy() {
    this.scrollContainer.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
    this.clearPool();
    this.listContainer.remove();
  }
}
