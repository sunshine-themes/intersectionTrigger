import { defaultInsOptions, triggerStates } from './constants';
import Helpers from './Helpers';
import Utils from './Utils';

/* eslint-disable no-fallthrough */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-invalid-this */

/*
 * ScrollTrigger 1.0.0
 * https://sunshine-themes.com/scrollTrigger
 *
 * @license Copyright 2022, Sunshine. All rights reserved.
 * Subject to the terms at https://sunshine-themes.com/scrollTrigger/standard-licensew.
 * @author: Sherif magdy, sherifmagdy@sunshine-themes.com
 */
class ScrollTrigger {
  constructor(options) {
    this._userOptions = options;
    this.triggers = [];
    this._triggersData = new WeakMap();
    //
    this._helpers = new Helpers(this);
    this._utils = new Utils(this);
    //
    this._setStates();
    this._setInstance();
  }

  _setStates() {
    this._states = {};
    this._states.hasInit = false;
  }

  _addScrollListener() {
    const scroller = this._helpers.getScroller();
    !!this._onScrollHandler && scroller.removeEventListener('scroll', this._onScrollHandler, false);

    this._onScrollHandler = (event) => {
      //Invoke all onScroll triggers Functions
      this.triggers.forEach((trigger) => {
        const onScrollFun = this._utils.getTriggerStates(trigger)?.onScroll;
        this._helpers.is.function(onScrollFun) && onScrollFun(trigger);
      });
      //Invoke custom function
      this._helpers.is.function(this.onScroll) && this.onScroll(event, this);
    };

    scroller.addEventListener('scroll', this._onScrollHandler, false);
  }
  _addResizeListener() {
    !!this._onResizeHandler && removeEventListener('resize', this._onResizeHandler, false);

    this._onResizeHandler = () => {
      this._helpers.removeGuides();
      this._helpers.createGuides();
    };
    addEventListener('resize', this._onResizeHandler, false);
  }
  _createInstance() {
    //Creates observer threshold
    this._threshold = this._utils.setThreshold();

    this._observerOptions = {
      root: this._root,
      rootMargin: this._rootMargin,
      threshold: this._threshold,
    };

    this.observer = new IntersectionObserver(this._observerCallback, this._observerOptions);

    this._root = this.observer.root;
    this.rootBounds = this._utils.getRootRect(this.observer.rootMargin);
    this._isRootViewport = this._helpers.is.rootViewport(this._root);

    //Init Event listener
    this._addScrollListener();
    this._addResizeListener();
  }

