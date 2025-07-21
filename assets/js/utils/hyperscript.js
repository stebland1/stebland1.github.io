/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tagName
 * @param {Partial<HTMLElementTagNameMap[K]> & {[key: string]: any}} [props]
 * @param {Array<(Node | string)>} children
 *
 * @returns {HTMLElementTagNameMap[K]}
 */
export const h = (tagName, props = {}, ...children) => {
  const el = document.createElement(tagName);

  for (const [key, value] of Object.entries(props)) {
    if (key in el) {
      el[key] = value;
    } else {
      el.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (child) {
      el.appendChild(
        child instanceof Node ? child : document.createTextNode(child),
      );
    }
  }

  return el;
};
