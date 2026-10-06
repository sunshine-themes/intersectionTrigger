//Import Types
import type Animation from '../plugins/animation/animation';
import type ToggleClass from '../plugins/toggleclass/toggleclass';
import type Guides from '../plugins/guides/guides';
import type { DeepRequired } from '../utils/types';
import type {
	EventHandler,
	ModifiedDOMRect,
	IntersectionTriggerOptions,
	TriggerData,
	PositionsData,
	Root,
	PluginName,
	ScrollCallbacks,
	Trigger,
	TriggerOptions,
	RootPosition,
	TriggerPosition,
	Plugin
} from './types';

//Import Modules
import { defaultInsOptions, triggerStates } from '../constants';
import { mergeOptions, getMinMax, deepClone } from '../helpers';
import Utils from '../utils/utils';

const registeredPlugins: Plugin[] = [];
const instances: IntersectionTrigger[] = [];
let instanceID = 0;

class IntersectionTrigger {
	id: number;
	observer: IntersectionObserver | undefined;
	toggleClass: ToggleClass | undefined;
	customScrollHandler!: EventHandler;
	animation: Animation | undefined;
	guides: Guides | undefined;
	axis: 'x' | 'y' | undefined;
	name: string | undefined;
	triggers: HTMLElement[];
	rootBounds!: DOMRectReadOnly | ModifiedDOMRect;
	killed!: boolean;
	_states: { oCbFirstInvoke: boolean; runningScrollCbs: number };
	_options!: DeepRequired<IntersectionTriggerOptions>;
	_triggersData: WeakMap<HTMLElement, TriggerData>;
	_defaultOptions!: IntersectionTriggerOptions;
	_userOptions: IntersectionTriggerOptions;
	_onResizeHandler!: () => void;
	_positionsData!: PositionsData;
	_utils: Utils | undefined;
	_isREPGreater!: boolean;
	_threshold!: number[];
	_rootMargin!: string;
	_rAFID!: number;
	_resizeRAFID!: number;
	_rootResizeObserver: ResizeObserver | undefined;
	_root!: Root;
	static getInstanceById: (id: number) => IntersectionTrigger | undefined;
	static registerPlugins: (plugins: Plugin[]) => number;
	static getInstances: () => IntersectionTrigger[];
	static getRegisteredPlugins: () => Plugin[];
	static update: () => void;
	static kill: () => void;

	constructor(options?: IntersectionTriggerOptions) {
		this._userOptions = options || {};
		this.triggers = [];
		this._triggersData = new WeakMap();
		//
		this.id = instanceID;
		instanceID++;
		instances.push(this);
		//
		this.animation = undefined;
		this.toggleClass = undefined;
		this.guides = undefined;
		//
		this._states = {
			oCbFirstInvoke: true, //observer callback first call
			runningScrollCbs: 0 //Running scroll functions
		};
		//
		this._utils = new Utils(this);
		//
		this._setInstance();
	}

	_setPlugin(pluginName: PluginName) {
		const plugins = IntersectionTrigger.getRegisteredPlugins();
		const Plugin = plugins.find(plg => pluginName === plg.pluginName);
		//The plugin classes share the constructor shape, the index access is safe for registered names
		if (Plugin) (this as unknown as Record<PluginName, unknown>)[pluginName] = new Plugin(this);
	}

	_addResizeListener() {
		this._removeResizeListener();

		this._onResizeHandler = () => {
			if (this._resizeRAFID) return; //coalesce the resize bursts into a single update
			this._resizeRAFID = requestAnimationFrame(() => {
				this._resizeRAFID = 0;
				this.update();
			});
		};
		this._utils!.getRoot('resize').addEventListener('resize', this._onResizeHandler, false);

		//Watch a root element for size changes that are not caused by a window resize
		if (this._root && typeof ResizeObserver !== 'undefined') {
			let roInitialized = false; //ResizeObserver fires once on observe, skip that initial call
			this._rootResizeObserver = new ResizeObserver(() => {
				if (!roInitialized) {
					roInitialized = true;
					return;
				}
				this._onResizeHandler();
			});
			this._rootResizeObserver.observe(this._root);
		}
	}
	_removeResizeListener() {
		this._utils!.getRoot('resize').removeEventListener('resize', this._onResizeHandler, false);
		this._rootResizeObserver?.disconnect();
		this._rootResizeObserver = undefined;
		if (this._resizeRAFID) {
			cancelAnimationFrame(this._resizeRAFID);
			this._resizeRAFID = 0;
		}
	}

