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
	Position,
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
	axis: string | undefined;
	name: string | undefined;
	triggers: HTMLElement[];
	rootBounds!: DOMRectReadOnly | ModifiedDOMRect;
	killed!: boolean;
	_states: { oCbFirstInvoke: boolean; runningScrollCbs: number };
	_options!: DeepRequired<IntersectionTriggerOptions>;
	_triggersData: WeakMap<HTMLElement, TriggerData>;
	_defaultOptions!: IntersectionTriggerOptions;
	_userOptions: IntersectionTriggerOptions;
	_onResizeHandler!: EventHandler;
	_positionsData!: PositionsData;
	_utils: Utils | undefined;
	_isREPGreater!: boolean;
	_threshold!: number[];
	_rootMargin!: string;
	_rAFID!: number;
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
		//@ts-ignore
		Plugin && (this[pluginName] = new Plugin(this));
	}

	_addResizeListener() {
		this._removeResizeListener();

		this._onResizeHandler = () => this.update();
		this._utils!.getRoot('resize').addEventListener('resize', this._onResizeHandler, false);
	}
	_removeResizeListener() {
		this._utils!.getRoot('resize').removeEventListener('resize', this._onResizeHandler, false);
	}

	_rAFCallback: FrameRequestCallback = () => {
		//Call all onScroll triggers Functions
		this.triggers.forEach(trigger => {
			const onScrollFuns = this._utils!.getTriggerData(trigger, 'states').onScroll;
			for (const k in onScrollFuns) {
				const fnName = k as keyof ScrollCallbacks;
				onScrollFuns[fnName] && onScrollFuns[fnName]!(trigger);
			}
		});
	};
	_onScrollHandler = () => (this._rAFID = requestAnimationFrame(this._rAFCallback));

	addScrollListener(handler: EventHandler) {
		this._utils!.getRoot('scroll').addEventListener('scroll', handler, false);
	}
	removeScrollListener(handler: EventHandler) {
		this._utils!.getRoot('scroll').removeEventListener('scroll', handler, false);
	}

	_observerCallback: IntersectionObserverCallback = (entries, observer) => {
		const { length } = this._utils!.dirProps();

		for (const entry of entries) {
			//Trigger data
			const trigger = entry.target as HTMLElement,
				tB = entry.boundingClientRect, //trigger Bounds
				isIntersecting = entry.isIntersecting;
			// intersectionRatio = entry.intersectionRatio;

			//Root Data
			const rB = (this.rootBounds = entry.rootBounds || this._utils!.getRootRect(observer.rootMargin)), //root Bounds
				rL = rB[length];
			//Getting needed data
			const {
					onScroll: { backup }
				} = this._utils!.getTriggerData(trigger, 'states'),
				initBackupFun = tB[length] >= rL,
				isBackupFunRunning = !!backup;

			const toggleActions = this._utils!.toggleActions;
			const setStates = this._utils!.setTriggerScrollStates;

			toggleActions(trigger);

			if (this._states.oCbFirstInvoke) {
				isIntersecting && initBackupFun && setStates(trigger, 'backup', toggleActions);
				continue;
			}

			if (isIntersecting) {
				!isBackupFunRunning && initBackupFun && setStates(trigger, 'backup', toggleActions);
			} else {
				isBackupFunRunning && setStates(trigger, 'backup');
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

		const getPositionNormal = (pos?: Position, name: 'tEP' | 'tLP' = 'tEP') =>
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

		const [minPosition, maxPosition] = getMinMax(triggerParams.enter, triggerParams.leave);
		triggerParams.minPosition = minPosition;
		triggerParams.maxPosition = maxPosition;

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
