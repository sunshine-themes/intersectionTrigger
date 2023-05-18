import type IntersectionTrigger from '../../core/core';
import type Utils from '../../utils/utils';
import type { PluginName } from '../../core/types';
import type { DeepRequired } from '../../utils/types';
import type { Anime, AnimeInstance, SnapParams, SnapConfiguration, SnapOptions, AnimationParams, AnimationOptions } from './types';

import { clamp, is, mergeOptions, splitStr, throwError } from '../../helpers';
import { defaultAnimationConfig, snapDefaultConfig } from '../../constants';

class Animation {
	_it: IntersectionTrigger | undefined;
	_utils: Utils | undefined;
	killed!: boolean;
	seekSmoothly!: (ins: Anime<AnimeInstance>, seekTo: number, link: number, isSeekToGreater: boolean) => void;
	seek!: (ins: Anime<AnimeInstance>, seekTo: number, link: boolean | number) => void;
	getTIL!: (trigger: HTMLElement, lowerPosition: number, higherPosition: number) => number;
	getSnapStep!: (snap: SnapParams | boolean) => number;
	startSnapping!: ({
		snapDistance,
		currentDis,
		snap,
		step,
		toRef
	}: {
		snapDistance: number;
		currentDis: number;
		snap: SnapParams;
		step: number;
		toRef?: boolean | undefined;
	}) => void;
	animateHandler!: (
		trigger: HTMLElement,
		{
			enter,
			leave,
			tIL,
			instance,
			snap,
			step,
			link
		}: {
			enter: number;
			leave: number;
			tIL: number;
			instance: Anime<AnimeInstance>;
			snap: boolean | SnapParams;
			step: number;
			link: number | boolean;
		}
	) => void;
	parseSnap!: {
		({ instance, snap }: { instance: Anime<AnimeInstance>; snap: SnapConfiguration }): SnapParams;
		({ instance, snap }: { instance: Anime<AnimeInstance>; snap: SnapParams }, update: boolean): SnapParams;
	};
	static pluginName: PluginName;

	constructor(it: IntersectionTrigger) {
		this._registerIntersectionTrigger(it);
		this.setUtils();
		return this;
	}
	_registerIntersectionTrigger(intersectionTrigger: IntersectionTrigger) {
		this._it = intersectionTrigger;
		this._utils = this._it!._utils;
	}

