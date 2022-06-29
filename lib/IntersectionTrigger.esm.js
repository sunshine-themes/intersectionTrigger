/*
* IntersectionTrigger v1.0.0
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright 2022, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  
// src/constants.js
var fn = () => {
};
var classDefaultToggleActions = ["add", "remove", "add", "remove"];
var animationDefaultToggleActions = ["play", "finish", "reverse", "finish"];
var snapDefaultParams = {to: null, after: 1, speed: 600, maxDistance: 500};
var defaultInsOptions = {
  defaults: {
    once: false,
    onEnter: fn,
    onLeave: fn,
    onEnterBack: fn,
    onLeaveBack: fn,
    toggleClass: null,
    animation: null
  },
  enter: "0% 100%",
  leave: "100% 0%",
  axis: "y",
  name: "",
  root: null,
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
var defaultToggleClassParams = {
  targets: null,
  toggleActions: classDefaultToggleActions,
  classNames: null
};
var defaultAnimationParams = {
  instance: null,
  toggleActions: animationDefaultToggleActions,
  control: false,
  snap: false
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
var clamp = (a, min, max) => Math.min(Math.max(a, min), max);
var splitStr = (st) => st.split(/\s+/);
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
var boundsMinusScrollbar = (element) => {
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

// src/Utils.js
var Utils = class {
  constructor(intersectionTrigger) {
    this._it = intersectionTrigger;
    this.setUtils();
    return this;
  }
  setUtils() {
    this.isVirtical = () => this._it.axis === "y";
    this.isRootViewport = () => !this._it._root;
    this.getRoot = () => this._it._root ?? window;
    this.dirProps = () => this.isVirtical() ? {ref: "top", length: "height", refOpposite: "bottom", innerLength: innerHeight} : {ref: "left", length: "width", refOpposite: "right", innerLength: innerWidth};
    this.setRootMargin = () => {
      const extendMargin = getScrollValue(this.isRootViewport() ? document.body : this._it._root, this.isVirtical() ? "x" : "y");
      return this.isVirtical() ? `${this._it._positions.rootLeavePosition.strValue} ${extendMargin}px ${this._it._positions.rootEnterPosition.strValue} ${extendMargin}px` : `${extendMargin}px ${this._it._positions.rootEnterPosition.strValue} ${extendMargin}px ${this._it._positions.rootLeavePosition.strValue}`;
    };
    this.setThreshold = () => {
      let threshold = [
        0,
        this._it._triggerParams.enter,
        this._it._triggerParams.leave,
        roundFloat(1 - this._it._triggerParams.leave, 2),
        1
      ];
      this._it.triggers.forEach((trigger) => {
        const {enter, leave} = this.getTriggerData(trigger);
        threshold.push(enter, leave, roundFloat(1 - leave, 2));
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
    this.validatePosition = (name, pos) => {
      is.function(pos) && (pos = pos(this._it));
      if (!is.string(pos))
        throwError(`${name} parameter must be a string.`);
      return pos;
    };
    this.setPositionData = (offset, isTrigger = true, isEnter = true) => {
      offset = this.validatePosition(isEnter ? "enter" : "leave", offset);
      let value = offset.trim();
      const isPercentage = is.percent(value);
      const isPixel = is.pixel(value);
      let position = {};
      value = isPercentage ? value.replace("%", "") : isPixel ? value.replace("px", "") : value;
      value = roundFloat(value);
      position.type = isPercentage ? "percent" : "pixel";
      if (isPercentage && isTrigger) {
        position.value = value / 100;
        position.strValue = `${value}%`;
        return position;
      }
      const {length, innerLength} = this.dirProps();
      const rootLength = this._it._root ? getBoundsProp(this._it._root, length) : innerLength;
      switch (true) {
        case (isPercentage && isEnter):
          position.value = roundFloat(value / 100 - 1, 2);
          position.strValue = `${position.value * 100}%`;
          break;
        case (isPercentage && !isEnter):
          position.value = -value / 100;
          position.strValue = `${position.value * 100}%`;
          break;
        case (isPixel && isEnter):
          position.value = roundFloat(value - rootLength, 2);
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
      const enterPositions = enter.trim().split(/\s+/g, 2);
      const leavePositions = leave.trim().split(/\s+/g, 2);
      const positions = [...enterPositions, ...leavePositions];
      return {
        triggerEnterPosition: this.setPositionData(positions[0]),
        rootEnterPosition: this.setPositionData(positions[1], false),
        triggerLeavePosition: this.setPositionData(positions[2]),
        rootLeavePosition: this.setPositionData(positions[3], false, false)
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
      if (prop) {
        return triggerStates2[prop];
      }
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
      data.callback(trigger, this);
      toggleClass && this.toggleClass(trigger, toggleClass, data.eventIndex);
      animation && this.animate(trigger, animation, data.eventIndex);
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
      data.callback(trigger, this);
      toggleClass && this.toggleClass(trigger, toggleClass, data.eventIndex);
      animation && this.animate(trigger, animation, data.eventIndex);
      this.setTriggerStates(trigger, {
        [data.leaveProp]: true,
        hasEntered: false,
        hasEnteredBack: false
      });
      once && hasEnteredOnce && this._it.remove(trigger);
    };
    this.animate = (trigger, animation, eventIndex) => {
      const {instance, toggleActions, control, snap} = animation;
      if (!instance)
        return;
      if (control) {
        const {animate} = this.getTriggerStates(trigger, "onScroll");
        const ids = this.getTriggerStates(trigger, "ids");
        const {enter, leave} = this.getTriggerData(trigger);
        const {ref, refOpposite, length} = this.dirProps();
        const isVir = this.isVirtical();
        const tB = trigger.getBoundingClientRect();
        const tIL = tB[length] - (enter * tB[length] + (1 - leave) * tB[length]);
        const root = this.getRoot();
        const duration = instance.duration;
        const animateHandler = (trigger2) => {
          const tB2 = trigger2.getBoundingClientRect();
          const ids2 = this.getTriggerStates(trigger2, "ids");
          this._it.rootBounds = this.getRootRect(this._it.observer.rootMargin);
          const rB = this._it.rootBounds;
          const scrollLength = tIL + rB[length];
          let currentTime = 0;
          const diff = rB[refOpposite] - (tB2[ref] + enter * tB2[length]);
          if (diff > 0) {
            currentTime = duration * diff / scrollLength;
            if (is.num(control)) {
              setTimeout(() => instance.seek(currentTime), control * 1e3);
            } else {
              instance.seek(currentTime);
            }
          }
          if (snap) {
            const speed = snap.speed * 17 / 1e3;
            let dis = 0;
            const startSnaping = (snapDistance, toRef = false) => {
              const direction = toRef ? -1 : 1;
              if (isVir) {
                root.scrollBy({
                  top: speed * direction,
                  behavior: "instant"
                });
              } else {
                root.scrollBy({
                  left: speed * direction,
                  behavior: "instant"
                });
              }
              dis += speed;
              if (dis >= snapDistance) {
                dis = 0;
                return;
              }
              requestAnimationFrame(() => startSnaping(snapDistance, toRef));
            };
            clearTimeout(ids2.snapTimeOutId);
            const snapTimeOutId = setTimeout(() => {
              const directionalDiff = snap.to.map((n) => currentTime - n);
              const diff2 = directionalDiff.map((n) => Math.abs(n));
              const closest = Math.min(...diff2);
              const closestWithDirection = directionalDiff[diff2.indexOf(closest)];
              const snapDistance = scrollLength * closest / duration;
              if (snapDistance >= snap.maxDistance || snapDistance < 10)
                return;
              if (closestWithDirection < 0) {
                startSnaping(snapDistance);
                return;
              }
              startSnaping(snapDistance, true);
            }, snap.after * 1e3);
            this.setTriggerStates(trigger2, {ids: {...ids2, snapTimeOutId}});
          }
        };
        switch (eventIndex) {
          case 0:
          case 2:
            this._it._states.oCbFirstInvoke && animateHandler(trigger);
            if (animate)
              break;
            this.setTriggerScrollStates(trigger, "animate", animateHandler);
            break;
          case 1:
          case 3:
            clearTimeout(ids.snapTimeOutId);
            this.setTriggerScrollStates(trigger, "animate", null);
            break;
        }
        return;
      }
      const action = toggleActions[eventIndex];
      if (action === "none")
        return;
      switch (action) {
        case "play":
          instance.reversed && instance.reverse();
          1 > instance.progress && instance[action]();
          break;
        case "restart":
        case "reset":
          instance.reversed && instance.reverse();
          instance[action]();
          break;
        case "pause":
          break;
        case "finish":
          instance.pause();
          instance.seek(instance.reversed ? 0 : instance.duration);
          break;
        case "reverse":
          if (instance.reversed)
            break;
          instance[action]();
          instance.paused && instance.play();
          break;
        case "kill":
          is.inObject(instance, "kill") && instance.kill();
          this.setTriggerData(trigger, null, {animation: {...defaultAnimationParams}});
          break;
      }
    };
    this.parseAnimation = (params) => {
      let animation = {};
      switch (true) {
        case is.animeInstance(params):
          animation = mergeOptions(defaultAnimationParams, {
            instance: params
          });
          break;
        case is.object(params):
          {
            const mergedParams = mergeOptions(defaultAnimationParams, params);
            const {instance, toggleActions, snap} = mergedParams;
            if (!is.animeInstance(instance))
              throwError("Invalid anime instance");
            const parseSnapNum = (n) => {
              const arr = [];
              let progress = n;
              while (progress < 1) {
                arr.push(clamp(progress, 0, 1));
                progress = progress + n;
              }
              return arr.map((v) => Math.round(v * instance.duration));
            };
            const parseSnapTo = (sn) => {
              if (is.num(sn))
                return parseSnapNum(sn);
              if (is.string(sn))
                return [];
              if (is.array(sn))
                return sn;
            };
            let snapParams = {};
            switch (true) {
              case (is.boolean(snap) && snap):
                snapParams.to = [];
                break;
              case is.array(snap):
                snapParams.to = snap;
                break;
              case is.num(snap):
                snapParams.to = parseSnapNum(snap);
                break;
              case is.object(snap):
                snapParams = snap;
                snapParams.to = parseSnapTo(snapParams.to);
                break;
            }
            mergedParams.snap = mergeOptions(snapDefaultParams, snapParams);
            is.string(toggleActions) && (mergedParams.toggleActions = splitStr(toggleActions));
            animation = mergedParams;
          }
          break;
      }
      is.inObject(animation, "instance") && animation.instance.reset();
      return animation;
    };
    this.toggleClass = (trigger, toggleClass, eventIndex) => {
      for (const {targets, toggleActions, classNames} of toggleClass) {
        if (toggleActions[eventIndex] === "none")
          continue;
        classNames.forEach((className) => targets.forEach((target) => target === "trigger" ? trigger.classList[toggleActions[eventIndex]](className) : target.classList[toggleActions[eventIndex]](className)));
      }
    };
    this.parseToggleClass = (params) => {
      let toggleClass = [];
      if (is.string(params)) {
        const mergedParams = mergeOptions(defaultToggleClassParams, {
          targets: ["trigger"],
          classNames: splitStr(params)
        });
        toggleClass.push([mergedParams]);
        return toggleClass;
      }
      if (is.array(params)) {
        toggleClass = params.map((obj) => {
          const mergedParams = mergeOptions(defaultToggleClassParams, obj);
          const {targets, classNames, toggleActions} = mergedParams;
          targets && (mergedParams.targets = this.parseQuery(targets, "targets"));
          classNames && (mergedParams.classNames = splitStr(classNames));
          is.string(toggleActions) && (mergedParams.toggleActions = splitStr(toggleActions));
          return mergedParams;
        });
      }
      return toggleClass;
    };
    this.toggleActions = (trigger) => {
      const tB = trigger.getBoundingClientRect();
      this._it.rootBounds = this.getRootRect(this._it.observer.rootMargin);
      const rB = this._it.rootBounds;
      const {enter, leave} = this.getTriggerData(trigger);
      const {hasEnteredFromOneSide, hasLeft, hasLeftBack} = this.getTriggerStates(trigger);
      const {ref, refOpposite, length} = this.dirProps();
      let hasCaseMet = true;
      switch (true) {
        case (hasLeftBack && tB[ref] + enter * tB[length] <= rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref]):
          this.onTriggerEnter(trigger);
          break;
        case (hasEnteredFromOneSide && tB[ref] + leave * tB[length] <= rB[ref]):
          this.onTriggerLeave(trigger);
          break;
        case (hasLeft && tB[ref] + leave * tB[length] >= rB[ref] && tB[ref] + leave * tB[length] < rB[refOpposite]):
          this.onTriggerEnter(trigger, "EnterBack");
          break;
        case (hasEnteredFromOneSide && tB[ref] + enter * tB[length] >= rB[refOpposite]):
          this.onTriggerLeave(trigger, "hasLeftBack");
          break;
        default:
          hasCaseMet = false;
          break;
      }
      return hasCaseMet;
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
      if (this._it._root && !is.doc(this._it._root)) {
        rootRect = boundsMinusScrollbar(this._it._root);
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
};
var Utils_default = Utils;

// src/IntersectionTrigger.js
var registeredPlugins = [];
var instances = [];
var instanceID = 0;
var IntersectionTrigger = class {
  constructor(options = {}) {
    this._userOptions = options;
    this.triggers = [];
    this._triggersData = new WeakMap();
    this._guidesInstance = null;
    this._utils = new Utils_default(this);
    this.id = instanceID;
    instanceID++;
    instances.push(this);
    this._setStates();
    this._setInstance();
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
  _onScrollHandler = () => requestAnimationFrame(this._rAFCallback);
  addScrollListener(handler) {
    this._utils.getRoot().addEventListener("scroll", handler, false);
  }
  removeScrollListener(handler) {
    this._utils.getRoot().removeEventListener("scroll", handler, false);
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
    this._isRootViewport = this._utils.isRootViewport();
  }
  _observerCallback = (entries, observer) => {
    const {ref, refOpposite, length} = this._utils.dirProps();
    for (const entry of entries) {
      const trigger = entry.target, tB = entry.boundingClientRect, isIntersecting = entry.isIntersecting, intersectionRatio = entry.intersectionRatio;
      this.rootBounds = entry.rootBounds || this._utils.getRootRect(observer.rootMargin);
      const rB = this.rootBounds, rootLength = rB[length], rootToTarget = rootLength / tB[length];
      const {enter, leave} = this._utils.getTriggerData(trigger);
      const {
        hasEnteredFromOneSide,
        onScroll: {backup}
      } = this._utils.getTriggerStates(trigger);
      const isTriggerLarger = tB[length] >= rootLength, isTSPLarger = enter > rootToTarget, isTEPLarger = 1 - leave > rootToTarget, initBackupFun = isTriggerLarger && (isTSPLarger || isTEPLarger), isBackupFunRunning = !!backup;
      const tSPIsBtwn = tB[ref] + enter * tB[length] < rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref], tEPIsBtwn = tB[ref] + leave * tB[length] < rB[refOpposite] && tB[ref] + leave * tB[length] > rB[ref], tSPIsUp = tB[ref] + enter * tB[length] < rB[ref], tEPIsDown = tB[ref] + leave * tB[length] > rB[refOpposite], tEPIsUp = tB[ref] + leave * tB[length] < rB[ref] && intersectionRatio < 1 - leave, tRefIsUp = tB[ref] < rB[ref], tRefOppIsUp = tB[refOpposite] < rB[ref];
      switch (true) {
        case this._states.oCbFirstInvoke:
          switch (true) {
            case (!isIntersecting && tRefIsUp && tRefOppIsUp):
              this._utils.onTriggerEnter(trigger);
              this._utils.onTriggerLeave(trigger);
              break;
            case isIntersecting:
              switch (true) {
                case (tSPIsBtwn || tEPIsBtwn || tSPIsUp && tEPIsDown):
                  this._utils.onTriggerEnter(trigger);
                  break;
                case tEPIsUp:
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
            case (hasEnteredFromOneSide && tB[refOpposite] < rB[ref]):
              this._utils.onTriggerLeave(trigger);
              break;
            case (hasEnteredFromOneSide && tB[ref] > rB[refOpposite]):
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
  _setInstance() {
    this._defaultOptions = defaultInsOptions;
    this._options = mergeOptions(this._defaultOptions, this._userOptions);
    this.axis = is.string(this._options.axis) ? this._options.axis : throwError("axis parameter must be a string.");
    this.name = is.string(this._options.name) ? this._options.name : throwError("name parameter must be a string.");
    this._root = !!this._options.root && this._utils.customParseQuery(this._options.root, "root") || null;
    this._positions = this._utils.parsePositions(this._options.enter, this._options.leave);
    this.customScrollHandler = this._options.onScroll;
    const {once, onEnter, onLeave, onEnterBack, onLeaveBack, toggleClass, animation} = this._options.defaults;
    this._triggerParams = {
      enter: this._positions.triggerEnterPosition.value,
      leave: this._positions.triggerLeavePosition.value,
      once,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
      toggleClass,
      animation
    };
    this._rootMargin = this._utils.setRootMargin();
    this._createInstance();
    this.customScrollHandler && this.addScrollListener(this.customScrollHandler);
    return this;
  }
  add(trigger = {}, options = {}) {
    const toAddTriggers = this._utils.customParseQuery(trigger);
    "enter" in options && (options.enter = this._utils.setPositionData(options.enter).value);
    "leave" in options && (options.leave = this._utils.setPositionData(options.leave).value);
    const triggerParams = {
      ...mergeOptions(this._triggerParams, options),
      states: {...triggerStates}
    };
    triggerParams.toggleClass && (triggerParams.toggleClass = this._utils.parseToggleClass(triggerParams.toggleClass));
    triggerParams.animation && (triggerParams.animation = this._utils.parseAnimation(triggerParams.animation));
    this.triggers = [...new Set([...this.triggers, ...toAddTriggers])];
    let mustRecreateObserver = false;
    [options.enter, options.leave].forEach((position) => !this._threshold.some((value) => position === value) && (mustRecreateObserver = true));
    if (mustRecreateObserver) {
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
    this._guidesInstance && this._guidesInstance.refresh();
    return this;
  }
  _disconnect() {
    this.observer && this.observer.disconnect();
    this.observer = null;
  }
  kill() {
    this._disconnect();
    this.removeScrollListener(this.customScrollHandler);
    this.triggers = [];
    this.removeGuides();
    const instanceIndex = instances.indexOf(this);
    ~instanceIndex && instances.splice(instanceIndex, 1);
  }
  addGuides(guidesIns) {
    if (!is.inObject(guidesIns, "_registerIntersectionTrigger"))
      throwError("Invalid Guides Instance.");
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
  update() {
    this._guidesInstance && this._guidesInstance.refresh();
  }
};
IntersectionTrigger.getInstances = () => instances;
IntersectionTrigger.getInstanceById = (id) => instances.find((ins) => ins.id === id);
IntersectionTrigger.update = () => instances.forEach((ins) => ins.update());
IntersectionTrigger.registerPlugins = (plugins = []) => registeredPlugins.push(...plugins);
IntersectionTrigger.getRegisteredPlugins = () => registeredPlugins;
export {
  IntersectionTrigger as default
};
