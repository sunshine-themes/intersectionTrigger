import type IntersectionTrigger from '../core/core';
import type {
	Root,
	DirectionProps,
	PositionData,
	Trigger,
	Position,
	PositionsData,
	TriggerData,
	TriggerStates,
	ScrollCallbacks,
	ModifiedDOMRect,
	ToggleActions,
	EventParams
} from '../core/types';

import { is, parseString, parseValue, roundFloat, throwError } from '../helpers';

export default class Utils {
	_it: IntersectionTrigger | undefined;
	tD: WeakMap<HTMLElement, TriggerData>;
	states: { oCbFirstInvoke: boolean; runningScrollCbs: number };
	isVertical!: () => boolean;
	getRoot!: {
		(): Exclude<Root, null>;
		(forEvent: 'resize'): Exclude<Root, null> | Window;
		(forEvent: 'scroll'): Exclude<Root, null> | Document;
	};
	dirProps!: () => DirectionProps & { clientLength: number };
	setRootMargin!: (rEP: PositionData, rLP: PositionData) => string;
	setThreshold!: () => number[];
	parseQuery!: (q: Trigger, errLog?: string) => HTMLElement[];
	parseRoot!: (query: Root | string) => HTMLElement | null;
	validatePosition!: (pos: Position) => string;
	setPositionData!: (pos: Position) => PositionData;
	parsePositions!: (triggerEnter: Position, triggerLeave: Position, rootEnter: Position, rootLeave: Position) => PositionsData;
	deleteTriggerData!: (trigger: HTMLElement) => void;
	hasTriggerData!: (trigger: HTMLElement, prop?: keyof TriggerData) => boolean;
	getTriggerData!: {
		(trigger: HTMLElement): TriggerData;
		<K extends keyof TriggerData>(trigger: HTMLElement, prop: K): TriggerData[K];
	};
	setTriggerData!: {
		(trigger: HTMLElement, value: TriggerData): void;
		(trigger: HTMLElement, value: Partial<TriggerData>, isPartial: boolean): void;
	};
	setTriggerStates!: (trigger: HTMLElement, value: Partial<TriggerStates>) => void;
	setTriggerScrollStates!: <P extends keyof ScrollCallbacks>(trigger: HTMLElement, prop: P, value?: ScrollCallbacks[P]) => void;
	triggerEvent!: (trigger: HTMLElement, eventParams: EventParams) => void;
	getPositions!: (
		tB: DOMRect | ModifiedDOMRect,
		rB: DOMRect | ModifiedDOMRect,
		dirProps: DirectionProps & { enter: number; leave: number }
	) => number[];
	toggleActions!: ToggleActions;
	parseRootMargin!: (rootMargins: string) => { value: number; unit: string }[];
	getRootRect!: (rootMargins: string) => ModifiedDOMRect;
	expandRectByRootMargin!: (rect: DOMRect | ModifiedDOMRect, rootMargins: string) => ModifiedDOMRect;

