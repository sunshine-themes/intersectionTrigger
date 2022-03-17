/* eslint-disable no-fallthrough */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-invalid-this */
/*
 * ScrollTrigger 1.0.0
 * https://sunshine-themes.com/scrollTrigger
 *
 * @license Copyright 2022, Sunshine. All rights reserved.
 * Subject to the terms at https://sunshine-themes.com/scrollTrigger/standard-license or for
 * members, the agreement issued with that membership.
 * @author: Sherif magdy, https://sunshine-themes.com
 */
class ScrollTrigger {
    //Private Props
    #defaultOptions;
    #userOptions;
    #options;
    #states;
    #triggersData;
    #observerOptions;
    #helpers;
    #positions;
    #root;
    #isRootViewport;
    #guides;
    #onResizeHandler;
    #onScrollHandler;
    #rootMargin;
    #threshold;
    #triggerDefaults;
    constructor(options) {
        this.#userOptions = options;
        this.triggers = [];
        this.#triggersData = new WeakMap();
        this.#guides = [];
        //
        this.#setHelpers();
        this.#setStates();
        this.#setInstance();
    }

    #setStates() {
        this.#states = {};

        this.#states.hasInit = false;
    }

    #addScrollListener() {
        const scroller = this.#helpers.getScroller();
        !!this.#onScrollHandler && scroller.removeEventListener('scroll', this.#onScrollHandler, false);

        this.#onScrollHandler = (event) => {
            //Invoke all onScroll triggers Functions
            this.triggers.forEach((trigger) => {
                const onScrollFun = this.#helpers.getTriggerStates(trigger)?.onScroll;
                this.#helpers.isFunction(onScrollFun) && onScrollFun(trigger);
            });
            //Invoke custom function
            this.#helpers.isFunction(this.onScroll) && this.onScroll(event, this);
        };

        scroller.addEventListener('scroll', this.#onScrollHandler, false);
    }
    #addResizeListener() {
        !!this.#onResizeHandler && removeEventListener('resize', this.#onResizeHandler, false);

        this.#onResizeHandler = () => {
            this.#helpers.removeGuides();
            this.#helpers.createGuides();
        };
        addEventListener('resize', this.#onResizeHandler, false);
    }

    #setInstance() {
        //Default Options for instance
        this.#defaultOptions = {
            //Defaults for every trigger
            defaults: {
                once: false,
                onEnter: null,
                onLeave: null,
                onEnterBack: null,
                onLeaveBack: null,
            },
            enter: '0% 100%',
            leave: '100% 0%',
            name: '',
            scroller: null,
            onScroll: null,
            guides: false,
            axis: 'y',
        };

        this.#helpers.validateOptions(this.#userOptions);
        this.#options = this.#helpers.mergeOptions(this.#defaultOptions, this.#userOptions);

        //Scroll Axis
        this.axis = this.#helpers.isString(this.#options.axis)
            ? this.#options.axis
            : this.#helpers.throwError('axis parameter must be a string.');
        //Name of ScrollTrigger instance
        this.name = this.#helpers.isString(this.#options.name)
            ? this.#options.name
            : this.#helpers.throwError('name parameter must be a string.');

        this.#root = (!!this.#options.scroller && this.#helpers.parseQuery(this.#options.scroller, 'root')) || null;
        this.#positions = this.#helpers.parsePositions(this.#options.enter, this.#options.leave);

        //Add onScroll custom handler
        this.onScroll = this.#options.onScroll;

        //Create trigger defaults
        this.#triggerDefaults = {
            once: this.#options.defaults.once,
            enter: this.#positions.triggerEnterPosition.value,
            leave: this.#positions.triggerLeavePosition.value,
            onEnter: this.#options.defaults.onEnter,
            onLeave: this.#options.defaults.onLeave,
            onEnterBack: this.#options.defaults.onEnterBack,
            onLeaveBack: this.#options.defaults.onLeaveBack,
        };

        //Creates root margin
        this.#helpers.setRootMargin();
        //Creates an IntersectionObserver
        this.#createInstance();

        return this;
    }

    #observerCallback = (entries, observer) => {
        const { ref, refOpposite, length } = this.#helpers.dirProps();
        for (const entry of entries) {
            const trigger = entry.target;
            const triggerBounds = entry.boundingClientRect;
            const isIntersecting = entry.isIntersecting;
            const intersectionRatio = entry.intersectionRatio;
            ///////
            this.rootBounds = entry.rootBounds || this.#helpers.getRootRect(observer.rootMargin);
            const rootLength = this.rootBounds[length];
            const rootToTarget = rootLength / triggerBounds[length];
            //////
            const { enter, leave, onEnter, onLeave, onLeaveBack } = this.#helpers.getTriggerData(trigger);
            const { hasEnteredFromOneSides, onScroll } = this.#helpers.getTriggerStates(trigger);
            ///////
            const isTriggerLarger = triggerBounds[length] >= rootLength;
            const isTSPLarger = enter > rootToTarget;
            const isTEPLarger = 1 - leave > rootToTarget;
            const initOnScrollFun = isTriggerLarger && (isTSPLarger || isTEPLarger);
            const isOnScrollFunRunning = !!onScroll;

            //At init & Intersecting cases
            const tSPIsBtwn =
                triggerBounds[ref] + enter * triggerBounds[length] < this.rootBounds[refOpposite] &&
                triggerBounds[ref] + enter * triggerBounds[length] > this.rootBounds[ref];
            const tEPIsBtwn =
                triggerBounds[ref] + leave * triggerBounds[length] < this.rootBounds[refOpposite] &&
                triggerBounds[ref] + leave * triggerBounds[length] > this.rootBounds[ref];
            const tSPIsUp = triggerBounds[ref] + enter * triggerBounds[length] < this.rootBounds[ref];
            const tEPIsDown = triggerBounds[ref] + leave * triggerBounds[length] > this.rootBounds[refOpposite];
            const tEPIsUp =
                triggerBounds[ref] + leave * triggerBounds[length] < this.rootBounds[ref] &&
                intersectionRatio < 1 - leave;

            //At init & is not intersecting cases
            const tTIsUp = triggerBounds[ref] < this.rootBounds[ref];
            const tBIsUp = triggerBounds[refOpposite] < this.rootBounds[ref];

            switch (true) {
                case !this.#states.hasInit:
                    switch (true) {
                        case !isIntersecting && tTIsUp && tBIsUp:
                            //Invoke onEnter Function
                            this.#helpers.onTriggerEnter(trigger, {
                                enterFun: onEnter,
                                enterProp: 'hasEntered',
                                leaveProp: 'hasLeftBack',
                            });
                            // Then Invoking onLeave Function
                            this.#helpers.onTriggerLeave(trigger, {
                                leaveFun: onLeave,
                                leaveProp: 'hasLeft',
                            });
                            break;
                        case isIntersecting:
                            switch (true) {
                                case tSPIsBtwn || tEPIsBtwn || (tSPIsUp && tEPIsDown):
                                    //Invoke onEnter Function
                                    this.#helpers.onTriggerEnter(trigger, {
                                        enterFun: onEnter,
                                        enterProp: 'hasEntered',
                                        leaveProp: 'hasLeftBack',
                                    });
                                    break;
                                case tEPIsUp:
                                    //Invoke onEnter Function
                                    this.#helpers.onTriggerEnter(trigger, {
                                        enterFun: onEnter,
                                        enterProp: 'hasEntered',
                                        leaveProp: 'hasLeftBack',
                                    });
                                    // Then Invoking onLeave Function
                                    this.#helpers.onTriggerLeave(trigger, {
                                        leaveFun: onLeave,
                                        leaveProp: 'hasLeft',
                                    });
                                    break;
                            }

                            if (initOnScrollFun)
                                this.#helpers.setTriggerStates(trigger, {
                                    onScroll: this.#helpers.toggleActions,
                                });

                            break;
                    }
                    break;
                case !isIntersecting:
                    if (isOnScrollFunRunning)
                        this.#helpers.setTriggerStates(trigger, {
                            onScroll: null,
                        });

                    switch (true) {
                        case hasEnteredFromOneSides && triggerBounds[refOpposite] < this.rootBounds[ref]:
                            this.#helpers.onTriggerLeave(trigger, {
                                leaveFun: onLeave,
                                leaveProp: 'hasLeft',
                            });
                            break;
                        case hasEnteredFromOneSides && triggerBounds[ref] > this.rootBounds[refOpposite]:
                            this.#helpers.onTriggerLeave(trigger, {
                                leaveFun: onLeaveBack,
                                leaveProp: 'hasLeftBack',
                            });
                            break;
                    }
                    break;
                case isIntersecting && !isOnScrollFunRunning:
                    this.#helpers.toggleActions(trigger);

                    initOnScrollFun &&
                        this.#helpers.setTriggerStates(trigger, {
                            onScroll: this.#helpers.toggleActions,
                        });

                    break;
            }
        }
        //Reset #states.hasInit state
        this.#states.hasInit = true;
    };

    #createInstance() {
        //Creates observer threshold
        this.#helpers.setThreshold();

        this.#observerOptions = {
            root: this.#root,
            rootMargin: this.#rootMargin,
            threshold: this.#threshold,
        };

        this.observer = new IntersectionObserver(this.#observerCallback, this.#observerOptions);

        this.#root = this.observer.root;
        this.rootBounds = this.#helpers.getRootRect(this.observer.rootMargin);
        this.#isRootViewport = this.#helpers.isRootViewport(this.#root);

        //Init Event listener
        this.#addScrollListener();
        this.#addResizeListener();
    }

    add(trigger = {}, options = {}) {
        const toAddTriggers = this.#helpers.parseQuery(trigger);

        this.#helpers.validateOptions(options);

        'enter' in options && (options.enter = this.#helpers.setPositionData(options.enter).value);
        'leave' in options && (options.leave = this.#helpers.setPositionData(options.leave).value);

        const triggerStates = {
            hasEntered: false,
            hasEnteredBack: false,
            hasLeft: true,
            hasLeftBack: true,
            hasFirstEntered: false,
            onScroll: null,
        };
        const triggerParams = { ...this.#triggerDefaults, ...options, states: { ...triggerStates } };
        //
        this.triggers = [...this.triggers, ...toAddTriggers];
        this.triggers = [...new Set(this.triggers)]; //to remove any duplicates
        //
        let shouldReCreateObserver = false;
        [options.enter, options.leave].forEach(
            (position) => !this.#threshold.some((value) => position === value) && (shouldReCreateObserver = true)
        );

        if (shouldReCreateObserver) {
            //Disconnect the IntersctionObserver
            this.#disconnect();
            //1- set trigger data
            toAddTriggers.forEach((trigger) => this.#helpers.setTriggerData(trigger, triggerParams));
            //2- recreate the observer
            this.#createInstance();
            //3- reobserve the triggers
            this.triggers.forEach((trigger) => this.observer.observe(trigger));
        } else {
            toAddTriggers.forEach((trigger) => {
                this.#helpers.setTriggerData(trigger, triggerParams);
                this.observer.observe(trigger);
            });
        }

        //Add guides
        this.#helpers.removeGuides();
        this.#helpers.createGuides();

        return this;
    }

    remove(trigger = {}) {
        let toRemoveTriggers = this.#helpers.parseQuery(trigger);
        toRemoveTriggers.forEach((trigger) => {
            this.#helpers.deleteTriggerData(trigger);
            this.observer.unobserve(trigger);
        });

        const updatedStoredTriggers = this.triggers.filter((storedTrigger) => {
            const isInRemoveTriggers = toRemoveTriggers.some((toRemoveTrigger) => storedTrigger === toRemoveTrigger);

            return !isInRemoveTriggers;
        });

        this.triggers = updatedStoredTriggers;

        //Add guides
        this.#helpers.removeGuides();
        this.#helpers.createGuides();

        return this;
    }
    #disconnect() {
        //Disconnect the IntersctionObserver
        this.observer && this.observer.disconnect();
        this.observer = null;
    }

    kill() {
        //Disconnect the IntersctionObserver
        this.#disconnect();
        //Remove event listeners
        removeEventListener('scroll', this.#onScrollHandler, false);
        removeEventListener('resize', this.#onResizeHandler, false);
        //Remove all trigger
        this.triggers = [];
        //Remove all guides from DOM
        this.#helpers.removeGuides();
    }

    #setHelpers() {
        this.#helpers = {};
        this.#helpers.isFunction = (value) => 'function' === typeof value;
        this.#helpers.isString = (value) => 'string' === typeof value;
        this.#helpers.isBoolean = (value) => 'boolean' === typeof value;
        this.#helpers.isObject = (value) => value && 'object' === typeof value && !(value instanceof Array);
        this.#helpers.isPercent = (value) => value && value.includes('%');
        this.#helpers.isPixel = (value) => value && value.includes('px');
        this.#helpers.isArray = (value) => value instanceof Array;
        this.#helpers.isElement = (value) => value instanceof HTMLElement || value instanceof Element;
        this.#helpers.isRootViewport = (root) => !root;
        this.#helpers.isDoc = (node) => node && node.nodeType === 9;
        this.#helpers.getBoundsProp = (element, prop) => element && element.getBoundingClientRect()[prop];
        this.#helpers.getScroller = () => (!!this.#root ? this.#root : window);
        this.#helpers.isScrollable = (element, dir = null) =>
            dir
                ? 'y' === dir
                    ? element.scrollHeight > element.clientHeight
                    : element.scrollWidth > element.clientWidth
                : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
        this.#helpers.getScrollValue = (element, dir) => ('y' === dir ? element.scrollHeight : element.scrollWidth);
        this.#helpers.isVirtical = () => 'y' === this.axis;
        this.#helpers.isHorizontal = () => 'x' === this.axis;
        this.#helpers.dirProps = () =>
            this.#helpers.isVirtical()
                ? { ref: 'top', length: 'height', refOpposite: 'bottom', innerLength: innerHeight }
                : { ref: 'left', length: 'width', refOpposite: 'right', innerLength: innerWidth };
        this.#helpers.roundFloat = (value, precision) => {
            this.#helpers.isString(value) && (value = parseFloat(value));
            const multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        };
        this.#helpers.getParents = (element) => {
            let parents = [];
            for (
                element = element.parentNode;
                element && element !== document && element !== document.documentElement;
                element = element.parentNode
            ) {
                parents.push(element);
            }
            return parents;
        };
        this.#helpers.boundsMinusScrollbar = (element) => {
            const bounds = element.getBoundingClientRect();

            const { top, bottom, right, left, height, width, x, y } = bounds;
            return {
                top,
                left,
                height,
                width,
                x,
                y,
                right: right - (right - left - element.clientWidth),
                bottom: bottom - (bottom - top - element.clientHeight),
            };
        };
        this.#helpers.mergeOptions = (def, custom) => {
            const defaultOptions = def;
            const options = custom;
            Object.entries(defaultOptions).forEach(([k, v]) => {
                if (this.#helpers.isObject(v)) {
                    this.#helpers.mergeOptions(v, (options[k] = options[k] || {}));
                } else if (!(k in options)) {
                    options[k] = v;
                }
            });
            return options;
        };
        this.#helpers.throwError = (message) => {
            throw new Error(message);
        };
        /////////////////
        this.#helpers.setRootMargin = () => {
            const extendMargin = this.#helpers.getScrollValue(
                this.#helpers.isRootViewport(this.#root) ? document.body : this.#root,
                this.#helpers.isVirtical() ? 'x' : 'y'
            );
            this.#rootMargin = this.#helpers.isVirtical()
                ? `${this.#positions.rootEndPosition.strValue} ${extendMargin}px ${
                      this.#positions.rootStartPosition.strValue
                  } ${extendMargin}px`
                : `${extendMargin}px ${this.#positions.rootStartPosition.strValue} ${extendMargin}px ${
                      this.#positions.rootEndPosition.strValue
                  }`;
        };
        this.#helpers.setThreshold = () => {
            this.#threshold = [
                0,
                this.#triggerDefaults.enter,
                this.#triggerDefaults.leave,
                this.#helpers.roundFloat(1 - this.#triggerDefaults.leave, 2),
                1,
            ];
            this.triggers.forEach((trigger) => {
                const { enter, leave } = this.#helpers.getTriggerData(trigger);
                this.#threshold.push(enter, leave, this.#helpers.roundFloat(1 - leave, 2));
            });

            this.#threshold = [...new Set(this.#threshold)]; //to remove duplicates
        };
        this.#helpers.parseQuery = (query, type = 'trigger') => {
            const isTrigger = 'trigger' === type;
            let output = isTrigger ? [] : {};

            if (!isTrigger) {
                output = this.#helpers.isString(query)
                    ? document.querySelector(query)
                    : this.#helpers.isElement(query)
                    ? query
                    : this.#helpers.throwError('scroller parameter must be a valid selector or an element');
                return output;
            }
            switch (true) {
                case this.#helpers.isString(query):
                    output = [...document.querySelectorAll(query)];
                    break;
                case this.#helpers.isArray(query):
                    output = query;
                    break;
                case this.#helpers.isElement(query):
                    output = [query];
                    break;
                default:
                    this.#helpers.throwError(
                        'trigger parameter must be a valid selector, an element or array of elements'
                    );
                    break;
            }

            return output;
        };

        // Positions parsing
        this.#helpers.validatePosition = (name, pos) => {
            this.#helpers.isFunction(pos) && (pos = pos(this));
            if (!this.#helpers.isString(pos)) this.#helpers.throwError(`${name} parameter must be a string.`);
            return pos;
        };
        this.#helpers.setPositionData = (offset, isTrigger = true, isEnter = true) => {
            offset = this.#helpers.validatePosition(isEnter ? 'enter' : 'leave', offset);

            let value = offset.trim();
            const isPercentage = this.#helpers.isPercent(value);
            const isPixel = this.#helpers.isPixel(value);

            let position = {};

            value = isPercentage ? value.replace('%', '') : isPixel ? value.replace('px', '') : value;
            value = this.#helpers.roundFloat(value);

            position.type = isPercentage ? 'percent' : 'pixel';

            //Trigger Positions
            if (isPercentage && isTrigger) {
                position.value = value / 100;
                position.strValue = `${value}%`;
                return position;
            }
            //Root Positions
            const { length, innerLength } = this.#helpers.dirProps();
            const rootLength = this.#root ? this.#helpers.getBoundsProp(this.#root, length) : innerLength;
            switch (true) {
                case isPercentage && isEnter:
                    position.value = this.#helpers.roundFloat(value / 100 - 1, 2);
                    position.strValue = `${position.value * 100}%`;
                    break;
                case isPercentage && !isEnter:
                    position.value = -value / 100;
                    position.strValue = `${position.value * 100}%`;
                    break;
                case isPixel && isEnter:
                    position.value = this.#helpers.roundFloat(value - rootLength, 2);
                    position.strValue = `${position.value}px`;
                    break;
                case isPixel && !isEnter:
                    position.value = -value;
                    position.strValue = `${-value}px`;
                    break;
            }

            position.guide = offset;

            return position;
        };
        this.#helpers.parsePositions = (enter = '', leave = '') => {
            enter = this.#helpers.validatePosition('enter', enter);
            leave = this.#helpers.validatePosition('leave', leave);

            let triggerEnterPosition = {},
                triggerLeavePosition = {},
                rootStartPosition = {},
                rootEndPosition = {};

            const enterPositions = enter.trim().split(/\s+/g, 2);
            const leavePositions = leave.trim().split(/\s+/g, 2);
            const positions = [...enterPositions, ...leavePositions];

            positions.forEach((offset, i) => {
                switch (i) {
                    case 0:
                        //Element enter Point
                        triggerEnterPosition = this.#helpers.setPositionData(offset);
                        break;
                    case 1:
                        //Root enter Point
                        rootStartPosition = this.#helpers.setPositionData(offset, false);
                        break;
                    case 2:
                        //Element leave Point
                        triggerLeavePosition = this.#helpers.setPositionData(offset);
                        break;
                    case 3:
                        //Root End Point
                        rootEndPosition = this.#helpers.setPositionData(offset, false, false);
                        break;
                }
            });

            const parsedPositions = {
                triggerLeavePosition,
                triggerEnterPosition,
                rootEndPosition,
                rootStartPosition,
            };

            return parsedPositions;
        };

        //Trigger Data actions
        this.#helpers.deleteTriggerData = (trigger) => {
            //Reset data of a trigger
            this.#triggersData.delete(trigger);
        };
        this.#helpers.hasTriggerData = (trigger, prop = null) => {
            const hasData = this.#triggersData.has(trigger);
            if (prop) {
                return hasData && prop in this.#helpers.getTriggerData(trigger);
            }

            return hasData;
        };
        this.#helpers.getTriggerData = (trigger, prop = null) => {
            if (prop) {
                //Get data property of a trigger
                return this.#helpers.hasTriggerData(trigger, prop) ? this.#triggersData.get(trigger)[prop] : {};
            }
            //Get data of a trigger
            return (this.#helpers.hasTriggerData(trigger) && this.#triggersData.get(trigger)) || {};
        };
        this.#helpers.setTriggerData = (trigger, value, props = null) => {
            if (props) {
                //Set data property of a trigger
                const storedValue = this.#helpers.getTriggerData(trigger);

                if (this.#helpers.isObject(storedValue)) {
                    this.#triggersData.set(trigger, { ...storedValue, ...props });
                }
                return;
            }
            //Set data of a trigger
            this.#triggersData.set(trigger, value);
        };
        this.#helpers.getTriggerStates = (trigger) => {
            const triggerStates = this.#helpers.getTriggerData(trigger, 'states');
            const hasEnteredFromOneSides = triggerStates.hasEntered || triggerStates.hasEnteredBack;

            return {
                ...triggerStates,
                hasEnteredFromOneSides,
            };
        };
        this.#helpers.setTriggerStates = (trigger, value = {}) => {
            const triggerData = this.#helpers.getTriggerData(trigger);
            const triggerStates = triggerData && { ...triggerData.states, ...value };

            this.#helpers.setTriggerData(trigger, null, { states: triggerStates });
        };
        //
        this.#helpers.onTriggerEnter = (trigger, data) => {
            //Get Stored trigger data
            const { hasFirstEntered } = this.#helpers.getTriggerStates(trigger);

            //Invoke Enter Function
            this.#helpers.isFunction(data.enterFun) && data.enterFun(trigger, this);

            const triggerProps = hasFirstEntered
                ? {
                      [data.enterProp]: true,
                      [data.leaveProp]: false,
                  }
                : { [data.enterProp]: true, hasLeft: false, hasLeftBack: false };

            //Reset trigger data props
            this.#helpers.setTriggerStates(trigger, triggerProps);
            //Reset hasFirstEntered state
            if (!hasFirstEntered) this.#helpers.setTriggerStates(trigger, { hasFirstEntered: true });
        };
        this.#helpers.onTriggerLeave = (trigger, data) => {
            //Get Stored trigger data
            const { once } = this.#helpers.getTriggerData(trigger);
            const { hasFirstEntered } = this.#helpers.getTriggerStates(trigger);
            //Invoke leave function
            this.#helpers.isFunction(data.leaveFun) && data.leaveFun(trigger, this);
            //Reset trigger data props
            this.#helpers.setTriggerStates(trigger, {
                [data.leaveProp]: true,
                hasEntered: false,
                hasEnteredBack: false,
            });
            //Remove the instance if once is true
            once && hasFirstEntered && this.remove(trigger);
        };

        this.#helpers.toggleActions = (trigger) => {
            const triggerBounds = trigger.getBoundingClientRect();
            this.rootBounds = this.#helpers.getRootRect(this.observer.rootMargin);

            const { enter, leave, onEnter, onEnterBack, onLeave, onLeaveBack } = this.#helpers.getTriggerData(trigger);
            const { hasEnteredFromOneSides, hasLeft, hasLeftBack } = this.#helpers.getTriggerStates(trigger);
            const { ref, refOpposite, length } = this.#helpers.dirProps();
            let hasCaseMet = true;

            switch (true) {
                case hasLeftBack &&
                    triggerBounds[ref] + enter * triggerBounds[length] <= this.rootBounds[refOpposite] &&
                    triggerBounds[ref] + enter * triggerBounds[length] > this.rootBounds[ref]:
                    //Enter case
                    this.#helpers.onTriggerEnter(trigger, {
                        enterFun: onEnter,
                        enterProp: 'hasEntered',
                        leaveProp: 'hasLeftBack',
                    });
                    break;
                case hasEnteredFromOneSides &&
                    triggerBounds[ref] + leave * triggerBounds[length] <= this.rootBounds[ref]:
                    //Leave case
                    this.#helpers.onTriggerLeave(trigger, {
                        leaveFun: onLeave,
                        leaveProp: 'hasLeft',
                    });
                    break;
                case hasLeft &&
                    triggerBounds[ref] + leave * triggerBounds[length] >= this.rootBounds[ref] &&
                    triggerBounds[ref] + leave * triggerBounds[length] < this.rootBounds[refOpposite]:
                    //EnterBack case
                    this.#helpers.onTriggerEnter(trigger, {
                        enterFun: onEnterBack,
                        enterProp: 'hasEnteredBack',
                        leaveProp: 'hasLeft',
                    });
                    break;
                case hasEnteredFromOneSides &&
                    triggerBounds[ref] + enter * triggerBounds[length] >= this.rootBounds[refOpposite]:
                    //LeaveBack case
                    this.#helpers.onTriggerLeave(trigger, {
                        leaveFun: onLeaveBack,
                        leaveProp: 'hasLeftBack',
                    });
                    break;
                default:
                    hasCaseMet = false;
                    break;
            }

            return hasCaseMet;
        };

        //Create Guides
        this.#helpers.createGuides = () => {
            const guideParam = this.#options.guides;
            if (this.#helpers.isBoolean(guideParam) && !guideParam) return;

            const isVirtical = this.#helpers.isVirtical();
            const createGuide = (options) => {
                const { triggerGuide, trigger, enter, position, text, color, backgroundColor } = options;
                const setProp = (el, prop, value) => (el.style[prop] = value);

                const guide = document.createElement('div');
                const guideWidth = isVirtical ? '100px' : '1px';
                const guideHeight = isVirtical ? '1px' : '100px';
                const guidePositionRef = isVirtical ? 'top' : 'left';

                setProp(guide, 'width', guideWidth);
                setProp(guide, 'height', guideHeight);
                setProp(guide, 'position', 'absolute');
                setProp(guide, 'zIndex', '9999');
                setProp(guide, 'backgroundColor', backgroundColor);
                setProp(guide, guidePositionRef, position);
                //Create the text element
                const createText = () => {
                    let virticalAlignment = {
                        dir: isVirtical ? (enter ? 'bottom' : 'top') : 'bottom',
                        value: isVirtical ? '5px' : '25px',
                    };
                    let horizontalAlignment = {
                        dir: isVirtical ? 'right' : enter ? 'right' : 'left',
                        value: isVirtical ? (triggerGuide ? '0px' : !this.#root ? '25px' : '0px') : '5px',
                    };

                    const textElement = document.createElement('span');
                    textElement.innerText = text;
                    guide.appendChild(textElement);

                    setProp(textElement, 'position', 'absolute');
                    setProp(textElement, 'color', color);
                    setProp(textElement, 'fontSize', '16px');
                    setProp(textElement, 'fontWeight', 'bold');
                    setProp(textElement, 'backgroundColor', backgroundColor);
                    setProp(textElement, 'padding', '5px');
                    setProp(textElement, 'width', 'max-content');
                    setProp(textElement, virticalAlignment.dir, virticalAlignment.value);
                    setProp(textElement, horizontalAlignment.dir, horizontalAlignment.value);
                };
                createText();
                //Add guide to the stored guides
                this.#guides.push(guide);
                //Append the guide to the document body
                document.body.append(guide);

                const setTranslateProp = (diffX, diffY) => {
                    const parts = [...guide.style.transform.matchAll(/(-?\d*\.?\d+)\s*(px|%)?/g)];
                    const translateXInPx = parts.length ? parts[0][1] : 0;
                    const translateYInPx = parts.length > 1 ? parts[1][1] : 0;

                    let x = parseFloat(diffX) + parseFloat(translateXInPx);
                    let y = parseFloat(diffY) + parseFloat(translateYInPx);

                    setProp(guide, 'transform', `translate(${x}px,${y}px)`);
                };
                const positionGuide = (isTrigger = true) => {
                    const guideBounds = guide.getBoundingClientRect();

                    const targetBounds = isTrigger
                        ? this.#helpers.boundsMinusScrollbar(trigger)
                        : this.#helpers.getRootRect(this.observer.rootMargin);
                    //Root Bounds without Margins
                    const rBoundsNoMargins = this.#root
                        ? this.#helpers.boundsMinusScrollbar(this.#root)
                        : this.#helpers.boundsMinusScrollbar(document.body);

                    const triggerDiffs = isVirtical
                        ? {
                              x: targetBounds.right - guideBounds.right,
                              y: targetBounds.top + position * targetBounds.height - guideBounds.top,
                          }
                        : {
                              x: targetBounds.left + position * targetBounds.width - guideBounds.left,
                              y: targetBounds.top - guideBounds.top,
                          };
                    const rootDiffs = isVirtical
                        ? enter
                            ? {
                                  x: rBoundsNoMargins.right - guideBounds.left,
                                  y: targetBounds.bottom - guideBounds.bottom,
                              }
                            : {
                                  x: rBoundsNoMargins.right - guideBounds.left,
                                  y: targetBounds.top - guideBounds.top,
                              }
                        : enter
                        ? {
                              x: targetBounds.right - guideBounds.right,
                              y: rBoundsNoMargins.bottom - guideBounds.top,
                          }
                        : { x: targetBounds.left - guideBounds.left, y: rBoundsNoMargins.bottom - guideBounds.top };

                    const diffs = isTrigger ? triggerDiffs : rootDiffs;

                    setTranslateProp(diffs.x, diffs.y);
                };

                //Root Guide
                if (!triggerGuide) {
                    setProp(
                        guide,
                        isVirtical ? 'width' : 'height',
                        this.#isRootViewport ? (isVirtical ? '100vw' : '100vh') : '100px'
                    );
                    setProp(guide, 'position', this.#isRootViewport ? 'fixed' : 'absolute');
                    this.#isRootViewport && !isVirtical && setProp(guide, 'top', '0px');

                    //the root is not the viewport and it is an element
                    if (!this.#isRootViewport) positionGuide(false);
                    return;
                }
                //Trigger guide
                positionGuide();
                //RePosition the guide on every parent Scroll
                this.#helpers.getParents(trigger).forEach((parent) => {
                    if (!this.#helpers.isScrollable(parent)) return;

                    parent.addEventListener('scroll', (event) => positionGuide(), false);
                });
            };
            //Guides Parameters
            const parseGuidesParams = (params) => {
                let guideParams = {
                    enter: {
                        trigger: {
                            backgroundColor: 'rgb(0, 149, 0)',
                            color: '#000',
                            text: 'Enter',
                        },
                        root: {
                            backgroundColor: 'rgb(0, 149, 0)',
                            color: '#000',
                            text: 'Root Enter',
                        },
                    },
                    leave: {
                        trigger: {
                            backgroundColor: '#ff0000',
                            color: '#000',
                            text: 'Leave',
                        },
                        root: {
                            backgroundColor: '#ff0000',
                            color: '#000',
                            text: 'Root Leave',
                        },
                    },
                };
                if (this.#helpers.isObject(params)) {
                    guideParams = this.#helpers.mergeOptions(guideParams, params);
                }
                return guideParams;
            };
            //Guides Parameters
            const guideParams = parseGuidesParams(this.#options.guides);
            //Create Root Guides
            const guideTextPrefix = this.name;

            createGuide({
                triggerGuide: false,
                enter: true,
                position: this.#positions.rootStartPosition.guide,
                text: `${guideTextPrefix} ${guideParams.enter.root.text}`,
                color: guideParams.enter.root.color,
                backgroundColor: guideParams.enter.root.backgroundColor,
            });
            createGuide({
                triggerGuide: false,
                enter: false,
                position: this.#positions.rootEndPosition.guide,
                text: `${guideTextPrefix} ${guideParams.leave.root.text}`,
                color: guideParams.leave.root.color,
                backgroundColor: guideParams.leave.root.backgroundColor,
            });
            //Create Triggers Guides
            this.triggers.forEach((trigger) => {
                const { enter, leave } = this.#helpers.getTriggerData(trigger);
                createGuide({
                    triggerGuide: true,
                    trigger,
                    enter: true,
                    position: enter,
                    text: `${guideTextPrefix} ${guideParams.enter.trigger.text}`,
                    color: guideParams.enter.trigger.color,
                    backgroundColor: guideParams.enter.trigger.backgroundColor,
                });
                createGuide({
                    triggerGuide: true,
                    trigger,
                    enter: false,
                    position: leave,
                    text: `${guideTextPrefix} ${guideParams.leave.trigger.text}`,
                    color: guideParams.leave.trigger.color,
                    backgroundColor: guideParams.leave.trigger.backgroundColor,
                });
            });
        };
        this.#helpers.removeGuides = () => {
            this.#guides.forEach((guide) => guide && guide.remove());
            this.#guides = [];
        };
        /**
         * Valide user options
         *
         *  @param {object} options
         *  @return {void}
         */
        this.#helpers.validateOptions = (options) => {
            for (const optionName in options) {
                const optionValue = options[optionName];
                const validateOption = (optionName, optionValue) => {
                    switch (optionName) {
                        case 'once':
                            !this.#helpers.isBoolean(optionValue) &&
                                this.#helpers.throwError('once parameter must be a boolean.');
                            break;
                        case 'axis':
                        case 'name':
                            !this.#helpers.isString(optionValue) &&
                                this.#helpers.throwError('axis and name parameters must be strings.');
                            break;
                        case 'guides':
                            !this.#helpers.isBoolean(optionValue) &&
                                !this.#helpers.isObject(optionValue) &&
                                this.#helpers.throwError('guides parameter must be a boolean or object.');
                            break;
                        case 'onEnter':
                        case 'onEnterBack':
                        case 'onLeave':
                        case 'onLeaveBack':
                        case 'onScroll':
                            !this.#helpers.isFunction(optionValue) &&
                                this.#helpers.throwError(
                                    'onEnter, onLeave, onEnterBack, onLeaveBack and onScroll parameters must be functions.'
                                );
                            break;
                    }
                };
                if (!this.#helpers.isObject(optionValue)) {
                    validateOption(optionName, optionValue);
                    continue;
                }

                for (const nestedOptionName in optionValue) {
                    const nestedOptionValue = optionValue[nestedOptionName];
                    validateOption(nestedOptionName, nestedOptionValue);
                }
            }
        };

        //  upcoming code is based on IntersectionObserver calculations of the root bounds
        this.#helpers.parseString = (string) => {
            const parsedString = string.split(/\s+/).map((margin) => {
                const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
                return { value: parseFloat(parts[1]), unit: parts[2] };
            });

            return parsedString;
        };
        this.#helpers.parseRootMargin = (rootMargins) => {
            var marginString = rootMargins || '0px';
            var margins = this.#helpers.parseString(marginString);
            // Handles shorthand.
            margins[1] = margins[1] || margins[0];
            margins[2] = margins[2] || margins[0];
            margins[3] = margins[3] || margins[1];

            return margins;
        };
        this.#helpers.expandRectByRootMargin = (rect, rootMargins) => {
            const margins = this.#helpers.parseRootMargin(rootMargins).map((margin, i) => {
                return margin.unit == 'px' ? margin.value : (margin.value * (i % 2 ? rect.width : rect.height)) / 100;
            });
            const newRect = {
                top: rect.top - margins[0],
                right: rect.right + margins[1],
                bottom: rect.bottom + margins[2],
                left: rect.left - margins[3],
            };
            newRect.width = newRect.right - newRect.left;
            newRect.height = newRect.bottom - newRect.top;

            return newRect;
        };
        this.#helpers.getRootRect = (rootMargins) => {
            let rootRect;
            if (this.#root && !this.#helpers.isDoc(this.#root)) {
                rootRect = this.#helpers.boundsMinusScrollbar(this.#root);
                return this.#helpers.expandRectByRootMargin(rootRect, rootMargins);
            }
            const doc = this.#helpers.isDoc(this.#root) ? this.#root : document;
            const html = doc.documentElement;
            const body = doc.body;
            rootRect = {
                top: 0,
                left: 0,
                right: html.clientWidth || body.clientWidth,
                width: html.clientWidth || body.clientWidth,
                bottom: html.clientHeight || body.clientHeight,
                height: html.clientHeight || body.clientHeight,
            };

            return this.#helpers.expandRectByRootMargin(rootRect, rootMargins);
        };
    }
}
