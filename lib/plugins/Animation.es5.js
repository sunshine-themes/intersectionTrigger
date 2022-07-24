/*
* Animation v1.0.0
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright 2022, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  
var animation = (function() {
  var __defProp = Object.defineProperty;
  var __export = function(target, all) {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };

  // src/plugins/Animation.js
  var Animation_exports = {};
  __export(Animation_exports, {
    default: function() {
      return Animation;
    }
  });

  // src/constants.js
  var fn = function fn2() {
  };
  var animationDefaultToggleActions = ["play", "complete", "reverse", "complete"];
  var snapDefaultParams = {
    to: null,
    after: 1,
    speed: 100,
    maxDistance: 500,
    onStart: fn,
    onComplete: fn
  };
  var defaultAnimationParams = {
    instance: null,
    toggleActions: animationDefaultToggleActions,
    link: false,
    snap: false
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
  var clamp = function clamp2(a, min, max) {
    return Math.min(Math.max(a, min), max);
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
  var throwError = function throwError2(message) {
    throw new Error(message);
  };

  // src/plugins/Animation.js
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
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
      return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr))
      return _arrayLikeToArray2(arr);
  }
  function _slicedToArray2(arr, i) {
    return _arrayWithHoles2(arr) || _iterableToArrayLimit2(arr, i) || _unsupportedIterableToArray2(arr, i) || _nonIterableRest2();
  }
  function _nonIterableRest2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
  var Animation = /* @__PURE__ */ function() {
    function Animation2(it) {
      _classCallCheck(this, Animation2);
      this._registerIntersectionTrigger(it);
      this.setUtils();
      return this;
    }
    _createClass(Animation2, [{
      key: "_registerIntersectionTrigger",
      value: function _registerIntersectionTrigger(intersectionTrigger) {
        this._it = intersectionTrigger;
        this._utils = this._it._utils;
      }
    }, {
      key: "setUtils",
      value: function setUtils() {
        var _this = this;
        var _this$_utils$dirProps = this._utils.dirProps(), ref = _this$_utils$dirProps.ref, refOpposite = _this$_utils$dirProps.refOpposite, length = _this$_utils$dirProps.length;
        var isVir = this._utils.isVirtical();
        var root = this._utils.getRoot();
        var rAFIDs = new WeakMap();
        this.seekSmoothly = function(ins, seekTo, link, isSeekToGreater) {
          if (_this._it.killed)
            return _this.kill();
          var cT = ins.currentTime;
          var sT = isSeekToGreater ? Math.min(cT + link, seekTo) : Math.max(cT - link, seekTo);
          ins.seek(sT);
          var hasComplete = isSeekToGreater ? sT >= seekTo : sT <= seekTo;
          if (hasComplete)
            return;
          var rAFID = requestAnimationFrame(function() {
            return _this.seekSmoothly(ins, seekTo, link, isSeekToGreater);
          });
          rAFIDs.set(ins, rAFID);
        };
        this.seek = function(ins, seekTo, link) {
          if (is.num(link)) {
            var cT = ins.currentTime;
            var isSeekToGreater = seekTo > cT;
            var rAFID = rAFIDs.has(ins) && rAFIDs.get(ins) || 0;
            cancelAnimationFrame(rAFID);
            _this.seekSmoothly(ins, seekTo, link, isSeekToGreater);
            return;
          }
          ins.seek(seekTo);
        };
        this.startSnaping = function(_ref) {
          var snapDistance = _ref.snapDistance, currentDis = _ref.currentDis, snap = _ref.snap, step = _ref.step, _ref$toRef = _ref.toRef, toRef = _ref$toRef === void 0 ? false : _ref$toRef;
          if (_this._it.killed)
            return _this.kill();
          var direction = toRef ? -1 : 1;
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
          currentDis += step;
          if (currentDis >= snapDistance) {
            currentDis = 0;
            snap.onComplete(_this._it);
            return;
          }
          requestAnimationFrame(function() {
            return _this.startSnaping({
              snapDistance: snapDistance,
              currentDis: currentDis,
              snap: snap,
              step: step,
              toRef: toRef
            });
          });
        };
        this.parseSnap = function(_ref2) {
          var instance = _ref2.instance, snap = _ref2.snap;
          var update = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
          var parseNum = function parseNum2(n) {
            var arr = [];
            var progress = n;
            while (progress < 1) {
              arr.push(clamp(progress, 0, 1));
              progress = progress + n;
            }
            return arr.map(function(v) {
              return Math.round(v * instance.duration);
            });
          };
          var parseTo = function parseTo2(sn) {
            if (is.num(sn))
              return parseNum(sn);
            if (is.string(sn))
              return parseMarks(sn);
            if (is.array(sn))
              return sn;
          };
          var parseMarks = function parseMarks2() {
            if (!is.inObject(instance, "marks"))
              return;
            return instance.marks.map(function(mark) {
              return mark.time;
            });
          };
          var getTo = function getTo2(params, to) {
            return update ? params.toOriginal : to;
          };
          var snapParams = {};
          switch (true) {
            case (is.boolean(snap) && snap):
              !update && (snapParams.toOriginal = "marks");
              snapParams.to = parseMarks(getTo(snapParams, snap));
              break;
            case is.array(snap):
              !update && (snapParams.toOriginal = snap);
              snapParams.to = getTo(snapParams, snap);
              break;
            case is.num(snap):
              !update && (snapParams.toOriginal = snap);
              snapParams.to = parseNum(getTo(snapParams, snap));
              break;
            case is.object(snap):
              snapParams = snap;
              !update && (snapParams.toOriginal = snapParams.to);
              snapParams.to = parseTo(getTo(snapParams, snapParams.to));
              break;
          }
          return mergeOptions(snapDefaultParams, snapParams);
        };
        this.getTIL = function(trigger, minPosition, maxPosition) {
          var tB = trigger.getBoundingClientRect();
          return tB[length] - (minPosition * tB[length] + (1 - maxPosition) * tB[length]);
        };
        this.getSnapStep = function(snap) {
          return snap && Math.round(Math.max(snap.speed * 17 / 1e3, 1));
        };
        this.animateHandler = function(trigger, _ref3) {
          var enter = _ref3.enter, leave = _ref3.leave, tIL = _ref3.tIL, instance = _ref3.instance, snap = _ref3.snap, step = _ref3.step, link = _ref3.link;
          if (_this._it.killed)
            return _this.kill();
          var tB = trigger.getBoundingClientRect();
          var ids = _this._utils.getTriggerStates(trigger, "ids");
          _this._it.rootBounds = _this._utils.getRootRect(_this._it.observer.rootMargin);
          var rB = _this._it.rootBounds;
          var scrollLength = tIL + (_this._it._isREPGreater ? rB[length] : -rB[length]);
          var duration = instance.duration;
          var seekTo = 0;
          var _this$_utils$getPosit = _this._utils.getPositions(tB, rB, {
            enter: enter,
            leave: leave,
            ref: ref,
            refOpposite: refOpposite,
            length: length
          }), _this$_utils$getPosit2 = _slicedToArray2(_this$_utils$getPosit, 4), tEP = _this$_utils$getPosit2[0], tLP = _this$_utils$getPosit2[1], rEP = _this$_utils$getPosit2[2], rLP = _this$_utils$getPosit2[3];
          var diff = rEP - tEP;
          if (diff > 0) {
            seekTo = duration * diff / scrollLength;
            _this.seek(instance, seekTo, link);
          }
          if (snap) {
            var dis = 0;
            clearTimeout(ids.snapTimeOutId);
            var snapTimeOutId = setTimeout(function() {
              var directionalDiff = snap.to.map(function(n) {
                return seekTo - n;
              }), diff2 = directionalDiff.map(function(n) {
                return Math.abs(n);
              }), closest = Math.min.apply(Math, _toConsumableArray(diff2)), closestWithDirection = directionalDiff[diff2.indexOf(closest)], snapDistance = scrollLength * closest / duration, snapData = {
                snapDistance: snapDistance,
                currentDis: dis,
                snap: snap,
                step: step
              };
              if (snapDistance >= snap.maxDistance || snapDistance < step)
                return;
              snap.onStart(_this._it);
              if (closestWithDirection < 0) {
                _this.startSnaping(snapData);
                return;
              }
              _this.startSnaping(_objectSpread(_objectSpread({}, snapData), {}, {
                toRef: true
              }));
            }, snap.after * 1e3);
            _this._utils.setTriggerStates(trigger, {
              ids: _objectSpread(_objectSpread({}, ids), {}, {
                snapTimeOutId: snapTimeOutId
              })
            });
          }
        };
      }
    }, {
      key: "animate",
      value: function animate(trigger, animation, eventIndex) {
        var _this2 = this;
        var instance = animation.instance, toggleActions = animation.toggleActions, link = animation.link, snap = animation.snap;
        if (!instance)
          return;
        if (link) {
          var _this$_utils$getTrigg = this._utils.getTriggerStates(trigger, "onScroll"), animate2 = _this$_utils$getTrigg.animate;
          var ids = this._utils.getTriggerStates(trigger, "ids");
          var _this$_utils$getTrigg2 = this._utils.getTriggerData(trigger), enter = _this$_utils$getTrigg2.enter, leave = _this$_utils$getTrigg2.leave, minPosition = _this$_utils$getTrigg2.minPosition, maxPosition = _this$_utils$getTrigg2.maxPosition;
          var tIL = this.getTIL(trigger, minPosition, maxPosition);
          var step = this.getSnapStep(snap) || 0;
          var animateData = {
            enter: enter,
            leave: leave,
            tIL: tIL,
            instance: instance,
            snap: snap,
            link: is.boolean(link) ? link : Math.abs(link),
            step: step
          };
          switch (eventIndex) {
            case 0:
            case 2:
              this._it._states.oCbFirstInvoke && this.animateHandler(trigger, animateData);
              if (animate2)
                break;
              this._utils.setTriggerScrollStates(trigger, "animate", function() {
                return _this2.animateHandler(trigger, animateData);
              });
              break;
            case 1:
            case 3:
              clearTimeout(ids.snapTimeOutId);
              this._utils.setTriggerScrollStates(trigger, "animate", null);
              this.seek(instance, eventIndex === 1 ? instance.duration : 0, link);
              break;
          }
          return;
        }
        var action = toggleActions[eventIndex];
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
            this._utils.setTriggerData(trigger, null, {
              animation: _objectSpread({}, defaultAnimationParams)
            });
            break;
        }
      }
    }, {
      key: "parse",
      value: function parse(params) {
        var update = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        var animation = {};
        switch (true) {
          case is.animeInstance(params):
            animation = mergeOptions(defaultAnimationParams, {
              instance: params
            });
            break;
          case is.object(params):
            {
              animation = mergeOptions(defaultAnimationParams, params);
              var _animation = animation, toggleActions = _animation.toggleActions, snap = _animation.snap, instance = _animation.instance;
              snap && (animation.snap = this.parseSnap({
                instance: instance,
                snap: snap
              }, update));
              is.string(toggleActions) && (animation.toggleActions = splitStr(toggleActions));
            }
            break;
        }
        !is.animeInstance(animation.instance) && throwError("Invalid anime instance");
        is.inObject(animation, "instance") && animation.instance.reset();
        return animation;
      }
    }, {
      key: "update",
      value: function update() {
        var _this3 = this;
        this._it.triggers.forEach(function(trigger) {
          var _this3$_utils$getTrig = _this3._utils.getTriggerData(trigger), enter = _this3$_utils$getTrig.enter, leave = _this3$_utils$getTrig.leave, minPosition = _this3$_utils$getTrig.minPosition, maxPosition = _this3$_utils$getTrig.maxPosition, animation = _this3$_utils$getTrig.animation;
          animation = _this3.parse(animation, true);
          _this3._utils.setTriggerData(trigger, null, {
            animation: animation
          });
          var _this3$_utils$getTrig2 = _this3._utils.getTriggerStates(trigger, "onScroll"), animate = _this3$_utils$getTrig2.animate;
          if (animate) {
            var _animation2 = animation, instance = _animation2.instance, snap = _animation2.snap, link = _animation2.link;
            var tIL = _this3.getTIL(trigger, minPosition, maxPosition);
            var step = _this3.getSnapStep(snap) || 0;
            _this3._utils.setTriggerScrollStates(trigger, "animate", null);
            _this3._utils.setTriggerScrollStates(trigger, "animate", function() {
              return _this3.animateHandler(trigger, {
                enter: enter,
                leave: leave,
                instance: instance,
                snap: snap,
                link: link,
                tIL: tIL,
                step: step
              });
            });
          }
        });
      }
    }, {
      key: "kill",
      value: function kill() {
        this._it = null;
        this._utils = null;
      }
    }]);
    return Animation2;
  }();
  return Animation_exports;
})();
