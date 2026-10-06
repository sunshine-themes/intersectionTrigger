import type IntersectionTrigger from '../core/core';
import type {
	Root,
	DirectionProps,
	PositionData,
	Trigger,
	RootValue,
	TriggerValue,
	RootPosition,
	TriggerPosition,
	PositionsData,
	TriggerData,
	TriggerStates,
	ScrollCallbacks,
	ModifiedDOMRect,
	EventParams
} from '../core/types';
import { getParents, getScrollBarWidth, is, parseValue, roundFloat, throwError } from '../helpers';
import { buildRootMarginString, buildThreshold, expandRectByMargins, parseMarginString, positionPixels } from '../math';

export default class Utils {
	_it: IntersectionTrigger | undefined;
	tD: WeakMap<HTMLElement, TriggerData>;
	states: { oCbFirstInvoke: boolean; runningScrollCbs: number };
	readonly _scrollTargets = new Set<HTMLElement>();
	_parsedMargins: { source: string; margins: { value: number; unit: string }[] } | undefined;
	_dirPropsCache: (DirectionProps & { clientLength: number }) | undefined;
	scrollbarThickness: { x: number; y: number } | undefined;

	constructor(intersectionTrigger: IntersectionTrigger) {
		this._it = intersectionTrigger;
		this.tD = this._it._triggersData;
		this.states = this._it._states;
	}

	isVertical() {
		return 'y' === this._it!.axis;
	}

	getRoot(): Exclude<Root, null>;
	getRoot(forEvent: 'resize'): Exclude<Root, null> | Window;
	getRoot(forEvent: 'scroll'): Exclude<Root, null> | Document;
	getRoot(forEvent?: 'resize' | 'scroll'): Exclude<Root, null> | Window | Document {
		if (!this._it!._root) {
			if (forEvent === 'resize') return window;
			if (forEvent === 'scroll') return document;
			return document.documentElement;
		}
		return this._it!._root;
	}

	setScrollbarThickness(rootElement: HTMLElement) {
		if (this.scrollbarThickness) return;
		const sBWidth = getScrollBarWidth();
		this.scrollbarThickness = {
			x: is.scrollable(rootElement, 'x') ? sBWidth : 0,
			y: is.scrollable(rootElement, 'y') ? sBWidth : 0
		};
	}

	dirProps(): DirectionProps & { clientLength: number } {
		//The axis never changes after construction, cache the derived props
		if (this._dirPropsCache) return this._dirPropsCache;
		return (this._dirPropsCache = this.isVertical()
			? { ref: 'top', length: 'height', refOpposite: 'bottom', clientLength: document.documentElement.clientHeight }
			: { ref: 'left', length: 'width', refOpposite: 'right', clientLength: document.documentElement.clientWidth });
	}

	setRootMargin(rEP: PositionData, rLP: PositionData) {
		const { length, clientLength } = this.dirProps();
		const rootLength = this._it!._root ? this._it!._root.getBoundingClientRect()[length] : clientLength;

		rEP.pixels = positionPixels(rEP, rootLength);
		rLP.pixels = positionPixels(rLP, rootLength);
		this._it!._isREPGreater = rEP.pixels >= rLP.pixels;

		const root = this.getRoot();
		const extendMargin = this.isVertical() ? root.scrollWidth : root.scrollHeight; //adding margin to intersect if the trigger is out of the root viewport
		return buildRootMarginString({
			isREPGreater: this._it!._isREPGreater,
			rEPpx: rEP.pixels,
			rLPpx: rLP.pixels,
			rootLength,
			isVertical: this.isVertical(),
			extendMargin
		});
	}

	setThreshold() {
		return buildThreshold(
			this._it!.triggers.map(trigger => {
				const { enter, leave, higherPosition } = this.getTriggerData(trigger);
				return { enter, leave, higher: higherPosition };
			})
		);
	}

	parseQuery(q: Trigger, errLog = 'trigger') {
		if (is.string(q)) return [...document.querySelectorAll<HTMLElement>(q)];
		if (is.nodeList(q)) return [...q] as HTMLElement[];
		if (is.array(q)) return q as HTMLElement[];
		if (is.element(q)) return [q];
		return throwError(`${errLog} parameter must be a valid selector, an element or array of elements`);
	}

