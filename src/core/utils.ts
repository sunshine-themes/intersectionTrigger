import type { Root, Position, TriggerStates, ScrollCallbacks } from '../constants.js';
import type { Trigger, TriggerData } from './core.js';
import type IntersectionTrigger from './core.js';

import { getBoundsProp, getScrollValue, is, parseString, parseValue, roundFloat, throwError } from '../helpers.js';

interface PositionData {
	original: string;
	value: number;
	unit: string;
	normal: number;
	pixeled?: number;
}
type ModifiedDOMRect = Omit<DOMRect, 'x' | 'y' | 'toJSON'>;
type PositionsData = {
	tEP: PositionData;
	rEP: PositionData;
	tLP: PositionData;
	rLP: PositionData;
};
type DirectionProps = { ref: 'top' | 'left'; length: 'height' | 'width'; refOpposite: 'bottom' | 'right' };
type ToggleActions = (trigger: HTMLElement) => boolean;

export default class Utils {
	_it: IntersectionTrigger | undefined;
	isVertical: () => boolean;
	getRoot: {
		(): Exclude<Root, null>;
		(forEvent: 'resize'): Exclude<Root, null> | Window;
		(forEvent: 'scroll'): Exclude<Root, null> | Document;
	};
	dirProps: () => DirectionProps & { clientLength: number };
	setRootMargin: (rEP: PositionData, rLP: PositionData) => string;
	setThreshold: () => number[];
	parseQuery: (q: Trigger, errLog?: string) => HTMLElement[];
	parseRoot: (query: Root | string) => HTMLElement | null;
	validatePosition: (pos: Position) => string;
	setPositionData: (pos: Position) => PositionData;
	parsePositions: (triggerEnter: Position, triggerLeave: Position, rootEnter: Position, rootLeave: Position) => PositionsData;
	deleteTriggerData: (trigger: HTMLElement) => void;
	hasTriggerData: (trigger: HTMLElement, prop?: keyof TriggerData) => boolean;
	getTriggerData: {
		(trigger: HTMLElement): TriggerData;
		<K extends keyof TriggerData>(trigger: HTMLElement, prop: K): TriggerData[K];
	};
	setTriggerData: {
		(trigger: HTMLElement, value: TriggerData): void;
		(trigger: HTMLElement, value: Partial<TriggerData>, isPartial: boolean): void;
	};
	getTriggerStates: {
		(trigger: HTMLElement): Required<TriggerStates>;
		<K extends keyof TriggerStates>(trigger: HTMLElement, prop: K): TriggerStates[K];
	};
	setTriggerStates: (trigger: HTMLElement, value: Partial<TriggerStates>) => void;
	setTriggerScrollStates: <P extends keyof ScrollCallbacks>(trigger: HTMLElement, prop: P, value?: ScrollCallbacks[P]) => void;
	onTriggerEnter: (trigger: HTMLElement, event?: string) => void;
	onTriggerLeave: (trigger: HTMLElement, event?: string) => void;
	getPositions: (
		tB: DOMRect | ModifiedDOMRect,
		rB: DOMRect | ModifiedDOMRect,
		dirProps: DirectionProps & { enter: number; leave: number }
	) => number[];
	toggleActions: ToggleActions;
	parseRootMargin: (rootMargins: string) => { value: number; unit: string }[];
	getRootRect: (rootMargins: string) => ModifiedDOMRect;
	expandRectByRootMargin: (rect: DOMRect | ModifiedDOMRect, rootMargins: string) => ModifiedDOMRect;