	setUtils() {
		const { ref, refOpposite, length } = this._utils!.dirProps();
		const isVer = this._utils!.isVertical();
		const root = this._utils!.getRoot();

		const rAFIDs = new WeakMap();
		this.seekSmoothly = (ins, seekTo, link, isSeekToGreater) => {
			if (this.killed) return;

			const cT = ins.currentTime;
			const sT = isSeekToGreater ? Math.min(cT + link, seekTo) : Math.max(cT - link, seekTo);
			ins.seek(sT);
			const hasComplete = isSeekToGreater ? sT >= seekTo : sT <= seekTo;
			if (hasComplete) return;

			const rAFID = requestAnimationFrame(() => this.seekSmoothly(ins, seekTo, link, isSeekToGreater));
			rAFIDs.set(ins, rAFID);
		};

		this.seek = (ins, seekTo, link) => {
			if (is.num(link)) {
				const cT = ins.currentTime;
				const isSeekToGreater = seekTo > cT;
				const rAFID = (rAFIDs.has(ins) && rAFIDs.get(ins)) || 0;

				cancelAnimationFrame(rAFID);
				this.seekSmoothly(ins, seekTo, link, isSeekToGreater);
				return;
			}
			ins.seek(seekTo);
		};

		this.startSnapping = ({ snapDistance, currentDis, snap, step, toRef = false }) => {
			if (this.killed) return;

			const direction = toRef ? -1 : 1;
			if (isVer) {
				root.scrollBy({
					top: step * direction,
					behavior: 'instant' as ScrollBehavior
				});
			} else {
				root.scrollBy({
					left: step * direction,
					behavior: 'instant' as ScrollBehavior
				});
			}
			currentDis += step;
			if (currentDis >= snapDistance) {
				currentDis = 0;
				snap.onComplete(this._it as IntersectionTrigger);
				return;
			}
			requestAnimationFrame(() => this.startSnapping({ snapDistance, currentDis, snap, step, toRef }));
		};

		this.parseSnap = ({ instance, snap }: { instance: Anime<AnimeInstance>; snap: SnapConfiguration | SnapParams }, update?: boolean) => {
			const parseNum = (n: number) => {
				const arr: number[] = [];
				let progress = 0;
				while (progress <= 1) {
					arr.push(clamp(progress, 0, 1));
					progress = progress + n;
				}
				return arr.map(v => Math.round(v * instance.duration));
			};
			const parseMarks = (): number[] => {
				if (!is.inObject(instance, 'marks')) return throwError('"marks" feature is not available in the provided anime instance');
				return (instance as Anime<anime.AnimeTimelineInstance>).marks!.map((mark: { name: string; time: number }) => mark.time);
			};
			const mergeOpts = (customOpts: SnapOptions) => mergeOptions(snapDefaultConfig, customOpts);
			const parseOriginalToParam = (to: number | string | number[]) => (is.num(to) ? parseNum(to) : parseMarks());

			let snapParams = {} as SnapParams;
			let mergedParams = {} as DeepRequired<SnapOptions>;

			if (update) {
				const { originalToParam } = snap as SnapParams;
				originalToParam && (snapParams = { ...(snap as SnapParams), to: parseOriginalToParam(originalToParam) });
			} else {
				if (is.boolean(snap)) mergedParams = mergeOpts({ to: 'marks' });
				if (is.array(snap) || is.num(snap)) mergedParams = mergeOpts({ to: snap });
				if (is.object(snap)) mergedParams = mergeOpts(snap as SnapOptions);

				snapParams = mergedParams as SnapParams;

				const { to } = mergedParams;
				if (is.string(to) && !!to) snapParams = { ...mergedParams, originalToParam: 'marks', to: parseMarks() };
				if (is.num(to) && !!to) snapParams = { ...mergedParams, originalToParam: to, to: parseNum(to) };
			}

			return snapParams;
		};

		this.getTIL = (trigger, lowerPosition, higherPosition) => {
			const tB = trigger.getBoundingClientRect();
			return tB[length] - (lowerPosition * tB[length] + (1 - higherPosition) * tB[length]);
		};

		this.getSnapStep = snap => (is.object(snap) ? Math.round(Math.max((snap.speed * 17) / 1000, 1)) : 0);

		this.animateHandler = (trigger, { enter, leave, tIL, instance, snap, step, link }) => {
			if (this.killed) return;

			const tB = trigger.getBoundingClientRect(), //trigger Bounds
				ids = this._utils!.getTriggerData(trigger, 'states').ids,
				rB = (this._it!.rootBounds = this._utils!.getRootRect(this._it!.observer!.rootMargin)), //root Bounds
				scrollLength = tIL + (this._it!._isREPGreater ? rB[length] : -rB[length]),
				duration = instance.duration;

			const pos = this._utils!.getPositions(tB, rB, { enter, leave, ref, refOpposite, length });
			const diff = pos[2] - pos[0]; // root enter position - trigger enter position

			let seekTo = 0;

			if (diff > 0) {
				seekTo = (duration * diff) / scrollLength;
				this.seek(instance, seekTo, link);
			}

			//Snap
			if (!is.boolean(snap)) {
				const dis = 0;
				// Clear timeout
				clearTimeout(ids.snapTimeOutId);
				// Set a timeout to run after scrolling stops
				const snapTimeOutId = setTimeout(() => {
					const directionalDiff = snap.to.map(n => seekTo - n),
						diff = directionalDiff.map(n => Math.abs(n)),
						closest = Math.min(...diff),
						closestWithDirection = directionalDiff[diff.indexOf(closest)],
						snapDistance = (scrollLength * closest) / duration,
						snapData = { snapDistance, currentDis: dis, snap, step };

					if (snapDistance >= snap.maxDistance || snapDistance < step) return;

					snap.onStart(this._it as IntersectionTrigger);

					if (closestWithDirection < 0) {
						this.startSnapping(snapData);
						return;
					}

					this.startSnapping({ ...snapData, toRef: true });
				}, snap.after * 1000);

				//Update the id of Timeout
				this._utils!.setTriggerStates(trigger, { ids: { ...ids, snapTimeOutId } });
			}
		};
	}

