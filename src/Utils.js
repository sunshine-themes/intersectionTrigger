export default class Utils {
  constructor(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._helpers = this._it._helpers;
    this.setUtils();
    return this;
  }
  setUtils() {
    this.setRootMargin = () => {
      const extendMargin = this._helpers.getScrollValue(
        this._helpers.is.rootViewport(this._it._root) ? document.body : this._it._root,
        this._helpers.is.virtical() ? 'x' : 'y'
      );
      return this._helpers.is.virtical()
        ? `${this._it._positions.rootEndPosition.strValue} ${extendMargin}px ${this._it._positions.rootStartPosition.strValue} ${extendMargin}px`
        : `${extendMargin}px ${this._it._positions.rootStartPosition.strValue} ${extendMargin}px ${this._it._positions.rootEndPosition.strValue}`;
    };
    this.setThreshold = () => {
      let threshold = [
        0,
        this._it._triggerParams.enter,
        this._it._triggerParams.leave,
        this._helpers.roundFloat(1 - this._it._triggerParams.leave, 2),
        1,
      ];
      this._it.triggers.forEach((trigger) => {
        const { enter, leave } = this.getTriggerData(trigger);
        threshold.push(enter, leave, this._helpers.roundFloat(1 - leave, 2));
      });

      return [...new Set(threshold)]; //to remove duplicates
    };
    this.parseQuery = (query, type = 'trigger') => {
      const isTrigger = 'trigger' === type;
      let output = isTrigger ? [] : {};

      if (!isTrigger) {
        output = this._helpers.is.string(query)
          ? document.querySelector(query)
          : this._helpers.is.element(query)
          ? query
          : this._helpers.throwError('root parameter must be a valid selector or an element');
        return output;
      }
      switch (true) {
        case this._helpers.is.string(query):
          output = [...document.querySelectorAll(query)];
          break;
        case this._helpers.is.array(query):
          output = query;
          break;
        case this._helpers.is.element(query):
          output = [query];
          break;
        default:
          this._helpers.throwError('trigger parameter must be a valid selector, an element or array of elements');
          break;
      }

      return output;
    };

    // Positions parsing
    this.validatePosition = (name, pos) => {
      this._helpers.is.function(pos) && (pos = pos(this));
      if (!this._helpers.is.string(pos)) this._helpers.throwError(`${name} parameter must be a string.`);
      return pos;
    };
    this.setPositionData = (offset, isTrigger = true, isEnter = true) => {
      offset = this.validatePosition(isEnter ? 'enter' : 'leave', offset);

      let value = offset.trim();
      const isPercentage = this._helpers.is.percent(value);
      const isPixel = this._helpers.is.pixel(value);

      let position = {};

      value = isPercentage ? value.replace('%', '') : isPixel ? value.replace('px', '') : value;
      value = this._helpers.roundFloat(value);

      position.type = isPercentage ? 'percent' : 'pixel';

      //Trigger Positions
      if (isPercentage && isTrigger) {
        position.value = value / 100;
        position.strValue = `${value}%`;
        return position;
      }
      //Root Positions
      const { length, innerLength } = this._helpers.dirProps();
      const rootLength = this._it._root ? this._helpers.getBoundsProp(this._it._root, length) : innerLength;
      switch (true) {
        case isPercentage && isEnter:
          position.value = this._helpers.roundFloat(value / 100 - 1, 2);
          position.strValue = `${position.value * 100}%`;
          break;
        case isPercentage && !isEnter:
          position.value = -value / 100;
          position.strValue = `${position.value * 100}%`;
          break;
        case isPixel && isEnter:
          position.value = this._helpers.roundFloat(value - rootLength, 2);
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
            triggerEnterPosition = this.setPositionData(offset);
            break;
          case 1:
            //Root enter Point
            rootStartPosition = this.setPositionData(offset, false);
            break;
          case 2:
            //Element leave Point
            triggerLeavePosition = this.setPositionData(offset);
            break;
          case 3:
            //Root End Point
            rootEndPosition = this.setPositionData(offset, false, false);
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

        if (this._helpers.is.object(storedValue)) {
          this._it._triggersData.set(trigger, { ...storedValue, ...props });
        }
        return;
      }
      //Set data of a trigger
      this._it._triggersData.set(trigger, value);
    };
    this.getTriggerStates = (trigger) => {
      const triggerStates = this.getTriggerData(trigger, 'states');
      const hasEnteredFromOneSide = triggerStates.hasEntered || triggerStates.hasEnteredBack;

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
    //
    this.onTriggerEnter = (trigger, data) => {
      //Get Stored trigger data
      const { hasFirstEntered } = this.getTriggerStates(trigger);

      //Invoke Enter Function
      this._helpers.is.function(data.enterFun) && data.enterFun(trigger, this);

      const triggerProps = hasFirstEntered
        ? {
            [data.enterProp]: true,
            [data.leaveProp]: false,
          }
        : { [data.enterProp]: true, hasLeft: false, hasLeftBack: false };

      //Reset trigger data props
      this.setTriggerStates(trigger, triggerProps);
      //Reset hasFirstEntered state
      if (!hasFirstEntered) this.setTriggerStates(trigger, { hasFirstEntered: true });
    };
    this.onTriggerLeave = (trigger, data) => {
      //Get Stored trigger data
      const { once } = this.getTriggerData(trigger);
      const { hasFirstEntered } = this.getTriggerStates(trigger);
      //Invoke leave function
      this._helpers.is.function(data.leaveFun) && data.leaveFun(trigger, this);
      //Reset trigger data props
      this.setTriggerStates(trigger, {
        [data.leaveProp]: true,
        hasEntered: false,
        hasEnteredBack: false,
      });
      //Remove the instance if once is true
      once && hasFirstEntered && this._it.remove(trigger);
    };

    this.toggleActions = (trigger) => {
      const tB = trigger.getBoundingClientRect(); //trigger Bounds
      this._it.rootBounds = this.getRootRect(this._it.observer.rootMargin);
      const rB = this._it.rootBounds; //root Bounds

      const { enter, leave, onEnter, onEnterBack, onLeave, onLeaveBack } = this.getTriggerData(trigger);
      const { hasEnteredFromOneSide, hasLeft, hasLeftBack } = this.getTriggerStates(trigger);
      const { ref, refOpposite, length } = this._helpers.dirProps();
      let hasCaseMet = true;

      switch (true) {
        case hasLeftBack && tB[ref] + enter * tB[length] <= rB[refOpposite] && tB[ref] + enter * tB[length] > rB[ref]:
          //Enter case
          this.onTriggerEnter(trigger, {
            enterFun: onEnter,
            enterProp: 'hasEntered',
            leaveProp: 'hasLeftBack',
          });
          break;
        case hasEnteredFromOneSide && tB[ref] + leave * tB[length] <= rB[ref]:
          //Leave case
          this.onTriggerLeave(trigger, {
            leaveFun: onLeave,
            leaveProp: 'hasLeft',
          });
          break;
        case hasLeft && tB[ref] + leave * tB[length] >= rB[ref] && tB[ref] + leave * tB[length] < rB[refOpposite]:
          //EnterBack case
          this.onTriggerEnter(trigger, {
            enterFun: onEnterBack,
            enterProp: 'hasEnteredBack',
            leaveProp: 'hasLeft',
          });
          break;
        case hasEnteredFromOneSide && tB[ref] + enter * tB[length] >= rB[refOpposite]:
          //LeaveBack case
          this.onTriggerLeave(trigger, {
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

    /**
     * Valide user options
     *
     *  @param {object} options
     *  @return {void}
     */
    this.validateOptions = (options) => {
      for (const optionName in options) {
        const optionValue = options[optionName];
        const validateOption = (optionName, optionValue) => {
          switch (optionName) {
            case 'once':
              !this._helpers.is.boolean(optionValue) && this._helpers.throwError('once parameter must be a boolean.');
              break;
            case 'axis':
            case 'name':
              !this._helpers.is.string(optionValue) && this._helpers.throwError('axis and name parameters must be strings.');
              break;
            case 'guides':
              !this._helpers.is.boolean(optionValue) &&
                !this._helpers.is.object(optionValue) &&
                this._helpers.throwError('guides parameter must be a boolean or object.');
              break;
            case 'onEnter':
            case 'onEnterBack':
            case 'onLeave':
            case 'onLeaveBack':
            case 'onScroll':
              !this._helpers.is.function(optionValue) &&
                this._helpers.throwError('onEnter, onLeave, onEnterBack, onLeaveBack and onScroll parameters must be functions.');
              break;
          }
        };
        if (!this._helpers.is.object(optionValue)) {
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
    this.parseString = (string) => {
      const parsedString = string.split(/\s+/).map((margin) => {
        const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
        return { value: parseFloat(parts[1]), unit: parts[2] };
      });

      return parsedString;
    };
    this.parseRootMargin = (rootMargins) => {
      var marginString = rootMargins || '0px';
      var margins = this.parseString(marginString);
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
      if (this._it._root && !this._helpers.is.doc(this._it._root)) {
        rootRect = this._helpers.boundsMinusScrollbar(this._it._root);
        return this.expandRectByRootMargin(rootRect, rootMargins);
      }
      const doc = this._helpers.is.doc(this._it._root) ? this._it._root : document;
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
