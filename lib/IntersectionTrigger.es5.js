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
  var Helpers = /* @__PURE__ */ function() {
    function Helpers2(intersectionTrigger) {
      _classCallCheck(this, Helpers2);
      this._it = intersectionTrigger;
      this.setHelpers();
      return this;
    }
    _createClass(Helpers2, [{
      key: "setHelpers",
      value: function setHelpers() {
        var _this = this;
        this.is = {
          function: function _function(value) {
            return typeof value === "function";
          },
          string: function string(value) {
            return typeof value === "string";
          },
          boolean: function boolean(value) {
            return typeof value === "boolean";
          },
          object: function object(value) {
            return value && _typeof(value) === "object" && !(value instanceof Array);
          },
          inObject: function inObject(obj, prop) {
            return _this.is.object(obj) && prop in obj;
          },
          percent: function percent(value) {
            return value && value.includes("%");
          },
          pixel: function pixel(value) {
            return value && value.includes("px");
          },
          array: function array(value) {
            return value instanceof Array;
          },
          element: function element(value) {
            return value instanceof HTMLElement || value instanceof Element;
          },
          rootViewport: function rootViewport(root) {
            return !root;
          },
          doc: function doc(node) {
            return node && node.nodeType === 9;
          },
          scrollable: function scrollable(element) {
            var dir = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
            return dir ? dir === "y" ? element.scrollHeight > element.clientHeight : element.scrollWidth > element.clientWidth : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
          },
          virtical: function virtical() {
            return _this._it.axis === "y";
          },
          horizontal: function horizontal() {
            return _this._it.axis === "x";
          }
        };
        this.getBoundsProp = function(element, prop) {
          return element && element.getBoundingClientRect()[prop];
        };
        this.getRoot = function() {
          return !!_this._it._root ? _this._it._root : window;
        };
        this.getScrollValue = function(element, dir) {
          return dir === "y" ? element.scrollHeight : element.scrollWidth;
        };
        this.dirProps = function() {
          return _this.is.virtical() ? {
            ref: "top",
            length: "height",
            refOpposite: "bottom",
            innerLength: innerHeight
          } : {
            ref: "left",
            length: "width",
            refOpposite: "right",
            innerLength: innerWidth
          };
        };
        this.roundFloat = function(value, precision) {
          _this.is.string(value) && (value = parseFloat(value));
          var multiplier = Math.pow(10, precision || 0);
          return Math.round(value * multiplier) / multiplier;
        };
        this.getParents = function(element) {
          var parents = [];
          for (element = element.parentNode; element && element !== document && element !== document.documentElement; element = element.parentNode) {
            parents.push(element);
          }
          return parents;
        };
        this.mergeOptions = function(def, custom) {
          var defaultOptions = def;
          var options = custom;
          Object.entries(defaultOptions).forEach(function(_ref) {
            var _ref2 = _slicedToArray(_ref, 2), k = _ref2[0], v = _ref2[1];
            if (_this.is.object(v)) {
              _this.mergeOptions(v, options[k] = options[k] || {});
            } else if (!(k in options)) {
              options[k] = v;
            }
          });
          return options;
        };
        this.throwError = function(message) {
          throw new Error(message);
        };
        this.boundsMinusScrollbar = function(element) {
          var bounds = element.getBoundingClientRect();
          var top = bounds.top, bottom = bounds.bottom, right = bounds.right, left = bounds.left, height = bounds.height, width = bounds.width, x = bounds.x, y = bounds.y;
          return {
            top: top,
            left: left,
            height: height,
            width: width,
            x: x,
            y: y,
            right: right - (right - left - element.clientWidth),
            bottom: bottom - (bottom - top - element.clientHeight)
          };
        };
      }
    }]);
    return Helpers2;
  }();

  // src/Utils.js
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
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
  var Utils = /* @__PURE__ */ function() {
    function Utils2(intersectionTrigger) {
      _classCallCheck2(this, Utils2);
      this._it = intersectionTrigger;
      this._helpers = this._it._helpers;
      this.setUtils();
      return this;
    }
    _createClass2(Utils2, [{
      key: "setUtils",
      value: function setUtils() {
        var _this = this;
        this.setRootMargin = function() {
          var extendMargin = _this._helpers.getScrollValue(_this._helpers.is.rootViewport(_this._it._root) ? document.body : _this._it._root, _this._helpers.is.virtical() ? "x" : "y");
          return _this._helpers.is.virtical() ? "".concat(_this._it._positions.rootEndPosition.strValue, " ").concat(extendMargin, "px ").concat(_this._it._positions.rootStartPosition.strValue, " ").concat(extendMargin, "px") : "".concat(extendMargin, "px ").concat(_this._it._positions.rootStartPosition.strValue, " ").concat(extendMargin, "px ").concat(_this._it._positions.rootEndPosition.strValue);
        };
        this.setThreshold = function() {
          var threshold = [0, _this._it._triggerParams.enter, _this._it._triggerParams.leave, _this._helpers.roundFloat(1 - _this._it._triggerParams.leave, 2), 1];
          _this._it.triggers.forEach(function(trigger) {
            var _this$getTriggerData = _this.getTriggerData(trigger), enter = _this$getTriggerData.enter, leave = _this$getTriggerData.leave;
            threshold.push(enter, leave, _this._helpers.roundFloat(1 - leave, 2));
          });
          return _toConsumableArray(new Set(threshold));
        };
        this.parseQuery = function(query) {
          var type = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "trigger";
          var isTrigger = type === "trigger";
          var output = isTrigger ? [] : {};
          if (!isTrigger) {
            output = _this._helpers.is.string(query) ? document.querySelector(query) : _this._helpers.is.element(query) ? query : _this._helpers.throwError("root parameter must be a valid selector or an element");
            return output;
          }
          switch (true) {
            case _this._helpers.is.string(query):
              output = _toConsumableArray(document.querySelectorAll(query));
              break;
            case _this._helpers.is.array(query):
              output = query;
              break;
            case _this._helpers.is.element(query):
              output = [query];
              break;
            default:
              _this._helpers.throwError("trigger parameter must be a valid selector, an element or array of elements");
              break;
          }
          return output;
        };
        this.validatePosition = function(name, pos) {
          _this._helpers.is.function(pos) && (pos = pos(_this));
          if (!_this._helpers.is.string(pos))
            _this._helpers.throwError("".concat(name, " parameter must be a string."));
          return pos;
        };
        this.setPositionData = function(offset) {
          var isTrigger = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
          var isEnter = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
          offset = _this.validatePosition(isEnter ? "enter" : "leave", offset);
          var value = offset.trim();
          var isPercentage = _this._helpers.is.percent(value);
          var isPixel = _this._helpers.is.pixel(value);
          var position = {};
          value = isPercentage ? value.replace("%", "") : isPixel ? value.replace("px", "") : value;
          value = _this._helpers.roundFloat(value);
          position.type = isPercentage ? "percent" : "pixel";
          if (isPercentage && isTrigger) {
            position.value = value / 100;
            position.strValue = "".concat(value, "%");
            return position;
          }
          var _this$_helpers$dirPro = _this._helpers.dirProps(), length = _this$_helpers$dirPro.length, innerLength = _this$_helpers$dirPro.innerLength;
          var rootLength = _this._it._root ? _this._helpers.getBoundsProp(_this._it._root, length) : innerLength;
          switch (true) {
            case (isPercentage && isEnter):
              position.value = _this._helpers.roundFloat(value / 100 - 1, 2);
              position.strValue = "".concat(position.value * 100, "%");
              break;
            case (isPercentage && !isEnter):
              position.value = -value / 100;
              position.strValue = "".concat(position.value * 100, "%");
              break;
            case (isPixel && isEnter):
              position.value = _this._helpers.roundFloat(value - rootLength, 2);
              position.strValue = "".concat(position.value, "px");
              break;
            case (isPixel && !isEnter):
              position.value = -value;
              position.strValue = "".concat(-value, "px");
              break;
          }
          position.guide = offset;
          return position;
        };
        this.parsePositions = function() {
          var enter = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
          var leave = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
          enter = _this.validatePosition("enter", enter);
          leave = _this.validatePosition("leave", leave);
          var triggerEnterPosition = {}, triggerLeavePosition = {}, rootStartPosition = {}, rootEndPosition = {};
          var enterPositions = enter.trim().split(/\s+/g, 2);
          var leavePositions = leave.trim().split(/\s+/g, 2);
          var positions = [].concat(_toConsumableArray(enterPositions), _toConsumableArray(leavePositions));
          positions.forEach(function(offset, i) {
            switch (i) {
              case 0:
                triggerEnterPosition = _this.setPositionData(offset);
                break;
              case 1:
                rootStartPosition = _this.setPositionData(offset, false);
                break;
              case 2:
                triggerLeavePosition = _this.setPositionData(offset);
                break;
              case 3:
                rootEndPosition = _this.setPositionData(offset, false, false);
                break;
            }
          });
          var parsedPositions = {
            triggerLeavePosition: triggerLeavePosition,
            triggerEnterPosition: triggerEnterPosition,
            rootEndPosition: rootEndPosition,
            rootStartPosition: rootStartPosition
          };
          return parsedPositions;
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
            if (_this._helpers.is.object(storedValue)) {
              _this._it._triggersData.set(trigger, _objectSpread(_objectSpread({}, storedValue), props));
            }
            return;
          }
          _this._it._triggersData.set(trigger, value);
        };
        this.getTriggerStates = function(trigger) {
          var triggerStates2 = _this.getTriggerData(trigger, "states");
          var hasEnteredFromOneSide = triggerStates2.hasEntered || triggerStates2.hasEnteredBack;
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
        this.onTriggerEnter = function(trigger, data) {
          var _ref, _ref2;
          var _this$getTriggerState = _this.getTriggerStates(trigger), hasFirstEntered = _this$getTriggerState.hasFirstEntered;
          _this._helpers.is.function(data.enterFun) && data.enterFun(trigger, _this);
          var triggerProps = hasFirstEntered ? (_ref = {}, _defineProperty(_ref, data.enterProp, true), _defineProperty(_ref, data.leaveProp, false), _ref) : (_ref2 = {}, _defineProperty(_ref2, data.enterProp, true), _defineProperty(_ref2, "hasLeft", false), _defineProperty(_ref2, "hasLeftBack", false), _ref2);
          _this.setTriggerStates(trigger, triggerProps);
          if (!hasFirstEntered)
            _this.setTriggerStates(trigger, {
              hasFirstEntered: true
            });
        };
        this.onTriggerLeave = function(trigger, data) {
          var _this$setTriggerState;
          var _this$getTriggerData2 = _this.getTriggerData(trigger), once = _this$getTriggerData2.once;
          var _this$getTriggerState2 = _this.getTriggerStates(trigger), hasFirstEntered = _this$getTriggerState2.hasFirstEntered;
          _this._helpers.is.function(data.leaveFun) && data.leaveFun(trigger, _this);
          _this.setTriggerStates(trigger, (_this$setTriggerState = {}, _defineProperty(_this$setTriggerState, data.leaveProp, true), _defineProperty(_this$setTriggerState, "hasEntered", false), _defineProperty(_this$setTriggerState, "hasEnteredBack", false), _this$setTriggerState));
          once && hasFirstEntered && _this._it.remove(trigger);
        };
        this.toggleActions = function(trigger) {
          var tB = trigger.getBoundingClientRect();
          _this._it.rootBounds = _this.getRootRect(_this._it.observer.rootMargin);
          var rB = _this._it.rootBounds;
          var _this$getTriggerData3 = _this.getTriggerData(trigger), enter = _this$getTriggerData3.enter, leave = _this$getTriggerData3.leave, onEnter = _this$getTriggerData3.onEnter, onEnterBack = _this$getTriggerData3.onEnterBack, onLeave = _this$getTriggerData3.onLeave, onLeaveBack = _this$getTriggerData3.onLeaveBack;
          var _this$getTriggerState3 = _this.getTriggerStates(trigger), hasEnteredFromOneSide = _this$getTriggerState3.hasEnteredFromOneSide, hasLeft = _this$getTriggerState3.hasLeft, hasLeftBack = _this$getTriggerState3.hasLeftBack;
          var _this$_helpers$dirPro2 = _this._helpers.dirProps(), ref = _this$_helpers$dirPro2.ref, refOpposite = _this$_helpers$dirPro2.refOpposite, length = _this$_helpers$dirPro2.length;
          var hasCaseMet = true;
          switch (true) {
            case (hasLeftBack && tB[ref] + enter * tB[length] <= rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref]):
              _this.onTriggerEnter(trigger, {
                enterFun: onEnter,
                enterProp: "hasEntered",
                leaveProp: "hasLeftBack"
              });
              break;
            case (hasEnteredFromOneSide && tB[ref] + leave * tB[length] <= rB[ref]):
              _this.onTriggerLeave(trigger, {
                leaveFun: onLeave,
                leaveProp: "hasLeft"
              });
              break;
            case (hasLeft && tB[ref] + leave * tB[length] >= rB[ref] && tB[ref] + leave * tB[length] < rB[refOpposite]):
              _this.onTriggerEnter(trigger, {
                enterFun: onEnterBack,
                enterProp: "hasEnteredBack",
                leaveProp: "hasLeft"
              });
              break;
            case (hasEnteredFromOneSide && tB[ref] + enter * tB[length] >= rB[refOpposite]):
              _this.onTriggerLeave(trigger, {
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
        this.validateOptions = function(options) {
          for (var optionName in options) {
            var optionValue = options[optionName];
            var validateOption = function validateOption2(optionName2, optionValue2) {
              switch (optionName2) {
                case "once":
                  !_this._helpers.is.boolean(optionValue2) && _this._helpers.throwError("once parameter must be a boolean.");
                  break;
                case "axis":
                case "name":
                  !_this._helpers.is.string(optionValue2) && _this._helpers.throwError("axis and name parameters must be strings.");
                  break;
                case "guides":
                  !_this._helpers.is.boolean(optionValue2) && !_this._helpers.is.object(optionValue2) && _this._helpers.throwError("guides parameter must be a boolean or object.");
                  break;
                case "onEnter":
                case "onEnterBack":
                case "onLeave":
                case "onLeaveBack":
                case "onScroll":
                  !_this._helpers.is.function(optionValue2) && _this._helpers.throwError("onEnter, onLeave, onEnterBack, onLeaveBack and onScroll parameters must be functions.");
                  break;
              }
            };
            if (!_this._helpers.is.object(optionValue)) {
              validateOption(optionName, optionValue);
              continue;
            }
            for (var nestedOptionName in optionValue) {
              var nestedOptionValue = optionValue[nestedOptionName];
              validateOption(nestedOptionName, nestedOptionValue);
            }
          }
        };
        this.parseString = function(string) {
          var parsedString = string.split(/\s+/).map(function(margin) {
            var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
            return {
              value: parseFloat(parts[1]),
              unit: parts[2]
            };
          });
          return parsedString;
        };
        this.parseRootMargin = function(rootMargins) {
          var marginString = rootMargins || "0px";
          var margins = _this.parseString(marginString);
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
          if (_this._it._root && !_this._helpers.is.doc(_this._it._root)) {
            rootRect = _this._helpers.boundsMinusScrollbar(_this._it._root);
            return _this.expandRectByRootMargin(rootRect, rootMargins);
          }
          var doc = _this._helpers.is.doc(_this._it._root) ? _this._it._root : document;
          var html = doc.documentElement;
          var body = doc.body;
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
  function ownKeys2(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
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
  function _classCallCheck3(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties3(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass3(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties3(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties3(Constructor, staticProps);
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
  var instances = [];
  var instanceID = 0;
  var IntersectionTrigger = /* @__PURE__ */ function() {
    function IntersectionTrigger2() {
      var _this = this;
      var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      _classCallCheck3(this, IntersectionTrigger2);
      _defineProperty2(this, "_observerCallback", function(entries, observer) {
        var _this$_helpers$dirPro = _this._helpers.dirProps(), ref = _this$_helpers$dirPro.ref, refOpposite = _this$_helpers$dirPro.refOpposite, length = _this$_helpers$dirPro.length;
        var _iterator = _createForOfIteratorHelper(entries), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var entry = _step.value;
            var trigger = entry.target;
            var tB = entry.boundingClientRect;
            var isIntersecting = entry.isIntersecting;
            var intersectionRatio = entry.intersectionRatio;
            _this.rootBounds = entry.rootBounds || _this._utils.getRootRect(observer.rootMargin);
            var rB = _this.rootBounds;
            var rootLength = rB[length];
            var rootToTarget = rootLength / tB[length];
            var _this$_utils$getTrigg = _this._utils.getTriggerData(trigger), enter = _this$_utils$getTrigg.enter, leave = _this$_utils$getTrigg.leave, onEnter = _this$_utils$getTrigg.onEnter, onLeave = _this$_utils$getTrigg.onLeave, onLeaveBack = _this$_utils$getTrigg.onLeaveBack;
            var _this$_utils$getTrigg2 = _this._utils.getTriggerStates(trigger), hasEnteredFromOneSide = _this$_utils$getTrigg2.hasEnteredFromOneSide, onScroll = _this$_utils$getTrigg2.onScroll;
            var isTriggerLarger = tB[length] >= rootLength;
            var isTSPLarger = enter > rootToTarget;
            var isTEPLarger = 1 - leave > rootToTarget;
            var initOnScrollFun = isTriggerLarger && (isTSPLarger || isTEPLarger);
            var isOnScrollFunRunning = !!onScroll;
            var tSPIsBtwn = tB[ref] + enter * tB[length] < rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref];
            var tEPIsBtwn = tB[ref] + leave * tB[length] < rB[refOpposite] && tB[ref] + leave * tB[length] > rB[ref];
            var tSPIsUp = tB[ref] + enter * tB[length] < rB[ref];
            var tEPIsDown = tB[ref] + leave * tB[length] > rB[refOpposite];
            var tEPIsUp = tB[ref] + leave * tB[length] < rB[ref] && intersectionRatio < 1 - leave;
            var tTIsUp = tB[ref] < rB[ref];
            var tBIsUp = tB[refOpposite] < rB[ref];
            switch (true) {
              case !_this._states.hasInit:
                switch (true) {
                  case (!isIntersecting && tTIsUp && tBIsUp):
                    _this._utils.onTriggerEnter(trigger, {
                      enterFun: onEnter,
                      enterProp: "hasEntered",
                      leaveProp: "hasLeftBack"
                    });
                    _this._utils.onTriggerLeave(trigger, {
                      leaveFun: onLeave,
                      leaveProp: "hasLeft"
                    });
                    break;
                  case isIntersecting:
                    switch (true) {
                      case (tSPIsBtwn || tEPIsBtwn || tSPIsUp && tEPIsDown):
                        _this._utils.onTriggerEnter(trigger, {
                          enterFun: onEnter,
                          enterProp: "hasEntered",
                          leaveProp: "hasLeftBack"
                        });
                        break;
                      case tEPIsUp:
                        _this._utils.onTriggerEnter(trigger, {
                          enterFun: onEnter,
                          enterProp: "hasEntered",
                          leaveProp: "hasLeftBack"
                        });
                        _this._utils.onTriggerLeave(trigger, {
                          leaveFun: onLeave,
                          leaveProp: "hasLeft"
                        });
                        break;
                    }
                    if (initOnScrollFun)
                      _this._utils.setTriggerStates(trigger, {
                        onScroll: _this._utils.toggleActions
                      });
                    break;
                }
                break;
              case !isIntersecting:
                if (isOnScrollFunRunning)
                  _this._utils.setTriggerStates(trigger, {
                    onScroll: null
                  });
                switch (true) {
                  case (hasEnteredFromOneSide && tB[refOpposite] < rB[ref]):
                    _this._utils.onTriggerLeave(trigger, {
                      leaveFun: onLeave,
                      leaveProp: "hasLeft"
                    });
                    break;
                  case (hasEnteredFromOneSide && tB[ref] > rB[refOpposite]):
                    _this._utils.onTriggerLeave(trigger, {
                      leaveFun: onLeaveBack,
                      leaveProp: "hasLeftBack"
                    });
                    break;
                }
                break;
              case (isIntersecting && !isOnScrollFunRunning):
                _this._utils.toggleActions(trigger);
                initOnScrollFun && _this._utils.setTriggerStates(trigger, {
                  onScroll: _this._utils.toggleActions
                });
                break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        _this._states.hasInit = true;
      });
      this._userOptions = options;
      this.triggers = [];
      this._triggersData = new WeakMap();
      this._guidesInstance = null;
      this._helpers = new Helpers(this);
      this._utils = new Utils(this);
      this.id = instanceID;
      instanceID++;
      instances.push(this);
      this._setStates();
      this._setInstance();
    }
    _createClass3(IntersectionTrigger2, [{
      key: "_setStates",
      value: function _setStates() {
        this._states = {};
        this._states.hasInit = false;
      }
    }, {
      key: "_addScrollListener",
      value: function _addScrollListener() {
        var _this2 = this;
        var root = this._helpers.getRoot();
        !!this._onScrollHandler && root.removeEventListener("scroll", this._onScrollHandler, false);
        this._onScrollHandler = function(event) {
          _this2.triggers.forEach(function(trigger) {
            var _this2$_utils$getTrig;
            var onScrollFun = (_this2$_utils$getTrig = _this2._utils.getTriggerStates(trigger)) === null || _this2$_utils$getTrig === void 0 ? void 0 : _this2$_utils$getTrig.onScroll;
            _this2._helpers.is.function(onScrollFun) && onScrollFun(trigger);
          });
          _this2._helpers.is.function(_this2.onScroll) && _this2.onScroll(event, _this2);
        };
        root.addEventListener("scroll", this._onScrollHandler, false);
      }
    }, {
      key: "_createInstance",
      value: function _createInstance() {
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
    }, {
      key: "_setInstance",
      value: function _setInstance() {
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
    }, {
      key: "add",
      value: function add() {
        var _this3 = this;
        var trigger = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var toAddTriggers = this._utils.parseQuery(trigger);
        this._utils.validateOptions(options);
        "enter" in options && (options.enter = this._utils.setPositionData(options.enter).value);
        "leave" in options && (options.leave = this._utils.setPositionData(options.leave).value);
        var triggerParams = _objectSpread2(_objectSpread2(_objectSpread2({}, this._triggerParams), options), {}, {
          states: _objectSpread2({}, triggerStates)
        });
        this.triggers = [].concat(_toConsumableArray2(this.triggers), _toConsumableArray2(toAddTriggers));
        this.triggers = _toConsumableArray2(new Set(this.triggers));
        var shouldReCreateObserver = false;
        [options.enter, options.leave].forEach(function(position) {
          return !_this3._threshold.some(function(value) {
            return position === value;
          }) && (shouldReCreateObserver = true);
        });
        if (shouldReCreateObserver) {
          this._disconnect();
          toAddTriggers.forEach(function(trigger2) {
            return _this3._utils.setTriggerData(trigger2, triggerParams);
          });
          this._createInstance();
          this.triggers.forEach(function(trigger2) {
            return _this3.observer.observe(trigger2);
          });
        } else {
          toAddTriggers.forEach(function(trigger2) {
            _this3._utils.setTriggerData(trigger2, triggerParams);
            _this3.observer.observe(trigger2);
          });
        }
        this._guidesInstance && this._guidesInstance.refresh();
        return this;
      }
    }, {
      key: "remove",
      value: function remove() {
        var _this4 = this;
        var trigger = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        var toRemoveTriggers = this._utils.parseQuery(trigger);
        toRemoveTriggers.forEach(function(trigger2) {
          _this4._utils.deleteTriggerData(trigger2);
          _this4.observer.unobserve(trigger2);
        });
        var updatedStoredTriggers = this.triggers.filter(function(storedTrigger) {
          var isInRemoveTriggers = toRemoveTriggers.some(function(toRemoveTrigger) {
            return storedTrigger === toRemoveTrigger;
          });
          return !isInRemoveTriggers;
        });
        this.triggers = updatedStoredTriggers;
        this._guidesInstance && this._guidesInstance.refresh();
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
        removeEventListener("scroll", this._onScrollHandler, false);
        this.triggers = [];
        this.removeGuides();
        var instanceIndex = instances.indexOf(this);
        ~instanceIndex && instances.splice(instanceIndex, 1);
      }
    }, {
      key: "addGuides",
      value: function addGuides(guidesIns) {
        if (!this._helpers.is.inObject(guidesIns, "_registerIntersectionTrigger"))
          this._helpers.throwError("Invalid Guides Instance.");
        guidesIns._registerIntersectionTrigger(this);
        guidesIns.refresh();
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
    }]);
    return IntersectionTrigger2;
  }();
  IntersectionTrigger.instances = instances;
  return IntersectionTrigger_exports;
})();