	animate(trigger: HTMLElement, animation: AnimationParams, eventIndex: number) {
		const { instance, toggleActions, link, snap } = animation;

		if (link) {
			const {
				enter,
				leave,
				lowerPosition,
				higherPosition,
				states: {
					onScroll: { animate },
					ids
				}
			} = this._utils!.getTriggerData(trigger);
			const tIL = this.getTIL(trigger, lowerPosition, higherPosition); //trigger Intersection length
			const step = this.getSnapStep(snap);
			const animateData = { enter, leave, tIL, instance, snap, link: is.boolean(link) ? link : Math.abs(link), step };

			switch (eventIndex) {
				case 0:
				case 2:
					this._it!._states.oCbFirstInvoke && this.animateHandler(trigger, animateData); //to update the animation if the root intersects trigger at beginning

					if (animate) break;
					this._utils!.setTriggerScrollStates(trigger, 'animate', () => this.animateHandler(trigger, animateData));
					break;
				case 1:
				case 3:
					// Clear snapping
					clearTimeout(ids.snapTimeOutId);
					this._utils!.setTriggerScrollStates(trigger, 'animate');

					//Reset the animation
					this.seek(instance, 1 === eventIndex ? instance.duration : 0, link);
					break;
			}

			return;
		}

		const action = toggleActions[eventIndex];
		const progress = instance.currentTime / instance.duration;
		if ('none' === action) return;

		switch (action) {
			case 'play':
				if (instance.reversed) {
					instance.reverse();
					instance.completed = false;
				}
				progress < 1 && instance[action]();
				break;
			case 'resume':
				progress < 1 && progress > 0 && instance.play();
				break;
			case 'restart':
			case 'reset':
				instance.reversed && instance.reverse();
				instance[action]();
				break;
			case 'pause':
				instance[action]();
				break;
			case 'complete':
				instance.pause();
				instance.seek(instance.reversed ? 0 : instance.duration);
				break;
			case 'reverse':
				!instance.reversed && instance[action]();
				instance.paused && instance.play();
				break;
			case 'kill':
				is.inObject(instance, 'kill') && instance.kill();
				this._utils!.setTriggerData(trigger, { animation: undefined }, true);
				break;
		}
	}

	parse(params: Anime<AnimeInstance> | AnimationOptions): AnimationParams;
	parse(params: AnimationParams, update: boolean): AnimationParams;
	parse(params: Anime<AnimeInstance> | AnimationOptions | AnimationParams, update?: boolean) {
		let mergedParams = {} as DeepRequired<AnimationOptions>,
			animationParams = {} as AnimationParams;

		if (update) {
			const { instance, snap } = params as AnimationParams;
			!is.boolean(snap) && (animationParams = { ...(params as AnimationParams), snap: this.parseSnap({ instance, snap }, true) });
		} else {
			if (!is.object(params)) return throwError('"animation" parameter is NOT valid.');

			if (is.animeInstance(params)) {
				mergedParams = mergeOptions(defaultAnimationConfig, {
					instance: params
				});
			} else if (params.instance && is.animeInstance(params.instance)) {
				mergedParams = mergeOptions(defaultAnimationConfig, params);
			} else {
				return throwError('"instance" parameter must be anime instance.');
			}

			const { toggleActions, snap, instance, link } = mergedParams;

			animationParams = {
				instance,
				toggleActions: splitStr(toggleActions),
				snap: !!snap && this.parseSnap({ instance, snap }),
				link
			};
		}

		//Reset anime instance
		animationParams.instance.reset();

		return animationParams;
	}

	update() {
		this._it!.triggers.forEach(trigger => {
			//update the animation data
			const { enter, leave, lowerPosition, higherPosition, animation } = this._utils!.getTriggerData(trigger),
				anim = animation && this.parse(animation, true); //parsed animation data
			this._utils!.setTriggerData(trigger, { animation: anim }, true);

			//update the animation handler data
			const { animate } = this._utils!.getTriggerData(trigger, 'states').onScroll;
			if (animate && !!anim) {
				const { instance, snap, link } = anim;
				const tIL = this.getTIL(trigger, lowerPosition, higherPosition);
				const step = this.getSnapStep(snap);
				//reassign an animate handler
				this._utils!.setTriggerScrollStates(trigger, 'animate');
				this._utils!.setTriggerScrollStates(trigger, 'animate', () =>
					this.animateHandler(trigger, { enter, leave, instance, snap, link, tIL, step })
				);
			}
		});
	}

	kill() {
		this.killed = true;

		this._it = this._utils = undefined;
	}
}

Animation.pluginName = 'animation';

export default Animation;