	parseRoot(query: Root | string) {
		if (!query) return null;
		if (is.string(query)) {
			const el = document.querySelector<HTMLElement>(query);
			if (!el) return throwError('root parameter must be a valid selector');
			return el;
		}
		if (is.element(query)) return query;

		return throwError('root parameter must be an element');
	}

	// Positions parsing
	validatePosition(pos: RootPosition | TriggerPosition): RootValue | TriggerValue {
		is.function<RootValue | TriggerValue>(pos) && (pos = pos(this._it as IntersectionTrigger));
		if (!is.string(pos)) return throwError(`enter, leave, rootEnter and rootLeave parameters must be a string.`);
		return pos;
	}

	setPositionData(pos: RootPosition | TriggerPosition): PositionData {
		const original = this.validatePosition(pos).trim();
		const parsed = parseValue(original);
		const roundedValue = roundFloat(parsed.value);

		return {
			original,
			unit: parsed.unit,
			value: roundedValue,
			normal: parsed.unit === '%' ? roundedValue / 100 : 0
		};
	}

	parsePositions(
		triggerEnter: TriggerPosition,
		triggerLeave: TriggerPosition,
		rootEnter: RootPosition,
		rootLeave: RootPosition
	): PositionsData {
		const positionsData = [triggerEnter, rootEnter, triggerLeave, rootLeave].map(pos => this.setPositionData(pos));
		return {
			tEP: positionsData[0], //trigger enter position
			rEP: positionsData[1], //root enter position
			tLP: positionsData[2], //trigger leave position
			rLP: positionsData[3] //root leave position
		};
	}

	//Trigger Data actions
	deleteTriggerData(trigger: HTMLElement) {
		return this.tD.delete(trigger);
	}

	getTriggerData(trigger: HTMLElement): TriggerData;
	getTriggerData<K extends keyof TriggerData>(trigger: HTMLElement, prop: K): TriggerData[K];
	getTriggerData<K extends keyof TriggerData>(trigger: HTMLElement, prop?: K): TriggerData | TriggerData[K] {
		const triggerData = this.tD.get(trigger) || ({} as TriggerData);
		if (prop) return triggerData[prop];
		return triggerData;
	}

	setTriggerData(trigger: HTMLElement, value: TriggerData): void;
	setTriggerData(trigger: HTMLElement, value: Partial<TriggerData>, isPartial: boolean): void;
	setTriggerData(trigger: HTMLElement, value: TriggerData | Partial<TriggerData>, isPartial?: boolean) {
		const storedValue = this.getTriggerData(trigger);
		const newValue = isPartial ? { ...storedValue, ...value } : value;
		this.tD.set(trigger, newValue as TriggerData);
	}

	setTriggerStates(trigger: HTMLElement, value: Partial<TriggerStates>) {
		const triggerStates = this.getTriggerData(trigger, 'states');
		this.setTriggerData(trigger, { states: { ...triggerStates, ...value } }, true);
	}

	setTriggerScrollStates<P extends keyof ScrollCallbacks>(trigger: HTMLElement, prop: P, value?: ScrollCallbacks[P]) {
		const triggerScrollStates = this.getTriggerData(trigger, 'states').onScroll;
		triggerScrollStates[prop] = value;

		this.setTriggerStates(trigger, { onScroll: triggerScrollStates });

		//Update
		if (value) {
			if (0 === this.states.runningScrollCbs) this._it!.addScrollListener(this._it!._onScrollHandler);

			//Listen to the scrollable containers between the trigger and the root
			//so nested scrolling drives the callbacks as well
			const rootEl = this.getRoot();
			getParents(trigger).forEach(parent => {
				if (parent === rootEl || !is.scrollable(parent) || this._scrollTargets.has(parent)) return;
				this._scrollTargets.add(parent);
				parent.addEventListener('scroll', this._it!._onScrollHandler, false);
			});

			this.states.runningScrollCbs++;
			return;
		}

		if (0 < this.states.runningScrollCbs) this.states.runningScrollCbs--;
		if (0 === this.states.runningScrollCbs) {
			this._it!.removeScrollListener(this._it!._onScrollHandler);
			this._scrollTargets.forEach(el => el.removeEventListener('scroll', this._it!._onScrollHandler));
			this._scrollTargets.clear();
		}
	}

