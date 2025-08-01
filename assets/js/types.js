/**
 * @callback RenderItemCallback
 * @param {Object} item
 * @param {Number} index
 * @returns {HTMLElement}
 */

/**
 * @typedef {Object} VirtualListOptions
 * @property {Number} [itemHeight=200] Fixed height of items in pixels.
 * @property {Number} [buffer=2] Number of additional rows to render above and below the viewport.
 * @property {Number} [gap=16] The number of pixels spacing between elements.
 * @property {() => Number} [getNumCols] A callback function returning the number of columns to display.
 * @property {RenderItemCallback} [renderItem] Optional custom render function that returns the HTML to render.
 */

/** @typedef {'about' | 'portfolio' | 'blog' | 'contact'} Page */

/** @typedef {(options?: any) => (void | (() => void) | Promise<void>)} RouteLoader */

/**
 * @typedef {{
 *   path: string,
 *   load: RouteLoader
 * }} RouteConfig
 */

export {};