	_rAFCallback: FrameRequestCallback = () => {
		this._rAFID = 0;
		if (this.killed) return;

		//One root bounds computation per frame, shared by all triggers
		this.rootBounds = this._utils!.getRootRect(this.observer!.rootMargin);

		//Call all onScroll triggers Functions
		this.triggers.forEach(trigger => {
			const onScrollFuns = this._utils!.getTriggerData(trigger, 'states').onScroll;
			for (const k in onScrollFuns) {
				const fnName = k as keyof ScrollCallbacks;
				onScrollFuns[fnName] && onScrollFuns[fnName]!(trigger, undefined, this.rootBounds);
			}
		});
	};
	_onScrollHandler = () => {
		if (this._rAFID) return; //a frame is already scheduled, coalesce the scroll events
		this._rAFID = requestAnimationFrame(this._rAFCallback);
	};

	addScrollListener(handler: EventHandler) {
		this._utils!.getRoot('scroll').addEventListener('scroll', handler, false);
	}
	removeScrollListener(handler: EventHandler) {
		this._utils!.getRoot('scroll').removeEventListener('scroll', handler, false);
	}

	_observerCallback: IntersectionObserverCallback = (entries, observer) => {
		const { length } = this._utils!.dirProps();

		//One root bounds computation per batch. IO's entry.rootBounds is NOT used because it can
		//disagree with the manual measurement (e.g. inside iframes) and every position must come
		//from the same coordinate source as setRootMargin and the scroll-linked handlers.
		this.rootBounds = this._utils!.getRootRect(observer.rootMargin);

		for (const entry of entries) {
			if (this.killed) return; //The instance may have been killed while processing a previous entry

			//Trigger data
			const trigger = entry.target as HTMLElement,
				tB = entry.boundingClientRect, //trigger Bounds at observation time, same frame as this callback
				isIntersecting = entry.isIntersecting;
			// intersectionRatio = entry.intersectionRatio;

			//Skip entries of triggers removed while processing a previous entry (e.g. "once" triggers)
			if (!this._utils!.getTriggerData(trigger, 'states')) continue;

			//Root Data
			const rB = this.rootBounds,
				rL = rB[length];
			//Getting needed data
			const {
					onScroll: { backup }
				} = this._utils!.getTriggerData(trigger, 'states'),
				initBackupFun = tB[length] >= rL,
				isBackupFunRunning = !!backup;

			//The trigger bounds are re-read: the entry rect was captured at the crossing frame,
			//but an animated scroll may have moved the trigger further by the time this callback runs.
			//The root bounds are stable during a scroll, so the hoisted batch bounds stay valid.
			this._utils!.toggleActions(trigger, undefined, rB);

			//The trigger callback may have killed the instance or removed the trigger
			if (this.killed) return;
			if (!this._utils!.getTriggerData(trigger, 'states')) continue;

			if (this._states.oCbFirstInvoke) {
				isIntersecting &&
					initBackupFun &&
					this._utils!.setTriggerScrollStates(trigger, 'backup', this._utils!.toggleActions.bind(this._utils!));
				continue;
			}

			if (isIntersecting) {
				!isBackupFunRunning &&
					initBackupFun &&
					this._utils!.setTriggerScrollStates(trigger, 'backup', this._utils!.toggleActions.bind(this._utils!));
			} else {
				isBackupFunRunning && this._utils!.setTriggerScrollStates(trigger, 'backup');
			}
		}
		//Reset oCbFirstInvoke state
		this._states.oCbFirstInvoke = false;
	};

	_createInstance() {
		this._rootMargin = this._utils!.setRootMargin(this._positionsData.rEP, this._positionsData.rLP); //Create root margin
		this._threshold = this._utils!.setThreshold(); //Create observer threshold

		this.observer = new IntersectionObserver(this._observerCallback, {
			root: this._root,
			rootMargin: this._rootMargin,
			threshold: this._threshold
		});

		this._root = this.observer.root as HTMLElement | null;
		this.rootBounds = this._utils!.getRootRect(this.observer.rootMargin);
	}

	_setInstance() {
		//Default Options for instance
		this._defaultOptions = defaultInsOptions;
		this._options = mergeOptions(this._defaultOptions, this._userOptions);
		const {
			axis,
			name,
			root,
			defaults: { enter, leave },
			onScroll,
			rootEnter,
			rootLeave,
			guides
		} = this._options;

		this.axis = axis; //Scroll Axis
		this.name = name; //Name of IntersectionTrigger instance

		this._root = this._utils!.parseRoot(root);
		this._positionsData = this._utils!.parsePositions(enter, leave, rootEnter, rootLeave);

		//Add onScroll custom handler
		this.customScrollHandler = onScroll;

		//Create an IntersectionObserver
		this._createInstance();
		//Init Event listeners
		this._addResizeListener();
		this.customScrollHandler && this.addScrollListener(this.customScrollHandler);

		//Add guides
		if (guides) {
			this._setPlugin('guides');
			this.guides!.init(guides);
		}

		return this;
	}

