export default class Helpers {
  constructor(intersectionTrigger) {
    this._it = intersectionTrigger;
    this.setHelpers();
    return this;
  }

  setHelpers() {
    this.is = {
      function: (a) => 'function' === typeof a,
      string: (a) => 'string' === typeof a,
      boolean: (a) => 'boolean' === typeof a,
      object: (a) => a && 'object' === typeof a && !(a instanceof Array),
      inObject: (obj, prop) => this.is.object(obj) && prop in obj,
      percent: (a) => a && a.includes('%'),
      pixel: (a) => a && a.includes('px'),
      array: (a) => a instanceof Array,
      element: (a) => a instanceof HTMLElement || a instanceof Element,
      rootViewport: (a) => !a,
      doc: (a) => a && a.nodeType === 9,
      scrollable: (element, dir = null) =>
        dir
          ? 'y' === dir
            ? element.scrollHeight > element.clientHeight
            : element.scrollWidth > element.clientWidth
          : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth,
      virtical: () => 'y' === this._it.axis,
      horizontal: () => 'x' === this._it.axis,
      anime: (a) => this.is.object(a) && a.hasOwnProperty('animatables') && !a.hasOwnProperty('add'),
      tl: (a) => this.is.object(a) && a.hasOwnProperty('add') && this.is.function(a.add),
    };
    this.getBoundsProp = (element, prop) => element && element.getBoundingClientRect()[prop];
    this.getRoot = () => this._it._root ?? window;
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
