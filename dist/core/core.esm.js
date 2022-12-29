/*
* IntersectionTrigger v1.0.3 
* IntersectionTrigger utilizes the most modern web technology to trigger anything by intersection. Including scroll-based animations.
* https://sunshine-themes.com/?appID=ss_app_1
*
* Copyright 2022, Sunshine. All rights reserved.
* @license: Released under the personal 'no charge' license can be viewed at http://sunshine-themes.com/?appID=ss_app_1&tab=license, Licensees of commercial or business license are granted additional rights. See http://sunshine-themes.com/?appID=ss_app_1&tab=license for details..
* @author: Sherif Magdy, sherifmagdy@sunshine-themes.com
*
* Released on: December 29, 2022
*/

// src/constants.js
var fn = () => {
};
var defaultInsOptions = {
  defaults: {
    enter: "0%",
    leave: "100%",
    once: false,
    onEnter: fn,
    onLeave: fn,
    onEnterBack: fn,
    onLeaveBack: fn,
    toggleClass: null,
    animation: null
  },
  rootEnter: "100%",
  rootLeave: "0%",
  axis: "y",
  name: "",
  root: null,
  guides: false,
  onScroll: fn
};
var triggerStates = {
  hasEntered: false,
  hasEnteredBack: false,
  hasLeft: true,
  hasLeftBack: true,
  hasEnteredOnce: false,
  onScroll: {backup: null, animate: null},
  ids: {snapTimeOutId: 0}
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
var getBoundsProp = (element, prop) => element && element.getBoundingClientRect()[prop];
var getScrollValue = (element, dir) => dir === "y" ? element.scrollHeight : element.scrollWidth;
var roundFloat = (value, precision) => {
  is.string(value) && (value = parseFloat(value));
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
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
var throwError = (message) => {
  throw new Error(message);
};
var getMinMax = (n1, n2) => [n1, n2].sort((a, b) => a - b);
var parseValue = (v) => {
  const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(v);
  return {value: parseFloat(parts[1]), unit: parts[2]};
};
var parseString = (string) => {
  return string.split(/\s+/).map((v) => parseValue(v));
};

// src/utils.js
var Utils = class {
  constructor(intersectionTrigger) {
    this._it = intersectionTrigger;
    this.setUtils();
    return this;
  }
  setUtils() {
    this.isVertical = () => this._it.axis === "y";
    this.isViewport = () => !this._it._root;
    this.getRoot = () => this._it._root ?? window;
    this.dirProps = () => this.isVertical() ? {ref: "top", length: "height", refOpposite: "bottom", clientLength: document.documentElement.clientHeight} : {ref: "left", length: "width", refOpposite: "right", clientLength: document.documentElement.clientWidth};
    this.setRootMargin = (rEP, rLP) => {
      const {length, clientLength} = this.dirProps();
      const rootLength = this._it._root ? getBoundsProp(this._it._root, length) : clientLength;
      const valueToPx = (pos, total) => {
        const {value, unit, normal} = pos;
        if (unit === "%")
          return normal * total;
        if (unit === "px")
          return value;
      };
      rEP.pixeled = valueToPx(rEP, rootLength);
      rLP.pixeled = valueToPx(rLP, rootLength);
      this._it._isREPGreater = rEP.pixeled >= rLP.pixeled;
      let rootMargins = {};
      rootMargins.fromOppRef = `${(this._it._isREPGreater ? rEP.pixeled : rLP.pixeled) - rootLength}px`;
      rootMargins.fromRef = `${-1 * (this._it._isREPGreater ? rLP.pixeled : rEP.pixeled)}px`;
      const extendMargin = getScrollValue(this.isViewport() ? document.body : this._it._root, this.isVertical() ? "x" : "y");
      return this.isVertical() ? `${rootMargins.fromRef} ${extendMargin}px ${rootMargins.fromOppRef} ${extendMargin}px` : `${extendMargin}px ${rootMargins.fromOppRef} ${extendMargin}px ${rootMargins.fromRef}`;
    };
    this.setThreshold = () => {
      const {enter, leave, maxPosition} = this._it._defaultTriggerParams;
      let threshold = [0, enter, leave, roundFloat(1 - maxPosition, 2), 1];
      this._it.triggers.forEach((trigger) => {
        const {enter: enter2, leave: leave2, maxPosition: maxPosition2} = this.getTriggerData(trigger);
        threshold.push(enter2, leave2, roundFloat(1 - maxPosition2, 2));
      });
      return [...new Set(threshold)];
    };
    this.parseQuery = (q, errLog) => {
      switch (true) {
        case is.string(q):
          return [...document.querySelectorAll(q)];
        case is.array(q):
          return q;
        case is.element(q):
          return [q];
        default:
          throwError(`${errLog} parameter must be a valid selector, an element or array of elements`);
      }
    };
    this.customParseQuery = (query, type = "trigger") => {
      const isTrigger = type === "trigger";
      let output = isTrigger ? [] : {};
      if (!isTrigger) {
        output = is.string(query) ? document.querySelector(query) : is.element(query) ? query : throwError("root parameter must be a valid selector or an element");
        return output;
      }
      return this.parseQuery(query, "trigger");
    };
    this.validatePosition = (pos) => {
      is.function(pos) && (pos = pos(this._it));
      if (!is.string(pos))
        throwError(`enter, leave, rootEnter and rootLeave parameters must be a string.`);
      return pos;
    };
    this.setPositionData = (pos) => {
      pos = this.validatePosition(pos);
      const original = pos.trim();
      const parsed = parseValue(original);
      const roundedValue = roundFloat(parsed.value);
      return {
        original,
        unit: parsed.unit,
        value: roundedValue,
        normal: parsed.unit === "%" ? roundedValue / 100 : null
      };
    };
    this.parsePositions = (triggerEnter, triggerLeave, rootEnter, rootLeave) => {
      const positionsData = [triggerEnter, rootEnter, triggerLeave, rootLeave].map((pos) => this.setPositionData(this.validatePosition(pos).trim()));
      return {
        tEP: positionsData[0],
        rEP: positionsData[1],
        tLP: positionsData[2],
        rLP: positionsData[3]
      };
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
        if (is.object(storedValue)) {
          this._it._triggersData.set(trigger, {...storedValue, ...props});
        }
        return;
      }
      this._it._triggersData.set(trigger, value);
    };
    this.getTriggerStates = (trigger, prop = null) => {
      const triggerStates2 = this.getTriggerData(trigger, "states");
      const hasEnteredFromOneSide = triggerStates2.hasEntered || triggerStates2.hasEnteredBack;
      if (prop)
        return triggerStates2[prop];
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
    this.setTriggerScrollStates = (trigger, prop, value = null) => {
      const triggerScrollStates = this.getTriggerStates(trigger, "onScroll");
      triggerScrollStates[prop] = value;
      this.setTriggerStates(trigger, {onscroll: {...triggerScrollStates}});
      if (value) {
        if (this._it._states.runningScrollCbs === 0)
          this._it.addScrollListener(this._it._onScrollHandler);
        this._it._states.runningScrollCbs++;
        return;
      }
      if (0 < this._it._states.runningScrollCbs)
        this._it._states.runningScrollCbs--;
      if (this._it._states.runningScrollCbs === 0)
        this._it.removeScrollListener(this._it._onScrollHandler);
    };
    this.onTriggerEnter = (trigger, event = "Enter") => {
      const {hasEnteredOnce} = this.getTriggerStates(trigger);
      const {onEnter, onEnterBack, toggleClass, animation} = this.getTriggerData(trigger);
      const isEnterEvent = event === "Enter";
      const data = {
        callback: isEnterEvent ? onEnter : onEnterBack,
        enterProp: isEnterEvent ? "hasEntered" : "hasEnteredBack",
        leaveProp: isEnterEvent ? "hasLeftBack" : "hasLeft",
        eventIndex: isEnterEvent ? 0 : 2
      };
      data.callback(trigger, this._it);
      if (this._it.killed)
        return this.kill();
      toggleClass && this._it.toggleClass.toggle(trigger, toggleClass, data.eventIndex);
      animation && this._it.animation.animate(trigger, animation, data.eventIndex);
      const triggerProps = hasEnteredOnce ? {
        [data.enterProp]: true,
        [data.leaveProp]: false
      } : {[data.enterProp]: true, hasLeft: false, hasLeftBack: false};
      this.setTriggerStates(trigger, triggerProps);
      if (!hasEnteredOnce)
        this.setTriggerStates(trigger, {hasEnteredOnce: true});
    };
    this.onTriggerLeave = (trigger, event = "Leave") => {
      const {once} = this.getTriggerData(trigger);
      const {hasEnteredOnce} = this.getTriggerStates(trigger);
      const {onLeave, onLeaveBack, toggleClass, animation} = this.getTriggerData(trigger);
      const isLeaveEvent = event === "Leave";
      const data = {
        callback: isLeaveEvent ? onLeave : onLeaveBack,
        leaveProp: isLeaveEvent ? "hasLeft" : "hasLeftBack",
        eventIndex: isLeaveEvent ? 1 : 3
      };
      data.callback(trigger, this._it);
      if (this._it.killed)
        return this.kill();
      animation && this._it.animation.animate(trigger, animation, data.eventIndex);
      toggleClass && this._it.toggleClass.toggle(trigger, toggleClass, data.eventIndex);
      this.setTriggerStates(trigger, {
        [data.leaveProp]: true,
        hasEntered: false,
        hasEnteredBack: false
      });
      once && hasEnteredOnce && this._it.remove(trigger);
    };
    this.getPositions = (tB, rB, {enter, leave, ref, refOpposite, length}) => {
      const isREPGreater = this._it._isREPGreater;
      return [
        tB[ref] + enter * tB[length],
        tB[ref] + leave * tB[length],
        isREPGreater ? rB[refOpposite] : rB[ref],
        isREPGreater ? rB[ref] : rB[refOpposite]
      ];
    };
    this.toggleActions = (trigger) => {
      const tB = trigger.getBoundingClientRect();
      this._it.rootBounds = this.getRootRect(this._it.observer.rootMargin);
      const rB = this._it.rootBounds;
      const {hasEnteredFromOneSide, hasLeft, hasLeftBack, hasEnteredOnce} = this.getTriggerStates(trigger);
      const {enter, leave} = this.getTriggerData(trigger);
      const {ref, refOpposite, length} = this.dirProps();
      const [tEP, tLP, rEP, rLP] = this.getPositions(tB, rB, {enter, leave, ref, refOpposite, length});
      let hasCaseMet = true;
      switch (true) {
        case (hasLeftBack && rEP > tEP):
          this.onTriggerEnter(trigger);
          break;
        case (hasEnteredFromOneSide && rLP > tLP):
          this.onTriggerLeave(trigger);
          break;
        case (hasLeft && hasEnteredOnce && rLP < tLP):
          this.onTriggerEnter(trigger, "EnterBack");
          break;
        case (hasEnteredFromOneSide && rEP < tEP):
          this.onTriggerLeave(trigger, "hasLeftBack");
          break;
        default:
          hasCaseMet = false;
          break;
      }
      return hasCaseMet;
    };
    this.parseRootMargin = (rootMargins) => {
      var marginString = rootMargins || "0px";
      var margins = parseString(marginString);
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
      if (this._it._root && !is.doc(this._it._root)) {
        rootRect = this._it._root.getBoundingClientRect();
        return this.expandRectByRootMargin(rootRect, rootMargins);
      }
      const doc = is.doc(this._it._root) ? this._it._root : document;
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
  kill() {
    this._it = null;
  }
};
var utils_default = Utils;

// src/core/core.js
var registeredPlugins = [];
var instances = [];
var instanceID = 0;
var IntersectionTrigger = class {
  constructor(configuration = {}) {
    this._userOptions = configuration;
    this.triggers = [];
    this._triggersData = new WeakMap();
    this._utils = new utils_default(this);
    this.id = instanceID;
    instanceID++;
    instances.push(this);
    this.animation = null;
    this.toggleClass = null;
    this.guides = null;
    this._setStates();
    this._setInstance();
  }
  _setPlugin(propertyName) {
    const plugins = IntersectionTrigger.getRegisteredPlugins();
    const Plugin = plugins.find((plg) => propertyName === plg.pluginName);
    Plugin && (this[propertyName] = new Plugin(this));
  }
  _addResizeListener() {
    this._removeResizeListener();
    this._onResizeHandler = () => this.update();
    this._utils.getRoot().addEventListener("resize", this._onResizeHandler, false);
  }
  _removeResizeListener() {
    this._utils.getRoot().removeEventListener("resize", this._onResizeHandler, false);
  }
  _setStates() {
    this._states = {};
    this._states.oCbFirstInvoke = true;
    this._states.runningScrollCbs = 0;
  }
  _rAFCallback = (time) => {
    this.triggers.forEach((trigger) => {
      const onScrollFuns = this._utils.getTriggerStates(trigger, "onScroll");
      for (const key in onScrollFuns) {
        onScrollFuns[key] && is.function(onScrollFuns[key]) && onScrollFuns[key](trigger, time);
      }
    });
  };
  _onScrollHandler = () => this._rAFID = requestAnimationFrame(this._rAFCallback);
  addScrollListener(handler) {
    this._utils.getRoot().addEventListener("scroll", handler, false);
  }
  removeScrollListener(handler) {
    this._utils.getRoot().removeEventListener("scroll", handler, false);
  }
  _observerCallback = (entries, observer) => {
    const {ref, refOpposite, length} = this._utils.dirProps();
    for (const entry of entries) {
      const trigger = entry.target, tB = entry.boundingClientRect, isIntersecting = entry.isIntersecting;
      this.rootBounds = entry.rootBounds || this._utils.getRootRect(observer.rootMargin);
      const rB = this.rootBounds, rL = rB[length];
      const {enter, leave} = this._utils.getTriggerData(trigger);
      const {
        hasEnteredFromOneSide,
        onScroll: {backup}
      } = this._utils.getTriggerStates(trigger);
      const [tEP, tLP, rEP, rLP] = this._utils.getPositions(tB, rB, {enter, leave, ref, refOpposite, length});
      const initBackupFun = tB[length] >= rL, isBackupFunRunning = !!backup;
      switch (true) {
        case this._states.oCbFirstInvoke:
          switch (true) {
            case (!isIntersecting && rLP > tLP):
              this._utils.onTriggerEnter(trigger);
              this._utils.onTriggerLeave(trigger);
              break;
            case isIntersecting:
              switch (true) {
                case (rEP > tEP && rLP < tLP):
                  this._utils.onTriggerEnter(trigger);
                  break;
                case rLP > tLP:
                  this._utils.onTriggerEnter(trigger);
                  this._utils.onTriggerLeave(trigger);
                  break;
              }
              if (initBackupFun)
                this._utils.setTriggerScrollStates(trigger, "backup", this._utils.toggleActions);
              break;
          }
          break;
        case !isIntersecting:
          if (isBackupFunRunning)
            this._utils.setTriggerScrollStates(trigger, "backup", null);
          switch (true) {
            case (hasEnteredFromOneSide && rLP > tLP):
              this._utils.onTriggerLeave(trigger);
              break;
            case (hasEnteredFromOneSide && rEP < tEP):
              this._utils.onTriggerLeave(trigger, "onLeaveBack");
              break;
          }
          break;
        case (isIntersecting && !isBackupFunRunning):
          this._utils.toggleActions(trigger);
          initBackupFun && this._utils.setTriggerScrollStates(trigger, "backup", this._utils.toggleActions);
          break;
      }
    }
    this._states.oCbFirstInvoke = false;
  };
  _createInstance() {
    this._rootMargin = this._utils.setRootMargin(this._positionsData.rEP, this._positionsData.rLP);
    this._threshold = this._utils.setThreshold();
    this._observerOptions = {
      root: this._root,
      rootMargin: this._rootMargin,
      threshold: this._threshold
    };
    this.observer = new IntersectionObserver(this._observerCallback, this._observerOptions);
    this._root = this.observer.root;
    this.rootBounds = this._utils.getRootRect(this.observer.rootMargin);
    this._isViewport = this._utils.isViewport();
  }
  _setInstance() {
    this._defaultOptions = defaultInsOptions;
    this._options = mergeOptions(this._defaultOptions, this._userOptions);
    this.axis = is.string(this._options.axis) ? this._options.axis : throwError("axis parameter must be a string.");
    this.name = is.string(this._options.name) ? this._options.name : throwError("name parameter must be a string.");
    this._root = !!this._options.root && this._utils.customParseQuery(this._options.root, "root") || null;
    this._positionsData = this._utils.parsePositions(this._options.defaults.enter, this._options.defaults.leave, this._options.rootEnter, this._options.rootLeave);
    this.customScrollHandler = this._options.onScroll;
    const {once, onEnter, onLeave, onEnterBack, onLeaveBack, toggleClass, animation} = this._options.defaults, normalizedTEP = this._positionsData.tEP.normal, normalizedTLP = this._positionsData.tLP.normal, [minPosition, maxPosition] = getMinMax(normalizedTEP, normalizedTLP);
    this._defaultTriggerParams = {
      enter: normalizedTEP,
      leave: normalizedTLP,
      minPosition,
      maxPosition,
      once,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
      toggleClass,
      animation
    };
    this._createInstance();
    this._addResizeListener();
    this.customScrollHandler && this.addScrollListener(this.customScrollHandler);
    if (this._options.guides) {
      this._setPlugin("guides");
      this.guides.init(this._options.guides);
    }
    return this;
  }
  add(trigger = {}, config = {}) {
    const toAddTriggers = this._utils.customParseQuery(trigger);
    "enter" in config && (config.enter = this._utils.setPositionData(config.enter).normal);
    "leave" in config && (config.leave = this._utils.setPositionData(config.leave).normal);
    const mergedParams = mergeOptions(this._defaultTriggerParams, config);
    const [minPosition, maxPosition] = getMinMax(mergedParams.enter, mergedParams.leave);
    const triggerParams = {
      ...mergedParams,
      minPosition,
      maxPosition,
      states: {...triggerStates}
    };
    const parseProp = (name) => {
      !this[name] && this._setPlugin(name);
      triggerParams[name] = this[name].parse(triggerParams[name]);
    };
    triggerParams.toggleClass && parseProp("toggleClass");
    triggerParams.animation && parseProp("animation");
    this.triggers = [...new Set([...this.triggers, ...toAddTriggers])];
    let mustUpdate = false;
    [config.enter, config.leave].forEach((position) => !this._threshold.some((value) => position === value) && (mustUpdate = true));
    if (mustUpdate) {
      toAddTriggers.forEach((trigger2) => this._utils.setTriggerData(trigger2, triggerParams));
      this.update();
    } else {
      toAddTriggers.forEach((trigger2) => {
        this._utils.setTriggerData(trigger2, triggerParams);
        this.observer.observe(trigger2);
      });
    }
    this.guides && this.guides.update();
    return this;
  }
  remove(trigger = {}) {
    let toRemoveTriggers = this._utils.customParseQuery(trigger);
    toRemoveTriggers.forEach((trigger2) => {
      this._utils.deleteTriggerData(trigger2);
      this.observer.unobserve(trigger2);
    });
    const updatedStoredTriggers = this.triggers.filter((storedTrigger) => {
      const isInRemoveTriggers = toRemoveTriggers.some((toRemoveTrigger) => storedTrigger === toRemoveTrigger);
      return !isInRemoveTriggers;
    });
    this.triggers = updatedStoredTriggers;
    this.guides && this.guides.update();
    return this;
  }
  _disconnect() {
    this.observer && this.observer.disconnect();
    this.observer = null;
  }
  update() {
    this._disconnect();
    this._createInstance();
    this.triggers.forEach((trigger) => this.observer.observe(trigger));
    this.guides && this.guides.update();
  }
  kill() {
    this.killed = true;
    this._disconnect();
    this.removeScrollListener(this._onScrollHandler);
    this.removeScrollListener(this.customScrollHandler);
    this._removeResizeListener();
    this._rAFID && cancelAnimationFrame(this._rAFID);
    this.guides && this.guides.kill();
    this.toggleClasss && this.toggleClasss.kill();
    this.animation && this.animation.kill();
    this.triggers = [];
    this.animation = this.toggleClass = this.guides = this._utils = null;
    const instanceIndex = instances.indexOf(this);
    ~instanceIndex && instances.splice(instanceIndex, 1);
  }
};
IntersectionTrigger.getInstances = () => instances;
IntersectionTrigger.getInstanceById = (id) => instances.find((ins) => ins.id === id);
IntersectionTrigger.update = () => instances.forEach((ins) => ins.update());
IntersectionTrigger.kill = () => instances.forEach((ins) => ins.kill());
IntersectionTrigger.registerPlugins = (plugins = []) => registeredPlugins.push(...plugins);
IntersectionTrigger.getRegisteredPlugins = () => registeredPlugins;
var core_default = IntersectionTrigger;
export {
  core_default as default
};