	constructor(intersectionTrigger: IntersectionTrigger) {
		this._it = intersectionTrigger;

		this.setUtils();
		return this;
	}
	setUtils() {
		this.isVertical = () => 'y' === this._it!.axis;
		// @ts-ignore
		this.getRoot = (forEvent?: 'resize' | 'scroll'): Exclude<Root, null> | Document | Window => {
			if (!this._it!._root) {
				if (forEvent === 'resize') return window;
				if (forEvent === 'scroll') return document;
				return document.documentElement;
			}
			return this._it!._root;
		};
		this.dirProps = () =>
			this.isVertical()
				? { ref: 'top', length: 'height', refOpposite: 'bottom', clientLength: document.documentElement.clientHeight }
				: { ref: 'left', length: 'width', refOpposite: 'right', clientLength: document.documentElement.clientWidth };
		this.setRootMargin = (rEP, rLP) => {
			const { length, clientLength } = this.dirProps();
			const rootLength = this._it!._root ? getBoundsProp(this._it!._root, length) : clientLength;
			const valueToPx = (pos: PositionData, total: number) => {
				const { value, unit, normal } = pos;
				if ('%' === unit) return normal * total;
				return value;
			};
			rEP.pixeled = valueToPx(rEP, rootLength);
			rLP.pixeled = valueToPx(rLP, rootLength);
			this._it!._isREPGreater = rEP.pixeled >= rLP.pixeled;
			//Set root margins
			const rootMargins = {
				fromRef: `${-1 * (this._it!._isREPGreater ? rLP.pixeled : rEP.pixeled)}px`, //root margin from direction Reference (top|left)
				fromOppRef: `${(this._it!._isREPGreater ? rEP.pixeled : rLP.pixeled) - rootLength}px`, //root margin from the direction Reference's opposite (bottom|right)
			};

			const extendMargin = getScrollValue(this.getRoot(), this.isVertical() ? 'x' : 'y');
			return this.isVertical()
				? `${rootMargins.fromRef} ${extendMargin}px ${rootMargins.fromOppRef} ${extendMargin}px`
				: `${extendMargin}px ${rootMargins.fromOppRef} ${extendMargin}px ${rootMargins.fromRef}`;
		};
		this.setThreshold = () => {
			const threshold = [0, 1];

			this._it!.triggers.forEach((trigger) => {
				const { enter, leave, maxPosition } = this.getTriggerData(trigger);
				threshold.push(enter, leave, roundFloat(1 - maxPosition, 2));
			});

			return [...new Set(threshold)]; //to remove duplicates
		};
		this.parseQuery = (q, errLog = 'trigger') => {
			if (is.string(q)) return [...document.querySelectorAll<HTMLElement>(q)];
			if (is.array(q)) return q as HTMLElement[];
			if (is.element(q)) return [q];
			return throwError(`${errLog} parameter must be a valid selector, an element or array of elements`);
		};
		this.parseRoot = (query) => {
			if (!query) return null;
			if (is.string(query)) {
				const el = document.querySelector<HTMLElement>(query);
				if (!el) return throwError('root parameter must be a valid selector');
				return el;
			}
			if (is.element(query)) return query;

			return throwError('root parameter must be an element');
		};

		// Positions parsing
		this.validatePosition = (pos) => {
			is.function(pos) && (pos = pos(this._it as IntersectionTrigger));
			if (!is.string(pos)) return throwError(`enter, leave, rootEnter and rootLeave parameters must be a string.`);
			return pos;
		};
		this.setPositionData = (pos) => {
			pos = this.validatePosition(pos);

			const original = pos.trim();
			const parsed = parseValue(original);
			const roundedValue = roundFloat(parsed.value);

			return {
				original,
				unit: parsed.unit,
				value: roundedValue,
				normal: parsed.unit === '%' ? roundedValue / 100 : 0,
			};
		};
		this.parsePositions = (triggerEnter, triggerLeave, rootEnter, rootLeave) => {
			const positionsData = [triggerEnter, rootEnter, triggerLeave, rootLeave].map((pos) =>
				this.setPositionData(this.validatePosition(pos).trim())
			);
			return {
				tEP: positionsData[0], //trigger enter position
				rEP: positionsData[1], //root enter position
				tLP: positionsData[2], //trigger leave position
				rLP: positionsData[3], //root leave position
			};
		};

		//Trigger Data actions
		this.deleteTriggerData = (trigger) => {
			//Reset data of a trigger
			this._it!._triggersData.delete(trigger);
		};
		this.hasTriggerData = (trigger, prop) => {
			const hasData = this._it!._triggersData.has(trigger);
			if (prop) return hasData && prop in this.getTriggerData(trigger);
			return hasData;
		};
		this.getTriggerData = <K extends keyof TriggerData>(trigger: HTMLElement, prop?: K) => {
			if (prop)
				//Get data property of a trigger
				return this.hasTriggerData(trigger, prop) ? this._it!._triggersData.get(trigger)![prop] : {};

			//Get data of a trigger
			return (this.hasTriggerData(trigger) && this._it!._triggersData.get(trigger)) || {};
		};
		this.setTriggerData = (trigger: HTMLElement, value: TriggerData | Partial<TriggerData>, isPartial?: boolean) => {
			if (isPartial) {
				//Set data property of a trigger
				const storedValue = this.getTriggerData(trigger);
				if ('enter' in storedValue) this._it!._triggersData.set(trigger, { ...storedValue, ...value });
				return;
			}
			//Set data of a trigger
			this._it!._triggersData.set(trigger, value as TriggerData);
		};
		this.getTriggerStates = <K extends keyof TriggerStates>(trigger: HTMLElement, prop?: K) => {
			const triggerStates = this.getTriggerData(trigger, 'states');

			if (prop) return triggerStates[prop]; //Get a property of a trigger states

			return {
				...triggerStates,
				hasEnteredFromOneSide: triggerStates.hasEntered || triggerStates.hasEnteredBack,
			};
		};
		this.setTriggerStates = (trigger, value) => {
			const triggerData = this.getTriggerData(trigger);
			const triggerStates = triggerData && { ...triggerData.states, ...value };

			this.setTriggerData(trigger, { states: triggerStates }, true);
		};
		this.setTriggerScrollStates = (trigger, prop, value) => {
			const triggerScrollStates = this.getTriggerStates(trigger, 'onScroll');
			triggerScrollStates[prop] = value;

			this.setTriggerStates(trigger, { onScroll: { ...triggerScrollStates } });

			//Update
			if (value) {
				if (0 === this._it!._states.runningScrollCbs) this._it!.addScrollListener(this._it!._onScrollHandler);
				this._it!._states.runningScrollCbs++;
				return;
			}

			if (0 < this._it!._states.runningScrollCbs) this._it!._states.runningScrollCbs--;
			if (0 === this._it!._states.runningScrollCbs) this._it!.removeScrollListener(this._it!._onScrollHandler);
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
			data.callback(trigger, this._it as IntersectionTrigger);
			if (this._it!.killed) return this.kill(); //Located after the callback to make sure that the IntersectionTrigger instance not killed, because the instance is parameter of it.

			toggleClass && this._it!.toggleClass!.toggle(trigger, toggleClass, data.eventIndex);
			animation && this._it!.animation!.animate(trigger, animation, data.eventIndex);

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
			data.callback(trigger, this._it as IntersectionTrigger);
			if (this._it!.killed) return this.kill(); //Located after the callback to make sure that the IntersectionTrigger instance not killed, because the instance is a parameter of it.

			toggleClass && this._it!.toggleClass!.toggle(trigger, toggleClass, data.eventIndex);
			animation && this._it!.animation!.animate(trigger, animation, data.eventIndex);

			//Reset trigger data props
			this.setTriggerStates(trigger, {
				[data.leaveProp]: true,
				hasEntered: false,
				hasEnteredBack: false,
			});
			//Remove the instance if once is true
			once && hasEnteredOnce && this._it!.remove(trigger);
		};

		this.getPositions = (tB, rB, { enter, leave, ref, refOpposite, length }) => {
			const isREPGreater = this._it!._isREPGreater;
			return [
				tB[ref] + enter * tB[length], //tEP
				tB[ref] + leave * tB[length], //tLP
				isREPGreater ? rB[refOpposite] : rB[ref], //rEP
				isREPGreater ? rB[ref] : rB[refOpposite], //rLP
			];
		};

		this.toggleActions = (trigger) => {
			const tB = trigger.getBoundingClientRect(); //trigger Bounds
			this._it!.rootBounds = this.getRootRect(this._it!.observer!.rootMargin);
			const rB = this._it!.rootBounds; //root Bounds

			const { hasEnteredFromOneSide, hasLeft, hasLeftBack, hasEnteredOnce } = this.getTriggerStates(trigger);
			const { enter, leave } = this.getTriggerData(trigger);
			const { ref, refOpposite, length } = this.dirProps();
			const [tEP, tLP, rEP, rLP] = this.getPositions(tB, rB, { enter, leave, ref, refOpposite, length });
			let hasCaseMet = true;

			switch (true) {
				case hasLeftBack && rEP > tEP:
					//Enter case
					this.onTriggerEnter(trigger);
					break;
				case hasEnteredFromOneSide && rLP > tLP:
					//Leave case
					this.onTriggerLeave(trigger);
					break;
				case hasLeft && hasEnteredOnce && rLP < tLP:
					//EnterBack case
					this.onTriggerEnter(trigger, 'EnterBack');
					break;
				case hasEnteredFromOneSide && rEP < tEP:
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
				return margin.unit === 'px' ? margin.value : (margin.value * (i % 2 ? rect.width : rect.height)) / 100;
			});
			const newRect: ModifiedDOMRect = {
				top: rect.top - margins[0],
				right: rect.right + margins[1],
				bottom: rect.bottom + margins[2],
				left: rect.left - margins[3],
				width: 0,
				height: 0,
			};
			newRect.width = newRect.right - newRect.left;
			newRect.height = newRect.bottom - newRect.top;

			return newRect;
		};
		this.getRootRect = (rootMargins) => {
			let rootRect: ModifiedDOMRect;
			if (this._it!._root && !is.doc(this._it!._root)) {
				rootRect = this._it!._root.getBoundingClientRect();
				return this.expandRectByRootMargin(rootRect, rootMargins);
			}
			const doc = is.doc(this._it!._root) ? this._it!._root : document;
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

	kill() {
		this._it = undefined;
	}
}

export type { PositionData, PositionsData, ModifiedDOMRect, ToggleActions };
