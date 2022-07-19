/*
* Animation v1.0.0
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

// src/plugins/Animation.js
__markAsModule(exports);
__export(exports, {
  default: () => Animation
});

// src/constants.js
var fn = () => {
};
var animationDefaultToggleActions = ["play", "complete", "reverse", "complete"];
var snapDefaultParams = {to: null, after: 1, speed: 100, maxDistance: 500, onStart: fn, onComplete: fn};
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

// src/plugins/Animation.js
var Animation = class {
  constructor(it) {
    this._registerIntersectionTrigger(it);
    return this;
  }
  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }
  animate(trigger, animation, eventIndex) {
    const {instance, toggleActions, control, snap} = animation;
    if (!instance)
      return;
    if (control) {
      const {animate} = this._utils.getTriggerStates(trigger, "onScroll");
      const ids = this._utils.getTriggerStates(trigger, "ids");
      const {enter, leave, minPosition, maxPosition} = this._utils.getTriggerData(trigger);
      const {ref, refOpposite, length} = this._utils.dirProps();
      const isVir = this._utils.isVirtical();
      const tB = trigger.getBoundingClientRect();
      const tIL = tB[length] - (minPosition * tB[length] + (1 - maxPosition) * tB[length]);
      const root = this._utils.getRoot();
      const duration = instance.duration;
      const seek = (t) => instance.seek(t);
      const animateHandler = (trigger2) => {
        const tB2 = trigger2.getBoundingClientRect();
        const ids2 = this._utils.getTriggerStates(trigger2, "ids");
        this._it.rootBounds = this._utils.getRootRect(this._it.observer.rootMargin);
        const rB = this._it.rootBounds;
        const scrollLength = tIL + (this._it._isREPGreater ? rB[length] : -rB[length]);
        let currentTime = 0;
        const [tEP, tLP, rEP, rLP] = this._utils.getPositions(tB2, rB, {enter, leave, ref, refOpposite, length});
        const diff = rEP - tEP;
        if (diff > 0) {
          currentTime = duration * diff / scrollLength;
          if (is.num(control)) {
            setTimeout(() => seek(currentTime), control * 1e3);
          } else {
            seek(currentTime);
          }
        }
        if (snap) {
          const step = Math.round(Math.max(snap.speed * 17 / 1e3, 1));
          let dis = 0;
          const startSnaping = (snapDistance, toRef = false) => {
            const direction = toRef ? -1 : 1;
            if (isVir) {
              root.scrollBy({
                top: step * direction,
                behavior: "instant"
              });
            } else {
              root.scrollBy({
                left: step * direction,
                behavior: "instant"
              });
            }
            dis += step;
            if (dis >= snapDistance) {
              dis = 0;
              snap.onComplete(this._it);
              return;
            }
            requestAnimationFrame(() => startSnaping(snapDistance, toRef));
          };
          clearTimeout(ids2.snapTimeOutId);
          const snapTimeOutId = setTimeout(() => {
            const directionalDiff = snap.to.map((n) => currentTime - n), diff2 = directionalDiff.map((n) => Math.abs(n)), closest = Math.min(...diff2), closestWithDirection = directionalDiff[diff2.indexOf(closest)], snapDistance = scrollLength * closest / duration;
            if (snapDistance >= snap.maxDistance || snapDistance < step)
              return;
            snap.onStart(this._it);
            if (closestWithDirection < 0) {
              startSnaping(snapDistance);
              return;
            }
            startSnaping(snapDistance, true);
          }, snap.after * 1e3);
          this._utils.setTriggerStates(trigger2, {ids: {...ids2, snapTimeOutId}});
        }
      };
      switch (eventIndex) {
        case 0:
        case 2:
          this._it._states.oCbFirstInvoke && animateHandler(trigger);
          if (animate)
            break;
          this._utils.setTriggerScrollStates(trigger, "animate", animateHandler);
          break;
        case 1:
        case 3:
          clearTimeout(ids.snapTimeOutId);
          this._utils.setTriggerScrollStates(trigger, "animate", null);
          if (eventIndex === 1) {
            seek(duration);
            break;
          }
          seek(0);
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
        instance[action]();
        break;
      case "complete":
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
        this._utils.setTriggerData(trigger, null, {animation: {...defaultAnimationParams}});
        break;
    }
  }
  parse(params) {
    let animation = {};
    switch (true) {
      case is.animeInstance(params):
        animation = mergeOptions(defaultAnimationParams, {
          instance: params
        });
        break;
      case is.object(params):
        {
          this._params = mergeOptions(defaultAnimationParams, params);
          if (!is.animeInstance(this._params.instance))
            throwError("Invalid anime instance");
          const {toggleActions, snap} = this._params;
          snap && this.parseSnap();
          is.string(toggleActions) && (this._params.toggleActions = splitStr(toggleActions));
          animation = this._params;
        }
        break;
    }
    is.inObject(animation, "instance") && animation.instance.reset();
    return animation;
  }
  parseSnap() {
    const {instance, snap} = this._params;
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
        return parseSnapMarks(sn);
      if (is.array(sn))
        return sn;
    };
    const parseSnapMarks = () => {
      if (!is.inObject(instance, "marks"))
        return;
      const marks = instance.marks;
      const snapTo = marks.map((mark) => mark.time);
      return snapTo;
    };
    let snapParams = {};
    switch (true) {
      case (is.boolean(snap) && snap):
        snapParams.to = parseSnapMarks(snap);
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
    this._params.snap = mergeOptions(snapDefaultParams, snapParams);
  }
  kill() {
    this._it = null;
    this._utils = null;
  }
};
