import { guideDefaultParams } from '../constants';
import { getMinMax, getParents, getScrollBarWidth, is, mergeOptions, setElProps } from '../helpers.js';

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

		this._scrollBarWidth = getScrollBarWidth();
		this.isVer = this._utils.isVertical();
		this.rootEl = this._it._root ?? document.body;
		this.scrollWidth = {
			x: is.scrollable(this.rootEl, 'x') ? this._scrollBarWidth : 0,
			y: is.scrollable(this.rootEl, 'y') ? this._scrollBarWidth : 0,
		};

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

	_guideCreation(options, triggerEl = null) {
		const { enter, position, isHigherValue, text, color, backgroundColor } = options;

		const guide = document.createElement('div');

		setElProps(guide, {
			width: this.isVer ? '100px' : '1px',
			height: this.isVer ? '1px' : '100px',
			position: 'absolute',
			zIndex: '9999',
			backgroundColor: backgroundColor,
			[this.isVer ? 'top' : 'left']: position,
		});
		//Create the text element
		const createText = () => {
			let verticalAlignment = {
				dir: this.isVer ? (enter ? 'bottom' : 'top') : 'bottom',
				value: this.isVer ? '5px' : '25px',
			};
			let horizontalAlignment = {
				dir: this.isVer ? 'right' : enter ? 'right' : 'left',
				value: this.isVer ? (triggerEl ? '0px' : !this._it._root ? '25px' : '0px') : '5px',
			};

			const textElement = document.createElement('span');
			textElement.innerText = text;
			guide.appendChild(textElement);

			setElProps(textElement, {
				position: 'absolute',
				color: color,
				fontSize: '16px',
				fontWeight: 'bold',
				backgroundColor: backgroundColor,
				padding: '5px',
				width: 'max-content',
				[verticalAlignment.dir]: verticalAlignment.value,
				[horizontalAlignment.dir]: horizontalAlignment.value,
			});
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

			setElProps(guide, { transform: `translate(${x}px,${y}px)` });
		};

		const positionGuide = (isTrigger = true) => {
			const guideBounds = guide.getBoundingClientRect();

			const rDefaultBounds = this.rootEl.getBoundingClientRect(); //root Bounds regardless the root margins
			let targetBounds = this._utils.getRootRect(this._it.observer.rootMargin);
			let scrollWidth = {
				x: isHigherValue ? this.scrollWidth.x : 0,
				y: isHigherValue ? this.scrollWidth.y : 0,
			};

			const rootDiffs = this.isVer
				? enter
					? {
							x: rDefaultBounds.right - guideBounds.left - this.scrollWidth.y,
							y: targetBounds.bottom - guideBounds.bottom - scrollWidth.x,
					  }
					: {
							x: rDefaultBounds.right - guideBounds.left - this.scrollWidth.y,
							y: targetBounds.top - guideBounds.top - scrollWidth.x,
					  }
				: enter
				? {
						x: targetBounds.right - guideBounds.right,
						y: rDefaultBounds.bottom - guideBounds.top - this.scrollWidth.x,
				  }
				: { x: targetBounds.left - guideBounds.left, y: rDefaultBounds.bottom - guideBounds.top - this.scrollWidth.x };

			let triggerDiffs = {};
			if (isTrigger) {
				targetBounds = triggerEl.getBoundingClientRect();
				triggerDiffs = this.isVer
					? {
							x: targetBounds.right - guideBounds.right,
							y: targetBounds.top + position * targetBounds.height - guideBounds.top,
					  }
					: {
							x: targetBounds.left + position * targetBounds.width - guideBounds.left,
							y: targetBounds.top - guideBounds.top,
					  };
			}

			const diffs = isTrigger ? triggerDiffs : rootDiffs;

			setTranslateProp(diffs.x, diffs.y);
		};

		//Root Guide
		if (!triggerEl) {
			setElProps(guide, {
				[this.isVer ? 'width' : 'height']: this._it._isViewport ? (this.isVer ? '100vw' : '100vh') : '100px',
				position: this._it._isViewport ? 'fixed' : 'absolute',
			});
			this._it._isViewport && !this.isVer && setElProps(guide, { top: '0px' });

			//the root is not the viewport and it is an element
			if (!this._it._isViewport) positionGuide(false);
			return;
		}
		//Trigger guide
		positionGuide();
		//RePosition the guide on every parent Scroll
		getParents(triggerEl).forEach((parent) => {
			if (!is.scrollable(parent)) return;

			parent.addEventListener('scroll', positionGuide, false);
		});
	}

	createGuides() {
		//Guides Parameters
		const parseGuidesParams = (params) => {
			let guideParams = guideDefaultParams;
			if (is.object(params)) {
				guideParams = mergeOptions(guideParams, params);
			}
			return guideParams;
		};
		const guideParams = parseGuidesParams(this.options);
		const guideTextPrefix = this._it.name;

		//Create Root Guides
		const rEPValue = this._it._positionsData.rEP.value;
		const rLPValue = this._it._positionsData.rLP.value;

		this._guideCreation({
			enter: true,
			position: `${rEPValue}${this._it._positionsData.rEP.unit}`,
			isHigherValue: getMinMax(rEPValue, rLPValue)[1] === rEPValue,
			text: `${guideTextPrefix} ${guideParams.enter.root.text}`,
			color: guideParams.enter.root.color,
			backgroundColor: guideParams.enter.root.backgroundColor,
		});
		this._guideCreation({
			enter: false,
			position: `${rLPValue}${this._it._positionsData.rLP.unit}`,
			isHigherValue: getMinMax(rEPValue, rLPValue)[1] === rLPValue,
			text: `${guideTextPrefix} ${guideParams.leave.root.text}`,
			color: guideParams.leave.root.color,
			backgroundColor: guideParams.leave.root.backgroundColor,
		});

		//Create Triggers Guides
		this._it.triggers.forEach((trigger) => {
			const { enter, leave } = this._utils.getTriggerData(trigger);
			this._guideCreation(
				{
					enter: true,
					position: enter,
					text: `${guideTextPrefix} ${guideParams.enter.trigger.text}`,
					color: guideParams.enter.trigger.color,
					backgroundColor: guideParams.enter.trigger.backgroundColor,
				},
				trigger
			);
			this._guideCreation(
				{
					enter: false,
					position: leave,
					text: `${guideTextPrefix} ${guideParams.leave.trigger.text}`,
					color: guideParams.leave.trigger.color,
					backgroundColor: guideParams.leave.trigger.backgroundColor,
				},
				trigger
			);
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
Guides.pluginName = 'guides';

export default Guides;