	constructor(intersectionTrigger: IntersectionTrigger) {
		this._it = intersectionTrigger;
		this.tD = this._it._triggersData;
		this.states = this._it._states;

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
			const rootLength = this._it!._root ? this._it!._root.getBoundingClientRect()[length] : clientLength;
			const valueToPx = (pos: PositionData, total: number) => {
				const { value, unit, normal } = pos;
				if ('%' === unit) return normal * total;
				return value;
			};
			rEP.pixels = valueToPx(rEP, rootLength);
			rLP.pixels = valueToPx(rLP, rootLength);
			this._it!._isREPGreater = rEP.pixels >= rLP.pixels;
			//Set root margins
			const rootMargins = {
				fromRef: `${-1 * (this._it!._isREPGreater ? rLP.pixels : rEP.pixels)}px`, //root margin from direction Reference (top|left)
				fromOppRef: `${(this._it!._isREPGreater ? rEP.pixels : rLP.pixels) - rootLength}px` //root margin from the direction Reference's opposite (bottom|right)
			};

			const root = this.getRoot();
			const extendMargin = this.isVertical() ? root.scrollWidth : root.scrollHeight; //adding margin to intersect if the trigger is out of the root viewport
			return this.isVertical()
				? `${rootMargins.fromRef} ${extendMargin}px ${rootMargins.fromOppRef} ${extendMargin}px`
				: `${extendMargin}px ${rootMargins.fromOppRef} ${extendMargin}px ${rootMargins.fromRef}`;
		};
		this.setThreshold = () => {
			const threshold = [0, 1];

			this._it!.triggers.forEach(trigger => {
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
		this.parseRoot = query => {
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
		this.validatePosition = pos => {
			is.function<string>(pos) && (pos = pos(this._it as IntersectionTrigger));
			if (!is.string(pos)) return throwError(`enter, leave, rootEnter and rootLeave parameters must be a string.`);
			return pos;
		};
		this.setPositionData = pos => {
			pos = this.validatePosition(pos);

			const original = pos.trim();
			const parsed = parseValue(original);
			const roundedValue = roundFloat(parsed.value);

			return {
				original,
				unit: parsed.unit,
				value: roundedValue,
				normal: parsed.unit === '%' ? roundedValue / 100 : 0
			};
		};
		this.parsePositions = (triggerEnter, triggerLeave, rootEnter, rootLeave) => {
			const positionsData = [triggerEnter, rootEnter, triggerLeave, rootLeave].map(pos =>
				this.setPositionData(this.validatePosition(pos).trim())
			);
			return {
				tEP: positionsData[0], //trigger enter position
				rEP: positionsData[1], //root enter position
				tLP: positionsData[2], //trigger leave position
				rLP: positionsData[3] //root leave position
			};
		};

		//Trigger Data actions
		this.deleteTriggerData = trigger => this.tD.delete(trigger);
		this.getTriggerData = <K extends keyof TriggerData>(trigger: HTMLElement, prop?: K) => {
			const triggerData = this.tD.get(trigger) || ({} as TriggerData);
			if (prop) return triggerData[prop];
			return triggerData;
		};
		this.setTriggerData = (trigger: HTMLElement, value: TriggerData | Partial<TriggerData>, isPartial?: boolean) => {
			const storedValue = this.getTriggerData(trigger);
			const newValue = isPartial ? { ...storedValue, ...value } : value;
			this.tD.set(trigger, newValue as TriggerData);
		};
		this.setTriggerStates = (trigger, value) => {
			const triggerStates = this.getTriggerData(trigger, 'states');
			this.setTriggerData(trigger, { states: { ...triggerStates, ...value } }, true);
		};
		this.setTriggerScrollStates = (trigger, prop, value) => {
			const triggerScrollStates = this.getTriggerData(trigger, 'states').onScroll;
			triggerScrollStates[prop] = value;

			this.setTriggerStates(trigger, { onScroll: triggerScrollStates });

			//Update
			if (value) {
				if (0 === this.states.runningScrollCbs) this._it!.addScrollListener(this._it!._onScrollHandler);
				this.states.runningScrollCbs++;
				return;
			}

			if (0 < this.states.runningScrollCbs) this.states.runningScrollCbs--;
			if (0 === this.states.runningScrollCbs) this._it!.removeScrollListener(this._it!._onScrollHandler);
		};
		//
		this.triggerEvent = (trigger, [name, callback, enterState, leaveState, index]) => {
			//Get Stored trigger data
			const {
				once,
				toggleClass,
				animation,
				states: { hasEnteredOnce }
			} = this.getTriggerData(trigger);

			callback(trigger, this._it as IntersectionTrigger); //Invoke Callback

			if (this._it!.killed) return this.kill(); //Located after the callback to make sure that the IntersectionTrigger instance not killed while executing.

			toggleClass && this._it!.toggleClass!.toggle(trigger, toggleClass, index);
			animation && this._it!.animation!.animate(trigger, animation, index);

			const isEnterEvent = 'Enter' === name || 'EnterBack' === name;

			let triggerStates = {} as Partial<TriggerStates>;
			if (isEnterEvent) {
				triggerStates = {
					[enterState as keyof TriggerStates]: true,
					[leaveState]: false
				};

				if (!hasEnteredOnce)
					triggerStates = { [enterState as keyof TriggerStates]: true, hasLeft: false, hasLeftBack: false, hasEnteredOnce: true };
			} else {
				//Remove the instance if 'once' is true
				if (once && hasEnteredOnce) {
					this._it!.remove(trigger);
					return;
				}

				triggerStates = {
					[leaveState]: true,
					hasEntered: false,
					hasEnteredBack: false
				};
			}

			//Reset trigger data props
			this.setTriggerStates(trigger, triggerStates);
		};

		this.getPositions = (tB, rB, { enter, leave, ref, refOpposite, length }) => {
			const isREPGreater = this._it!._isREPGreater;
			return [
				tB[ref] + enter * tB[length], //tEP
				tB[ref] + leave * tB[length], //tLP
				isREPGreater ? rB[refOpposite] : rB[ref], //rEP
				isREPGreater ? rB[ref] : rB[refOpposite] //rLP
			];
		};

		this.toggleActions = trigger => {
			const { enter, leave, onEnter, onLeave, onEnterBack, onLeaveBack, states } = this.getTriggerData(trigger),
				tB = trigger.getBoundingClientRect(), //trigger Bounds
				rB = (this._it!.rootBounds = this.getRootRect(this._it!.observer!.rootMargin)), //root Bounds
				{ ref, refOpposite, length } = this.dirProps(),
				[tEP, tLP, rEP, rLP] = this.getPositions(tB, rB, { enter, leave, ref, refOpposite, length });

			let modStates = { ...states, hasEnteredFromOneSide: states.hasEntered || states.hasEnteredBack };

			const updateStates = () => {
				const states = this.getTriggerData(trigger, 'states');
				modStates = { ...states, hasEnteredFromOneSide: states.hasEntered || states.hasEnteredBack };
			};

			//Enter case
			if (modStates.hasLeftBack && rEP > tEP) {
				this.triggerEvent(trigger, ['Enter', onEnter, 'hasEntered', 'hasLeftBack', 0]);
				updateStates();
			}
			//Leave case
			if (modStates.hasEnteredFromOneSide && rLP > tLP) {
				this.triggerEvent(trigger, ['Leave', onLeave, null, 'hasLeft', 1]);
				updateStates();
			}
			//EnterBack case
			if (modStates.hasLeft && modStates.hasEnteredOnce && rLP < tLP) {
				this.triggerEvent(trigger, ['EnterBack', onEnterBack, 'hasEnteredBack', 'hasLeft', 2]);
				updateStates();
			}
			//LeaveBack case
			if (modStates.hasEnteredFromOneSide && rEP < tEP) {
				this.triggerEvent(trigger, ['LeaveBack', onLeaveBack, null, 'hasLeftBack', 3]);
				updateStates();
			}
		};

		//  upcoming code is based on IntersectionObserver calculations of the root bounds. All rights reserved (https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).

		this.parseRootMargin = rootMargins => {
			const marginString = rootMargins || '0px';
			const margins = parseString(marginString);
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
				height: 0
			};
			newRect.width = newRect.right - newRect.left;
			newRect.height = newRect.bottom - newRect.top;

			return newRect;
		};
		this.getRootRect = rootMargins => {
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
				height: html.clientHeight || body.clientHeight
			};

			return this.expandRectByRootMargin(rootRect, rootMargins);
		};
	}

	kill() {
		this._it = undefined;
	}
}
