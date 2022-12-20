/*
* IntersectionTrigger v1.0.1 
* IntersectionTrigger utilizes the most modern web technology to trigger anything by intersection. Including scroll-based animations.
* https://sunshine-themes.com/?appID=ss_app_1
*
* Copyright 2022, Sunshine. All rights reserved.
* @license: Released under the personal 'no charge' license can be viewed at http://sunshine-themes.com/?appID=ss_app_1&tab=license, Licensees of commercial or business license are granted additional rights. See http://sunshine-themes.com/?appID=ss_app_1&tab=license for details..
* @author: Sherif Magdy, sherifmagdy@sunshine-themes.com
*
* Released on: December 20, 2022
*/

// src/constants.js
var guideDefaultParams = {
  enter: {
    trigger: {
      backgroundColor: "rgb(0, 149, 0)",
      color: "#000",
      text: "Enter"
    },
    root: {
      backgroundColor: "rgb(0, 149, 0)",
      color: "#000",
      text: "Root Enter"
    }
  },
  leave: {
    trigger: {
      backgroundColor: "#ff0000",
      color: "#000",
      text: "Leave"
    },
    root: {
      backgroundColor: "#ff0000",
      color: "#000",
      text: "Root Leave"
    }
  }
};

// src/helpers.js
var is = {
  function: (a) => typeof a === "function",
  string: (a) => typeof a === "string",
  boolean: (a) => typeof a === "boolean",
  object: (a) => a && typeof a === "object" && !(a instanceof Array),
  inObject: (obj, prop) => is.object(obj) && prop in obj,
  num: (a) => typeof a === "number",
  percent: (a) => a && a.includes("%"),
  pixel: (a) => a && a.includes("px"),
  array: (a) => a instanceof Array,
  element: (a) => a instanceof HTMLElement || a instanceof Element,
  doc: (a) => a && a.nodeType === 9,
  scrollable: (element, dir = null) => dir ? dir === "y" ? element.scrollHeight > element.clientHeight : element.scrollWidth > element.clientWidth : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth,
  anime: (a) => is.object(a) && a.hasOwnProperty("animatables") && !a.hasOwnProperty("add"),
  tl: (a) => is.object(a) && a.hasOwnProperty("add") && is.function(a.add),
  animeInstance: (a) => is.anime(a) || is.tl(a)
};
var getParents = (element) => {
  let parents = [];
  for (element = element.parentNode; element && element !== document && element !== document.documentElement; element = element.parentNode) {
    parents.push(element);
  }
  return parents;
};
var mergeOptions = (def, custom) => {
  const defaultOptions = def;
  const options = custom;
  Object.entries(defaultOptions).forEach(([k, v]) => {
    if (is.object(v)) {
      mergeOptions(v, options[k] = options[k] || {});
    } else if (!(k in options)) {
      options[k] = v;
    }
  });
  return options;
};
var getMinMax = (n1, n2) => [n1, n2].sort((a, b) => a - b);
var setElProps = (el, props) => {
  for (const propName in props) {
    el.style[propName] = props[propName];
  }
};
var getScrollBarWidth = () => {
  let el = document.createElement("div");
  el.style.cssText = "overflow:scroll; visibility:hidden; position:absolute;";
  document.body.appendChild(el);
  let width = el.offsetWidth - el.clientWidth;
  el.remove();
  return width;
};

