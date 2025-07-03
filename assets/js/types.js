/**
 * @callback RenderItemCallback
 * @param {Object} item
 * @param {Number} index
 * @returns {String}
 */

/**
 * @typedef {Object} VirtualListOptions
 * @property {String} [id] The ID to attach to the list container.
 * @property {String} [className] The class name to attach to the list container.
 * @property {Number} [itemHeight=200] Fixed height of items in pixels.
 * @property {Number} [buffer=2] Number of additional rows to render above and below the viewport.
 * @property {Number} [gap=16] The number of pixels spacing between elements.
 * @property {() => Number} [getNumCols] A callback function returning the number of columns to display.
 * @property {RenderItemCallback} [renderItem] Optional custom render function that returns the HTML to render.
 */

export {};
