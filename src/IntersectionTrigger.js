/* eslint-disable no-fallthrough */

import { defaultInsOptions, triggerStates } from './constants';
import Helpers from './Helpers';
import Utils from './Utils';

const instances = [];
let instanceID = 0;

class IntersectionTrigger {
  constructor(options = {}) {
    this._userOptions = options;
    this.triggers = [];
    this._triggersData = new WeakMap();
    this._guidesInstance = null;
    //
    this._helpers = new Helpers(this);
    this._utils = new Utils(this);
    //
    this.id = instanceID;
    instanceID++;
    instances.push(this);
    //
    this._setStates();
    this._setInstance();
  }

  _setStates() {
    this._states = {};
    this._states.hasInit = false;
  }

  _addScrollListener() {
    const root = this._helpers.getRoot();
    !!this._onScrollHandler && root.removeEventListener('scroll', this._onScrollHandler, false);

    this._onScrollHandler = (event) => {
      //Invoke all onScroll triggers Functions
      this.triggers.forEach((trigger) => {
        const onScrollFun = this._utils.getTriggerStates(trigger)?.onScroll;
        this._helpers.is.function(onScrollFun) && onScrollFun(trigger);
      });
      //Invoke custom function
      this._helpers.is.function(this.onScroll) && this.onScroll(event, this);
    };

    root.addEventListener('scroll', this._onScrollHandler, false);
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
    //Name of IntersectionTrigger instance
    this.name = this._helpers.is.string(this._options.name)
      ? this._options.name
      : this._helpers.throwError('name parameter must be a string.');

    this._root = (!!this._options.root && this._utils.parseQuery(this._options.root, 'root')) || null;
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

    //Refreash guides
    this._guidesInstance && this._guidesInstance.refresh();

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
    this._guidesInstance && this._guidesInstance.refresh();

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
    //Remove all triggers
    this.triggers = [];
    //Remove all guides from DOM
    this.removeGuides();
    //Remove from instances
    const instanceIndex = instances.indexOf(this);
    ~instanceIndex && instances.splice(instanceIndex, 1);
  }

  addGuides(guidesIns) {
    if (!this._helpers.is.inObject(guidesIns, '_registerIntersectionTrigger')) this._helpers.throwError('Invalid Guides Instance.');

    guidesIns._registerIntersectionTrigger(this);
    guidesIns.refresh();
    this._guidesInstance = guidesIns;
    return this;
  }

  removeGuides() {
    this._guidesInstance && this._guidesInstance.kill();
    this._guidesInstance = null;
    return this;
  }
}

IntersectionTrigger.instances = instances;

export { IntersectionTrigger as default };