	add(trigger: Trigger, options?: TriggerOptions) {
		const toAddTriggers = this._utils!.parseQuery(trigger),
			{ defaults } = this._options,
			userOpts = options || {};

		const getPositionNormal = (pos?: RootPosition | TriggerPosition, name: 'tEP' | 'tLP' = 'tEP') =>
				pos ? this._utils!.setPositionData(pos).normal : this._positionsData[name].normal,
			getPlugin = <N extends Exclude<PluginName, 'guides'>>(name: N) => {
				!this[name] && this._setPlugin(name);
				return this[name] as NonNullable<(typeof this)[N]>;
			};

		const mergedParams = mergeOptions(defaults as TriggerOptions, userOpts),
			{ enter, leave, toggleClass, animation } = mergedParams,
			triggerParams = {
				...mergedParams,
				enter: getPositionNormal(enter),
				leave: getPositionNormal(leave, 'tLP'),
				toggleClass: toggleClass ? getPlugin('toggleClass').parse(toggleClass) : undefined,
				animation: animation ? getPlugin('animation').parse(animation) : undefined,
				states: triggerStates
			} as TriggerData;

		const [lowerPosition, higherPosition] = getMinMax(triggerParams.enter, triggerParams.leave);
		triggerParams.lowerPosition = lowerPosition;
		triggerParams.higherPosition = higherPosition;

		//Add new Triggers
		this.triggers = [...new Set([...this.triggers, ...toAddTriggers])]; //new Set to remove any duplicates
		//
		let mustUpdate = false;
		[triggerParams.enter, triggerParams.leave].forEach(
			normalizedPos => !this._threshold.some(value => normalizedPos === value) && (mustUpdate = true)
		);

		if (mustUpdate) {
			//set new triggers data
			toAddTriggers.forEach(trigger => this._utils!.setTriggerData(trigger, deepClone(triggerParams)));
			this.update();
		} else {
			toAddTriggers.forEach(trigger => {
				this._utils!.setTriggerData(trigger, deepClone(triggerParams));
				this.observer!.observe(trigger);
			});
		}

		//Update guides
		this.guides && this.guides.update();

		return this;
	}

	remove(trigger: Trigger) {
		const toRemoveTriggers = this._utils!.parseQuery(trigger);

		toRemoveTriggers.forEach(trigger => {
			//Release the scroll listener bookkeeping before the trigger data is deleted
			const { onScroll } = this._utils!.getTriggerData(trigger, 'states') || {};
			onScroll &&
				(Object.keys(onScroll) as (keyof ScrollCallbacks)[]).forEach(
					key => onScroll[key] && this._utils!.setTriggerScrollStates(trigger, key)
				);

			this._utils!.deleteTriggerData(trigger);
			this.observer!.unobserve(trigger);
		});

		const updatedStoredTriggers = this.triggers.filter(storedTrigger => {
			const isInRemoveTriggers = toRemoveTriggers.some(toRemoveTrigger => storedTrigger === toRemoveTrigger);

			return !isInRemoveTriggers;
		});

		this.triggers = updatedStoredTriggers;

		//Update guides
		this.guides && this.guides.update();

		return this;
	}
	_disconnect() {
		//Disconnect the IntersctionObserver
		this.observer && this.observer.disconnect();
		this.observer = undefined;
	}

	update() {
		//Disconnect the IntersctionObserver
		this._disconnect();
		//recreate the observer
		this._createInstance();
		//re-observe the triggers
		this.triggers.forEach(trigger => this.observer && this.observer.observe(trigger));
		//Update the animation data (the scroll-linked handlers hold stale trigger measurements)
		this.animation && this.animation.update();
		//Update guides
		this.guides && this.guides.update();
	}

	kill() {
		this.killed = true;

		this._disconnect(); //Disconnect the IntersctionObserver

		//Remove event listeners
		this.removeScrollListener(this._onScrollHandler);
		this.removeScrollListener(this.customScrollHandler);
		this._removeResizeListener();
		this._rAFID && cancelAnimationFrame(this._rAFID);

		this.guides && this.guides.kill(); //Kill guides instance
		this.toggleClass && this.toggleClass.kill(); //Kill toggleClass instance
		this.animation && this.animation.kill(); //Kill animation instance

		this._utils!.kill(); //Kill utils instance

		this.triggers = []; //Remove all triggers
		this.animation = this.toggleClass = this.guides = this._utils = undefined;

		//Remove from stored instances
		const instanceIndex = instances.indexOf(this);
		~instanceIndex && instances.splice(instanceIndex, 1);
	}
}

IntersectionTrigger.getInstances = () => instances;
IntersectionTrigger.getInstanceById = (id: number) => instances.find((ins: IntersectionTrigger) => ins.id === id);
IntersectionTrigger.update = () => instances.forEach(ins => ins.update());
IntersectionTrigger.kill = () => {
	while (instances.length) instances[0].kill();
};
IntersectionTrigger.registerPlugins = (plugins = []) => registeredPlugins.push(...plugins);
IntersectionTrigger.getRegisteredPlugins = () => registeredPlugins;

export default IntersectionTrigger;
