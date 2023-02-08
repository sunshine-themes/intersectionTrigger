/*
* IntersectionTrigger v1.0.4 
* IntersectionTrigger utilizes the most modern web technology to trigger anything by intersection. Including scroll-based animations.
* https://sunshine-themes.com/?appID=ss_app_1
*
* Copyright 2023, Sunshine. All rights reserved.
* @license: Released under the personal 'no charge' license can be viewed at http://sunshine-themes.com/?appID=ss_app_1&tab=license, Licensees of commercial or business license are granted additional rights. See http://sunshine-themes.com/?appID=ss_app_1&tab=license for details..
* @author: Sherif Magdy, sherifmagdy@sunshine-themes.com
*
* Released on: February 8, 2023
*/

var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// src/plugins/animation.ts
__markAsModule(exports);
__export(exports, {
  default: () => animation_default
});

// src/constants.ts
var fn = () => {
};
var snapDefaultConfig = {to: 0, after: 1, speed: 100, maxDistance: 500, onStart: fn, onComplete: fn};
var defaultAnimationConfig = {
  instance: {},
  toggleActions: "play complete reverse complete",
  link: false,
  snap: false
};

// src/helpers.ts
var is = {
  function: (a) => typeof a === "function",
  string: (a) => typeof a === "string",
  boolean: (a) => typeof a === "boolean",
  object: (a) => !!a && typeof a === "object" && a !== null && !(a instanceof Array),
  num: (a) => typeof a === "number",
  array: (a) => a instanceof Array,
  element: (a) => a instanceof HTMLElement,
  empty: (a) => Object.keys(a).length === 0,
  doc: (a) => is.element(a) && a.nodeType === 9,
  anime: (a) => is.object(a) && a.hasOwnProperty("animatables") && !a.hasOwnProperty("add"),
  tl: (a) => is.object(a) && a.hasOwnProperty("add") && is.function(a.add),
  animeInstance: (a) => is.anime(a) || is.tl(a),
  pixel: (a) => a.includes("px"),
  inObject: (obj, prop) => is.object(obj) && prop in obj,
  percent: (a) => a.includes("%"),
  scrollable: (element, dir) => dir ? dir === "y" ? element.scrollHeight > element.clientHeight : element.scrollWidth > element.clientWidth : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
};
var clamp = (a, min, max) => Math.min(Math.max(a, min), max);
var splitStr = (st) => st.split(/\s+/);
var mergeOptions = (defaultOptions, customOptions) => {
  const options = {...defaultOptions};
  for (const [key, value] of Object.entries(customOptions)) {
    if (is.object(options[key]) && !is.empty(options[key])) {
      if (!is.object(value))
        continue;
      options[key] = mergeOptions(options[key], value);
    } else {
      options[key] = value;
    }
  }
  return options;
};
var throwError = (message) => {
  throw new Error(message);
};

