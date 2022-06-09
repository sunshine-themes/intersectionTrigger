export default class Helpers {
  constructor(scrollTrigger) {
    this._st = scrollTrigger;
    this.setHelpers();
    return this;
  }

  setHelpers() {
    this.is = {
      function: (value) => 'function' === typeof value,
      string: (value) => 'string' === typeof value,
      boolean: (value) => 'boolean' === typeof value,
      object: (value) => value && 'object' === typeof value && !(value instanceof Array),
      inObject: (obj, prop) => this.is.object(obj) && prop in obj,
      percent: (value) => value && value.includes('%'),
      pixel: (value) => value && value.includes('px'),
      array: (value) => value instanceof Array,
      element: (value) => value instanceof HTMLElement || value instanceof Element,
      rootViewport: (root) => !root,
      doc: (node) => node && node.nodeType === 9,
      scrollable: (element, dir = null) =>
        dir
          ? 'y' === dir
            ? element.scrollHeight > element.clientHeight
            : element.scrollWidth > element.clientWidth
          : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth,
      virtical: () => 'y' === this._st.axis,
      horizontal: () => 'x' === this._st.axis,
    };
    this.getBoundsProp = (element, prop) => element && element.getBoundingClientRect()[prop];
    this.getScroller = () => (!!this._st._root ? this._st._root : window);
    this.getScrollValue = (element, dir) => ('y' === dir ? element.scrollHeight : element.scrollWidth);
    this.dirProps = () =>
      this.is.virtical()
        ? { ref: 'top', length: 'height', refOpposite: 'bottom', innerLength: innerHeight }
        : { ref: 'left', length: 'width', refOpposite: 'right', innerLength: innerWidth };
    this.roundFloat = (value, precision) => {
      this.is.string(value) && (value = parseFloat(value));
      const multiplier = Math.pow(10, precision || 0);
      return Math.round(value * multiplier) / multiplier;
    };
    this.getParents = (element) => {
      let parents = [];
      for (
        element = element.parentNode;
        element && element !== document && element !== document.documentElement;
        element = element.parentNode
      ) {
        parents.push(element);
      }
      return parents;
    };
    this.mergeOptions = (def, custom) => {
      const defaultOptions = def;
      const options = custom;
      Object.entries(defaultOptions).forEach(([k, v]) => {
        if (this.is.object(v)) {
          this.mergeOptions(v, (options[k] = options[k] || {}));
        } else if (!(k in options)) {
          options[k] = v;
        }
      });
      return options;
    };
    this.throwError = (message) => {
      throw new Error(message);
    };
    this.boundsMinusScrollbar = (element) => {
      const bounds = element.getBoundingClientRect();

      const { top, bottom, right, left, height, width, x, y } = bounds;
      return {
        top,
        left,
        height,
        width,
        x,
        y,
        right: right - (right - left - element.clientWidth),
        bottom: bottom - (bottom - top - element.clientHeight),
      };
    };
  }
}
