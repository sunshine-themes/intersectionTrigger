import { boundsMinusScrollbar, getBoundsProp, getScrollValue, is, parseString, roundFloat, throwError } from './helpers';

export default class Utils {
  constructor(intersectionTrigger) {
    this._it = intersectionTrigger;

    this.setUtils();
    return this;
  }
  setUtils() {
    this.isVirtical = () => 'y' === this._it.axis;
    this.isRootViewport = () => !this._it._root;
    this.getRoot = () => this._it._root ?? window;
    this.dirProps = () =>
      this.isVirtical()
        ? { ref: 'top', length: 'height', refOpposite: 'bottom', innerLength: innerHeight }
        : { ref: 'left', length: 'width', refOpposite: 'right', innerLength: innerWidth };
    this.setRootMargin = () => {
      const extendMargin = getScrollValue(this.isRootViewport() ? document.body : this._it._root, this.isVirtical() ? 'x' : 'y');
      return this.isVirtical()
        ? `${this._it._positions.rootLeavePosition.strValue} ${extendMargin}px ${this._it._positions.rootEnterPosition.strValue} ${extendMargin}px`
        : `${extendMargin}px ${this._it._positions.rootEnterPosition.strValue} ${extendMargin}px ${this._it._positions.rootLeavePosition.strValue}`;
    };
    this.setThreshold = () => {
      let threshold = [
        0,
        this._it._triggerParams.enter,
        this._it._triggerParams.leave,
        roundFloat(1 - this._it._triggerParams.leave, 2),
        1,
      ];
      this._it.triggers.forEach((trigger) => {
        const { enter, leave } = this.getTriggerData(trigger);
        threshold.push(enter, leave, roundFloat(1 - leave, 2));
      });

      return [...new Set(threshold)]; //to remove duplicates
    };
    this.parseQuery = (q, errLog) => {
      switch (true) {
        case is.string(q):
          return [...document.querySelectorAll(q)];
        case is.array(q):
          return q;
        case is.element(q):
          return [q];
        default:
          throwError(`${errLog} parameter must be a valid selector, an element or array of elements`);
      }
    };
    this.customParseQuery = (query, type = 'trigger') => {
      const isTrigger = 'trigger' === type;
      let output = isTrigger ? [] : {};

      if (!isTrigger) {
        output = is.string(query)
          ? document.querySelector(query)
          : is.element(query)
          ? query
          : throwError('root parameter must be a valid selector or an element');
        return output;
      }
      return this.parseQuery(query, 'trigger');
    };

    // Positions parsing
    this.validatePosition = (name, pos) => {
      is.function(pos) && (pos = pos(this._it));
      if (!is.string(pos)) throwError(`${name} parameter must be a string.`);
      return pos;
    };
    this.setPositionData = (offset, isTrigger = true, isEnter = true) => {
      offset = this.validatePosition(isEnter ? 'enter' : 'leave', offset);

      let value = offset.trim();
      const isPercentage = is.percent(value);
      const isPixel = is.pixel(value);

      let position = {};

      value = isPercentage ? value.replace('%', '') : isPixel ? value.replace('px', '') : value;
      value = roundFloat(value);

      position.type = isPercentage ? 'percent' : 'pixel';

      //Trigger Positions
      if (isPercentage && isTrigger) {
        position.value = value / 100;
        position.strValue = `${value}%`;
        return position;
      }
      //Root Positions
      const { length, innerLength } = this.dirProps();
      const rootLength = this._it._root ? getBoundsProp(this._it._root, length) : innerLength;
      switch (true) {
        case isPercentage && isEnter:
          position.value = roundFloat(value / 100 - 1, 2);
          position.strValue = `${position.value * 100}%`;
          break;
        case isPercentage && !isEnter:
          position.value = -value / 100;
          position.strValue = `${position.value * 100}%`;
          break;
        case isPixel && isEnter:
          position.value = roundFloat(value - rootLength, 2);
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
    this.parsePositions = (enter = '', leave = '') => {
      enter = this.validatePosition('enter', enter);
      leave = this.validatePosition('leave', leave);

      const enterPositions = enter.trim().split(/\s+/g, 2);
      const leavePositions = leave.trim().split(/\s+/g, 2);
      const positions = [...enterPositions, ...leavePositions];

      return {
        triggerEnterPosition: this.setPositionData(positions[0]),
        rootEnterPosition: this.setPositionData(positions[1], false),
        triggerLeavePosition: this.setPositionData(positions[2]),
        rootLeavePosition: this.setPositionData(positions[3], false, false),
      };
    };

    //Trigger Data actions
    this.deleteTriggerData = (trigger) => {
      //Reset data of a trigger
      this._it._triggersData.delete(trigger);
    };
    this.hasTriggerData = (trigger, prop = null) => {
      const hasData = this._it._triggersData.has(trigger);
      if (prop) {
        return hasData && prop in this.getTriggerData(trigger);
      }

      return hasData;
    };
    this.getTriggerData = (trigger, prop = null) => {
      if (prop) {
        //Get data property of a trigger
        return this.hasTriggerData(trigger, prop) ? this._it._triggersData.get(trigger)[prop] : {};
      }
      //Get data of a trigger
      return (this.hasTriggerData(trigger) && this._it._triggersData.get(trigger)) || {};
    };
    this.setTriggerData = (trigger, value, props = null) => {
      if (props) {
        //Set data property of a trigger
        const storedValue = this.getTriggerData(trigger);

        if (is.object(storedValue)) {
          this._it._triggersData.set(trigger, { ...storedValue, ...props });
        }
        return;
      }
      //Set data of a trigger
      this._it._triggersData.set(trigger, value);
    };
    this.getTriggerStates = (trigger, prop = null) => {
      const triggerStates = this.getTriggerData(trigger, 'states');
      const hasEnteredFromOneSide = triggerStates.hasEntered || triggerStates.hasEnteredBack;

      if (prop) {
        //Get a property of a trigger states
        return triggerStates[prop];
      }
      return {
        ...triggerStates,
        hasEnteredFromOneSide,
      };
    };
    this.setTriggerStates = (trigger, value = {}) => {
      const triggerData = this.getTriggerData(trigger);
      const triggerStates = triggerData && { ...triggerData.states, ...value };

      this.setTriggerData(trigger, null, { states: triggerStates });
    };
    this.setTriggerScrollStates = (trigger, prop, value = null) => {
      const triggerScrollStates = this.getTriggerStates(trigger, 'onScroll');
      triggerScrollStates[prop] = value;

      this.setTriggerStates(trigger, { onscroll: { ...triggerScrollStates } });

      //Update
      if (value) {
        if (0 === this._it._states.runningScrollCbs) this._it.addScrollListener(this._it._onScrollHandler);
        this._it._states.runningScrollCbs++;
        return;
      }

      if (0 < this._it._states.runningScrollCbs) this._it._states.runningScrollCbs--;
      if (0 === this._it._states.runningScrollCbs) this._it.removeScrollListener(this._it._onScrollHandler);
    };
    //
    this.onTriggerEnter = (trigger, event = 'Enter') => {
      //Get Stored trigger data
      const { hasEnteredOnce } = this.getTriggerStates(trigger);
      const { onEnter, onEnterBack, toggleClass, animation } = this.getTriggerData(trigger);
      //
      const isEnterEvent = 'Enter' === event;
      const data = {
        callback: isEnterEvent ? onEnter : onEnterBack,
        enterProp: isEnterEvent ? 'hasEntered' : 'hasEnteredBack',
        leaveProp: isEnterEvent ? 'hasLeftBack' : 'hasLeft',
        eventIndex: isEnterEvent ? 0 : 2,
      };
      //Invoke Enter Functions
      data.callback(trigger, this);
      this._it.toggleClass && toggleClass && this._it.toggleClass.toggle(trigger, toggleClass, data.eventIndex);
      this._it.animation && animation && this._it.animation.animate(trigger, animation, data.eventIndex);

      const triggerProps = hasEnteredOnce
        ? {
            [data.enterProp]: true,
            [data.leaveProp]: false,
          }
        : { [data.enterProp]: true, hasLeft: false, hasLeftBack: false };

      //Reset trigger data props
      this.setTriggerStates(trigger, triggerProps);
      //Reset hasEnteredOnce state
      if (!hasEnteredOnce) this.setTriggerStates(trigger, { hasEnteredOnce: true });
    };
    this.onTriggerLeave = (trigger, event = 'Leave') => {
      //Get Stored trigger data
      const { once } = this.getTriggerData(trigger);
      const { hasEnteredOnce } = this.getTriggerStates(trigger);
      const { onLeave, onLeaveBack, toggleClass, animation } = this.getTriggerData(trigger);
      //
      const isLeaveEvent = 'Leave' === event;
      const data = {
        callback: isLeaveEvent ? onLeave : onLeaveBack,
        leaveProp: isLeaveEvent ? 'hasLeft' : 'hasLeftBack',
        eventIndex: isLeaveEvent ? 1 : 3,
      };
      //Invoke leave functions
      data.callback(trigger, this);
      this._it.toggleClass && toggleClass && this._it.toggleClass.toggle(trigger, toggleClass, data.eventIndex);
      this._it.animation && animation && this._it.animation.animate(trigger, animation, data.eventIndex);

      //Reset trigger data props
      this.setTriggerStates(trigger, {
        [data.leaveProp]: true,
        hasEntered: false,
        hasEnteredBack: false,
      });
      //Remove the instance if once is true
      once && hasEnteredOnce && this._it.remove(trigger);
    };

    this.toggleActions = (trigger) => {
      const tB = trigger.getBoundingClientRect(); //trigger Bounds
      this._it.rootBounds = this.getRootRect(this._it.observer.rootMargin);
      const rB = this._it.rootBounds; //root Bounds

      const { enter, leave } = this.getTriggerData(trigger);
      const { hasEnteredFromOneSide, hasLeft, hasLeftBack } = this.getTriggerStates(trigger);
      const { ref, refOpposite, length } = this.dirProps();
      let hasCaseMet = true;

      switch (true) {
        case hasLeftBack && tB[ref] + enter * tB[length] <= rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref]:
          //Enter case
          this.onTriggerEnter(trigger);
          break;
        case hasEnteredFromOneSide && tB[ref] + leave * tB[length] <= rB[ref]:
          //Leave case
          this.onTriggerLeave(trigger);
          break;
        case hasLeft && tB[ref] + leave * tB[length] >= rB[ref] && tB[ref] + leave * tB[length] < rB[refOpposite]:
          //EnterBack case
          this.onTriggerEnter(trigger, 'EnterBack');
          break;
        case hasEnteredFromOneSide && tB[ref] + enter * tB[length] >= rB[refOpposite]:
          //LeaveBack case
          this.onTriggerLeave(trigger, 'hasLeftBack');
          break;
        default:
          hasCaseMet = false;
          break;
      }

      return hasCaseMet;
    };

    //  upcoming code is based on IntersectionObserver calculations of the root bounds. All rights reseved (https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).

    this.parseRootMargin = (rootMargins) => {
      var marginString = rootMargins || '0px';
      var margins = parseString(marginString);
      // Handles shorthand.
      margins[1] = margins[1] || margins[0];
      margins[2] = margins[2] || margins[0];
      margins[3] = margins[3] || margins[1];

      return margins;
    };
    this.expandRectByRootMargin = (rect, rootMargins) => {
      const margins = this.parseRootMargin(rootMargins).map((margin, i) => {
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
    this.getRootRect = (rootMargins) => {
      let rootRect;
      if (this._it._root && !is.doc(this._it._root)) {
        rootRect = boundsMinusScrollbar(this._it._root);
        return this.expandRectByRootMargin(rootRect, rootMargins);
      }
      const doc = is.doc(this._it._root) ? this._it._root : document;
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

      return this.expandRectByRootMargin(rootRect, rootMargins);
    };
  }
}