// src/plugins/animation.ts
var Animation = class {
  constructor(it) {
    this._registerIntersectionTrigger(it);
    this.setUtils();
    return this;
  }
  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }
  setUtils() {
    const {ref, refOpposite, length} = this._utils.dirProps();
    const isVer = this._utils.isVertical();
    const root = this._utils.getRoot();
    let rAFIDs = new WeakMap();
    this.seekSmoothly = (ins, seekTo, link, isSeekToGreater) => {
      if (this.killed)
        return;
      const cT = ins.currentTime;
      const sT = isSeekToGreater ? Math.min(cT + link, seekTo) : Math.max(cT - link, seekTo);
      ins.seek(sT);
      const hasComplete = isSeekToGreater ? sT >= seekTo : sT <= seekTo;
      if (hasComplete)
        return;
      const rAFID = requestAnimationFrame(() => this.seekSmoothly(ins, seekTo, link, isSeekToGreater));
      rAFIDs.set(ins, rAFID);
    };
    this.seek = (ins, seekTo, link) => {
      if (is.num(link)) {
        const cT = ins.currentTime;
        const isSeekToGreater = seekTo > cT;
        const rAFID = rAFIDs.has(ins) && rAFIDs.get(ins) || 0;
        cancelAnimationFrame(rAFID);
        this.seekSmoothly(ins, seekTo, link, isSeekToGreater);
        return;
      }
      ins.seek(seekTo);
    };
    this.startSnaping = ({snapDistance, currentDis, snap, step, toRef = false}) => {
      if (this.killed)
        return;
      const direction = toRef ? -1 : 1;
      if (isVer) {
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
      currentDis += step;
      if (currentDis >= snapDistance) {
        currentDis = 0;
        snap.onComplete(this._it);
        return;
      }
      requestAnimationFrame(() => this.startSnaping({snapDistance, currentDis, snap, step, toRef}));
    };
    this.parseSnap = ({instance, snap}, update) => {
      const parseNum = (n) => {
        const arr = [];
        let progress = 0;
        while (progress <= 1) {
          arr.push(clamp(progress, 0, 1));
          progress = progress + n;
        }
        return arr.map((v) => Math.round(v * instance.duration));
      };
      const parseMarks = () => {
        if (!is.inObject(instance, "marks"))
          return throwError('"marks" feature is not available in the provided anime instance');
        return instance.marks.map((mark) => mark.time);
      };
      const mergeOpts = (customOpts) => mergeOptions(snapDefaultConfig, customOpts);
      const parseOriginalToParam = (to) => is.num(to) ? parseNum(to) : parseMarks();
      let snapParams = {};
      let mergedParams = {};
      if (update) {
        const {originalToParam} = snap;
        originalToParam && (snapParams = {...snap, to: parseOriginalToParam(originalToParam)});
      } else {
        if (is.boolean(snap))
          mergedParams = mergeOpts({to: "marks"});
        if (is.array(snap) || is.num(snap))
          mergedParams = mergeOpts({to: snap});
        if (is.object(snap))
          mergedParams = mergeOpts(snap);
        snapParams = mergedParams;
        const {to} = mergedParams;
        if (is.string(to) && !!to)
          snapParams = {...mergedParams, originalToParam: "marks", to: parseMarks()};
        if (is.num(to) && !!to)
          snapParams = {...mergedParams, originalToParam: to, to: parseNum(to)};
        console.log(snapParams.to);
      }
      return snapParams;
    };
    this.getTIL = (trigger, minPosition, maxPosition) => {
      const tB = trigger.getBoundingClientRect();
      return tB[length] - (minPosition * tB[length] + (1 - maxPosition) * tB[length]);
    };
    this.getSnapStep = (snap) => is.object(snap) ? Math.round(Math.max(snap.speed * 17 / 1e3, 1)) : 0;
    this.animateHandler = (trigger, {enter, leave, tIL, instance, snap, step, link}) => {
      if (this.killed)
        return;
      const tB = trigger.getBoundingClientRect();
      const ids = this._utils.getTriggerStates(trigger, "ids");
      this._it.rootBounds = this._utils.getRootRect(this._it.observer.rootMargin);
      const rB = this._it.rootBounds;
      const scrollLength = tIL + (this._it._isREPGreater ? rB[length] : -rB[length]);
      const duration = instance.duration;
      let seekTo = 0;
      const [tEP, tLP, rEP, rLP] = this._utils.getPositions(tB, rB, {enter, leave, ref, refOpposite, length});
      const diff = rEP - tEP;
      if (diff > 0) {
        seekTo = duration * diff / scrollLength;
        this.seek(instance, seekTo, link);
      }
      if (!is.boolean(snap)) {
        let dis = 0;
        clearTimeout(ids.snapTimeOutId);
        const snapTimeOutId = setTimeout(() => {
          const directionalDiff = snap.to.map((n) => seekTo - n), diff2 = directionalDiff.map((n) => Math.abs(n)), closest = Math.min(...diff2), closestWithDirection = directionalDiff[diff2.indexOf(closest)], snapDistance = scrollLength * closest / duration, snapData = {snapDistance, currentDis: dis, snap, step};
          if (snapDistance >= snap.maxDistance || snapDistance < step)
            return;
          snap.onStart(this._it);
          if (closestWithDirection < 0) {
            this.startSnaping(snapData);
            return;
          }
          this.startSnaping({...snapData, toRef: true});
        }, snap.after * 1e3);
        this._utils.setTriggerStates(trigger, {ids: {...ids, snapTimeOutId}});
      }
    };
  }
  animate(trigger, animation, eventIndex) {
    const {instance, toggleActions, link, snap} = animation;
    if (link) {
      const {animate} = this._utils.getTriggerStates(trigger, "onScroll");
      const ids = this._utils.getTriggerStates(trigger, "ids");
      const {enter, leave, minPosition, maxPosition} = this._utils.getTriggerData(trigger);
      const tIL = this.getTIL(trigger, minPosition, maxPosition);
      const step = this.getSnapStep(snap);
      const animateData = {enter, leave, tIL, instance, snap, link: is.boolean(link) ? link : Math.abs(link), step};
      switch (eventIndex) {
        case 0:
        case 2:
          this._it._states.oCbFirstInvoke && this.animateHandler(trigger, animateData);
          if (animate)
            break;
          this._utils.setTriggerScrollStates(trigger, "animate", () => this.animateHandler(trigger, animateData));
          break;
        case 1:
        case 3:
          clearTimeout(ids.snapTimeOutId);
          this._utils.setTriggerScrollStates(trigger, "animate");
          this.seek(instance, eventIndex === 1 ? instance.duration : 0, link);
          break;
      }
      return;
    }
    const action = toggleActions[eventIndex];
    const progress = instance.currentTime / instance.duration;
    if (action === "none")
      return;
    switch (action) {
      case "play":
        if (instance.reversed) {
          instance.reverse();
          instance.completed = false;
        }
        progress < 1 && instance[action]();
        break;
      case "resume":
        progress < 1 && progress > 0 && instance.play();
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
        !instance.reversed && instance[action]();
        instance.paused && instance.play();
        break;
      case "kill":
        is.inObject(instance, "kill") && instance.kill();
        this._utils.setTriggerData(trigger, {animation: void 0}, true);
        break;
    }
  }
  parse(params, update) {
    let mergedParams = {}, animationParams = {};
    if (update) {
      const {instance, snap} = params;
      !is.boolean(snap) && (animationParams = {...params, snap: this.parseSnap({instance, snap}, true)});
    } else {
      if (!is.object(params))
        return throwError('"animation" parameter is NOT valid.');
      if (is.animeInstance(params)) {
        mergedParams = mergeOptions(defaultAnimationConfig, {
          instance: params
        });
      } else if (params.instance && is.animeInstance(params.instance)) {
        mergedParams = mergeOptions(defaultAnimationConfig, params);
      } else {
        return throwError('"instance" parameter must be anime instance.');
      }
      const {toggleActions, snap, instance, link} = mergedParams;
      animationParams = {
        instance,
        toggleActions: splitStr(toggleActions),
        snap: !!snap && this.parseSnap({instance, snap}),
        link
      };
    }
    animationParams.instance.reset();
    return animationParams;
  }
  update() {
    this._it.triggers.forEach((trigger) => {
      let {enter, leave, minPosition, maxPosition, animation} = this._utils.getTriggerData(trigger);
      animation = animation && this.parse(animation, true);
      this._utils.setTriggerData(trigger, {animation}, true);
      const {animate} = this._utils.getTriggerStates(trigger, "onScroll");
      if (animate && !!animation) {
        const {instance, snap, link} = animation;
        const tIL = this.getTIL(trigger, minPosition, maxPosition);
        const step = this.getSnapStep(snap);
        this._utils.setTriggerScrollStates(trigger, "animate");
        this._utils.setTriggerScrollStates(trigger, "animate", () => this.animateHandler(trigger, {enter, leave, instance, snap, link, tIL, step}));
      }
    });
  }
  kill() {
    this.killed = true;
    this._it = this._utils = void 0;
  }
};
Animation.pluginName = "animation";
var animation_default = Animation;