  _observerCallback = (entries, observer) => {
    const { ref, refOpposite, length } = this._helpers.dirProps();
    for (const entry of entries) {
      const trigger = entry.target;
      const tB = entry.boundingClientRect; //trigger Bounds
      const isIntersecting = entry.isIntersecting;
      const intersectionRatio = entry.intersectionRatio;
      ///////
      this.rootBounds = entry.rootBounds || this._utils.getRootRect(observer.rootMargin);
      const rB = this.rootBounds; //root Bounds;
      const rootLength = rB[length];
      const rootToTarget = rootLength / tB[length];
      //////
      const { enter, leave, onEnter, onLeave, onLeaveBack } = this._utils.getTriggerData(trigger);
      const { hasEnteredFromOneSide, onScroll } = this._utils.getTriggerStates(trigger);
      ///////
      const isTriggerLarger = tB[length] >= rootLength;
      const isTSPLarger = enter > rootToTarget;
      const isTEPLarger = 1 - leave > rootToTarget;
      const initOnScrollFun = isTriggerLarger && (isTSPLarger || isTEPLarger);
      const isOnScrollFunRunning = !!onScroll;

      //At init & Intersecting cases
      const tSPIsBtwn = tB[ref] + enter * tB[length] < rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref];
      const tEPIsBtwn = tB[ref] + leave * tB[length] < rB[refOpposite] && tB[ref] + leave * tB[length] > rB[ref];
      const tSPIsUp = tB[ref] + enter * tB[length] < rB[ref];
      const tEPIsDown = tB[ref] + leave * tB[length] > rB[refOpposite];
      const tEPIsUp = tB[ref] + leave * tB[length] < rB[ref] && intersectionRatio < 1 - leave;

      //At init & is not intersecting cases
      const tTIsUp = tB[ref] < rB[ref];
      const tBIsUp = tB[refOpposite] < rB[ref];

      switch (true) {
        case !this._states.hasInit:
          switch (true) {
            case !isIntersecting && tTIsUp && tBIsUp:
              //Invoke onEnter Function
              this._utils.onTriggerEnter(trigger, {
                enterFun: onEnter,
                enterProp: 'hasEntered',
                leaveProp: 'hasLeftBack',
              });
              // Then Invoking onLeave Function
              this._utils.onTriggerLeave(trigger, {
                leaveFun: onLeave,
                leaveProp: 'hasLeft',
              });
              break;
            case isIntersecting:
              switch (true) {
                case tSPIsBtwn || tEPIsBtwn || (tSPIsUp && tEPIsDown):
                  //Invoke onEnter Function
                  this._utils.onTriggerEnter(trigger, {
                    enterFun: onEnter,
                    enterProp: 'hasEntered',
                    leaveProp: 'hasLeftBack',
                  });
                  break;
                case tEPIsUp:
                  //Invoke onEnter Function
                  this._utils.onTriggerEnter(trigger, {
                    enterFun: onEnter,
                    enterProp: 'hasEntered',
                    leaveProp: 'hasLeftBack',
                  });
                  // Then Invoking onLeave Function
                  this._utils.onTriggerLeave(trigger, {
                    leaveFun: onLeave,
                    leaveProp: 'hasLeft',
                  });
                  break;
              }

              if (initOnScrollFun)
                this._utils.setTriggerStates(trigger, {
                  onScroll: this._utils.toggleActions,
                });

              break;
          }
          break;
        case !isIntersecting:
          if (isOnScrollFunRunning)
            this._utils.setTriggerStates(trigger, {
              onScroll: null,
            });

          switch (true) {
            case hasEnteredFromOneSide && tB[refOpposite] < rB[ref]:
              this._utils.onTriggerLeave(trigger, {
                leaveFun: onLeave,
                leaveProp: 'hasLeft',
              });
              break;
            case hasEnteredFromOneSide && tB[ref] > rB[refOpposite]:
              this._utils.onTriggerLeave(trigger, {
                leaveFun: onLeaveBack,
                leaveProp: 'hasLeftBack',
              });
              break;
          }
          break;
        case isIntersecting && !isOnScrollFunRunning:
          this._utils.toggleActions(trigger);

          initOnScrollFun &&
            this._utils.setTriggerStates(trigger, {
              onScroll: this._utils.toggleActions,
            });

          break;
      }
    }
    //Reset hasInit state
    this._states.hasInit = true;
  };

  _setInstance() {
    //Default Options for instance
    this._defaultOptions = defaultInsOptions;

    this._utils.validateOptions(this._userOptions);
    this._options = this._helpers.mergeOptions(this._defaultOptions, this._userOptions);

    //Scroll Axis
    this.axis = this._helpers.is.string(this._options.axis)
      ? this._options.axis
      : this._helpers.throwError('axis parameter must be a string.');
    //Name of ScrollTrigger instance
    this.name = this._helpers.is.string(this._options.name)
      ? this._options.name
      : this._helpers.throwError('name parameter must be a string.');

    this._root = (!!this._options.scroller && this._utils.parseQuery(this._options.scroller, 'root')) || null;
    this._positions = this._utils.parsePositions(this._options.enter, this._options.leave);

    //Add onScroll custom handler
    this.onScroll = this._options.onScroll;

    //Create trigger defaults
    this._triggerParams = {
      once: this._options.defaults.once,
      enter: this._positions.triggerEnterPosition.value,
      leave: this._positions.triggerLeavePosition.value,
      onEnter: this._options.defaults.onEnter,
      onLeave: this._options.defaults.onLeave,
      onEnterBack: this._options.defaults.onEnterBack,
      onLeaveBack: this._options.defaults.onLeaveBack,
    };

    //Create root margin
    this._rootMargin = this._utils.setRootMargin();
    //Create an IntersectionObserver
    this._createInstance();

    return this;
  }

  add(trigger = {}, options = {}) {
    const toAddTriggers = this._utils.parseQuery(trigger);

    this._utils.validateOptions(options);

    'enter' in options && (options.enter = this._utils.setPositionData(options.enter).value);
    'leave' in options && (options.leave = this._utils.setPositionData(options.leave).value);

    const triggerParams = { ...this._triggerParams, ...options, states: { ...triggerStates } };
    //
    this.triggers = [...this.triggers, ...toAddTriggers];
    this.triggers = [...new Set(this.triggers)]; //to remove any duplicates
    //
    let shouldReCreateObserver = false;
    [options.enter, options.leave].forEach(
      (position) => !this._threshold.some((value) => position === value) && (shouldReCreateObserver = true)
    );

    if (shouldReCreateObserver) {
      //Disconnect the IntersctionObserver
      this._disconnect();
      //1- set trigger data
      toAddTriggers.forEach((trigger) => this._utils.setTriggerData(trigger, triggerParams));
      //2- recreate the observer
      this._createInstance();
      //3- reobserve the triggers
      this.triggers.forEach((trigger) => this.observer.observe(trigger));
    } else {
      toAddTriggers.forEach((trigger) => {
        this._utils.setTriggerData(trigger, triggerParams);
        this.observer.observe(trigger);
      });
    }

    //Add guides
    this._helpers.removeGuides();
    this._helpers.createGuides();

    return this;
  }

  remove(trigger = {}) {
    let toRemoveTriggers = this._utils.parseQuery(trigger);
    toRemoveTriggers.forEach((trigger) => {
      this._utils.deleteTriggerData(trigger);
      this.observer.unobserve(trigger);
    });

    const updatedStoredTriggers = this.triggers.filter((storedTrigger) => {
      const isInRemoveTriggers = toRemoveTriggers.some((toRemoveTrigger) => storedTrigger === toRemoveTrigger);

      return !isInRemoveTriggers;
    });

    this.triggers = updatedStoredTriggers;

    //Refreash guides
    this._helpers.removeGuides();
    this._helpers.createGuides();

    return this;
  }
  _disconnect() {
    //Disconnect the IntersctionObserver
    this.observer && this.observer.disconnect();
    this.observer = null;
  }

  kill() {
    //Disconnect the IntersctionObserver
    this._disconnect();
    //Remove event listeners
    removeEventListener('scroll', this._onScrollHandler, false);
    removeEventListener('resize', this._onResizeHandler, false);
    //Remove all trigger
    this.triggers = [];
    //Remove all guides from DOM
    this._helpers.removeGuides();
  }

  addGuides(guidesIns) {
    if (!this._helpers.is.inObject(guidesIns, '_registerScrollTrigger')) this._helpers.throwError('Invalid Guides Instance.');

    guidesIns._registerScrollTrigger(this);
    this._guidesInstance = guidesIns;
  }

  _setHelpers() {
    this._helpers = new Helpers(this);
    // this._helpers.isFunction = (value) => 'function' === typeof value;
    // this._helpers.isString = (value) => 'string' === typeof value;
    // this._helpers.isBoolean = (value) => 'boolean' === typeof value;
    // this._helpers.isObject = (value) => value && 'object' === typeof value && !(value instanceof Array);
    // this._helpers.isPercent = (value) => value && value.includes('%');
    // this._helpers.isPixel = (value) => value && value.includes('px');
    // this._helpers.isArray = (value) => value instanceof Array;
    // this._helpers.isElement = (value) => value instanceof HTMLElement || value instanceof Element;
    // this._helpers.isRootViewport = (root) => !root;
    // this._helpers.isDoc = (node) => node && node.nodeType === 9;
    // this._helpers.isScrollable = (element, dir = null) => (this._helpers.isVirtical = () => 'y' === this.axis);
    // this._helpers.isHorizontal = () => 'x' === this.axis;
    // dir
    //   ? 'y' === dir
    //     ? element.scrollHeight > element.clientHeight
    //     : element.scrollWidth > element.clientWidth
    //   : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
    // this._helpers.getBoundsProp = (element, prop) => element && element.getBoundingClientRect()[prop];
    // this._helpers.getScroller = () => (!!this._root ? this._root : window);
    // this._helpers.getScrollValue = (element, dir) => ('y' === dir ? element.scrollHeight : element.scrollWidth);
    // this._helpers.dirProps = () =>
    //   this._helpers.isVirtical()
    //     ? { ref: 'top', length: 'height', refOpposite: 'bottom', innerLength: innerHeight }
    //     : { ref: 'left', length: 'width', refOpposite: 'right', innerLength: innerWidth };
    // this._helpers.roundFloat = (value, precision) => {
    //   this._helpers.isString(value) && (value = parseFloat(value));
    //   const multiplier = Math.pow(10, precision || 0);
    //   return Math.round(value * multiplier) / multiplier;
    // };
    // this._helpers.getParents = (element) => {
    //   let parents = [];
    //   for (
    //     element = element.parentNode;
    //     element && element !== document && element !== document.documentElement;
    //     element = element.parentNode
    //   ) {
    //     parents.push(element);
    //   }
    //   return parents;
    // };
    // this._helpers.mergeOptions = (def, custom) => {
    //   const defaultOptions = def;
    //   const options = custom;
    //   Object.entries(defaultOptions).forEach(([k, v]) => {
    //     if (this._helpers.isObject(v)) {
    //       this._helpers.mergeOptions(v, (options[k] = options[k] || {}));
    //     } else if (!(k in options)) {
    //       options[k] = v;
    //     }
    //   });
    //   return options;
    // };
    // this._helpers.throwError = (message) => {
    //   throw new Error(message);
    // };
    // this._helpers.boundsMinusScrollbar = (element) => {
    //   const bounds = element.getBoundingClientRect();

    //   const { top, bottom, right, left, height, width, x, y } = bounds;
    //   return {
    //     top,
    //     left,
    //     height,
    //     width,
    //     x,
    //     y,
    //     right: right - (right - left - element.clientWidth),
    //     bottom: bottom - (bottom - top - element.clientHeight),
    //   };
    // };
    /////////////////
    // this._helpers.setRootMargin = () => {
    //   const extendMargin = this._helpers.getScrollValue(
    //     this._helpers.isRootViewport(this._root) ? document.body : this._root,
    //     this._helpers.isVirtical() ? 'x' : 'y'
    //   );
    //   this._rootMargin = this._helpers.isVirtical()
    //     ? `${this._positions.rootEndPosition.strValue} ${extendMargin}px ${this._positions.rootStartPosition.strValue} ${extendMargin}px`
    //     : `${extendMargin}px ${this._positions.rootStartPosition.strValue} ${extendMargin}px ${this._positions.rootEndPosition.strValue}`;
    // };
    // this._helpers.setThreshold = () => {
    //   this._threshold = [
    //     0,
    //     this._triggerParams.enter,
    //     this._triggerParams.leave,
    //     this._helpers.roundFloat(1 - this._triggerParams.leave, 2),
    //     1,
    //   ];
    //   this.triggers.forEach((trigger) => {
    //     const { enter, leave } = this._helpers.getTriggerData(trigger);
    //     this._threshold.push(enter, leave, this._helpers.roundFloat(1 - leave, 2));
    //   });

    //   this._threshold = [...new Set(this._threshold)]; //to remove duplicates
    // };
    // this._helpers.parseQuery = (query, type = 'trigger') => {
    //   const isTrigger = 'trigger' === type;
    //   let output = isTrigger ? [] : {};

    //   if (!isTrigger) {
    //     output = this._helpers.isString(query)
    //       ? document.querySelector(query)
    //       : this._helpers.isElement(query)
    //       ? query
    //       : this._helpers.throwError('scroller parameter must be a valid selector or an element');
    //     return output;
    //   }
    //   switch (true) {
    //     case this._helpers.isString(query):
    //       output = [...document.querySelectorAll(query)];
    //       break;
    //     case this._helpers.isArray(query):
    //       output = query;
    //       break;
    //     case this._helpers.isElement(query):
    //       output = [query];
    //       break;
    //     default:
    //       this._helpers.throwError('trigger parameter must be a valid selector, an element or array of elements');
    //       break;
    //   }

    //   return output;
    // };

    // // Positions parsing
    // this._helpers.validatePosition = (name, pos) => {
    //   this._helpers.isFunction(pos) && (pos = pos(this));
    //   if (!this._helpers.isString(pos)) this._helpers.throwError(`${name} parameter must be a string.`);
    //   return pos;
    // };
    // this._helpers.setPositionData = (offset, isTrigger = true, isEnter = true) => {
    //   offset = this._helpers.validatePosition(isEnter ? 'enter' : 'leave', offset);

    //   let value = offset.trim();
    //   const isPercentage = this._helpers.isPercent(value);
    //   const isPixel = this._helpers.isPixel(value);

    //   let position = {};

    //   value = isPercentage ? value.replace('%', '') : isPixel ? value.replace('px', '') : value;
    //   value = this._helpers.roundFloat(value);

    //   position.type = isPercentage ? 'percent' : 'pixel';

    //   //Trigger Positions
    //   if (isPercentage && isTrigger) {
    //     position.value = value / 100;
    //     position.strValue = `${value}%`;
    //     return position;
    //   }
    //   //Root Positions
    //   const { length, innerLength } = this._helpers.dirProps();
    //   const rootLength = this._root ? this._helpers.getBoundsProp(this._root, length) : innerLength;
    //   switch (true) {
    //     case isPercentage && isEnter:
    //       position.value = this._helpers.roundFloat(value / 100 - 1, 2);
    //       position.strValue = `${position.value * 100}%`;
    //       break;
    //     case isPercentage && !isEnter:
    //       position.value = -value / 100;
    //       position.strValue = `${position.value * 100}%`;
    //       break;
    //     case isPixel && isEnter:
    //       position.value = this._helpers.roundFloat(value - rootLength, 2);
    //       position.strValue = `${position.value}px`;
    //       break;
    //     case isPixel && !isEnter:
    //       position.value = -value;
    //       position.strValue = `${-value}px`;
    //       break;
    //   }

    //   position.guide = offset;

    //   return position;
    // };
    // this._helpers.parsePositions = (enter = '', leave = '') => {
    //   enter = this._helpers.validatePosition('enter', enter);
    //   leave = this._helpers.validatePosition('leave', leave);

    //   let triggerEnterPosition = {},
    //     triggerLeavePosition = {},
    //     rootStartPosition = {},
    //     rootEndPosition = {};

    //   const enterPositions = enter.trim().split(/\s+/g, 2);
    //   const leavePositions = leave.trim().split(/\s+/g, 2);
    //   const positions = [...enterPositions, ...leavePositions];

    //   positions.forEach((offset, i) => {
    //     switch (i) {
    //       case 0:
    //         //Element enter Point
    //         triggerEnterPosition = this._helpers.setPositionData(offset);
    //         break;
    //       case 1:
    //         //Root enter Point
    //         rootStartPosition = this._helpers.setPositionData(offset, false);
    //         break;
    //       case 2:
    //         //Element leave Point
    //         triggerLeavePosition = this._helpers.setPositionData(offset);
    //         break;
    //       case 3:
    //         //Root End Point
    //         rootEndPosition = this._helpers.setPositionData(offset, false, false);
    //         break;
    //     }
    //   });

    //   const parsedPositions = {
    //     triggerLeavePosition,
    //     triggerEnterPosition,
    //     rootEndPosition,
    //     rootStartPosition,
    //   };

    //   return parsedPositions;
    // };

    // //Trigger Data actions
    // this._helpers.deleteTriggerData = (trigger) => {
    //   //Reset data of a trigger
    //   this._triggersData.delete(trigger);
    // };
    // this._helpers.hasTriggerData = (trigger, prop = null) => {
    //   const hasData = this._triggersData.has(trigger);
    //   if (prop) {
    //     return hasData && prop in this._helpers.getTriggerData(trigger);
    //   }

    //   return hasData;
    // };
    // this._helpers.getTriggerData = (trigger, prop = null) => {
    //   if (prop) {
    //     //Get data property of a trigger
    //     return this._helpers.hasTriggerData(trigger, prop) ? this._triggersData.get(trigger)[prop] : {};
    //   }
    //   //Get data of a trigger
    //   return (this._helpers.hasTriggerData(trigger) && this._triggersData.get(trigger)) || {};
    // };
    // this._helpers.setTriggerData = (trigger, value, props = null) => {
    //   if (props) {
    //     //Set data property of a trigger
    //     const storedValue = this._helpers.getTriggerData(trigger);

    //     if (this._helpers.isObject(storedValue)) {
    //       this._triggersData.set(trigger, { ...storedValue, ...props });
    //     }
    //     return;
    //   }
    //   //Set data of a trigger
    //   this._triggersData.set(trigger, value);
    // };
    // this._helpers.getTriggerStates = (trigger) => {
    //   const triggerStates = this._helpers.getTriggerData(trigger, 'states');
    //   const hasEnteredFromOneSide = triggerStates.hasEntered || triggerStates.hasEnteredBack;

    //   return {
    //     ...triggerStates,
    //     hasEnteredFromOneSide,
    //   };
    // };
    // this._helpers.setTriggerStates = (trigger, value = {}) => {
    //   const triggerData = this._helpers.getTriggerData(trigger);
    //   const triggerStates = triggerData && { ...triggerData.states, ...value };

    //   this._helpers.setTriggerData(trigger, null, { states: triggerStates });
    // };
    // //
    // this._helpers.onTriggerEnter = (trigger, data) => {
    //   //Get Stored trigger data
    //   const { hasFirstEntered } = this._helpers.getTriggerStates(trigger);

    //   //Invoke Enter Function
    //   this._helpers.isFunction(data.enterFun) && data.enterFun(trigger, this);

    //   const triggerProps = hasFirstEntered
    //     ? {
    //         [data.enterProp]: true,
    //         [data.leaveProp]: false,
    //       }
    //     : { [data.enterProp]: true, hasLeft: false, hasLeftBack: false };

    //   //Reset trigger data props
    //   this._helpers.setTriggerStates(trigger, triggerProps);
    //   //Reset hasFirstEntered state
    //   if (!hasFirstEntered) this._helpers.setTriggerStates(trigger, { hasFirstEntered: true });
    // };
    // this._helpers.onTriggerLeave = (trigger, data) => {
    //   //Get Stored trigger data
    //   const { once } = this._helpers.getTriggerData(trigger);
    //   const { hasFirstEntered } = this._helpers.getTriggerStates(trigger);
    //   //Invoke leave function
    //   this._helpers.isFunction(data.leaveFun) && data.leaveFun(trigger, this);
    //   //Reset trigger data props
    //   this._helpers.setTriggerStates(trigger, {
    //     [data.leaveProp]: true,
    //     hasEntered: false,
    //     hasEnteredBack: false,
    //   });
    //   //Remove the instance if once is true
    //   once && hasFirstEntered && this.remove(trigger);
    // };

    // this._helpers.toggleActions = (trigger) => {
    //   const triggerBounds = trigger.getBoundingClientRect();
    //   this.rootBounds = this._helpers.getRootRect(this.observer.rootMargin);

    //   const { enter, leave, onEnter, onEnterBack, onLeave, onLeaveBack } = this._helpers.getTriggerData(trigger);
    //   const { hasEnteredFromOneSide, hasLeft, hasLeftBack } = this._helpers.getTriggerStates(trigger);
    //   const { ref, refOpposite, length } = this._helpers.dirProps();
    //   let hasCaseMet = true;

    //   switch (true) {
    //     case hasLeftBack &&
    //       triggerBounds[ref] + enter * triggerBounds[length] <= this.rootBounds[refOpposite] &&
    //       triggerBounds[ref] + enter * triggerBounds[length] > this.rootBounds[ref]:
    //       //Enter case
    //       this._helpers.onTriggerEnter(trigger, {
    //         enterFun: onEnter,
    //         enterProp: 'hasEntered',
    //         leaveProp: 'hasLeftBack',
    //       });
    //       break;
    //     case hasEnteredFromOneSide && triggerBounds[ref] + leave * triggerBounds[length] <= this.rootBounds[ref]:
    //       //Leave case
    //       this._helpers.onTriggerLeave(trigger, {
    //         leaveFun: onLeave,
    //         leaveProp: 'hasLeft',
    //       });
    //       break;
    //     case hasLeft &&
    //       triggerBounds[ref] + leave * triggerBounds[length] >= this.rootBounds[ref] &&
    //       triggerBounds[ref] + leave * triggerBounds[length] < this.rootBounds[refOpposite]:
    //       //EnterBack case
    //       this._helpers.onTriggerEnter(trigger, {
    //         enterFun: onEnterBack,
    //         enterProp: 'hasEnteredBack',
    //         leaveProp: 'hasLeft',
    //       });
    //       break;
    //     case hasEnteredFromOneSide && triggerBounds[ref] + enter * triggerBounds[length] >= this.rootBounds[refOpposite]:
    //       //LeaveBack case
    //       this._helpers.onTriggerLeave(trigger, {
    //         leaveFun: onLeaveBack,
    //         leaveProp: 'hasLeftBack',
    //       });
    //       break;
    //     default:
    //       hasCaseMet = false;
    //       break;
    //   }

    //   return hasCaseMet;
    // };

    // //Create Guides
    // this._helpers.createGuides = () => {
    //   const guideParam = this._options.guides;
    //   if (this._helpers.isBoolean(guideParam) && !guideParam) return;

    //   const isVirtical = this._helpers.isVirtical();
    //   const createGuide = (options) => {
    //     const { triggerGuide, trigger, enter, position, text, color, backgroundColor } = options;
    //     const setProp = (el, prop, value) => (el.style[prop] = value);

    //     const guide = document.createElement('div');
    //     const guideWidth = isVirtical ? '100px' : '1px';
    //     const guideHeight = isVirtical ? '1px' : '100px';
    //     const guidePositionRef = isVirtical ? 'top' : 'left';

    //     setProp(guide, 'width', guideWidth);
    //     setProp(guide, 'height', guideHeight);
    //     setProp(guide, 'position', 'absolute');
    //     setProp(guide, 'zIndex', '9999');
    //     setProp(guide, 'backgroundColor', backgroundColor);
    //     setProp(guide, guidePositionRef, position);
    //     //Create the text element
    //     const createText = () => {
    //       let virticalAlignment = {
    //         dir: isVirtical ? (enter ? 'bottom' : 'top') : 'bottom',
    //         value: isVirtical ? '5px' : '25px',
    //       };
    //       let horizontalAlignment = {
    //         dir: isVirtical ? 'right' : enter ? 'right' : 'left',
    //         value: isVirtical ? (triggerGuide ? '0px' : !this._root ? '25px' : '0px') : '5px',
    //       };

    //       const textElement = document.createElement('span');
    //       textElement.innerText = text;
    //       guide.appendChild(textElement);

    //       setProp(textElement, 'position', 'absolute');
    //       setProp(textElement, 'color', color);
    //       setProp(textElement, 'fontSize', '16px');
    //       setProp(textElement, 'fontWeight', 'bold');
    //       setProp(textElement, 'backgroundColor', backgroundColor);
    //       setProp(textElement, 'padding', '5px');
    //       setProp(textElement, 'width', 'max-content');
    //       setProp(textElement, virticalAlignment.dir, virticalAlignment.value);
    //       setProp(textElement, horizontalAlignment.dir, horizontalAlignment.value);
    //     };
    //     createText();
    //     //Add guide to the stored guides
    //     this._guides.push(guide);
    //     //Append the guide to the document body
    //     document.body.append(guide);

    //     const setTranslateProp = (diffX, diffY) => {
    //       const parts = [...guide.style.transform.matchAll(/(-?\d*\.?\d+)\s*(px|%)?/g)];
    //       const translateXInPx = parts.length ? parts[0][1] : 0;
    //       const translateYInPx = parts.length > 1 ? parts[1][1] : 0;

    //       let x = parseFloat(diffX) + parseFloat(translateXInPx);
    //       let y = parseFloat(diffY) + parseFloat(translateYInPx);

    //       setProp(guide, 'transform', `translate(${x}px,${y}px)`);
    //     };
    //     const positionGuide = (isTrigger = true) => {
    //       const guideBounds = guide.getBoundingClientRect();

    //       const targetBounds = isTrigger
    //         ? this._helpers.boundsMinusScrollbar(trigger)
    //         : this._helpers.getRootRect(this.observer.rootMargin);
    //       //Root Bounds without Margins
    //       const rBoundsNoMargins = this._root
    //         ? this._helpers.boundsMinusScrollbar(this._root)
    //         : this._helpers.boundsMinusScrollbar(document.body);

    //       const triggerDiffs = isVirtical
    //         ? {
    //             x: targetBounds.right - guideBounds.right,
    //             y: targetBounds.top + position * targetBounds.height - guideBounds.top,
    //           }
    //         : {
    //             x: targetBounds.left + position * targetBounds.width - guideBounds.left,
    //             y: targetBounds.top - guideBounds.top,
    //           };
    //       const rootDiffs = isVirtical
    //         ? enter
    //           ? {
    //               x: rBoundsNoMargins.right - guideBounds.left,
    //               y: targetBounds.bottom - guideBounds.bottom,
    //             }
    //           : {
    //               x: rBoundsNoMargins.right - guideBounds.left,
    //               y: targetBounds.top - guideBounds.top,
    //             }
    //         : enter
    //         ? {
    //             x: targetBounds.right - guideBounds.right,
    //             y: rBoundsNoMargins.bottom - guideBounds.top,
    //           }
    //         : { x: targetBounds.left - guideBounds.left, y: rBoundsNoMargins.bottom - guideBounds.top };

    //       const diffs = isTrigger ? triggerDiffs : rootDiffs;

    //       setTranslateProp(diffs.x, diffs.y);
    //     };

    //     //Root Guide
    //     if (!triggerGuide) {
    //       setProp(guide, isVirtical ? 'width' : 'height', this._isRootViewport ? (isVirtical ? '100vw' : '100vh') : '100px');
    //       setProp(guide, 'position', this._isRootViewport ? 'fixed' : 'absolute');
    //       this._isRootViewport && !isVirtical && setProp(guide, 'top', '0px');

    //       //the root is not the viewport and it is an element
    //       if (!this._isRootViewport) positionGuide(false);
    //       return;
    //     }
    //     //Trigger guide
    //     positionGuide();
    //     //RePosition the guide on every parent Scroll
    //     this._helpers.getParents(trigger).forEach((parent) => {
    //       if (!this._helpers.isScrollable(parent)) return;

    //       parent.addEventListener('scroll', (event) => positionGuide(), false);
    //     });
    //   };
    //   //Guides Parameters
    //   const parseGuidesParams = (params) => {
    //     let guideParams = {
    //       enter: {
    //         trigger: {
    //           backgroundColor: 'rgb(0, 149, 0)',
    //           color: '_000',
    //           text: 'Enter',
    //         },
    //         root: {
    //           backgroundColor: 'rgb(0, 149, 0)',
    //           color: '_000',
    //           text: 'Root Enter',
    //         },
    //       },
    //       leave: {
    //         trigger: {
    //           backgroundColor: '_ff0000',
    //           color: '_000',
    //           text: 'Leave',
    //         },
    //         root: {
    //           backgroundColor: '_ff0000',
    //           color: '_000',
    //           text: 'Root Leave',
    //         },
    //       },
    //     };
    //     if (this._helpers.isObject(params)) {
    //       guideParams = this._helpers.mergeOptions(guideParams, params);
    //     }
    //     return guideParams;
    //   };
    //   //Guides Parameters
    //   const guideParams = parseGuidesParams(this._options.guides);
    //   //Create Root Guides
    //   const guideTextPrefix = this.name;

    //   createGuide({
    //     triggerGuide: false,
    //     enter: true,
    //     position: this._positions.rootStartPosition.guide,
    //     text: `${guideTextPrefix} ${guideParams.enter.root.text}`,
    //     color: guideParams.enter.root.color,
    //     backgroundColor: guideParams.enter.root.backgroundColor,
    //   });
    //   createGuide({
    //     triggerGuide: false,
    //     enter: false,
    //     position: this._positions.rootEndPosition.guide,
    //     text: `${guideTextPrefix} ${guideParams.leave.root.text}`,
    //     color: guideParams.leave.root.color,
    //     backgroundColor: guideParams.leave.root.backgroundColor,
    //   });
    //   //Create Triggers Guides
    //   this.triggers.forEach((trigger) => {
    //     const { enter, leave } = this._helpers.getTriggerData(trigger);
    //     createGuide({
    //       triggerGuide: true,
    //       trigger,
    //       enter: true,
    //       position: enter,
    //       text: `${guideTextPrefix} ${guideParams.enter.trigger.text}`,
    //       color: guideParams.enter.trigger.color,
    //       backgroundColor: guideParams.enter.trigger.backgroundColor,
    //     });
    //     createGuide({
    //       triggerGuide: true,
    //       trigger,
    //       enter: false,
    //       position: leave,
    //       text: `${guideTextPrefix} ${guideParams.leave.trigger.text}`,
    //       color: guideParams.leave.trigger.color,
    //       backgroundColor: guideParams.leave.trigger.backgroundColor,
    //     });
    //   });
    // };
    // this._helpers.removeGuides = () => {
    //   this._guides.forEach((guide) => guide && guide.remove());
    //   this._guides = [];
    // };
    // /**
    //  * Valide user options
    //  *
    //  *  @param {object} options
    //  *  @return {void}
    //  */
    // this._helpers.validateOptions = (options) => {
    //   for (const optionName in options) {
    //     const optionValue = options[optionName];
    //     const validateOption = (optionName, optionValue) => {
    //       switch (optionName) {
    //         case 'once':
    //           !this._helpers.isBoolean(optionValue) && this._helpers.throwError('once parameter must be a boolean.');
    //           break;
    //         case 'axis':
    //         case 'name':
    //           !this._helpers.isString(optionValue) && this._helpers.throwError('axis and name parameters must be strings.');
    //           break;
    //         case 'guides':
    //           !this._helpers.isBoolean(optionValue) &&
    //             !this._helpers.isObject(optionValue) &&
    //             this._helpers.throwError('guides parameter must be a boolean or object.');
    //           break;
    //         case 'onEnter':
    //         case 'onEnterBack':
    //         case 'onLeave':
    //         case 'onLeaveBack':
    //         case 'onScroll':
    //           !this._helpers.isFunction(optionValue) &&
    //             this._helpers.throwError('onEnter, onLeave, onEnterBack, onLeaveBack and onScroll parameters must be functions.');
    //           break;
    //       }
    //     };
    //     if (!this._helpers.isObject(optionValue)) {
    //       validateOption(optionName, optionValue);
    //       continue;
    //     }

    //     for (const nestedOptionName in optionValue) {
    //       const nestedOptionValue = optionValue[nestedOptionName];
    //       validateOption(nestedOptionName, nestedOptionValue);
    //     }
    //   }
    // };

    // //  upcoming code is based on IntersectionObserver calculations of the root bounds
    // this._helpers.parseString = (string) => {
    //   const parsedString = string.split(/\s+/).map((margin) => {
    //     const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
    //     return { value: parseFloat(parts[1]), unit: parts[2] };
    //   });

    //   return parsedString;
    // };
    // this._helpers.parseRootMargin = (rootMargins) => {
    //   var marginString = rootMargins || '0px';
    //   var margins = this._helpers.parseString(marginString);
    //   // Handles shorthand.
    //   margins[1] = margins[1] || margins[0];
    //   margins[2] = margins[2] || margins[0];
    //   margins[3] = margins[3] || margins[1];

    //   return margins;
    // };
    // this._helpers.expandRectByRootMargin = (rect, rootMargins) => {
    //   const margins = this._helpers.parseRootMargin(rootMargins).map((margin, i) => {
    //     return margin.unit == 'px' ? margin.value : (margin.value * (i % 2 ? rect.width : rect.height)) / 100;
    //   });
    //   const newRect = {
    //     top: rect.top - margins[0],
    //     right: rect.right + margins[1],
    //     bottom: rect.bottom + margins[2],
    //     left: rect.left - margins[3],
    //   };
    //   newRect.width = newRect.right - newRect.left;
    //   newRect.height = newRect.bottom - newRect.top;

    //   return newRect;
    // };
    // this._helpers.getRootRect = (rootMargins) => {
    //   let rootRect;
    //   if (this._root && !this._helpers.isDoc(this._root)) {
    //     rootRect = this._helpers.boundsMinusScrollbar(this._root);
    //     return this._helpers.expandRectByRootMargin(rootRect, rootMargins);
    //   }
    //   const doc = this._helpers.isDoc(this._root) ? this._root : document;
    //   const html = doc.documentElement;
    //   const body = doc.body;
    //   rootRect = {
    //     top: 0,
    //     left: 0,
    //     right: html.clientWidth || body.clientWidth,
    //     width: html.clientWidth || body.clientWidth,
    //     bottom: html.clientHeight || body.clientHeight,
    //     height: html.clientHeight || body.clientHeight,
    //   };

    //   return this._helpers.expandRectByRootMargin(rootRect, rootMargins);
    // };
  }
}
