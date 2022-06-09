import { guideDefaultParams } from './constants';

export default class Guides {
  constructor(params) {
    this.params = params;
    this._guides = [];
    return this;
  }

  _registerScrollTrigger(scrollTrigger) {
    this._st = scrollTrigger;
    this._helpers = this._st._helpers;
    this._utils = this._st._utils;
  }

  createGuides() {
    const isVirtical = this._helpers.is.virtical();
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
          value: isVirtical ? (triggerGuide ? '0px' : !this._st._root ? '25px' : '0px') : '5px',
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

        const targetBounds = isTrigger
          ? this._helpers.boundsMinusScrollbar(trigger)
          : this._helpers.getRootRect(this._st.observer.rootMargin);
        //Root Bounds without Margins
        const rBoundsNoMargins = this._st._root
          ? this._helpers.boundsMinusScrollbar(this._st._root)
          : this._helpers.boundsMinusScrollbar(document.body);

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
        setProp(guide, isVirtical ? 'width' : 'height', this._st._isRootViewport ? (isVirtical ? '100vw' : '100vh') : '100px');
        setProp(guide, 'position', this._st._isRootViewport ? 'fixed' : 'absolute');
        this._st._isRootViewport && !isVirtical && setProp(guide, 'top', '0px');

        //the root is not the viewport and it is an element
        if (!this._st._isRootViewport) positionGuide(false);
        return;
      }
      //Trigger guide
      positionGuide();
      //RePosition the guide on every parent Scroll
      this._helpers.getParents(trigger).forEach((parent) => {
        if (!this._helpers.is.scrollable(parent)) return;

        parent.addEventListener('scroll', (event) => positionGuide(), false);
      });
    };
    //Guides Parameters
    const parseGuidesParams = (params) => {
      let guideParams = guideDefaultParams;
      if (this._helpers.is.object(params)) {
        guideParams = this._helpers.mergeOptions(guideParams, params);
      }
      return guideParams;
    };
    //Guides Parameters
    const guideParams = parseGuidesParams(this.params);
    //Create Root Guides
    const guideTextPrefix = this._st.name;

    createGuide({
      triggerGuide: false,
      enter: true,
      position: this._st._positions.rootStartPosition.guide,
      text: `${guideTextPrefix} ${guideParams.enter.root.text}`,
      color: guideParams.enter.root.color,
      backgroundColor: guideParams.enter.root.backgroundColor,
    });
    createGuide({
      triggerGuide: false,
      enter: false,
      position: this._st._positions.rootEndPosition.guide,
      text: `${guideTextPrefix} ${guideParams.leave.root.text}`,
      color: guideParams.leave.root.color,
      backgroundColor: guideParams.leave.root.backgroundColor,
    });
    //Create Triggers Guides
    this._st.triggers.forEach((trigger) => {
      const { enter, leave } = this._helpers.getTriggerData(trigger);
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
}