	triggerEvent(trigger: HTMLElement, eventParams: EventParams) {
		//Get Stored trigger data
		const {
			once,
			toggleClass,
			animation,
			states: { hasEnteredOnce }
		} = this.getTriggerData(trigger);
		const [name, callback, enterState, leaveState, index] = eventParams;

		callback(trigger, this._it as IntersectionTrigger); //Invoke Callback

		//The callback may have killed the instance, stop the event processing in that case
		if (!this._it || this._it.killed) return;

		toggleClass && this._it.toggleClass!.toggle(trigger, toggleClass, index);
		animation && this._it.animation!.animate(trigger, animation, index);

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
			//Remove the trigger if 'once' is true
			if (once && hasEnteredOnce) {
				this._it.remove(trigger);
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
	}

	getPositions(
		tB: DOMRect | ModifiedDOMRect,
		rB: DOMRect | ModifiedDOMRect,
		{ enter, leave, ref, refOpposite, length }: DirectionProps & { enter: number; leave: number }
	) {
		const isREPGreater = this._it!._isREPGreater;
		return [
			tB[ref] + enter * tB[length], //tEP
			tB[ref] + leave * tB[length], //tLP
			isREPGreater ? rB[refOpposite] : rB[ref], //rEP
			isREPGreater ? rB[ref] : rB[refOpposite] //rLP
		];
	}

	toggleActions(trigger: HTMLElement, tB?: DOMRect | ModifiedDOMRect, rB?: DOMRect | ModifiedDOMRect) {
		if (!this._it) return; //The instance may have been killed while processing a previous trigger

		const { enter, leave, onEnter, onLeave, onEnterBack, onLeaveBack, states } = this.getTriggerData(trigger),
			tBounds = tB ?? trigger.getBoundingClientRect(), //trigger Bounds
			rBounds = rB ?? (this._it.rootBounds = this.getRootRect(this._it.observer!.rootMargin)), //root Bounds
			{ ref, refOpposite, length } = this.dirProps(),
			[tEP, tLP, rEP, rLP] = this.getPositions(tBounds, rBounds, { enter, leave, ref, refOpposite, length });

		let modStates = { ...states, hasEnteredFromOneSide: states.hasEntered || states.hasEnteredBack };

		const updateStates = () => {
			const states = this.getTriggerData(trigger, 'states');
			modStates = { ...states, hasEnteredFromOneSide: states.hasEntered || states.hasEnteredBack };
		};

		//Enter case
		if (modStates.hasLeftBack && rEP >= tEP) {
			this.triggerEvent(trigger, ['Enter', onEnter, 'hasEntered', 'hasLeftBack', 0]);
			updateStates();
		}
		//EnterBack case
		if (modStates.hasLeft && modStates.hasEnteredOnce && rLP <= tLP) {
			this.triggerEvent(trigger, ['EnterBack', onEnterBack, 'hasEnteredBack', 'hasLeft', 2]);
			updateStates();
		}
		//Leave case
		if (modStates.hasEnteredFromOneSide && rLP > tLP) this.triggerEvent(trigger, ['Leave', onLeave, null, 'hasLeft', 1]);
		//LeaveBack case
		if (modStates.hasEnteredFromOneSide && rEP < tEP) this.triggerEvent(trigger, ['LeaveBack', onLeaveBack, null, 'hasLeftBack', 3]);
	}

	//  upcoming code is based on IntersectionObserver calculations of the root bounds. All rights reserved (https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).

	parseRootMargin(rootMargins: string) {
		const marginString = rootMargins || '0px';

		//The string only changes on update(), memoize the parsing
		if (this._parsedMargins?.source === marginString) return this._parsedMargins.margins;

		const margins = parseMarginString(marginString);
		this._parsedMargins = { source: marginString, margins };
		return margins;
	}

	getRootRect(rootMargins: string): ModifiedDOMRect {
		const hasRoot = this._it!._root && !is.doc(this._it!._root);
		const rootEl = this.getRoot();
		const rootRect = rootEl.getBoundingClientRect();

		this.setScrollbarThickness(rootEl);

		const modRootRect: ModifiedDOMRect = {
			top: hasRoot ? rootRect.top : 0,
			left: hasRoot ? rootRect.left : 0,
			bottom: hasRoot ? rootRect.bottom - this.scrollbarThickness!.x : rootEl.clientHeight,
			right: hasRoot ? rootRect.right - this.scrollbarThickness!.y : rootEl.clientWidth,
			width: 0,
			height: 0
		};
		return expandRectByMargins(modRootRect, this.parseRootMargin(rootMargins));
	}

	kill() {
		this._it = undefined;
	}
}
