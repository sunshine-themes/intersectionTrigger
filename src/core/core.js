import { defaultInsOptions, triggerStates } from '../constants';
import { mergeOptions, is, throwError, getMinMax } from '../helpers';
import Utils from '../Utils';

const registeredPlugins = [];
const instances = [];
let instanceID = 0;

class IntersectionTrigger {
	constructor(configuration = {}) {
		this._userOptions = configuration;
		this.triggers = [];
		this._triggersData = new WeakMap();
		//
		this._utils = new Utils(this);
		//
		this.id = instanceID;
		instanceID++;
		instances.push(this);
		//
		this.animation = null;
		this.toggleClass = null;
		this.guides = null;
		//
		this._setStates();
		this._setInstance();
	}

	_setPlugin(propertyName) {
		const plugins = IntersectionTrigger.getRegisteredPlugins();
		const Plugin = plugins.find((plg) => propertyName === plg.pluginName);
		Plugin && (this[propertyName] = new Plugin(this));
	}

	_addResizeListener() {
		this._removeResizeListener();

		this._onResizeHandler = () => this.update();
		this._utils.getRoot().addEventListener('resize', this._onResizeHandler, false);
	}
	_removeResizeListener() {
		this._utils.getRoot().removeEventListener('resize', this._onResizeHandler, false);
	}

	_setStates() {
		this._states = {};
		this._states.oCbFirstInvoke = true; //observer callback first call
		this._states.runningScrollCbs = 0;
	}

	_rAFCallback = (time) => {
		//Call all onScroll triggers Functions
		this.triggers.forEach((trigger) => {
			const onScrollFuns = this._utils.getTriggerStates(trigger, 'onScroll');
			for (const key in onScrollFuns) {
				onScrollFuns[key] && is.function(onScrollFuns[key]) && onScrollFuns[key](trigger, time);
			}
		});
	};
	_onScrollHandler = () => (this._rAFID = requestAnimationFrame(this._rAFCallback));

	addScrollListener(handler) {
		this._utils.getRoot().addEventListener('scroll', handler, false);
	}
	removeScrollListener(handler) {
		this._utils.getRoot().removeEventListener('scroll', handler, false);
	}

	_observerCallback = (entries, observer) => {
		const { ref, refOpposite, length } = this._utils.dirProps();
		for (const entry of entries) {
			//Trigger data
			const trigger = entry.target,
				tB = entry.boundingClientRect, //trigger Bounds
				isIntersecting = entry.isIntersecting;
			// intersectionRatio = entry.intersectionRatio;

			//Root Data
			this.rootBounds = entry.rootBounds || this._utils.getRootRect(observer.rootMargin);
			const rB = this.rootBounds, //root Bounds;
				rL = rB[length];

			//Getting needed data
			const { enter, leave } = this._utils.getTriggerData(trigger);
			const {
				hasEnteredFromOneSide,
				onScroll: { backup },
			} = this._utils.getTriggerStates(trigger);
			const [tEP, tLP, rEP, rLP] = this._utils.getPositions(tB, rB, { enter, leave, ref, refOpposite, length });

			//States
			const initBackupFun = tB[length] >= rL,
				isBackupFunRunning = !!backup;

			switch (true) {
				case this._states.oCbFirstInvoke:
					switch (true) {
						case !isIntersecting && rLP > tLP:
							this._utils.onTriggerEnter(trigger);
							this._utils.onTriggerLeave(trigger);
							break;
						case isIntersecting:
							switch (true) {
								case rEP > tEP && rLP < tLP:
									this._utils.onTriggerEnter(trigger);
									break;
								case rLP > tLP:
									this._utils.onTriggerEnter(trigger);
									this._utils.onTriggerLeave(trigger);
									break;
							}
							if (initBackupFun) this._utils.setTriggerScrollStates(trigger, 'backup', this._utils.toggleActions);
							break;
					}
					break;
				case !isIntersecting:
					if (isBackupFunRunning) this._utils.setTriggerScrollStates(trigger, 'backup', null);

					switch (true) {
						case hasEnteredFromOneSide && rLP > tLP:
							this._utils.onTriggerLeave(trigger);
							break;
						case hasEnteredFromOneSide && rEP < tEP:
							this._utils.onTriggerLeave(trigger, 'onLeaveBack');
							break;
					}
					break;
				case isIntersecting && !isBackupFunRunning:
					this._utils.toggleActions(trigger);
					initBackupFun && this._utils.setTriggerScrollStates(trigger, 'backup', this._utils.toggleActions);
					break;
			}
		}
		//Reset oCbFirstInvoke state
		this._states.oCbFirstInvoke = false;
	};

	_createInstance() {
		//Create root margin
		this._rootMargin = this._utils.setRootMargin(this._positionsData.rEP, this._positionsData.rLP);
		//Create observer threshold
		this._threshold = this._utils.setThreshold();

		this._observerOptions = {
			root: this._root,
			rootMargin: this._rootMargin,
			threshold: this._threshold,
		};

		this.observer = new IntersectionObserver(this._observerCallback, this._observerOptions);

		this._root = this.observer.root;
		this.rootBounds = this._utils.getRootRect(this.observer.rootMargin);
		this._isViewport = this._utils.isViewport();
	}

