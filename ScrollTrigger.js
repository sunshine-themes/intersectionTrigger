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
    #onScrollFuns;
    #observerOptions;
    #helpers;
    #positions;
    #triggerStartPos;
    #triggerEndPos;
    #root;
    #observerCallback;
    #isRootViewport;
    #guides;
    #onResizeHandler;
    #onScrollHandler;
    constructor(options) {
        this.#userOptions = options;
        this.triggers = [];
        this.#triggersData = new WeakMap();
        this.#guides = [];
        //
        this.#onScrollFuns = { triggers: new WeakMap(), guides: new WeakMap(), custom: null };
        //
        this.#setStates();
        this.#setHelpers();
        this.#addScrollListener();
        this.#setInstance();
    }

    #setStates() {
        this.#states = {};

        this.#states.hasFirstEntered = false;
        this.#states.hasInit = false;
        this.#states.hasGuidesEventsInit = false;
    }

    #addScrollListener() {
        this.#onScrollHandler = (event) => {
            //Invoke all onScroll Functions
            for (const funKey in this.#onScrollFuns) {
                switch (funKey) {
                    case 'guides':
                    case 'triggers':
                        {
                            const weakMap = this.#onScrollFuns[funKey];
                            const invokeFuns = (storedElements, isTriggers = true) => {
                                storedElements.forEach(
                                    (element) =>
                                        weakMap.has(element) && weakMap.get(element)(isTriggers ? element : event)
                                );
                            };
                            invokeFuns(this.triggers);
                            invokeFuns(this.#guides, false);
                        }
                        break;
                    case 'custom':
                        this.#onScrollFuns[funKey] = this.onScroll;
                        if (this.#helpers.isFunction(this.onScroll)) this.onScroll(event, this);
                        break;
                }
            }
        };

        addEventListener('scroll', this.#onScrollHandler, false);
    }
    #addResizeListener() {
        this.#onResizeHandler = () => {
            this.#helpers.removeGuides();
            this.#helpers.createGuides();
        };
        addEventListener('resize', this.#onResizeHandler, false);
    }

    #setInstance() {
        this.#defaultOptions = {
            once: false,
            name: '',
            trigger: null,
            scroller: null,
            guides: false,
            enter: '0% 100%',
            leave: '100% 0%',
            direction: 'y',
            onEnter: null,
            onLeave: null,
            onEnterBack: null,
            onLeaveBack: null,
            onScroll: null,
        };

        this.#options = {
            ...this.#defaultOptions,
            ...this.#userOptions,
        };

        //Add actions props
        this.onEnter = this.#options.onEnter;
        this.onLeave = this.#options.onLeave;
        this.onEnterBack = this.#options.onEnterBack;
        this.onLeaveBack = this.#options.onLeaveBack;
        this.onScroll = this.#options.onScroll;
        //Scroll Direction
        this.direction = this.#helpers.isString(this.#options.direction)
            ? this.#options.direction
            : this.#helpers.throwError('direction parameter must be a string.');
        //Name of ScrollTrigger instance
        this.name = this.#helpers.isString(this.#options.name)
            ? this.#options.name
            : this.#helpers.throwError('name parameter must be a string.');

        this.#root = this.#options.scroller ? this.#helpers.parseQuery(this.#options.scroller, 'root') : null;
        this.#positions = this.#helpers.parsePositions(this.#options.enter, this.#options.leave);
        this.#triggerStartPos = this.#positions.triggerEnterPosition.value;
        this.#triggerEndPos = this.#positions.triggerLeavePosition.value;

        this.#observerCallback = (entries, observer) => {
            const { ref, refOpposite, length } = this.#helpers.dirProps();
            entries.forEach((entry) => {
                const trigger = entry.target;
                const triggerBounds = entry.boundingClientRect;
                const isIntersecting = entry.isIntersecting;
                const intersectionRatio = entry.intersectionRatio;
                ///////
                this.rootBounds = entry.rootBounds || this.#helpers.getRootRect(observer.rootMargin);
                const rootLength = this.rootBounds[length];
                const rootToTarget = rootLength / triggerBounds[length];
                ///////
                const isTriggerLarger = triggerBounds[length] >= rootLength;
                const isTSPLarger = this.#triggerStartPos > rootToTarget;
                const isTEPLarger = 1 - this.#triggerEndPos > rootToTarget;
                const initOnScrollFun = isTriggerLarger && (isTSPLarger || isTEPLarger);
                ///////
                if (!this.#helpers.hasTriggerData(trigger)) {
                    //Creating a triggerData as WeakMap
                    const triggerData = {
                        hasEntered: false,
                        hasEnteredBack: false,
                        hasLeft: true,
                        hasLeftBack: true,
                        currentScrollValue: null,
                        startingScrollValue: null,
                    };
                    this.#helpers.setTriggerData(trigger, triggerData);
                }

                const { hasEnteredFromOneSides, isOnScrollFunRunning } = this.#helpers.getTriggerStates(trigger);

                /////////////
                /////At init & Intersecting cases
                //////////
                const tSPIsBtwn =
                    triggerBounds[ref] + this.#triggerStartPos * triggerBounds[length] < this.rootBounds[refOpposite] &&
                    triggerBounds[ref] + this.#triggerStartPos * triggerBounds[length] > this.rootBounds[ref];
                const tEPIsBtwn =
                    triggerBounds[ref] + this.#triggerEndPos * triggerBounds[length] < this.rootBounds[refOpposite] &&
                    triggerBounds[ref] + this.#triggerEndPos * triggerBounds[length] > this.rootBounds[ref];
                const tSPIsUp =
                    triggerBounds[ref] + this.#triggerStartPos * triggerBounds[length] < this.rootBounds[ref];
                const tEPIsDown =
                    triggerBounds[ref] + this.#triggerEndPos * triggerBounds[length] > this.rootBounds[refOpposite];
                const tEPIsUp =
                    triggerBounds[ref] + this.#triggerEndPos * triggerBounds[length] < this.rootBounds[ref] &&
                    intersectionRatio < 1 - this.#triggerEndPos;
                /////////////////
                //At init & is not intersecting cases
                ////////
                const tTIsUp = triggerBounds[ref] < this.rootBounds[ref];
                const tBIsUp = triggerBounds[refOpposite] < this.rootBounds[ref];
                ///////
                switch (true) {
                    case !this.#states.hasInit:
                        switch (true) {
                            case !isIntersecting && tTIsUp && tBIsUp:
                                //Invoke onEnter Function
                                this.#helpers.onTriggerEnter(trigger, {
                                    enterFun: this.onEnter,
                                    enterProp: 'hasEntered',
                                    leaveProp: 'hasLeftBack',
                                });
                                // Then Invoking onLeave Function
                                this.#helpers.onTriggerLeave(trigger, {
                                    leaveFun: this.onLeave,
                                    leaveProp: 'hasLeft',
                                });
                                break;
                            case isIntersecting:
                                switch (true) {
                                    case tSPIsBtwn || tEPIsBtwn || (tSPIsUp && tEPIsDown):
                                        //Invoke onEnter Function
                                        this.#helpers.onTriggerEnter(trigger, {
                                            enterFun: this.onEnter,
                                            enterProp: 'hasEntered',
                                            leaveProp: 'hasLeftBack',
                                        });
                                        break;
                                    case tEPIsUp:
                                        //Invoke onEnter Function
                                        this.#helpers.onTriggerEnter(trigger, {
                                            enterFun: this.onEnter,
                                            enterProp: 'hasEntered',
                                            leaveProp: 'hasLeftBack',
                                        });
                                        // Then Invoking onLeave Function
                                        this.#helpers.onTriggerLeave(trigger, {
                                            leaveFun: this.onLeave,
                                            leaveProp: 'hasLeft',
                                        });
                                    case initOnScrollFun:
                                        this.#helpers.addOnScrollTriggerFun(trigger, (trigger) =>
                                            this.#helpers.onScrollTriggerHandler(trigger)
                                        );
                                }

                                break;
                        }
                        break;
                    case !isIntersecting:
                        switch (true) {
                            case isOnScrollFunRunning:
                                this.#helpers.removeOnScrollTriggerFun(trigger);
                            case hasEnteredFromOneSides && triggerBounds[refOpposite] < this.rootBounds[ref]:
                                this.#helpers.onTriggerLeave(trigger, {
                                    leaveFun: this.onLeave,
                                    leaveProp: 'hasLeft',
                                });
                                break;
                            case hasEnteredFromOneSides && triggerBounds[ref] > this.rootBounds[refOpposite]:
                                this.#helpers.onTriggerLeave(trigger, {
                                    leaveFun: this.onLeaveBack,
                                    leaveProp: 'hasLeftBack',
                                });
                                break;
                        }
                        break;
                    case isIntersecting && !isOnScrollFunRunning:
                        this.#helpers.toggleActions(trigger, triggerBounds, this.rootBounds);

                        if (initOnScrollFun) {
                            this.#helpers.addOnScrollTriggerFun(trigger, (trigger) =>
                                this.#helpers.onScrollTriggerHandler(trigger)
                            );
                        }
                        break;
                }
            });
            //Reset #states.hasInit state
            this.#states.hasInit = true;
        };

        const extendMargin = this.#helpers.getScrollValue(
            this.#helpers.isRootViewport(this.#root) ? document.body : this.#root,
            this.#helpers.isVirtical() ? 'x' : 'y'
        );
        const rootMargin = this.#helpers.isVirtical()
            ? `${this.#positions.rootEndPosition.strValue} ${extendMargin}px ${
                  this.#positions.rootStartPosition.strValue
              } ${extendMargin}px`
            : `${extendMargin}px ${this.#positions.rootStartPosition.strValue} ${extendMargin}px ${
                  this.#positions.rootEndPosition.strValue
              }`;

        this.#observerOptions = {
            root: this.#root,
            rootMargin,
            threshold: [
                0,
                this.#positions.triggerEnterPosition.value,
                this.#positions.triggerLeavePosition.value,
                1 - this.#positions.triggerLeavePosition.value,
                1,
            ],
        };

        this.observer = new IntersectionObserver(this.#observerCallback, this.#observerOptions);

        this.#root = this.observer.root;
        this.rootBounds = this.#helpers.getRootRect(this.observer.rootMargin);
        this.#isRootViewport = this.#helpers.isRootViewport(this.#root);

        //Add trigger
        !!this.#options.trigger && this.add(this.#options.trigger);

        return this;
    }

    add(trigger = {}) {
        if (!trigger)
            this.#helpers.throwError(
                'Invalid trigger , trigger should be a string selector , an element or array of elements.'
            );

        let toAddTriggers = this.#helpers.parseQuery(trigger);

        this.triggers = [...this.triggers, ...toAddTriggers];
        toAddTriggers.forEach((trigger) => {
            this.observer.observe(trigger);
        });

        //Add guides
        this.#helpers.removeGuides();
        this.#helpers.createGuides();

        return this;
    }

    remove(trigger = {}) {
        let toRemoveTriggers = this.#helpers.parseQuery(trigger);
        toRemoveTriggers.forEach((trigger) => {
            this.observer.unobserve(trigger);
        });

        let updateStoredTriggers = this.triggers;

        updateStoredTriggers = updateStoredTriggers.filter((storedTrigger) => {
            const isInRemoveTriggers = toRemoveTriggers.some((toRemoveTrigger) => storedTrigger === toRemoveTrigger);

            return !isInRemoveTriggers;
        });

        this.triggers = updateStoredTriggers;

        //Add guides
        this.#helpers.removeGuides();
        this.#helpers.createGuides();

        return this;
    }

    kill() {
        //Disconnect the IntersctionObserver
        this.observer && this.observer.disconnect();
        this.observer = null;
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
        this.#helpers.isObject = (value) => 'object' === typeof value && !(value instanceof Array);
        this.#helpers.isPercent = (value) => value && value.includes('%');
        this.#helpers.isPixel = (value) => value && value.includes('px');
        this.#helpers.isArray = (value) => value instanceof Array;
        this.#helpers.isElement = (value) => value instanceof HTMLElement || value instanceof Element;
        this.#helpers.isRootViewport = (root) => !root;
        this.#helpers.isDoc = (node) => node && node.nodeType === 9;
        this.#helpers.getBoundsProp = (element, prop) => element && element.getBoundingClientRect()[prop];
        this.#helpers.dirProps = () =>
            this.#helpers.isVirtical()
                ? { ref: 'top', length: 'height', refOpposite: 'bottom', innerLength: innerHeight }
                : { ref: 'left', length: 'width', refOpposite: 'right', innerLength: innerWidth };
        this.#helpers.isScrollable = (element, dir = null) =>
            dir
                ? 'y' === dir
                    ? element.scrollHeight > element.clientHeight
                    : element.scrollWidth > element.clientWidth
                : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
        this.#helpers.getScrollValue = (element, dir) => ('y' === dir ? element.scrollHeight : element.scrollWidth);
        this.#helpers.isVirtical = () => 'y' === this.direction;
        this.#helpers.isHorizontal = () => 'x' === this.direction;
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
        this.#helpers.boundsMinusScrollbar = (element, bounds) => {
            bounds = bounds ?? element.getBoundingClientRect();

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

        this.#helpers.parsePositions = (enter = '', leave = '') => {
            this.#helpers.isFunction(enter) && (enter = enter(this));
            this.#helpers.isFunction(leave) && (leave = leave(this));

            if (!this.#helpers.isString(enter) || !this.#helpers.isString(leave))
                this.#helpers.throwError('The enter or leave parameters must be a string.');

            const { length, innerLength } = this.#helpers.dirProps();
            let triggerEnterPosition = {},
                triggerLeavePosition = {},
                rootStartPosition = {},
                rootEndPosition = {};

            const startPoints = enter.trim().split(/\s+/g, 2);
            const endPoints = leave.trim().split(/\s+/g, 2);
            const positions = [...startPoints, ...endPoints];

            const setPositionData = (offset, isTrigger = true, isStart = true) => {
                let value = offset;
                const isPercentage = this.#helpers.isPercent(value);
                const isPixel = this.#helpers.isPixel(value);
                const rootLength = this.#root ? this.#helpers.getBoundsProp(this.#root, length) : innerLength;

                let position = {};

                value = value.trim();
                value = isPercentage ? value.replace('%', '') : isPixel ? value.replace('px', '') : value;

                position.type = isPercentage ? 'percent' : 'pixel';

                //Trigger Positions
                if (isPercentage && isTrigger) {
                    position.value = value / 100;
                    position.strValue = `${value}%`;
                    return position;
                }
                //Root Positions
                switch (true) {
                    case isPercentage && isStart:
                        position.value = value / 100 - 1;
                        position.strValue = `${position.value * 100}%`;
                        break;
                    case isPercentage && !isStart:
                        position.value = -value / 100;
                        position.strValue = `${position.value * 100}%`;
                        break;
                    case isPixel && isStart:
                        position.value = value - rootLength;
                        position.strValue = `${position.value}px`;
                        break;
                    case isPixel && !isStart:
                        position.value = -value;
                        position.strValue = `${-value}px`;
                        break;
                }

                position.guide = offset;

                return position;
            };

            positions.forEach((offset, i) => {
                switch (i) {
                    case 0:
                        //Element enter Point
                        triggerEnterPosition = setPositionData(offset);
                        break;
                    case 1:
                        //Root enter Point
                        rootStartPosition = setPositionData(offset, false);
                        break;
                    case 2:
                        //Element leave Point
                        triggerLeavePosition = setPositionData(offset);
                        break;
                    case 3:
                        //Root End Point
                        rootEndPosition = setPositionData(offset, false, false);
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
        ////////////
        //Trigger Data actions
        ////////////////
        this.#helpers.deleteTriggerData = (trigger) => {
            //Reset data of a trigger
            this.#triggersData.delete(trigger);
        };
        this.#helpers.hasTriggerData = (trigger, prop = null) => {
            const hasData = this.#triggersData.has(trigger);
            if (prop) {
                return hasData && prop in this.#triggersData.get(trigger);
            }

            return hasData;
        };
        this.#helpers.getTriggerData = (trigger, prop = null) => {
            if (prop) {
                //Get data property of a trigger
                return (this.#helpers.hasTriggerData(trigger, prop) && this.#triggersData.get(trigger)[prop]) ?? {};
            }
            //Get data of a trigger
            return (this.#helpers.hasTriggerData(trigger) && this.#triggersData.get(trigger)) ?? {};
        };
        this.#helpers.setTriggerData = (trigger, value, props = null) => {
            if (props) {
                //Set data property of a trigger
                const storedValue = this.#helpers.getTriggerData(trigger);

                if ('object' === typeof storedValue) {
                    this.#triggersData.set(trigger, { ...storedValue, ...props });
                }
                return;
            }
            //Set data of a trigger
            this.#triggersData.set(trigger, value);
        };
        this.#helpers.getTriggerStates = (trigger) => {
            const hasEntered = this.#helpers.getTriggerData(trigger, 'hasEntered');
            const hasEnteredBack = this.#helpers.getTriggerData(trigger, 'hasEnteredBack');
            const hasEnteredFromOneSides = hasEntered || hasEnteredBack;
            const hasLeft = this.#helpers.getTriggerData(trigger, 'hasLeft');
            const hasLeftBack = this.#helpers.getTriggerData(trigger, 'hasLeftBack');
            const isOnScrollFunRunning = this.#helpers.hasOnScrollTriggerFun(trigger);

            return { hasEntered, hasEnteredBack, hasEnteredFromOneSides, hasLeft, hasLeftBack, isOnScrollFunRunning };
        };
        ///////////////////
        ////////
        this.#helpers.hasOnScrollTriggerFun = (trigger) => this.#onScrollFuns.triggers.has(trigger);
        this.#helpers.addOnScrollTriggerFun = (trigger, fun) => this.#onScrollFuns.triggers.set(trigger, fun);
        this.#helpers.removeOnScrollTriggerFun = (trigger) => this.#onScrollFuns.triggers.delete(trigger);
        ///////////////
        ////////
        this.#helpers.onTriggerEnter = (trigger, data) => {
            //Invoke Enter Function
            this.#helpers.isFunction(data.enterFun) && data.enterFun(trigger, this);
            const triggerProps = this.#states.hasFirstEntered
                ? {
                      [data.enterProp]: true,
                      [data.leaveProp]: false,
                  }
                : { [data.enterProp]: true, hasLeft: false, hasLeftBack: false };

            //Reset trigger data props
            this.#helpers.setTriggerData(trigger, null, triggerProps);
            //Reset hasFirstEntered state
            if (!this.#states.hasFirstEntered) this.#states.hasFirstEntered = true;
        };
        this.#helpers.onTriggerLeave = (trigger, data) => {
            //Invoke leave function
            this.#helpers.isFunction(data.leaveFun) && data.leaveFun(trigger, this);
            //Reset trigger data props
            this.#helpers.setTriggerData(trigger, null, {
                [data.leaveProp]: true,
                hasEntered: false,
                hasEnteredBack: false,
            });
            //Kill the instance if once is true
            if (!this.#helpers.isBoolean(this.#options.once))
                this.#helpers.throwError('once Parameter must be a boolean.');
            this.#options.once && this.#states.hasFirstEntered && this.kill();
        };

        this.#helpers.toggleActions = (trigger, triggerBounds = null, rootBounds = null) => {
            triggerBounds = triggerBounds || trigger.getBoundingClientRect();
            this.rootBounds = rootBounds || this.#helpers.getRootRect(this.observer.rootMargin);

            const { hasEnteredFromOneSides, hasLeft, hasLeftBack } = this.#helpers.getTriggerStates(trigger);
            const { ref, refOpposite, length } = this.#helpers.dirProps();

            let hasCaseMet = true;

            switch (true) {
                case hasLeftBack &&
                    triggerBounds[ref] + this.#triggerStartPos * triggerBounds[length] <=
                        this.rootBounds[refOpposite] &&
                    triggerBounds[ref] + this.#triggerStartPos * triggerBounds[length] > this.rootBounds[ref]:
                    //Enter case
                    this.#helpers.onTriggerEnter(trigger, {
                        enterFun: this.onEnter,
                        enterProp: 'hasEntered',
                        leaveProp: 'hasLeftBack',
                    });
                    break;
                case hasEnteredFromOneSides &&
                    triggerBounds[ref] + this.#triggerEndPos * triggerBounds[length] <= this.rootBounds[ref]:
                    //Leave case
                    this.#helpers.onTriggerLeave(trigger, {
                        leaveFun: this.onLeave,
                        leaveProp: 'hasLeft',
                    });
                    break;
                case hasLeft &&
                    triggerBounds[ref] + this.#triggerEndPos * triggerBounds[length] >= this.rootBounds[ref] &&
                    triggerBounds[ref] + this.#triggerEndPos * triggerBounds[length] < this.rootBounds[refOpposite]:
                    //EnterBack case
                    this.#helpers.onTriggerEnter(trigger, {
                        enterFun: this.onEnterBack,
                        enterProp: 'hasEnteredBack',
                        leaveProp: 'hasLeft',
                    });
                    break;
                case hasEnteredFromOneSides &&
                    triggerBounds[ref] + this.#triggerStartPos * triggerBounds[length] >= this.rootBounds[refOpposite]:
                    //LeaveBack case
                    this.#helpers.onTriggerLeave(trigger, {
                        leaveFun: this.onLeaveBack,
                        leaveProp: 'hasLeftBack',
                    });
                    break;
                default:
                    hasCaseMet = false;
                    break;
            }

            return hasCaseMet;
        };
        this.#helpers.onScrollTriggerHandler = (trigger) => this.#helpers.toggleActions(trigger);
        //////////////////
        //// Create Guides
        //////////////////////
        this.#helpers.createGuides = () => {
            const guideParams = this.#options.guides;
            if (this.#helpers.isBoolean(guideParams) && !guideParams) return;

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
                    if (!this.#isRootViewport) {
                        positionGuide(false);
                        this.#onScrollFuns.guides.set(guide, (event) => positionGuide(false));
                    }
                    return;
                }
                //Trigger guide
                positionGuide();
                //RePosition the guide on every parent Scroll
                this.#helpers.getParents(trigger).forEach((parent) => {
                    if (!this.#helpers.isScrollable(parent)) return;
                    parent === document.body
                        ? this.#onScrollFuns.guides.set(guide, (event) => positionGuide())
                        : parent.addEventListener('scroll', (event) => positionGuide(), false);
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
            const { enter, leave } = parseGuidesParams(this.#options.guides);
            //Create Root Guides
            const guideTextPrefix = this.name;
            createGuide({
                triggerGuide: false,
                enter: true,
                position: this.#positions.rootStartPosition.guide,
                text: `${guideTextPrefix} ${enter.root.text}`,
                color: enter.root.color,
                backgroundColor: enter.root.backgroundColor,
            });
            createGuide({
                triggerGuide: false,
                enter: false,
                position: this.#positions.rootEndPosition.guide,
                text: `${guideTextPrefix} ${leave.root.text}`,
                color: leave.root.color,
                backgroundColor: leave.root.backgroundColor,
            });
            //Create Triggers Guides
            this.triggers.forEach((trigger) => {
                createGuide({
                    triggerGuide: true,
                    trigger,
                    enter: true,
                    position: this.#positions.triggerEnterPosition.value,
                    text: `${guideTextPrefix} ${enter.trigger.text}`,
                    color: enter.trigger.color,
                    backgroundColor: enter.trigger.backgroundColor,
                });
                createGuide({
                    triggerGuide: true,
                    trigger,
                    enter: false,
                    position: this.#positions.triggerLeavePosition.value,
                    text: `${guideTextPrefix} ${leave.trigger.text}`,
                    color: leave.trigger.color,
                    backgroundColor: leave.trigger.backgroundColor,
                });
            });

            //Add event listeners to update the guides
            if (!this.#states.hasGuidesEventsInit) {
                this.#addResizeListener();
                this.#states.hasGuidesEventsInit = true;
            }
        };
        this.#helpers.removeGuides = () => {
            this.#guides.forEach((guide) => guide && guide.remove());
            this.#guides = [];
        };
        /////////////////////////
        ///////
        ////////////////////////
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
