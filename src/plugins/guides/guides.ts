import type IntersectionTrigger from '../../core/core';
import type { Root, EventHandler, PluginName } from '../../core/types';
import type Utils from '../../utils/utils';
import type { GuidesOptions, GuidesParams } from './types';

import { guideDefaultConfig } from '../../constants';
import { getMinMax, getParents, getScrollBarWidth, is, mergeOptions, setElProps } from '../../helpers.js';

class Guides {
	_it: IntersectionTrigger | undefined;
	_utils: Utils | undefined;
	options!: GuidesOptions;
	_guides!: HTMLElement[];
	_scrollBarWidth!: number;
	isVer!: boolean;
	rootEl!: Exclude<Root, null>;
	scrollWidth!: { x: number; y: number };
	_onResizeHandler!: EventHandler;
	static pluginName: PluginName;

	constructor(it: IntersectionTrigger) {
		this._registerIntersectionTrigger(it);
		return this;
	}

	_registerIntersectionTrigger(intersectionTrigger: IntersectionTrigger) {
		this._it = intersectionTrigger;
		this._utils = this._it!._utils;
	}

	init(options: GuidesOptions | boolean) {
		this.options = is.object(options) ? options : {};
		this._guides = [];

		this._scrollBarWidth = getScrollBarWidth();
		this.isVer = this._utils!.isVertical();
		this.rootEl = this._utils!.getRoot();
		this.scrollWidth = {
			x: is.scrollable(this.rootEl, 'x') ? this._scrollBarWidth : 0,
			y: is.scrollable(this.rootEl, 'y') ? this._scrollBarWidth : 0,
		};

		this._addResizeListener();
		this.update();
	}

	_addResizeListener() {
		this._onResizeHandler = this.update; //Update guides
		addEventListener('resize', this._onResizeHandler, false);
	}
	_removeResizeListener() {
		removeEventListener('resize', this._onResizeHandler, false);
	}

	_guideCreation(options: GuidesParams & { position: string }): void;
	_guideCreation(options: GuidesParams & { position: number }, triggerEl: HTMLElement): void;
	_guideCreation(options: GuidesParams & { position: string | number }, triggerEl?: HTMLElement) {
		const { enter, position, isHigherValue, text, color, backgroundColor } = options;

		const guide = document.createElement('div');

		setElProps(guide, {
			width: this.isVer ? '100px' : '1px',
			height: this.isVer ? '1px' : '100px',
			position: 'absolute',
			zIndex: '9999',
			backgroundColor: backgroundColor,
			[this.isVer ? 'top' : 'left']: position.toString(),
		});
		//Create the text element
		const createText = () => {
			let verticalAlignment = {
				dir: this.isVer ? (isHigherValue ? 'bottom' : 'top') : 'bottom',
				value: this.isVer ? '5px' : '15px',
			};
			let horizontalAlignment = {
				dir: this.isVer ? 'right' : isHigherValue ? 'right' : 'left',
				value: this.isVer ? (triggerEl ? '0px' : !this._it!._root ? '15px' : '0px') : '5px',
			};

			const textElement = document.createElement('span');
			textElement.innerText = text;
			guide.appendChild(textElement);

			setElProps(textElement, {
				position: 'absolute',
				color,
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

		const setTranslateProp = (diffX: number, diffY: number) => {
			const parts = [...guide.style.transform.matchAll(/(-?\d*\.?\d+)\s*(px|%)?/g)];
			const translateXInPx = parts.length ? parts[0][1] : '0';
			const translateYInPx = parts.length > 1 ? parts[1][1] : '0';

			let x = diffX + parseFloat(translateXInPx);
			let y = diffY + parseFloat(translateYInPx);

			setElProps(guide, { transform: `translate(${x}px,${y}px)` });
		};

		const positionGuide = () => {
			const guideBounds = guide.getBoundingClientRect();

			const rDefaultBounds = this.rootEl.getBoundingClientRect(); //root Bounds regardless the root margins
			let targetBounds = this._utils!.getRootRect(this._it!.observer!.rootMargin);
			let scrollWidth = {
				x: isHigherValue ? this.scrollWidth.x : 0,
				y: isHigherValue ? this.scrollWidth.y : 0,
			};
			let diffs = { x: 0, y: 0 };

			//Root Difference
			diffs = this.isVer
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

			if (triggerEl) {
				targetBounds = triggerEl!.getBoundingClientRect();
				//Trigger Difference
				diffs = this.isVer
					? {
							x: targetBounds.right - guideBounds.right,
							y: targetBounds.top + (position as number) * targetBounds.height - guideBounds.top,
					  }
					: {
							x: targetBounds.left + (position as number) * targetBounds.width - guideBounds.left,
							y: targetBounds.top - guideBounds.top,
					  };
			}

			setTranslateProp(diffs.x, diffs.y);
		};

		//Root Guide
		if (!triggerEl) {
			setElProps(guide, {
				[this.isVer ? 'width' : 'height']: !this._it!._root ? '100%' : '100px',
				position: !this._it!._root ? 'fixed' : 'absolute',
			});
			!this._it!._root && setElProps(guide, { [this.isVer ? 'right' : 'top']: '0px' });

			//the root is not the viewport and it is an element
			if (this._it!._root) positionGuide();
			return;
		}
		//Trigger guide
		positionGuide();
		//RePosition the guide on every parent on scroll
		getParents(triggerEl).forEach((parent) => {
			if (!is.scrollable(parent)) return;

			parent.addEventListener('scroll', positionGuide, false);
		});
	}

	createGuides() {
		//Guides Parameters
		const guideParams = mergeOptions(guideDefaultConfig, this.options);
		const guideTextPrefix = this._it!.name;

		//Create Root Guides
		const rEPValue = this._it!._positionsData.rEP.value;
		const rLPValue = this._it!._positionsData.rLP.value;

		this._guideCreation({
			enter: true,
			position: `${rEPValue}${this._it!._positionsData.rEP.unit}`,
			isHigherValue: getMinMax(rEPValue, rLPValue)[1] === rEPValue,
			text: `${guideTextPrefix} ${guideParams.enter.root.text}`,
			color: guideParams.enter.root.color,
			backgroundColor: guideParams.enter.root.backgroundColor,
		});
		this._guideCreation({
			enter: false,
			position: `${rLPValue}${this._it!._positionsData.rLP.unit}`,
			isHigherValue: getMinMax(rEPValue, rLPValue)[1] === rLPValue,
			text: `${guideTextPrefix} ${guideParams.leave.root.text}`,
			color: guideParams.leave.root.color,
			backgroundColor: guideParams.leave.root.backgroundColor,
		});

		//Create Triggers Guides
		this._it!.triggers.forEach((trigger) => {
			const { enter, leave, maxPosition } = this._utils!.getTriggerData(trigger);
			this._guideCreation(
				{
					enter: true,
					position: enter,
					isHigherValue: enter === maxPosition,
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
					isHigherValue: leave === maxPosition,
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

		this._it!.guides = undefined;
		this._it = undefined;
		this._utils = undefined;
	};
}
Guides.pluginName = 'guides';

export default Guides;