	_setInstance() {
		//Default Options for instance
		this._defaultOptions = defaultInsOptions;
		this._options = mergeOptions(this._defaultOptions, this._userOptions);

		//Scroll Axis
		this.axis = is.string(this._options.axis) ? this._options.axis : throwError('axis parameter must be a string.');
		//Name of IntersectionTrigger instance
		this.name = is.string(this._options.name) ? this._options.name : throwError('name parameter must be a string.');

		this._root = (!!this._options.root && this._utils.customParseQuery(this._options.root, 'root')) || null;
		this._positionsData = this._utils.parsePositions(
			this._options.defaults.enter,
			this._options.defaults.leave,
			this._options.rootEnter,
			this._options.rootLeave
		);

		//Add onScroll custom handler
		this.customScrollHandler = this._options.onScroll;

		//Create trigger defaults
		const { once, onEnter, onLeave, onEnterBack, onLeaveBack, toggleClass, animation } = this._options.defaults,
			normalizedTEP = this._positionsData.tEP.normal,
			normalizedTLP = this._positionsData.tLP.normal,
			[minPosition, maxPosition] = getMinMax(normalizedTEP, normalizedTLP);

		this._defaultTriggerParams = {
			enter: normalizedTEP,
			leave: normalizedTLP,
			minPosition,
			maxPosition,
			once,
			onEnter,
			onLeave,
			onEnterBack,
			onLeaveBack,
			toggleClass,
			animation,
		};

		//Create an IntersectionObserver
		this._createInstance();
		//Init Event listeners
		this._addResizeListener();
		this.customScrollHandler && this.addScrollListener(this.customScrollHandler);

		//Add guides
		if (this._options.guides) {
			this._setPlugin('guides');
			this.guides.init(this._options.guides);
		}

		return this;
	}

	add(trigger = {}, config = {}) {
		const toAddTriggers = this._utils.customParseQuery(trigger);

		'enter' in config && (config.enter = this._utils.setPositionData(config.enter).normal);
		'leave' in config && (config.leave = this._utils.setPositionData(config.leave).normal);

		const mergedParams = mergeOptions(this._defaultTriggerParams, config);
		const [minPosition, maxPosition] = getMinMax(mergedParams.enter, mergedParams.leave);
		const triggerParams = {
			...mergedParams,
			minPosition,
			maxPosition,
			states: { ...triggerStates },
		};
		const parseProp = (name) => {
			!this[name] && this._setPlugin(name);
			triggerParams[name] = this[name].parse(triggerParams[name]);
		};

		triggerParams.toggleClass && parseProp('toggleClass');
		triggerParams.animation && parseProp('animation');
		//Add new Triggers
		this.triggers = [...new Set([...this.triggers, ...toAddTriggers])]; //new Set to remove any duplicates
		//
		let mustUpdate = false;
		[config.enter, config.leave].forEach((position) => !this._threshold.some((value) => position === value) && (mustUpdate = true));

		if (mustUpdate) {
			//set new triggers data
			toAddTriggers.forEach((trigger) => this._utils.setTriggerData(trigger, triggerParams));
			this.update();
		} else {
			toAddTriggers.forEach((trigger) => {
				this._utils.setTriggerData(trigger, triggerParams);
				this.observer.observe(trigger);
			});
		}

		//Update guides
		this.guides && this.guides.update();

		return this;
	}

	remove(trigger = {}) {
		let toRemoveTriggers = this._utils.customParseQuery(trigger);
		toRemoveTriggers.forEach((trigger) => {
			this._utils.deleteTriggerData(trigger);
			this.observer.unobserve(trigger);
		});

		const updatedStoredTriggers = this.triggers.filter((storedTrigger) => {
			const isInRemoveTriggers = toRemoveTriggers.some((toRemoveTrigger) => storedTrigger === toRemoveTrigger);

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
		this.observer = null;
	}

	update() {
		//Disconnect the IntersctionObserver
		this._disconnect();
		//recreate the observer
		this._createInstance();
		//reobserve the triggers
		this.triggers.forEach((trigger) => this.observer.observe(trigger));
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
		this.toggleClasss && this.toggleClasss.kill(); //Kill toggleClasss instance
		this.animation && this.animation.kill(); //Kill animation instance

		this.triggers = []; //Remove all triggers
		this.animation = this.toggleClass = this.guides = this._utils = null;

		//Remove from stored instances
		const instanceIndex = instances.indexOf(this);
		~instanceIndex && instances.splice(instanceIndex, 1);
	}
}

IntersectionTrigger.getInstances = () => instances;
IntersectionTrigger.getInstanceById = (id) => instances.find((ins) => ins.id === id);
IntersectionTrigger.update = () => instances.forEach((ins) => ins.update());
IntersectionTrigger.kill = () => instances.forEach((ins) => ins.kill());
IntersectionTrigger.registerPlugins = (plugins = []) => registeredPlugins.push(...plugins);
IntersectionTrigger.getRegisteredPlugins = () => registeredPlugins;

export default IntersectionTrigger;
