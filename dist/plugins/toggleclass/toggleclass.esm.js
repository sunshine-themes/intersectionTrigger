/*
* IntersectionTrigger v1.1.0 
* IntersectionTrigger utilizes the most modern web technology to trigger anything by intersection. Including scroll-based animations.
* https://sunshine-themes.com/?appID=ss_app_1
*
* Copyright 2023, Sunshine. All rights reserved.
* @license: Released under the personal 'no charge' license can be viewed at http://sunshine-themes.com/?appID=ss_app_1&tab=license, Licensees of commercial or business license are granted additional rights. See http://sunshine-themes.com/?appID=ss_app_1&tab=license for details..
* @author: Sherif Magdy, sherifmagdy@sunshine-themes.com
*
* Released on: February 17, 2023
*/

// src/constants.ts
var defaultToggleClassConfig = {
  targets: [],
  toggleActions: "add remove add remove",
  classNames: ""
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
var splitStr = (st) => st.split(/\s+/);
var mergeOptions = (defaultOptions, customOptions) => {
  const options = {...defaultOptions};
  for (const [key, value] of Object.entries(customOptions)) {
    const k = key;
    if (is.object(options[k]) && !is.empty(options[k])) {
      if (!is.object(value))
        continue;
      options[k] = mergeOptions(options[k], value);
    } else {
      options[k] = value;
    }
  }
  return options;
};

// src/plugins/toggleclass/toggleclass.ts
var ToggleClass = class {
  constructor(it) {
    this.kill = () => {
      this._it = void 0;
      this._utils = void 0;
    };
    this._registerIntersectionTrigger(it);
    return this;
  }
  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }
  toggle(trigger, toggleClass, eventIndex) {
    for (const {targets, toggleActions, classNames} of toggleClass) {
      const action = toggleActions[eventIndex];
      if (action === "none")
        continue;
      classNames.forEach((className) => {
        if (!targets.length)
          return trigger.classList[action](className);
        targets.forEach((target) => target.classList[action](className));
      });
    }
  }
  parse(params) {
    let mergedParams = [];
    if (is.string(params))
      mergedParams = [
        mergeOptions(defaultToggleClassConfig, {
          classNames: params
        })
      ];
    if (is.array(params))
      mergedParams = params.map((obj) => mergeOptions(defaultToggleClassConfig, obj));
    return mergedParams.map((obj) => ({
      targets: this._utils.parseQuery(obj.targets, "targets"),
      toggleActions: splitStr(obj.toggleActions),
      classNames: splitStr(obj.classNames)
    }));
  }
};
ToggleClass.pluginName = "toggleClass";
var toggleclass_default = ToggleClass;
export {
  toggleclass_default as default
};
