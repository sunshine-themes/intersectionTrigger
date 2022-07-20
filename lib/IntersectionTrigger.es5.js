/*
* IntersectionTrigger v1.0.0
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright 2022, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  
var intersectiontrigger = (function() {
  var __defProp = Object.defineProperty;
  var __export = function(target, all) {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };

  // src/IntersectionTrigger.js
  var IntersectionTrigger_exports = {};
  __export(IntersectionTrigger_exports, {
    default: function() {
      return IntersectionTrigger;
    }
  });

  // src/constants.js
  var fn = function fn2() {
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
    onScroll: fn
  };
  var triggerStates = {
    hasEntered: false,
    hasEnteredBack: false,
    hasLeft: true,
    hasLeftBack: true,
    hasEnteredOnce: false,
    onScroll: {
      backup: null,
      animate: null
    },
    ids: {
      snapTimeOutId: 0
    }
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
  var getBoundsProp = function getBoundsProp2(element2, prop) {
    return element2 && element2.getBoundingClientRect()[prop];
  };
  var getScrollValue = function getScrollValue2(element2, dir) {
    return dir === "y" ? element2.scrollHeight : element2.scrollWidth;
  };
  var roundFloat = function roundFloat2(value, precision) {
    is.string(value) && (value = parseFloat(value));
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
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
  var throwError = function throwError2(message) {
    throw new Error(message);
  };
  var getMinMax = function getMinMax2(n1, n2) {
    return [n1, n2].sort(function(a, b) {
      return a - b;
    });
  };
  var parseValue = function parseValue2(v) {
    var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(v);
    return {
      value: parseFloat(parts[1]),
      unit: parts[2]
    };
  };
  var parseString = function parseString2(string2) {
    return string2.split(/\s+/).map(function(v) {
      return parseValue(v);
    });
  };

  // src/Utils.js
  function _slicedToArray2(arr, i) {
    return _arrayWithHoles2(arr) || _iterableToArrayLimit2(arr, i) || _unsupportedIterableToArray2(arr, i) || _nonIterableRest2();
  }
  function _nonIterableRest2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArrayLimit2(arr, i) {
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
  function _arrayWithHoles2(arr) {
    if (Array.isArray(arr))
      return arr;
  }
  function ownKeys(object2, enumerableOnly) {
    var keys = Object.keys(object2);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object2);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object2, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray2(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
      return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr))
      return _arrayLikeToArray2(arr);
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
  var Utils = /* @__PURE__ */ function() {
    function Utils2(intersectionTrigger) {
      _classCallCheck(this, Utils2);
      this._it = intersectionTrigger;
      this.setUtils();
      return this;
    }
    _createClass(Utils2, [{
      key: "setUtils",
      value: function setUtils() {
        var _this = this;
        this.isVirtical = function() {
          return _this._it.axis === "y";
        };
        this.isViewport = function() {
          return !_this._it._root;
        };
        this.getRoot = function() {
          var _this$_it$_root;
          return (_this$_it$_root = _this._it._root) !== null && _this$_it$_root !== void 0 ? _this$_it$_root : window;
        };
        this.dirProps = function() {
          return _this.isVirtical() ? {
            ref: "top",
            length: "height",
            refOpposite: "bottom",
            clientLength: document.documentElement.clientHeight
          } : {
            ref: "left",
            length: "width",
            refOpposite: "right",
            clientLength: document.documentElement.clientWidth
          };
        };
        this.setRootMargin = function(rEP, rLP) {
          var _this$dirProps = _this.dirProps(), length = _this$dirProps.length, clientLength = _this$dirProps.clientLength;
          var rootLength = _this._it._root ? getBoundsProp(_this._it._root, length) : clientLength;
          var valueToPx = function valueToPx2(pos, total) {
            var value = pos.value, unit = pos.unit, normal = pos.normal;
            if (unit === "%")
              return normal * total;
            if (unit === "px")
              return value;
          };
          rEP.pixeled = valueToPx(rEP, rootLength);
          rLP.pixeled = valueToPx(rLP, rootLength);
          _this._it._isREPGreater = rEP.pixeled >= rLP.pixeled;
          var rootMargins = {};
          rootMargins.fromOppRef = "".concat((_this._it._isREPGreater ? rEP.pixeled : rLP.pixeled) - rootLength, "px");
          rootMargins.fromRef = "".concat(-1 * (_this._it._isREPGreater ? rLP.pixeled : rEP.pixeled), "px");
          var extendMargin = getScrollValue(_this.isViewport() ? document.body : _this._it._root, _this.isVirtical() ? "x" : "y");
          return _this.isVirtical() ? "".concat(rootMargins.fromRef, " ").concat(extendMargin, "px ").concat(rootMargins.fromOppRef, " ").concat(extendMargin, "px") : "".concat(extendMargin, "px ").concat(rootMargins.fromOppRef, " ").concat(extendMargin, "px ").concat(rootMargins.fromRef);
        };
        this.setThreshold = function() {
          var _this$_it$_defaultTri = _this._it._defaultTriggerParams, enter = _this$_it$_defaultTri.enter, leave = _this$_it$_defaultTri.leave, maxPosition = _this$_it$_defaultTri.maxPosition;
          var threshold = [0, enter, leave, roundFloat(1 - maxPosition, 2), 1];
          _this._it.triggers.forEach(function(trigger) {
            var _this$getTriggerData = _this.getTriggerData(trigger), enter2 = _this$getTriggerData.enter, leave2 = _this$getTriggerData.leave, maxPosition2 = _this$getTriggerData.maxPosition;
            threshold.push(enter2, leave2, roundFloat(1 - maxPosition2, 2));
          });
          return _toConsumableArray(new Set(threshold));
        };
        this.parseQuery = function(q, errLog) {
          switch (true) {
            case is.string(q):
              return _toConsumableArray(document.querySelectorAll(q));
            case is.array(q):
              return q;
            case is.element(q):
              return [q];
            default:
              throwError("".concat(errLog, " parameter must be a valid selector, an element or array of elements"));
          }
        };
        this.customParseQuery = function(query) {
          var type = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "trigger";
          var isTrigger = type === "trigger";
          var output = isTrigger ? [] : {};
          if (!isTrigger) {
            output = is.string(query) ? document.querySelector(query) : is.element(query) ? query : throwError("root parameter must be a valid selector or an element");
            return output;
          }
          return _this.parseQuery(query, "trigger");
        };
        this.validatePosition = function(pos) {
          is.function(pos) && (pos = pos(_this._it));
          if (!is.string(pos))
            throwError("enter, leave, rootEnter and rootLeave parameters must be a string.");
          return pos;
        };
        this.setPositionData = function(pos) {
          pos = _this.validatePosition(pos);
          var original = pos.trim();
          var parsed = parseValue(original);
          var roundedValue = roundFloat(parsed.value);
          return {
            original: original,
            unit: parsed.unit,
            value: roundedValue,
            normal: parsed.unit === "%" ? roundedValue / 100 : null
          };
        };
        this.parsePositions = function(triggerEnter, triggerLeave, rootEnter, rootLeave) {
          var positionsData = [triggerEnter, rootEnter, triggerLeave, rootLeave].map(function(pos) {
            return _this.setPositionData(_this.validatePosition(pos).trim());
          });
          return {
            tEP: positionsData[0],
            rEP: positionsData[1],
            tLP: positionsData[2],
            rLP: positionsData[3]
          };
        };
        this.deleteTriggerData = function(trigger) {
          _this._it._triggersData.delete(trigger);
        };
        this.hasTriggerData = function(trigger) {
          var prop = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
          var hasData = _this._it._triggersData.has(trigger);
          if (prop) {
            return hasData && prop in _this.getTriggerData(trigger);
          }
          return hasData;
        };
        this.getTriggerData = function(trigger) {
          var prop = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
          if (prop) {
            return _this.hasTriggerData(trigger, prop) ? _this._it._triggersData.get(trigger)[prop] : {};
          }
          return _this.hasTriggerData(trigger) && _this._it._triggersData.get(trigger) || {};
        };
        this.setTriggerData = function(trigger, value) {
          var props = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
          if (props) {
            var storedValue = _this.getTriggerData(trigger);
            if (is.object(storedValue)) {
              _this._it._triggersData.set(trigger, _objectSpread(_objectSpread({}, storedValue), props));
            }
            return;
          }
          _this._it._triggersData.set(trigger, value);
        };
        this.getTriggerStates = function(trigger) {
          var prop = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
          var triggerStates2 = _this.getTriggerData(trigger, "states");
          var hasEnteredFromOneSide = triggerStates2.hasEntered || triggerStates2.hasEnteredBack;
          if (prop)
            return triggerStates2[prop];
          return _objectSpread(_objectSpread({}, triggerStates2), {}, {
            hasEnteredFromOneSide: hasEnteredFromOneSide
          });
        };
        this.setTriggerStates = function(trigger) {
          var value = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          var triggerData = _this.getTriggerData(trigger);
          var triggerStates2 = triggerData && _objectSpread(_objectSpread({}, triggerData.states), value);
          _this.setTriggerData(trigger, null, {
            states: triggerStates2
          });
        };
        this.setTriggerScrollStates = function(trigger, prop) {
          var value = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
          var triggerScrollStates = _this.getTriggerStates(trigger, "onScroll");
          triggerScrollStates[prop] = value;
          _this.setTriggerStates(trigger, {
            onscroll: _objectSpread({}, triggerScrollStates)
          });
          if (value) {
            if (_this._it._states.runningScrollCbs === 0)
              _this._it.addScrollListener(_this._it._onScrollHandler);
            _this._it._states.runningScrollCbs++;
            return;
          }
          if (0 < _this._it._states.runningScrollCbs)
            _this._it._states.runningScrollCbs--;
          if (_this._it._states.runningScrollCbs === 0)
            _this._it.removeScrollListener(_this._it._onScrollHandler);
        };
        this.onTriggerEnter = function(trigger) {
          var _ref, _ref2;
          var event = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Enter";
          var _this$getTriggerState = _this.getTriggerStates(trigger), hasEnteredOnce = _this$getTriggerState.hasEnteredOnce;
          var _this$getTriggerData2 = _this.getTriggerData(trigger), onEnter = _this$getTriggerData2.onEnter, onEnterBack = _this$getTriggerData2.onEnterBack, toggleClass = _this$getTriggerData2.toggleClass, animation = _this$getTriggerData2.animation;
          var isEnterEvent = event === "Enter";
          var data = {
            callback: isEnterEvent ? onEnter : onEnterBack,
            enterProp: isEnterEvent ? "hasEntered" : "hasEnteredBack",
            leaveProp: isEnterEvent ? "hasLeftBack" : "hasLeft",
            eventIndex: isEnterEvent ? 0 : 2
          };
          data.callback(trigger, _this);
          _this._it.toggleClass && toggleClass && _this._it.toggleClass.toggle(trigger, toggleClass, data.eventIndex);
          _this._it.animation && animation && _this._it.animation.animate(trigger, animation, data.eventIndex);
          var triggerProps = hasEnteredOnce ? (_ref = {}, _defineProperty(_ref, data.enterProp, true), _defineProperty(_ref, data.leaveProp, false), _ref) : (_ref2 = {}, _defineProperty(_ref2, data.enterProp, true), _defineProperty(_ref2, "hasLeft", false), _defineProperty(_ref2, "hasLeftBack", false), _ref2);
          _this.setTriggerStates(trigger, triggerProps);
          if (!hasEnteredOnce)
            _this.setTriggerStates(trigger, {
              hasEnteredOnce: true
            });
        };
        this.onTriggerLeave = function(trigger) {
          var _this$setTriggerState;
          var event = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Leave";
          var _this$getTriggerData3 = _this.getTriggerData(trigger), once = _this$getTriggerData3.once;
          var _this$getTriggerState2 = _this.getTriggerStates(trigger), hasEnteredOnce = _this$getTriggerState2.hasEnteredOnce;
          var _this$getTriggerData4 = _this.getTriggerData(trigger), onLeave = _this$getTriggerData4.onLeave, onLeaveBack = _this$getTriggerData4.onLeaveBack, toggleClass = _this$getTriggerData4.toggleClass, animation = _this$getTriggerData4.animation;
          var isLeaveEvent = event === "Leave";
          var data = {
            callback: isLeaveEvent ? onLeave : onLeaveBack,
            leaveProp: isLeaveEvent ? "hasLeft" : "hasLeftBack",
            eventIndex: isLeaveEvent ? 1 : 3
          };
          data.callback(trigger, _this);
          _this._it.toggleClass && toggleClass && _this._it.toggleClass.toggle(trigger, toggleClass, data.eventIndex);
          _this._it.animation && animation && _this._it.animation.animate(trigger, animation, data.eventIndex);
          _this.setTriggerStates(trigger, (_this$setTriggerState = {}, _defineProperty(_this$setTriggerState, data.leaveProp, true), _defineProperty(_this$setTriggerState, "hasEntered", false), _defineProperty(_this$setTriggerState, "hasEnteredBack", false), _this$setTriggerState));
          once && hasEnteredOnce && _this._it.remove(trigger);
        };
        this.getPositions = function(tB, rB, _ref3) {
          var enter = _ref3.enter, leave = _ref3.leave, ref = _ref3.ref, refOpposite = _ref3.refOpposite, length = _ref3.length;
          var isREPGreater = _this._it._isREPGreater;
          return [
            tB[ref] + enter * tB[length],
            tB[ref] + leave * tB[length],
            isREPGreater ? rB[refOpposite] : rB[ref],
            isREPGreater ? rB[ref] : rB[refOpposite]
          ];
        };
        this.toggleActions = function(trigger) {
          var tB = trigger.getBoundingClientRect();
          _this._it.rootBounds = _this.getRootRect(_this._it.observer.rootMargin);
          var rB = _this._it.rootBounds;
          var _this$getTriggerState3 = _this.getTriggerStates(trigger), hasEnteredFromOneSide = _this$getTriggerState3.hasEnteredFromOneSide, hasLeft = _this$getTriggerState3.hasLeft, hasLeftBack = _this$getTriggerState3.hasLeftBack, hasEnteredOnce = _this$getTriggerState3.hasEnteredOnce;
          var _this$getTriggerData5 = _this.getTriggerData(trigger), enter = _this$getTriggerData5.enter, leave = _this$getTriggerData5.leave;
          var _this$dirProps2 = _this.dirProps(), ref = _this$dirProps2.ref, refOpposite = _this$dirProps2.refOpposite, length = _this$dirProps2.length;
          var _this$getPositions = _this.getPositions(tB, rB, {
            enter: enter,
            leave: leave,
            ref: ref,
            refOpposite: refOpposite,
            length: length
          }), _this$getPositions2 = _slicedToArray2(_this$getPositions, 4), tEP = _this$getPositions2[0], tLP = _this$getPositions2[1], rEP = _this$getPositions2[2], rLP = _this$getPositions2[3];
          var hasCaseMet = true;
          switch (true) {
            case (hasLeftBack && rEP > tEP):
              _this.onTriggerEnter(trigger);
              break;
            case (hasEnteredFromOneSide && rLP > tLP):
              _this.onTriggerLeave(trigger);
              break;
            case (hasLeft && hasEnteredOnce && rLP < tLP):
              _this.onTriggerEnter(trigger, "EnterBack");
              break;
            case (hasEnteredFromOneSide && rEP < tEP):
              _this.onTriggerLeave(trigger, "hasLeftBack");
              break;
            default:
              hasCaseMet = false;
              break;
          }
          return hasCaseMet;
        };
        this.parseRootMargin = function(rootMargins) {
          var marginString = rootMargins || "0px";
          var margins = parseString(marginString);
          margins[1] = margins[1] || margins[0];
          margins[2] = margins[2] || margins[0];
          margins[3] = margins[3] || margins[1];
          return margins;
        };
        this.expandRectByRootMargin = function(rect, rootMargins) {
          var margins = _this.parseRootMargin(rootMargins).map(function(margin, i) {
            return margin.unit == "px" ? margin.value : margin.value * (i % 2 ? rect.width : rect.height) / 100;
          });
          var newRect = {
            top: rect.top - margins[0],
            right: rect.right + margins[1],
            bottom: rect.bottom + margins[2],
            left: rect.left - margins[3]
          };
          newRect.width = newRect.right - newRect.left;
          newRect.height = newRect.bottom - newRect.top;
          return newRect;
        };
        this.getRootRect = function(rootMargins) {
          var rootRect;
          if (_this._it._root && !is.doc(_this._it._root)) {
            rootRect = _this._it._root.getBoundingClientRect();
            return _this.expandRectByRootMargin(rootRect, rootMargins);
          }
          var doc2 = is.doc(_this._it._root) ? _this._it._root : document;
          var html = doc2.documentElement;
          var body = doc2.body;
          rootRect = {
            top: 0,
            left: 0,
            right: html.clientWidth || body.clientWidth,
            width: html.clientWidth || body.clientWidth,
            bottom: html.clientHeight || body.clientHeight,
            height: html.clientHeight || body.clientHeight
          };
          return _this.expandRectByRootMargin(rootRect, rootMargins);
        };
      }
    }]);
    return Utils2;
  }();

  // src/IntersectionTrigger.js
  function _toConsumableArray2(arr) {
    return _arrayWithoutHoles2(arr) || _iterableToArray2(arr) || _unsupportedIterableToArray3(arr) || _nonIterableSpread2();
  }
  function _nonIterableSpread2() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArray2(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
      return Array.from(iter);
  }
  function _arrayWithoutHoles2(arr) {
    if (Array.isArray(arr))
      return _arrayLikeToArray3(arr);
  }
  function ownKeys2(object2, enumerableOnly) {
    var keys = Object.keys(object2);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object2);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object2, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      i % 2 ? ownKeys2(Object(source), true).forEach(function(key) {
        _defineProperty2(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys2(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _slicedToArray3(arr, i) {
    return _arrayWithHoles3(arr) || _iterableToArrayLimit3(arr, i) || _unsupportedIterableToArray3(arr, i) || _nonIterableRest3();
  }
  function _nonIterableRest3() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArrayLimit3(arr, i) {
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
  function _arrayWithHoles3(arr) {
    if (Array.isArray(arr))
      return arr;
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray3(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it)
          o = it;
        var i = 0;
        var F = function F2() {
        };
        return {s: F, n: function n() {
          if (i >= o.length)
            return {done: true};
          return {done: false, value: o[i++]};
        }, e: function e(_e2) {
          throw _e2;
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
    }, e: function e(_e3) {
      didErr = true;
      err = _e3;
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
  function _unsupportedIterableToArray3(o, minLen) {
    if (!o)
      return;
    if (typeof o === "string")
      return _arrayLikeToArray3(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor)
      n = o.constructor.name;
    if (n === "Map" || n === "Set")
      return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray3(o, minLen);
  }
  function _arrayLikeToArray3(arr, len) {
    if (len == null || len > arr.length)
      len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  function _classCallCheck2(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties2(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass2(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties2(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties2(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {writable: false});
    return Constructor;
  }
  function _defineProperty2(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var registeredPlugins = [];
  var instances = [];
  var instanceID = 0;
  var IntersectionTrigger = /* @__PURE__ */ function() {
    function IntersectionTrigger2() {
      var _this = this;
      var configuration = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      _classCallCheck2(this, IntersectionTrigger2);
      _defineProperty2(this, "_rAFCallback", function(time) {
        _this.triggers.forEach(function(trigger) {
          var onScrollFuns = _this._utils.getTriggerStates(trigger, "onScroll");
          for (var key in onScrollFuns) {
            onScrollFuns[key] && is.function(onScrollFuns[key]) && onScrollFuns[key](trigger, time);
          }
        });
      });
      _defineProperty2(this, "_onScrollHandler", function() {
        return requestAnimationFrame(_this._rAFCallback);
      });
      _defineProperty2(this, "_observerCallback", function(entries, observer) {
        var _this$_utils$dirProps = _this._utils.dirProps(), ref = _this$_utils$dirProps.ref, refOpposite = _this$_utils$dirProps.refOpposite, length = _this$_utils$dirProps.length;
        var _iterator = _createForOfIteratorHelper(entries), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var entry = _step.value;
            var trigger = entry.target, tB = entry.boundingClientRect, isIntersecting = entry.isIntersecting;
            _this.rootBounds = entry.rootBounds || _this._utils.getRootRect(observer.rootMargin);
            var rB = _this.rootBounds, rL = rB[length], rootToTarget = rL / tB[length];
            var _this$_utils$getTrigg = _this._utils.getTriggerData(trigger), enter = _this$_utils$getTrigg.enter, leave = _this$_utils$getTrigg.leave, minPosition = _this$_utils$getTrigg.minPosition, maxPosition = _this$_utils$getTrigg.maxPosition;
            var _this$_utils$getTrigg2 = _this._utils.getTriggerStates(trigger), hasEnteredFromOneSide = _this$_utils$getTrigg2.hasEnteredFromOneSide, backup = _this$_utils$getTrigg2.onScroll.backup;
            var _this$_utils$getPosit = _this._utils.getPositions(tB, rB, {
              enter: enter,
              leave: leave,
              ref: ref,
              refOpposite: refOpposite,
              length: length
            }), _this$_utils$getPosit2 = _slicedToArray3(_this$_utils$getPosit, 4), tEP = _this$_utils$getPosit2[0], tLP = _this$_utils$getPosit2[1], rEP = _this$_utils$getPosit2[2], rLP = _this$_utils$getPosit2[3];
            var initBackupFun = tB[length] >= rL && (minPosition >= rootToTarget || 1 - maxPosition >= rootToTarget), isBackupFunRunning = !!backup;
            switch (true) {
              case _this._states.oCbFirstInvoke:
                switch (true) {
                  case (!isIntersecting && rLP > tLP):
                    _this._utils.onTriggerEnter(trigger);
                    _this._utils.onTriggerLeave(trigger);
                    break;
                  case isIntersecting:
                    switch (true) {
                      case (rEP > tEP && rLP < tLP):
                        _this._utils.onTriggerEnter(trigger);
                        break;
                      case rLP > tLP:
                        _this._utils.onTriggerEnter(trigger);
                        _this._utils.onTriggerLeave(trigger);
                        break;
                    }
                    if (initBackupFun)
                      _this._utils.setTriggerScrollStates(trigger, "backup", _this._utils.toggleActions);
                    break;
                }
                break;
              case !isIntersecting:
                if (isBackupFunRunning)
                  _this._utils.setTriggerScrollStates(trigger, "backup", null);
                switch (true) {
                  case (hasEnteredFromOneSide && rLP > tLP):
                    _this._utils.onTriggerLeave(trigger);
                    break;
                  case (hasEnteredFromOneSide && rEP < tEP):
                    _this._utils.onTriggerLeave(trigger, "onLeaveBack");
                    break;
                }
                break;
              case (isIntersecting && !isBackupFunRunning):
                _this._utils.toggleActions(trigger);
                initBackupFun && _this._utils.setTriggerScrollStates(trigger, "backup", _this._utils.toggleActions);
                break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        _this._states.oCbFirstInvoke = false;
      });
      this._userOptions = configuration;
      this.triggers = [];
      this._triggersData = new WeakMap();
      this._guidesInstance = null;
      this._utils = new Utils(this);
      this.id = instanceID;
      instanceID++;
      instances.push(this);
      this.animation = null;
      this.toggleClass = null;
      this._setStates();
      this._setInstance();
      this._setPlugins();
    }
    _createClass2(IntersectionTrigger2, [{
      key: "_setPlugins",
      value: function _setPlugins() {
        var _this2 = this;
        var plugins = IntersectionTrigger2.getRegisteredPlugins();
        plugins.forEach(function(Plugin) {
          switch (Plugin.name) {
            case "Animation":
              _this2.animation = new Plugin(_this2);
              break;
            case "ToggleClass":
              _this2.toggleClass = new Plugin(_this2);
              break;
          }
        });
      }
    }, {
      key: "_addResizeListener",
      value: function _addResizeListener() {
        var _this3 = this;
        this._removeResizeListener();
        this._onResizeHandler = function() {
          return _this3.update();
        };
        this._utils.getRoot().addEventListener("resize", this._onResizeHandler, false);
      }
    }, {
      key: "_removeResizeListener",
      value: function _removeResizeListener() {
        this._utils.getRoot().removeEventListener("resize", this._onResizeHandler, false);
      }
    }, {
      key: "_setStates",
      value: function _setStates() {
        this._states = {};
        this._states.oCbFirstInvoke = true;
        this._states.runningScrollCbs = 0;
      }
    }, {
      key: "addScrollListener",
      value: function addScrollListener(handler) {
        this._utils.getRoot().addEventListener("scroll", handler, false);
      }
    }, {
      key: "removeScrollListener",
      value: function removeScrollListener(handler) {
        this._utils.getRoot().removeEventListener("scroll", handler, false);
      }
    }, {
      key: "_createInstance",
      value: function _createInstance() {
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
    }, {
      key: "_setInstance",
      value: function _setInstance() {
        this._defaultOptions = defaultInsOptions;
        this._options = mergeOptions(this._defaultOptions, this._userOptions);
        this.axis = is.string(this._options.axis) ? this._options.axis : throwError("axis parameter must be a string.");
        this.name = is.string(this._options.name) ? this._options.name : throwError("name parameter must be a string.");
        this._root = !!this._options.root && this._utils.customParseQuery(this._options.root, "root") || null;
        this._positionsData = this._utils.parsePositions(this._options.defaults.enter, this._options.defaults.leave, this._options.rootEnter, this._options.rootLeave);
        this.customScrollHandler = this._options.onScroll;
        var _this$_options$defaul = this._options.defaults, once = _this$_options$defaul.once, onEnter = _this$_options$defaul.onEnter, onLeave = _this$_options$defaul.onLeave, onEnterBack = _this$_options$defaul.onEnterBack, onLeaveBack = _this$_options$defaul.onLeaveBack, toggleClass = _this$_options$defaul.toggleClass, animation = _this$_options$defaul.animation, normalizedTEP = this._positionsData.tEP.normal, normalizedTLP = this._positionsData.tLP.normal, _getMinMax = getMinMax(normalizedTEP, normalizedTLP), _getMinMax2 = _slicedToArray3(_getMinMax, 2), minPosition = _getMinMax2[0], maxPosition = _getMinMax2[1];
        this._defaultTriggerParams = {
          enter: normalizedTEP,
          leave: normalizedTLP,
          minPosition: minPosition,
          maxPosition: maxPosition,
          once: once,
          onEnter: onEnter,
          onLeave: onLeave,
          onEnterBack: onEnterBack,
          onLeaveBack: onLeaveBack,
          toggleClass: toggleClass,
          animation: animation
        };
        this._createInstance();
        this._addResizeListener();
        this.customScrollHandler && this.addScrollListener(this.customScrollHandler);
        return this;
      }
    }, {
      key: "add",
      value: function add() {
        var _this4 = this;
        var trigger = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        var config = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var toAddTriggers = this._utils.customParseQuery(trigger);
        "enter" in config && (config.enter = this._utils.setPositionData(config.enter).normal);
        "leave" in config && (config.leave = this._utils.setPositionData(config.leave).normal);
        var mergedParams = mergeOptions(this._defaultTriggerParams, config);
        var _getMinMax3 = getMinMax(mergedParams.enter, mergedParams.leave), _getMinMax4 = _slicedToArray3(_getMinMax3, 2), minPosition = _getMinMax4[0], maxPosition = _getMinMax4[1];
        var triggerParams = _objectSpread2(_objectSpread2({}, mergedParams), {}, {
          minPosition: minPosition,
          maxPosition: maxPosition,
          states: _objectSpread2({}, triggerStates)
        });
        this.toggleClass && triggerParams.toggleClass && (triggerParams.toggleClass = this.toggleClass.parse(triggerParams.toggleClass));
        this.animation && triggerParams.animation && (triggerParams.animation = this.animation.parse(triggerParams.animation));
        this.triggers = _toConsumableArray2(new Set([].concat(_toConsumableArray2(this.triggers), _toConsumableArray2(toAddTriggers))));
        var mustUpdate = false;
        [config.enter, config.leave].forEach(function(position) {
          return !_this4._threshold.some(function(value) {
            return position === value;
          }) && (mustUpdate = true);
        });
        if (mustUpdate) {
          this.update(toAddTriggers, triggerParams);
        } else {
          toAddTriggers.forEach(function(trigger2) {
            _this4._utils.setTriggerData(trigger2, triggerParams);
            _this4.observer.observe(trigger2);
          });
        }
        this._guidesInstance && this._guidesInstance.update();
        return this;
      }
    }, {
      key: "remove",
      value: function remove() {
        var _this5 = this;
        var trigger = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        var toRemoveTriggers = this._utils.customParseQuery(trigger);
        toRemoveTriggers.forEach(function(trigger2) {
          _this5._utils.deleteTriggerData(trigger2);
          _this5.observer.unobserve(trigger2);
        });
        var updatedStoredTriggers = this.triggers.filter(function(storedTrigger) {
          var isInRemoveTriggers = toRemoveTriggers.some(function(toRemoveTrigger) {
            return storedTrigger === toRemoveTrigger;
          });
          return !isInRemoveTriggers;
        });
        this.triggers = updatedStoredTriggers;
        this._guidesInstance && this._guidesInstance.update();
        return this;
      }
    }, {
      key: "_disconnect",
      value: function _disconnect() {
        this.observer && this.observer.disconnect();
        this.observer = null;
      }
    }, {
      key: "kill",
      value: function kill() {
        this._disconnect();
        this.removeScrollListener(this.customScrollHandler);
        this._removeResizeListener();
        this.triggers = [];
        this.removeGuides();
        this.animation && this.animation.kill();
        this.toggleClasss && this.toggleClasss.kill();
        var instanceIndex = instances.indexOf(this);
        ~instanceIndex && instances.splice(instanceIndex, 1);
      }
    }, {
      key: "addGuides",
      value: function addGuides(guidesIns) {
        if (!is.inObject(guidesIns, "_registerIntersectionTrigger"))
          throwError("Invalid Guides Instance.");
        guidesIns._registerIntersectionTrigger(this);
        guidesIns.update();
        this._guidesInstance = guidesIns;
        return this;
      }
    }, {
      key: "removeGuides",
      value: function removeGuides() {
        this._guidesInstance && this._guidesInstance.kill();
        this._guidesInstance = null;
        return this;
      }
    }, {
      key: "update",
      value: function update() {
        var _this6 = this;
        var newTriggers = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        var triggerParams = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
        this._disconnect();
        newTriggers && newTriggers.forEach(function(trigger) {
          return _this6._utils.setTriggerData(trigger, triggerParams);
        });
        this._createInstance();
        this.triggers.forEach(function(trigger) {
          return _this6.observer.observe(trigger);
        });
        this.animation && this.animation.update();
        this._guidesInstance && this._guidesInstance.update();
      }
    }]);
    return IntersectionTrigger2;
  }();
  IntersectionTrigger.getInstances = function() {
    return instances;
  };
  IntersectionTrigger.getInstanceById = function(id) {
    return instances.find(function(ins) {
      return ins.id === id;
    });
  };
  IntersectionTrigger.update = function() {
    return instances.forEach(function(ins) {
      return ins.update();
    });
  };
  IntersectionTrigger.registerPlugins = function() {
    var plugins = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    return registeredPlugins.push.apply(registeredPlugins, _toConsumableArray2(plugins));
  };
  IntersectionTrigger.getRegisteredPlugins = function() {
    return registeredPlugins;
  };
  return IntersectionTrigger_exports;
})();
