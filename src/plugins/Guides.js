import { guideDefaultParams } from '../constants';
import { getParents, is, mergeOptions } from '../helpers.js';

class Guides {
  constructor(it) {
    this._registerIntersectionTrigger(it);
    return this;
  }

  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }

  init(options) {
    this.options = is.object(options) ? options : {};
    this._guides = [];

    this._addResizeListener();
    this.update();
  }

  _addResizeListener() {
    this._onResizeHandler = this.update; //Update guides
    this._utils.getRoot().addEventListener('resize', this._onResizeHandler, false);
  }
  _removeResizeListener() {
    this._utils.getRoot().removeEventListener('resize', this._onResizeHandler, false);
  }

  createGuides() {
    const isVirtical = this._utils.isVirtical();
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
          value: isVirtical ? (triggerGuide ? '0px' : !this._it._root ? '25px' : '0px') : '5px',
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
      this._guides.push(guide);
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

        const tBounds = isTrigger ? trigger.getBoundingClientRect() : this._utils.getRootRect(this._it.observer.rootMargin);
        const rBounds = (this._it._root ?? document.body).getBoundingClientRect();

        const triggerDiffs = isVirtical
          ? {
              x: tBounds.right - guideBounds.right,
              y: tBounds.top + position * tBounds.height - guideBounds.top,
            }
          : {
              x: tBounds.left + position * tBounds.width - guideBounds.left,
              y: tBounds.top - guideBounds.top,
            };
        const rootDiffs = isVirtical
          ? enter
            ? {
                x: rBounds.right - guideBounds.left,
                y: tBounds.bottom - guideBounds.bottom,
              }
            : {
                x: rBounds.right - guideBounds.left,
                y: tBounds.top - guideBounds.top,
              }
          : enter
          ? {
              x: tBounds.right - guideBounds.right,
              y: rBounds.bottom - guideBounds.top,
            }
          : { x: tBounds.left - guideBounds.left, y: rBounds.bottom - guideBounds.top };

        const diffs = isTrigger ? triggerDiffs : rootDiffs;

        setTranslateProp(diffs.x, diffs.y);
      };

      //Root Guide
      if (!triggerGuide) {
        setProp(guide, isVirtical ? 'width' : 'height', this._it._isViewport ? (isVirtical ? '100vw' : '100vh') : '100px');
        setProp(guide, 'position', this._it._isViewport ? 'fixed' : 'absolute');
        this._it._isViewport && !isVirtical && setProp(guide, 'top', '0px');

        //the root is not the viewport and it is an element
        if (!this._it._isViewport) positionGuide(false);
        return;
      }
      //Trigger guide
      positionGuide();
      //RePosition the guide on every parent Scroll
      getParents(trigger).forEach((parent) => {
        if (!is.scrollable(parent)) return;

        parent.addEventListener('scroll', () => positionGuide(), false);
      });
    };
    //Guides Parameters
    const parseGuidesParams = (params) => {
      let guideParams = guideDefaultParams;
      if (is.object(params)) {
        guideParams = mergeOptions(guideParams, params);
      }
      return guideParams;
    };
    //Guides Parameters
    const guideParams = parseGuidesParams(this.options);
    //Create Root Guides
    const guideTextPrefix = this._it.name;

    createGuide({
      triggerGuide: false,
      enter: true,
      position: `${this._it._positionsData.rEP.value}${this._it._positionsData.rEP.unit}`,
      text: `${guideTextPrefix} ${guideParams.enter.root.text}`,
      color: guideParams.enter.root.color,
      backgroundColor: guideParams.enter.root.backgroundColor,
    });
    createGuide({
      triggerGuide: false,
      enter: false,
      position: `${this._it._positionsData.rLP.value}${this._it._positionsData.rLP.unit}`,
      text: `${guideTextPrefix} ${guideParams.leave.root.text}`,
      color: guideParams.leave.root.color,
      backgroundColor: guideParams.leave.root.backgroundColor,
    });
    //Create Triggers Guides
    this._it.triggers.forEach((trigger) => {
      const { enter, leave } = this._utils.getTriggerData(trigger);
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
  }

  removeGuides = () => {
    this._guides.forEach((guide) => guide && guide.remove());
    this._guides = [];
  };

  update = () => {
    this.removeGuides();
    this.createGuides();
  };

  kill = () => {
    this._removeResizeListener();
    this.removeGuides();

    this._it.guides = null;

    this._it = null;
    this._utils = null;
  };
}

export { Guides as default };
