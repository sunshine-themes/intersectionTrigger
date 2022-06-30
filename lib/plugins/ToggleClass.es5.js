/*
* ToggleClass v1.0.0
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright 2022, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  
var toggleclass = (function() {
  var __defProp = Object.defineProperty;
  var __export = function(target, all) {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };

  // src/plugins/ToggleClass.js
  var ToggleClass_exports = {};
  __export(ToggleClass_exports, {
    default: function() {
      return ToggleClass;
    }
  });

  // src/constants.js
  var classDefaultToggleActions = ["add", "remove", "add", "remove"];
  var defaultToggleClassParams = {
    targets: null,
    toggleActions: classDefaultToggleActions,
    classNames: null
  };

  // src/helpers.js
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o)
      return;
    if (typeof o === "string")
      return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor)
      n = o.constructor.name;
    if (n === "Map" || n === "Set")
      return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length)
      len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null)
      return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i)
          break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null)
          _i["return"]();
      } finally {
        if (_d)
          throw _e;
      }
    }
    return _arr;
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr))
      return arr;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";
    return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && typeof Symbol == "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof(obj);
  }
  var is = {
    function: function _function(a) {
      return typeof a === "function";
    },
    string: function string(a) {
      return typeof a === "string";
    },
    boolean: function boolean(a) {
      return typeof a === "boolean";
    },
    object: function object(a) {
      return a && _typeof(a) === "object" && !(a instanceof Array);
    },
    inObject: function inObject(obj, prop) {
      return is.object(obj) && prop in obj;
    },
    num: function num(a) {
      return typeof a === "number";
    },
    percent: function percent(a) {
      return a && a.includes("%");
    },
    pixel: function pixel(a) {
      return a && a.includes("px");
    },
    array: function array(a) {
      return a instanceof Array;
    },
    element: function element(a) {
      return a instanceof HTMLElement || a instanceof Element;
    },
    doc: function doc(a) {
      return a && a.nodeType === 9;
    },
    scrollable: function scrollable(element2) {
      var dir = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      return dir ? dir === "y" ? element2.scrollHeight > element2.clientHeight : element2.scrollWidth > element2.clientWidth : element2.scrollHeight > element2.clientHeight || element2.scrollWidth > element2.clientWidth;
    },
    anime: function anime(a) {
      return is.object(a) && a.hasOwnProperty("animatables") && !a.hasOwnProperty("add");
    },
    tl: function tl(a) {
      return is.object(a) && a.hasOwnProperty("add") && is.function(a.add);
    },
    animeInstance: function animeInstance(a) {
      return is.anime(a) || is.tl(a);
    }
  };
  var splitStr = function splitStr2(st) {
    return st.split(/\s+/);
  };
  var mergeOptions = function mergeOptions2(def, custom) {
    var defaultOptions = def;
    var options = custom;
    Object.entries(defaultOptions).forEach(function(_ref) {
      var _ref2 = _slicedToArray(_ref, 2), k = _ref2[0], v = _ref2[1];
      if (is.object(v)) {
        mergeOptions2(v, options[k] = options[k] || {});
      } else if (!(k in options)) {
        options[k] = v;
      }
    });
    return options;
  };

  // src/plugins/ToggleClass.js
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray2(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it)
          o = it;
        var i = 0;
        var F = function F2() {
        };
        return {s: F, n: function n() {
          if (i >= o.length)
            return {done: true};
          return {done: false, value: o[i++]};
        }, e: function e(_e) {
          throw _e;
        }, f: F};
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return {s: function s() {
      it = it.call(o);
    }, n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    }, e: function e(_e2) {
      didErr = true;
      err = _e2;
    }, f: function f() {
      try {
        if (!normalCompletion && it.return != null)
          it.return();
      } finally {
        if (didErr)
          throw err;
      }
    }};
  }
  function _unsupportedIterableToArray2(o, minLen) {
    if (!o)
      return;
    if (typeof o === "string")
      return _arrayLikeToArray2(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor)
      n = o.constructor.name;
    if (n === "Map" || n === "Set")
      return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray2(o, minLen);
  }
  function _arrayLikeToArray2(arr, len) {
    if (len == null || len > arr.length)
      len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {writable: false});
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var ToggleClass = /* @__PURE__ */ function() {
    function ToggleClass2(it) {
      var _this = this;
      _classCallCheck(this, ToggleClass2);
      _defineProperty(this, "kill", function() {
        _this._it = null;
        _this._utils = null;
      });
      this._registerIntersectionTrigger(it);
      return this;
    }
    _createClass(ToggleClass2, [{
      key: "_registerIntersectionTrigger",
      value: function _registerIntersectionTrigger(intersectionTrigger) {
        this._it = intersectionTrigger;
        this._utils = this._it._utils;
      }
    }, {
      key: "toggle",
      value: function toggle(trigger, toggleClass, eventIndex) {
        var _iterator = _createForOfIteratorHelper(toggleClass), _step;
        try {
          var _loop = function _loop2() {
            var _step$value = _step.value, targets = _step$value.targets, toggleActions = _step$value.toggleActions, classNames = _step$value.classNames;
            if (toggleActions[eventIndex] === "none")
              return "continue";
            classNames.forEach(function(className) {
              return targets.forEach(function(target) {
                return target === "trigger" ? trigger.classList[toggleActions[eventIndex]](className) : target.classList[toggleActions[eventIndex]](className);
              });
            });
          };
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var _ret = _loop();
            if (_ret === "continue")
              continue;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }, {
      key: "parse",
      value: function parse(params) {
        var _this2 = this;
        var toggleClass = [];
        if (is.string(params)) {
          var mergedParams = mergeOptions(defaultToggleClassParams, {
            targets: ["trigger"],
            classNames: splitStr(params)
          });
          toggleClass.push([mergedParams]);
          return toggleClass;
        }
        if (is.array(params)) {
          toggleClass = params.map(function(obj) {
            var mergedParams2 = mergeOptions(defaultToggleClassParams, obj);
            var targets = mergedParams2.targets, classNames = mergedParams2.classNames, toggleActions = mergedParams2.toggleActions;
            targets && (mergedParams2.targets = _this2._utils.parseQuery(targets, "targets"));
            classNames && (mergedParams2.classNames = splitStr(classNames));
            is.string(toggleActions) && (mergedParams2.toggleActions = splitStr(toggleActions));
            return mergedParams2;
          });
        }
        return toggleClass;
      }
    }]);
    return ToggleClass2;
  }();
  return ToggleClass_exports;
})();
