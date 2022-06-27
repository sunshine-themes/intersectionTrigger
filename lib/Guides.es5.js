/*
* Guides v1.0.0
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright 2022, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  
var guides = (function() {
  var __defProp = Object.defineProperty;
  var __export = function(target, all) {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };

  // src/Guides.js
  var Guides_exports = {};
  __export(Guides_exports, {
    default: function() {
      return Guides;
    }
  });

  // src/constants.js
  var guideDefaultParams = {
    enter: {
      trigger: {
        backgroundColor: "rgb(0, 149, 0)",
        color: "#000",
        text: "Enter"
      },
      root: {
        backgroundColor: "rgb(0, 149, 0)",
        color: "#000",
        text: "Root Enter"
      }
    },
    leave: {
      trigger: {
        backgroundColor: "#ff0000",
        color: "#000",
        text: "Leave"
      },
      root: {
        backgroundColor: "#ff0000",
        color: "#000",
        text: "Root Leave"
      }
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
  var getParents = function getParents2(element2) {
    var parents = [];
    for (element2 = element2.parentNode; element2 && element2 !== document && element2 !== document.documentElement; element2 = element2.parentNode) {
      parents.push(element2);
    }
    return parents;
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
  var boundsMinusScrollbar = function boundsMinusScrollbar2(element2) {
    var bounds = element2.getBoundingClientRect();
    var top = bounds.top, bottom = bounds.bottom, right = bounds.right, left = bounds.left, height = bounds.height, width = bounds.width, x = bounds.x, y = bounds.y;
    return {
      top: top,
      left: left,
      height: height,
      width: width,
      x: x,
      y: y,
      right: right - (right - left - element2.clientWidth),
      bottom: bottom - (bottom - top - element2.clientHeight)
    };
  };

  // src/Guides.js
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
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var Guides = /* @__PURE__ */ function() {
    function Guides2() {
      var _this = this;
      var params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      _classCallCheck(this, Guides2);
      _defineProperty(this, "removeGuides", function() {
        _this._guides.forEach(function(guide) {
          return guide && guide.remove();
        });
        _this._guides = [];
      });
      _defineProperty(this, "refresh", function() {
        _this.removeGuides();
        _this.createGuides();
      });
      _defineProperty(this, "kill", function() {
        _this.removeGuides();
        _this._it = null;
        _this._utils = null;
        removeEventListener("resize", _this._onResizeHandler, false);
      });
      this.params = params;
      this._guides = [];
      return this;
    }
    _createClass(Guides2, [{
      key: "_registerIntersectionTrigger",
      value: function _registerIntersectionTrigger(intersectionTrigger) {
        this._it = intersectionTrigger;
        this._utils = this._it._utils;
        this._addResizeListener();
      }
    }, {
      key: "_addResizeListener",
      value: function _addResizeListener() {
        var _this2 = this;
        !!this._onResizeHandler && removeEventListener("resize", this._onResizeHandler, false);
        this._onResizeHandler = function() {
          _this2.refresh();
        };
        addEventListener("resize", this._onResizeHandler, false);
      }
    }, {
      key: "createGuides",
      value: function createGuides() {
        var _this3 = this;
        var isVirtical = this._utils.isVirtical();
        var createGuide = function createGuide2(options) {
          var triggerGuide = options.triggerGuide, trigger = options.trigger, enter = options.enter, position = options.position, text = options.text, color = options.color, backgroundColor = options.backgroundColor;
          var setProp = function setProp2(el, prop, value) {
            return el.style[prop] = value;
          };
          var guide = document.createElement("div");
          var guideWidth = isVirtical ? "100px" : "1px";
          var guideHeight = isVirtical ? "1px" : "100px";
          var guidePositionRef = isVirtical ? "top" : "left";
          setProp(guide, "width", guideWidth);
          setProp(guide, "height", guideHeight);
          setProp(guide, "position", "absolute");
          setProp(guide, "zIndex", "9999");
          setProp(guide, "backgroundColor", backgroundColor);
          setProp(guide, guidePositionRef, position);
          var createText = function createText2() {
            var virticalAlignment = {
              dir: isVirtical ? enter ? "bottom" : "top" : "bottom",
              value: isVirtical ? "5px" : "25px"
            };
            var horizontalAlignment = {
              dir: isVirtical ? "right" : enter ? "right" : "left",
              value: isVirtical ? triggerGuide ? "0px" : !_this3._it._root ? "25px" : "0px" : "5px"
            };
            var textElement = document.createElement("span");
            textElement.innerText = text;
            guide.appendChild(textElement);
            setProp(textElement, "position", "absolute");
            setProp(textElement, "color", color);
            setProp(textElement, "fontSize", "16px");
            setProp(textElement, "fontWeight", "bold");
            setProp(textElement, "backgroundColor", backgroundColor);
            setProp(textElement, "padding", "5px");
            setProp(textElement, "width", "max-content");
            setProp(textElement, virticalAlignment.dir, virticalAlignment.value);
            setProp(textElement, horizontalAlignment.dir, horizontalAlignment.value);
          };
          createText();
          _this3._guides.push(guide);
          document.body.append(guide);
          var setTranslateProp = function setTranslateProp2(diffX, diffY) {
            var parts = _toConsumableArray(guide.style.transform.matchAll(/(-?\d*\.?\d+)\s*(px|%)?/g));
            var translateXInPx = parts.length ? parts[0][1] : 0;
            var translateYInPx = parts.length > 1 ? parts[1][1] : 0;
            var x = parseFloat(diffX) + parseFloat(translateXInPx);
            var y = parseFloat(diffY) + parseFloat(translateYInPx);
            setProp(guide, "transform", "translate(".concat(x, "px,").concat(y, "px)"));
          };
          var positionGuide = function positionGuide2() {
            var isTrigger = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
            var guideBounds = guide.getBoundingClientRect();
            var targetBounds = isTrigger ? boundsMinusScrollbar(trigger) : _this3._utils.getRootRect(_this3._it.observer.rootMargin);
            var rBoundsNoMargins = _this3._it._root ? boundsMinusScrollbar(_this3._it._root) : boundsMinusScrollbar(document.body);
            var triggerDiffs = isVirtical ? {
              x: targetBounds.right - guideBounds.right,
              y: targetBounds.top + position * targetBounds.height - guideBounds.top
            } : {
              x: targetBounds.left + position * targetBounds.width - guideBounds.left,
              y: targetBounds.top - guideBounds.top
            };
            var rootDiffs = isVirtical ? enter ? {
              x: rBoundsNoMargins.right - guideBounds.left,
              y: targetBounds.bottom - guideBounds.bottom
            } : {
              x: rBoundsNoMargins.right - guideBounds.left,
              y: targetBounds.top - guideBounds.top
            } : enter ? {
              x: targetBounds.right - guideBounds.right,
              y: rBoundsNoMargins.bottom - guideBounds.top
            } : {
              x: targetBounds.left - guideBounds.left,
              y: rBoundsNoMargins.bottom - guideBounds.top
            };
            var diffs = isTrigger ? triggerDiffs : rootDiffs;
            setTranslateProp(diffs.x, diffs.y);
          };
          if (!triggerGuide) {
            setProp(guide, isVirtical ? "width" : "height", _this3._it._isRootViewport ? isVirtical ? "100vw" : "100vh" : "100px");
            setProp(guide, "position", _this3._it._isRootViewport ? "fixed" : "absolute");
            _this3._it._isRootViewport && !isVirtical && setProp(guide, "top", "0px");
            if (!_this3._it._isRootViewport)
              positionGuide(false);
            return;
          }
          positionGuide();
          getParents(trigger).forEach(function(parent) {
            if (!is.scrollable(parent))
              return;
            parent.addEventListener("scroll", function(event) {
              return positionGuide();
            }, false);
          });
        };
        var parseGuidesParams = function parseGuidesParams2(params) {
          var guideParams2 = guideDefaultParams;
          if (is.object(params)) {
            guideParams2 = mergeOptions(guideParams2, params);
          }
          return guideParams2;
        };
        var guideParams = parseGuidesParams(this.params);
        var guideTextPrefix = this._it.name;
        createGuide({
          triggerGuide: false,
          enter: true,
          position: this._it._positions.rootEnterPosition.guide,
          text: "".concat(guideTextPrefix, " ").concat(guideParams.enter.root.text),
          color: guideParams.enter.root.color,
          backgroundColor: guideParams.enter.root.backgroundColor
        });
        createGuide({
          triggerGuide: false,
          enter: false,
          position: this._it._positions.rootLeavePosition.guide,
          text: "".concat(guideTextPrefix, " ").concat(guideParams.leave.root.text),
          color: guideParams.leave.root.color,
          backgroundColor: guideParams.leave.root.backgroundColor
        });
        this._it.triggers.forEach(function(trigger) {
          var _this3$_utils$getTrig = _this3._utils.getTriggerData(trigger), enter = _this3$_utils$getTrig.enter, leave = _this3$_utils$getTrig.leave;
          createGuide({
            triggerGuide: true,
            trigger: trigger,
            enter: true,
            position: enter,
            text: "".concat(guideTextPrefix, " ").concat(guideParams.enter.trigger.text),
            color: guideParams.enter.trigger.color,
            backgroundColor: guideParams.enter.trigger.backgroundColor
          });
          createGuide({
            triggerGuide: true,
            trigger: trigger,
            enter: false,
            position: leave,
            text: "".concat(guideTextPrefix, " ").concat(guideParams.leave.trigger.text),
            color: guideParams.leave.trigger.color,
            backgroundColor: guideParams.leave.trigger.backgroundColor
          });
        });
      }
    }]);
    return Guides2;
  }();
  return Guides_exports;
})();
