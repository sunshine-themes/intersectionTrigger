/*
* Animation v1.0.0
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright 2022, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  
// src/constants.js
var animationDefaultToggleActions = ["play", "finish", "reverse", "finish"];
var snapDefaultParams = {to: null, after: 1, speed: 600, maxDistance: 500};
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
      const {enter, leave} = this._utils.getTriggerData(trigger);
      const {ref, refOpposite, length} = this._utils.dirProps();
      const isVir = this._utils.isVirtical();
      const tB = trigger.getBoundingClientRect();
      const tIL = tB[length] - (enter * tB[length] + (1 - leave) * tB[length]);
      const root = this._utils.getRoot();
      const duration = instance.duration;
      const animateHandler = (trigger2) => {
        const tB2 = trigger2.getBoundingClientRect();
        const ids2 = this._utils.getTriggerStates(trigger2, "ids");
        this._it.rootBounds = this._utils.getRootRect(this._it.observer.rootMargin);
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
          const speed = Math.round(Math.max(snap.speed * 17 / 1e3, 1));
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
            if (snapDistance >= snap.maxDistance || snapDistance < speed)
              return;
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
          mergedParams.snap = mergeOptions(snapDefaultParams, snapParams);
          is.string(toggleActions) && (mergedParams.toggleActions = splitStr(toggleActions));
          animation = mergedParams;
        }
        break;
    }
    is.inObject(animation, "instance") && animation.instance.reset();
    return animation;
  }
  kill() {
    this._it = null;
    this._utils = null;
  }
};
export {
  Animation as default
};
