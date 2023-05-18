import type IntersectionTrigger from '../../core/core';
import type { Root, EventHandler, PluginName, ModifiedDOMRect } from '../../core/types';
import type Utils from '../../utils/utils';
import type { GuidesOptions, GuidesParams, PositionGuideOptions } from './types';

import { guideDefaultConfig } from '../../constants';
import { getMinMax, getParents, is, mergeOptions, setElProps } from '../../helpers';

class Guides {
	_it: IntersectionTrigger | undefined;
	_utils: Utils | undefined;
	options!: GuidesOptions;
	_guides!: HTMLElement[];
	isVer!: boolean;
	rootEl!: Exclude<Root, null>;
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

		this.isVer = this._utils!.isVertical();
		this.rootEl = this._utils!.getRoot();

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

		const guide = document.createElement('div'),
			guideThickness = 2;

		guide.id = triggerEl ? (enter ? 'trigger-enter' : 'trigger-leave') : enter ? 'root-enter' : 'root-leave';

		setElProps(guide, {
			width: this.isVer ? '100px' : `${guideThickness}px`,
			height: this.isVer ? `${guideThickness}px` : '100px',
			position: 'absolute',
			zIndex: '9999',
			backgroundColor: backgroundColor,
			[this.isVer ? 'top' : 'left']: isHigherValue ? `calc( ${position.toString()} - ${guideThickness}px )` : position.toString()
		});
		//Create the text element
		const createText = () => {
			const verticalAlignment = {
				dir: this.isVer ? (isHigherValue ? 'bottom' : 'top') : 'bottom',
				value: this.isVer ? '5px' : '15px'
			};
			const horizontalAlignment = {
				dir: this.isVer ? 'right' : isHigherValue ? 'right' : 'left',
				value: this.isVer ? (triggerEl ? '0px' : !this._it!._root ? '15px' : '0px') : '5px'
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
				[horizontalAlignment.dir]: horizontalAlignment.value
			});
		};
		createText();
		//Add guide to the stored guides
		this._guides.push(guide);
		//Append the guide to the document body
		document.body.append(guide);

		//Root Guide
		if (!triggerEl) {
			setElProps(guide, {
				[this.isVer ? 'width' : 'height']: !this._it!._root ? '100%' : '100px',
				position: !this._it!._root ? 'fixed' : 'absolute'
			});
			!this._it!._root && setElProps(guide, { [this.isVer ? 'right' : 'top']: '0px' });

			//the root is not the viewport and it is an element
			if (this._it!._root) this._positionGuide(guide, { enter, isHigherValue });
			return;
		}
		//Trigger guide
		this._positionGuide(guide, { position, enter, isHigherValue } as PositionGuideOptions, triggerEl);
		//RePosition the guide on every parent on scroll
		getParents(triggerEl).forEach(parent => {
			if (!is.scrollable(parent)) return;
			parent.addEventListener(
				'scroll',
				() => this._positionGuide(guide, { position, enter, isHigherValue } as PositionGuideOptions, triggerEl),
				false
			);
		});
	}

	createGuides() {
		//Guides Parameters
		const guideParams = mergeOptions(guideDefaultConfig, this.options);
		const guideTextPrefix = this._it!.name;

		//Create Root Guides
		const rEPValue = this._it!._positionsData.rEP.value;
		const rLPValue = this._it!._positionsData.rLP.value;
		const rHigherPosition = getMinMax(rEPValue, rLPValue)[1]; //root higher position value

		this._guideCreation({
			enter: true,
			position: `${rEPValue}${this._it!._positionsData.rEP.unit}`,
			isHigherValue: rHigherPosition === rEPValue,
			text: `${guideTextPrefix} ${guideParams.enter.root.text}`,
			color: guideParams.enter.root.color,
			backgroundColor: guideParams.enter.root.backgroundColor
		});
		this._guideCreation({
			enter: false,
			position: `${rLPValue}${this._it!._positionsData.rLP.unit}`,
			isHigherValue: rHigherPosition === rLPValue,
			text: `${guideTextPrefix} ${guideParams.leave.root.text}`,
			color: guideParams.leave.root.color,
			backgroundColor: guideParams.leave.root.backgroundColor
		});

		//Create Triggers' Guides
		this._it!.triggers.forEach(trigger => {
			const { enter, leave, higherPosition } = this._utils!.getTriggerData(trigger);
			this._guideCreation(
				{
					enter: true,
					position: enter,
					isHigherValue: enter === higherPosition,
					text: `${guideTextPrefix} ${guideParams.enter.trigger.text}`,
					color: guideParams.enter.trigger.color,
					backgroundColor: guideParams.enter.trigger.backgroundColor
				},
				trigger
			);
			this._guideCreation(
				{
					enter: false,
					position: leave,
					isHigherValue: leave === higherPosition,
					text: `${guideTextPrefix} ${guideParams.leave.trigger.text}`,
					color: guideParams.leave.trigger.color,
					backgroundColor: guideParams.leave.trigger.backgroundColor
				},
				trigger
			);
		});
	}

	_positionGuide(guide: HTMLElement, options: Omit<PositionGuideOptions, 'position'>): void;
	_positionGuide(guide: HTMLElement, options: PositionGuideOptions, triggerEl: HTMLElement): void;
	_positionGuide(guide: HTMLElement, options: PositionGuideOptions, triggerEl?: HTMLElement) {
		const { position, isHigherValue } = options;
		const guideBounds = guide.getBoundingClientRect();
		const rDefaultBounds = this.rootEl.getBoundingClientRect(); //root Bounds regardless the root margins

		let targetBounds = this._utils!.getRootRect(this._it!.observer!.rootMargin);
		let diffs: { x: number; y: number };

		//Root Difference
		const secAxisRefs: (keyof ModifiedDOMRect)[] = ['right', 'left', 'bottom', 'top'];
		const verMainAxisRef: keyof ModifiedDOMRect = isHigherValue ? 'bottom' : 'top';
		const hozMainAxisRef: keyof ModifiedDOMRect = isHigherValue ? 'right' : 'left';
		diffs = this.isVer
			? {
					x: rDefaultBounds[secAxisRefs[0]] - guideBounds[secAxisRefs[1]],
					y: targetBounds[verMainAxisRef] - guideBounds[verMainAxisRef]
			  }
			: {
					x: targetBounds[hozMainAxisRef] - guideBounds[hozMainAxisRef],
					y: rDefaultBounds[secAxisRefs[2]] - guideBounds[secAxisRefs[3]]
			  };

		if (triggerEl) {
			targetBounds = triggerEl.getBoundingClientRect();
			//Trigger Difference
			diffs = this.isVer
				? {
						x: targetBounds.right - guideBounds.right,
						y: targetBounds.top + position * targetBounds.height - guideBounds.top
				  }
				: {
						x: targetBounds.left + position * targetBounds.width - guideBounds.left,
						y: targetBounds.top - guideBounds.top
				  };
		}

		this._setGuideTransformProp(guide, diffs.x, diffs.y);
	}

	_setGuideTransformProp(guide: HTMLElement, diffX: number, diffY: number) {
		const parts = [...guide.style.transform.matchAll(/(-?\d*\.?\d+)\s*(px|%)?/g)];
		const translateXInPx = parts.length ? parts[0][1] : '0';
		const translateYInPx = parts.length > 1 ? parts[1][1] : '0';

		const x = diffX + parseFloat(translateXInPx);
		const y = diffY + parseFloat(translateYInPx);

		setElProps(guide, { transform: `translate(${x}px,${y}px)` });
	}

	removeGuides = () => {
		this._guides.forEach(guide => guide && guide.remove());
		this._guides = [];
	};

	update = () => {
		this.removeGuides();
		this.createGuides();
	};

	kill = () => {
		this._removeResizeListener();
		this.removeGuides();

		this._it!.guides = this._it = this._utils = undefined;
	};
}
Guides.pluginName = 'guides';

export default Guides;
