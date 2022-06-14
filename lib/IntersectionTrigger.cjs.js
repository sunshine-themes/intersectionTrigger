/*
* IntersectionTrigger v1.0.0
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright 2022, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  
var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// src/IntersectionTrigger.js
__markAsModule(exports);
__export(exports, {
  default: () => IntersectionTrigger
});

// src/constants.js
var defaultInsOptions = {
  defaults: {
    once: false,
    onEnter: null,
    onLeave: null,
    onEnterBack: null,
    onLeaveBack: null
  },
  enter: "0% 100%",
  leave: "100% 0%",
  axis: "y",
  name: "",
  root: null,
  onScroll: null
};
var triggerStates = {
  hasEntered: false,
  hasEnteredBack: false,
  hasLeft: true,
  hasLeftBack: true,
  hasFirstEntered: false,
  onScroll: null
};

// src/Helpers.js
var Helpers = class {
  constructor(intersectionTrigger) {
    this._it = intersectionTrigger;
    this.setHelpers();
    return this;
  }
  setHelpers() {
    this.is = {
      function: (value) => typeof value === "function",
      string: (value) => typeof value === "string",
      boolean: (value) => typeof value === "boolean",
      object: (value) => value && typeof value === "object" && !(value instanceof Array),
      inObject: (obj, prop) => this.is.object(obj) && prop in obj,
      percent: (value) => value && value.includes("%"),
      pixel: (value) => value && value.includes("px"),
      array: (value) => value instanceof Array,
      element: (value) => value instanceof HTMLElement || value instanceof Element,
      rootViewport: (root) => !root,
      doc: (node) => node && node.nodeType === 9,
      scrollable: (element, dir = null) => dir ? dir === "y" ? element.scrollHeight > element.clientHeight : element.scrollWidth > element.clientWidth : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth,
      virtical: () => this._it.axis === "y",
      horizontal: () => this._it.axis === "x"
    };
    this.getBoundsProp = (element, prop) => element && element.getBoundingClientRect()[prop];
    this.getRoot = () => !!this._it._root ? this._it._root : window;
    this.getScrollValue = (element, dir) => dir === "y" ? element.scrollHeight : element.scrollWidth;
    this.dirProps = () => this.is.virtical() ? {ref: "top", length: "height", refOpposite: "bottom", innerLength: innerHeight} : {ref: "left", length: "width", refOpposite: "right", innerLength: innerWidth};
    this.roundFloat = (value, precision) => {
      this.is.string(value) && (value = parseFloat(value));
      const multiplier = Math.pow(10, precision || 0);
      return Math.round(value * multiplier) / multiplier;
    };
    this.getParents = (element) => {
      let parents = [];
      for (element = element.parentNode; element && element !== document && element !== document.documentElement; element = element.parentNode) {
        parents.push(element);
      }
      return parents;
    };
    this.mergeOptions = (def, custom) => {
      const defaultOptions = def;
      const options = custom;
      Object.entries(defaultOptions).forEach(([k, v]) => {
        if (this.is.object(v)) {
          this.mergeOptions(v, options[k] = options[k] || {});
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
      const {top, bottom, right, left, height, width, x, y} = bounds;
      return {
        top,
        left,
        height,
        width,
        x,
        y,
        right: right - (right - left - element.clientWidth),
        bottom: bottom - (bottom - top - element.clientHeight)
      };
    };
  }
};
var Helpers_default = Helpers;

// src/Utils.js
var Utils = class {
  constructor(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._helpers = this._it._helpers;
    this.setUtils();
    return this;
  }
  setUtils() {
    this.setRootMargin = () => {
      const extendMargin = this._helpers.getScrollValue(this._helpers.is.rootViewport(this._it._root) ? document.body : this._it._root, this._helpers.is.virtical() ? "x" : "y");
      return this._helpers.is.virtical() ? `${this._it._positions.rootEndPosition.strValue} ${extendMargin}px ${this._it._positions.rootStartPosition.strValue} ${extendMargin}px` : `${extendMargin}px ${this._it._positions.rootStartPosition.strValue} ${extendMargin}px ${this._it._positions.rootEndPosition.strValue}`;
    };
    this.setThreshold = () => {
      let threshold = [
        0,
        this._it._triggerParams.enter,
        this._it._triggerParams.leave,
        this._helpers.roundFloat(1 - this._it._triggerParams.leave, 2),
        1
      ];
      this._it.triggers.forEach((trigger) => {
        const {enter, leave} = this.getTriggerData(trigger);
        threshold.push(enter, leave, this._helpers.roundFloat(1 - leave, 2));
      });
      return [...new Set(threshold)];
    };
    this.parseQuery = (query, type = "trigger") => {
      const isTrigger = type === "trigger";
      let output = isTrigger ? [] : {};
      if (!isTrigger) {
        output = this._helpers.is.string(query) ? document.querySelector(query) : this._helpers.is.element(query) ? query : this._helpers.throwError("root parameter must be a valid selector or an element");
        return output;
      }
      switch (true) {
        case this._helpers.is.string(query):
          output = [...document.querySelectorAll(query)];
          break;
        case this._helpers.is.array(query):
          output = query;
          break;
        case this._helpers.is.element(query):
          output = [query];
          break;
        default:
          this._helpers.throwError("trigger parameter must be a valid selector, an element or array of elements");
          break;
      }
      return output;
    };
    this.validatePosition = (name, pos) => {
      this._helpers.is.function(pos) && (pos = pos(this));
      if (!this._helpers.is.string(pos))
        this._helpers.throwError(`${name} parameter must be a string.`);
      return pos;
    };
    this.setPositionData = (offset, isTrigger = true, isEnter = true) => {
      offset = this.validatePosition(isEnter ? "enter" : "leave", offset);
      let value = offset.trim();
      const isPercentage = this._helpers.is.percent(value);
      const isPixel = this._helpers.is.pixel(value);
      let position = {};
      value = isPercentage ? value.replace("%", "") : isPixel ? value.replace("px", "") : value;
      value = this._helpers.roundFloat(value);
      position.type = isPercentage ? "percent" : "pixel";
      if (isPercentage && isTrigger) {
        position.value = value / 100;
        position.strValue = `${value}%`;
        return position;
      }
      const {length, innerLength} = this._helpers.dirProps();
      const rootLength = this._it._root ? this._helpers.getBoundsProp(this._it._root, length) : innerLength;
      switch (true) {
        case (isPercentage && isEnter):
          position.value = this._helpers.roundFloat(value / 100 - 1, 2);
          position.strValue = `${position.value * 100}%`;
          break;
        case (isPercentage && !isEnter):
          position.value = -value / 100;
          position.strValue = `${position.value * 100}%`;
          break;
        case (isPixel && isEnter):
          position.value = this._helpers.roundFloat(value - rootLength, 2);
          position.strValue = `${position.value}px`;
          break;
        case (isPixel && !isEnter):
          position.value = -value;
          position.strValue = `${-value}px`;
          break;
      }
      position.guide = offset;
      return position;
    };
    this.parsePositions = (enter = "", leave = "") => {
      enter = this.validatePosition("enter", enter);
      leave = this.validatePosition("leave", leave);
      let triggerEnterPosition = {}, triggerLeavePosition = {}, rootStartPosition = {}, rootEndPosition = {};
      const enterPositions = enter.trim().split(/\s+/g, 2);
      const leavePositions = leave.trim().split(/\s+/g, 2);
      const positions = [...enterPositions, ...leavePositions];
      positions.forEach((offset, i) => {
        switch (i) {
          case 0:
            triggerEnterPosition = this.setPositionData(offset);
            break;
          case 1:
            rootStartPosition = this.setPositionData(offset, false);
            break;
          case 2:
            triggerLeavePosition = this.setPositionData(offset);
            break;
          case 3:
            rootEndPosition = this.setPositionData(offset, false, false);
            break;
        }
      });
      const parsedPositions = {
        triggerLeavePosition,
        triggerEnterPosition,
        rootEndPosition,
        rootStartPosition
      };
      return parsedPositions;
    };
    this.deleteTriggerData = (trigger) => {
      this._it._triggersData.delete(trigger);
    };
    this.hasTriggerData = (trigger, prop = null) => {
      const hasData = this._it._triggersData.has(trigger);
      if (prop) {
        return hasData && prop in this.getTriggerData(trigger);
      }
      return hasData;
    };
    this.getTriggerData = (trigger, prop = null) => {
      if (prop) {
        return this.hasTriggerData(trigger, prop) ? this._it._triggersData.get(trigger)[prop] : {};
      }
      return this.hasTriggerData(trigger) && this._it._triggersData.get(trigger) || {};
    };
    this.setTriggerData = (trigger, value, props = null) => {
      if (props) {
        const storedValue = this.getTriggerData(trigger);
        if (this._helpers.is.object(storedValue)) {
          this._it._triggersData.set(trigger, {...storedValue, ...props});
        }
        return;
      }
      this._it._triggersData.set(trigger, value);
    };
    this.getTriggerStates = (trigger) => {
      const triggerStates2 = this.getTriggerData(trigger, "states");
      const hasEnteredFromOneSide = triggerStates2.hasEntered || triggerStates2.hasEnteredBack;
      return {
        ...triggerStates2,
        hasEnteredFromOneSide
      };
    };
    this.setTriggerStates = (trigger, value = {}) => {
      const triggerData = this.getTriggerData(trigger);
      const triggerStates2 = triggerData && {...triggerData.states, ...value};
      this.setTriggerData(trigger, null, {states: triggerStates2});
    };
    this.onTriggerEnter = (trigger, data) => {
      const {hasFirstEntered} = this.getTriggerStates(trigger);
      this._helpers.is.function(data.enterFun) && data.enterFun(trigger, this);
      const triggerProps = hasFirstEntered ? {
        [data.enterProp]: true,
        [data.leaveProp]: false
      } : {[data.enterProp]: true, hasLeft: false, hasLeftBack: false};
      this.setTriggerStates(trigger, triggerProps);
      if (!hasFirstEntered)
        this.setTriggerStates(trigger, {hasFirstEntered: true});
    };
    this.onTriggerLeave = (trigger, data) => {
      const {once} = this.getTriggerData(trigger);
      const {hasFirstEntered} = this.getTriggerStates(trigger);
      this._helpers.is.function(data.leaveFun) && data.leaveFun(trigger, this);
      this.setTriggerStates(trigger, {
        [data.leaveProp]: true,
        hasEntered: false,
        hasEnteredBack: false
      });
      once && hasFirstEntered && this._it.remove(trigger);
    };
    this.toggleActions = (trigger) => {
      const tB = trigger.getBoundingClientRect();
      this._it.rootBounds = this.getRootRect(this._it.observer.rootMargin);
      const rB = this._it.rootBounds;
      const {enter, leave, onEnter, onEnterBack, onLeave, onLeaveBack} = this.getTriggerData(trigger);
      const {hasEnteredFromOneSide, hasLeft, hasLeftBack} = this.getTriggerStates(trigger);
      const {ref, refOpposite, length} = this._helpers.dirProps();
      let hasCaseMet = true;
      switch (true) {
        case (hasLeftBack && tB[ref] + enter * tB[length] <= rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref]):
          this.onTriggerEnter(trigger, {
            enterFun: onEnter,
            enterProp: "hasEntered",
            leaveProp: "hasLeftBack"
          });
          break;
        case (hasEnteredFromOneSide && tB[ref] + leave * tB[length] <= rB[ref]):
          this.onTriggerLeave(trigger, {
            leaveFun: onLeave,
            leaveProp: "hasLeft"
          });
          break;
        case (hasLeft && tB[ref] + leave * tB[length] >= rB[ref] && tB[ref] + leave * tB[length] < rB[refOpposite]):
          this.onTriggerEnter(trigger, {
            enterFun: onEnterBack,
            enterProp: "hasEnteredBack",
            leaveProp: "hasLeft"
          });
          break;
        case (hasEnteredFromOneSide && tB[ref] + enter * tB[length] >= rB[refOpposite]):
          this.onTriggerLeave(trigger, {
            leaveFun: onLeaveBack,
            leaveProp: "hasLeftBack"
          });
          break;
        default:
          hasCaseMet = false;
          break;
      }
      return hasCaseMet;
    };
    this.validateOptions = (options) => {
      for (const optionName in options) {
        const optionValue = options[optionName];
        const validateOption = (optionName2, optionValue2) => {
          switch (optionName2) {
            case "once":
              !this._helpers.is.boolean(optionValue2) && this._helpers.throwError("once parameter must be a boolean.");
              break;
            case "axis":
            case "name":
              !this._helpers.is.string(optionValue2) && this._helpers.throwError("axis and name parameters must be strings.");
              break;
            case "guides":
              !this._helpers.is.boolean(optionValue2) && !this._helpers.is.object(optionValue2) && this._helpers.throwError("guides parameter must be a boolean or object.");
              break;
            case "onEnter":
            case "onEnterBack":
            case "onLeave":
            case "onLeaveBack":
            case "onScroll":
              !this._helpers.is.function(optionValue2) && this._helpers.throwError("onEnter, onLeave, onEnterBack, onLeaveBack and onScroll parameters must be functions.");
              break;
          }
        };
        if (!this._helpers.is.object(optionValue)) {
          validateOption(optionName, optionValue);
          continue;
        }
        for (const nestedOptionName in optionValue) {
          const nestedOptionValue = optionValue[nestedOptionName];
          validateOption(nestedOptionName, nestedOptionValue);
        }
      }
    };
    this.parseString = (string) => {
      const parsedString = string.split(/\s+/).map((margin) => {
        const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
        return {value: parseFloat(parts[1]), unit: parts[2]};
      });
      return parsedString;
    };
    this.parseRootMargin = (rootMargins) => {
      var marginString = rootMargins || "0px";
      var margins = this.parseString(marginString);
      margins[1] = margins[1] || margins[0];
      margins[2] = margins[2] || margins[0];
      margins[3] = margins[3] || margins[1];
      return margins;
    };
    this.expandRectByRootMargin = (rect, rootMargins) => {
      const margins = this.parseRootMargin(rootMargins).map((margin, i) => {
        return margin.unit == "px" ? margin.value : margin.value * (i % 2 ? rect.width : rect.height) / 100;
      });
      const newRect = {
        top: rect.top - margins[0],
        right: rect.right + margins[1],
        bottom: rect.bottom + margins[2],
        left: rect.left - margins[3]
      };
      newRect.width = newRect.right - newRect.left;
      newRect.height = newRect.bottom - newRect.top;
      return newRect;
    };
    this.getRootRect = (rootMargins) => {
      let rootRect;
      if (this._it._root && !this._helpers.is.doc(this._it._root)) {
        rootRect = this._helpers.boundsMinusScrollbar(this._it._root);
        return this.expandRectByRootMargin(rootRect, rootMargins);
      }
      const doc = this._helpers.is.doc(this._it._root) ? this._it._root : document;
      const html = doc.documentElement;
      const body = doc.body;
      rootRect = {
        top: 0,
        left: 0,
        right: html.clientWidth || body.clientWidth,
        width: html.clientWidth || body.clientWidth,
        bottom: html.clientHeight || body.clientHeight,
        height: html.clientHeight || body.clientHeight
      };
      return this.expandRectByRootMargin(rootRect, rootMargins);
    };
  }
};
var Utils_default = Utils;

// src/IntersectionTrigger.js
var instances = [];
var instanceID = 0;
var IntersectionTrigger = class {
  constructor(options = {}) {
    this._userOptions = options;
    this.triggers = [];
    this._triggersData = new WeakMap();
    this._guidesInstance = null;
    this._helpers = new Helpers_default(this);
    this._utils = new Utils_default(this);
    this.id = instanceID;
    instanceID++;
    instances.push(this);
    this._setStates();
    this._setInstance();
  }
  _setStates() {
    this._states = {};
    this._states.hasInit = false;
  }
  _addScrollListener() {
    const root = this._helpers.getRoot();
    !!this._onScrollHandler && root.removeEventListener("scroll", this._onScrollHandler, false);
    this._onScrollHandler = (event) => {
      this.triggers.forEach((trigger) => {
        const onScrollFun = this._utils.getTriggerStates(trigger)?.onScroll;
        this._helpers.is.function(onScrollFun) && onScrollFun(trigger);
      });
      this._helpers.is.function(this.onScroll) && this.onScroll(event, this);
    };
    root.addEventListener("scroll", this._onScrollHandler, false);
  }
  _createInstance() {
    this._threshold = this._utils.setThreshold();
    this._observerOptions = {
      root: this._root,
      rootMargin: this._rootMargin,
      threshold: this._threshold
    };
    this.observer = new IntersectionObserver(this._observerCallback, this._observerOptions);
    this._root = this.observer.root;
    this.rootBounds = this._utils.getRootRect(this.observer.rootMargin);
    this._isRootViewport = this._helpers.is.rootViewport(this._root);
    this._addScrollListener();
  }
  _observerCallback = (entries, observer) => {
    const {ref, refOpposite, length} = this._helpers.dirProps();
    for (const entry of entries) {
      const trigger = entry.target;
      const tB = entry.boundingClientRect;
      const isIntersecting = entry.isIntersecting;
      const intersectionRatio = entry.intersectionRatio;
      this.rootBounds = entry.rootBounds || this._utils.getRootRect(observer.rootMargin);
      const rB = this.rootBounds;
      const rootLength = rB[length];
      const rootToTarget = rootLength / tB[length];
      const {enter, leave, onEnter, onLeave, onLeaveBack} = this._utils.getTriggerData(trigger);
      const {hasEnteredFromOneSide, onScroll} = this._utils.getTriggerStates(trigger);
      const isTriggerLarger = tB[length] >= rootLength;
      const isTSPLarger = enter > rootToTarget;
      const isTEPLarger = 1 - leave > rootToTarget;
      const initOnScrollFun = isTriggerLarger && (isTSPLarger || isTEPLarger);
      const isOnScrollFunRunning = !!onScroll;
      const tSPIsBtwn = tB[ref] + enter * tB[length] < rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref];
      const tEPIsBtwn = tB[ref] + leave * tB[length] < rB[refOpposite] && tB[ref] + leave * tB[length] > rB[ref];
      const tSPIsUp = tB[ref] + enter * tB[length] < rB[ref];
      const tEPIsDown = tB[ref] + leave * tB[length] > rB[refOpposite];
      const tEPIsUp = tB[ref] + leave * tB[length] < rB[ref] && intersectionRatio < 1 - leave;
      const tTIsUp = tB[ref] < rB[ref];
      const tBIsUp = tB[refOpposite] < rB[ref];
      switch (true) {
        case !this._states.hasInit:
          switch (true) {
            case (!isIntersecting && tTIsUp && tBIsUp):
              this._utils.onTriggerEnter(trigger, {
                enterFun: onEnter,
                enterProp: "hasEntered",
                leaveProp: "hasLeftBack"
              });
              this._utils.onTriggerLeave(trigger, {
                leaveFun: onLeave,
                leaveProp: "hasLeft"
              });
              break;
            case isIntersecting:
              switch (true) {
                case (tSPIsBtwn || tEPIsBtwn || tSPIsUp && tEPIsDown):
                  this._utils.onTriggerEnter(trigger, {
                    enterFun: onEnter,
                    enterProp: "hasEntered",
                    leaveProp: "hasLeftBack"
                  });
                  break;
                case tEPIsUp:
                  this._utils.onTriggerEnter(trigger, {
                    enterFun: onEnter,
                    enterProp: "hasEntered",
                    leaveProp: "hasLeftBack"
                  });
                  this._utils.onTriggerLeave(trigger, {
                    leaveFun: onLeave,
                    leaveProp: "hasLeft"
                  });
                  break;
              }
              if (initOnScrollFun)
                this._utils.setTriggerStates(trigger, {
                  onScroll: this._utils.toggleActions
                });
              break;
          }
          break;
        case !isIntersecting:
          if (isOnScrollFunRunning)
            this._utils.setTriggerStates(trigger, {
              onScroll: null
            });
          switch (true) {
            case (hasEnteredFromOneSide && tB[refOpposite] < rB[ref]):
              this._utils.onTriggerLeave(trigger, {
                leaveFun: onLeave,
                leaveProp: "hasLeft"
              });
              break;
            case (hasEnteredFromOneSide && tB[ref] > rB[refOpposite]):
              this._utils.onTriggerLeave(trigger, {
                leaveFun: onLeaveBack,
                leaveProp: "hasLeftBack"
              });
              break;
          }
          break;
        case (isIntersecting && !isOnScrollFunRunning):
          this._utils.toggleActions(trigger);
          initOnScrollFun && this._utils.setTriggerStates(trigger, {
            onScroll: this._utils.toggleActions
          });
          break;
      }
    }
    this._states.hasInit = true;
  };
  _setInstance() {
    this._defaultOptions = defaultInsOptions;
    this._utils.validateOptions(this._userOptions);
    this._options = this._helpers.mergeOptions(this._defaultOptions, this._userOptions);
    this.axis = this._helpers.is.string(this._options.axis) ? this._options.axis : this._helpers.throwError("axis parameter must be a string.");
    this.name = this._helpers.is.string(this._options.name) ? this._options.name : this._helpers.throwError("name parameter must be a string.");
    this._root = !!this._options.root && this._utils.parseQuery(this._options.root, "root") || null;
    this._positions = this._utils.parsePositions(this._options.enter, this._options.leave);
    this.onScroll = this._options.onScroll;
    this._triggerParams = {
      once: this._options.defaults.once,
      enter: this._positions.triggerEnterPosition.value,
      leave: this._positions.triggerLeavePosition.value,
      onEnter: this._options.defaults.onEnter,
      onLeave: this._options.defaults.onLeave,
      onEnterBack: this._options.defaults.onEnterBack,
      onLeaveBack: this._options.defaults.onLeaveBack
    };
    this._rootMargin = this._utils.setRootMargin();
    this._createInstance();
    return this;
  }
  add(trigger = {}, options = {}) {
    const toAddTriggers = this._utils.parseQuery(trigger);
    this._utils.validateOptions(options);
    "enter" in options && (options.enter = this._utils.setPositionData(options.enter).value);
    "leave" in options && (options.leave = this._utils.setPositionData(options.leave).value);
    const triggerParams = {...this._triggerParams, ...options, states: {...triggerStates}};
    this.triggers = [...this.triggers, ...toAddTriggers];
    this.triggers = [...new Set(this.triggers)];
    let shouldReCreateObserver = false;
    [options.enter, options.leave].forEach((position) => !this._threshold.some((value) => position === value) && (shouldReCreateObserver = true));
    if (shouldReCreateObserver) {
      this._disconnect();
      toAddTriggers.forEach((trigger2) => this._utils.setTriggerData(trigger2, triggerParams));
      this._createInstance();
      this.triggers.forEach((trigger2) => this.observer.observe(trigger2));
    } else {
      toAddTriggers.forEach((trigger2) => {
        this._utils.setTriggerData(trigger2, triggerParams);
        this.observer.observe(trigger2);
      });
    }
    this._guidesInstance && this._guidesInstance.refresh();
    return this;
  }
  remove(trigger = {}) {
    let toRemoveTriggers = this._utils.parseQuery(trigger);
    toRemoveTriggers.forEach((trigger2) => {
      this._utils.deleteTriggerData(trigger2);
      this.observer.unobserve(trigger2);
    });
    const updatedStoredTriggers = this.triggers.filter((storedTrigger) => {
      const isInRemoveTriggers = toRemoveTriggers.some((toRemoveTrigger) => storedTrigger === toRemoveTrigger);
      return !isInRemoveTriggers;
    });
    this.triggers = updatedStoredTriggers;
    this._guidesInstance && this._guidesInstance.refresh();
    return this;
  }
  _disconnect() {
    this.observer && this.observer.disconnect();
    this.observer = null;
  }
  kill() {
    this._disconnect();
    removeEventListener("scroll", this._onScrollHandler, false);
    this.triggers = [];
    this.removeGuides();
    const instanceIndex = instances.indexOf(this);
    ~instanceIndex && instances.splice(instanceIndex, 1);
  }
  addGuides(guidesIns) {
    if (!this._helpers.is.inObject(guidesIns, "_registerIntersectionTrigger"))
      this._helpers.throwError("Invalid Guides Instance.");
    guidesIns._registerIntersectionTrigger(this);
    guidesIns.refresh();
    this._guidesInstance = guidesIns;
    return this;
  }
  removeGuides() {
    this._guidesInstance && this._guidesInstance.kill();
    this._guidesInstance = null;
    return this;
  }
};
IntersectionTrigger.instances = instances;