// src/plugins/guides.js
var Guides = class {
  constructor(it) {
    this._registerIntersectionTrigger(it);
    return this;
  }
  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }
  init(options) {
    this.options = is.object(options) ? options : {};
    this._guides = [];
    this._scrollBarWidth = getScrollBarWidth();
    this.isVer = this._utils.isVertical();
    this.rootEl = this._it._root ?? document.body;
    this.scrollWidth = {
      x: is.scrollable(this.rootEl, "x") ? this._scrollBarWidth : 0,
      y: is.scrollable(this.rootEl, "y") ? this._scrollBarWidth : 0
    };
    this._addResizeListener();
    this.update();
  }
  _addResizeListener() {
    this._onResizeHandler = this.update;
    this._utils.getRoot().addEventListener("resize", this._onResizeHandler, false);
  }
  _removeResizeListener() {
    this._utils.getRoot().removeEventListener("resize", this._onResizeHandler, false);
  }
  _guideCreation(options, triggerEl = null) {
    const {enter, position, isHigherValue, text, color, backgroundColor} = options;
    const guide = document.createElement("div");
    setElProps(guide, {
      width: this.isVer ? "100px" : "1px",
      height: this.isVer ? "1px" : "100px",
      position: "absolute",
      zIndex: "9999",
      backgroundColor,
      [this.isVer ? "top" : "left"]: position
    });
    const createText = () => {
      let verticalAlignment = {
        dir: this.isVer ? enter ? "bottom" : "top" : "bottom",
        value: this.isVer ? "5px" : "25px"
      };
      let horizontalAlignment = {
        dir: this.isVer ? "right" : enter ? "right" : "left",
        value: this.isVer ? triggerEl ? "0px" : !this._it._root ? "25px" : "0px" : "5px"
      };
      const textElement = document.createElement("span");
      textElement.innerText = text;
      guide.appendChild(textElement);
      setElProps(textElement, {
        position: "absolute",
        color,
        fontSize: "16px",
        fontWeight: "bold",
        backgroundColor,
        padding: "5px",
        width: "max-content",
        [verticalAlignment.dir]: verticalAlignment.value,
        [horizontalAlignment.dir]: horizontalAlignment.value
      });
    };
    createText();
    this._guides.push(guide);
    document.body.append(guide);
    const setTranslateProp = (diffX, diffY) => {
      const parts = [...guide.style.transform.matchAll(/(-?\d*\.?\d+)\s*(px|%)?/g)];
      const translateXInPx = parts.length ? parts[0][1] : 0;
      const translateYInPx = parts.length > 1 ? parts[1][1] : 0;
      let x = parseFloat(diffX) + parseFloat(translateXInPx);
      let y = parseFloat(diffY) + parseFloat(translateYInPx);
      setElProps(guide, {transform: `translate(${x}px,${y}px)`});
    };
    const positionGuide = (isTrigger = true) => {
      const guideBounds = guide.getBoundingClientRect();
      const rDefaultBounds = this.rootEl.getBoundingClientRect();
      let targetBounds = this._utils.getRootRect(this._it.observer.rootMargin);
      let scrollWidth = {
        x: isHigherValue ? this.scrollWidth.x : 0,
        y: isHigherValue ? this.scrollWidth.y : 0
      };
      const rootDiffs = this.isVer ? enter ? {
        x: rDefaultBounds.right - guideBounds.left - this.scrollWidth.y,
        y: targetBounds.bottom - guideBounds.bottom - scrollWidth.x
      } : {
        x: rDefaultBounds.right - guideBounds.left - this.scrollWidth.y,
        y: targetBounds.top - guideBounds.top - scrollWidth.x
      } : enter ? {
        x: targetBounds.right - guideBounds.right,
        y: rDefaultBounds.bottom - guideBounds.top - this.scrollWidth.x
      } : {x: targetBounds.left - guideBounds.left, y: rDefaultBounds.bottom - guideBounds.top - this.scrollWidth.x};
      let triggerDiffs = {};
      if (isTrigger) {
        targetBounds = triggerEl.getBoundingClientRect();
        triggerDiffs = this.isVer ? {
          x: targetBounds.right - guideBounds.right,
          y: targetBounds.top + position * targetBounds.height - guideBounds.top
        } : {
          x: targetBounds.left + position * targetBounds.width - guideBounds.left,
          y: targetBounds.top - guideBounds.top
        };
      }
      const diffs = isTrigger ? triggerDiffs : rootDiffs;
      setTranslateProp(diffs.x, diffs.y);
    };
    if (!triggerEl) {
      setElProps(guide, {
        [this.isVer ? "width" : "height"]: this._it._isViewport ? this.isVer ? "100vw" : "100vh" : "100px",
        position: this._it._isViewport ? "fixed" : "absolute"
      });
      this._it._isViewport && !this.isVer && setElProps(guide, {top: "0px"});
      if (!this._it._isViewport)
        positionGuide(false);
      return;
    }
    positionGuide();
    getParents(triggerEl).forEach((parent) => {
      if (!is.scrollable(parent))
        return;
      parent.addEventListener("scroll", positionGuide, false);
    });
  }
  createGuides() {
    const parseGuidesParams = (params) => {
      let guideParams2 = guideDefaultParams;
      if (is.object(params)) {
        guideParams2 = mergeOptions(guideParams2, params);
      }
      return guideParams2;
    };
    const guideParams = parseGuidesParams(this.options);
    const guideTextPrefix = this._it.name;
    const rEPValue = this._it._positionsData.rEP.value;
    const rLPValue = this._it._positionsData.rLP.value;
    this._guideCreation({
      enter: true,
      position: `${rEPValue}${this._it._positionsData.rEP.unit}`,
      isHigherValue: getMinMax(rEPValue, rLPValue)[1] === rEPValue,
      text: `${guideTextPrefix} ${guideParams.enter.root.text}`,
      color: guideParams.enter.root.color,
      backgroundColor: guideParams.enter.root.backgroundColor
    });
    this._guideCreation({
      enter: false,
      position: `${rLPValue}${this._it._positionsData.rLP.unit}`,
      isHigherValue: getMinMax(rEPValue, rLPValue)[1] === rLPValue,
      text: `${guideTextPrefix} ${guideParams.leave.root.text}`,
      color: guideParams.leave.root.color,
      backgroundColor: guideParams.leave.root.backgroundColor
    });
    this._it.triggers.forEach((trigger) => {
      const {enter, leave} = this._utils.getTriggerData(trigger);
      this._guideCreation({
        enter: true,
        position: enter,
        text: `${guideTextPrefix} ${guideParams.enter.trigger.text}`,
        color: guideParams.enter.trigger.color,
        backgroundColor: guideParams.enter.trigger.backgroundColor
      }, trigger);
      this._guideCreation({
        enter: false,
        position: leave,
        text: `${guideTextPrefix} ${guideParams.leave.trigger.text}`,
        color: guideParams.leave.trigger.color,
        backgroundColor: guideParams.leave.trigger.backgroundColor
      }, trigger);
    });
  }
  removeGuides = () => {
    this._guides.forEach((guide) => guide && guide.remove());
    this._guides = [];
  };
  update = () => {
    this.removeGuides();
    this.createGuides();
  };
  kill = () => {
    this._removeResizeListener();
    this.removeGuides();
    this._it.guides = null;
    this._it = null;
    this._utils = null;
  };
};
Guides.pluginName = "guides";
var guides_default = Guides;
export {
  guides_default as default
};
