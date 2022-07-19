/*
* ToggleClass v1.0.0
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

// src/plugins/ToggleClass.js
__markAsModule(exports);
__export(exports, {
  default: () => ToggleClass
});

// src/constants.js
var classDefaultToggleActions = ["add", "remove", "add", "remove"];
var defaultToggleClassParams = {
  targets: null,
  toggleActions: classDefaultToggleActions,
  classNames: null
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

// src/plugins/ToggleClass.js
var ToggleClass = class {
  constructor(it) {
    this._registerIntersectionTrigger(it);
    return this;
  }
  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }
  toggle(trigger, toggleClass, eventIndex) {
    for (const {targets, toggleActions, classNames} of toggleClass) {
      if (toggleActions[eventIndex] === "none")
        continue;
      classNames.forEach((className) => {
        if (targets) {
          targets.forEach((target) => target.classList[toggleActions[eventIndex]](className));
          return;
        }
        trigger.classList[toggleActions[eventIndex]](className);
      });
    }
  }
  parse(params) {
    let toggleClass = [];
    if (is.string(params)) {
      const mergedParams = mergeOptions(defaultToggleClassParams, {
        classNames: splitStr(params)
      });
      toggleClass.push([mergedParams]);
      return toggleClass;
    }
    if (is.array(params)) {
      toggleClass = params.map((obj) => {
        const mergedParams = mergeOptions(defaultToggleClassParams, obj);
        const {targets, classNames, toggleActions} = mergedParams;
        targets && (mergedParams.targets = this._utils.parseQuery(targets, "targets"));
        classNames && (mergedParams.classNames = splitStr(classNames));
        is.string(toggleActions) && (mergedParams.toggleActions = splitStr(toggleActions));
        return mergedParams;
      });
    }
    return toggleClass;
  }
  kill = () => {
    this._it = null;
    this._utils = null;
  };
};
