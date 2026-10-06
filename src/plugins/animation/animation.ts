import type IntersectionTrigger from '../../core/core';
import type Utils from '../../utils/utils';
import type { PluginName } from '../../core/types';
import type { DeepRequired } from '../../utils/types';
import type { AnimeInstance, SnapParams, SnapConfiguration, SnapOptions, AnimationParams, AnimationOptions } from './types';

import { clamp, is, mergeOptions, splitStr, throwError } from '../../helpers';
import { defaultAnimationConfig, defaultSmoothTimeConstant, snapDefaultConfig } from '../../constants';
import { expFollowFactor, intersectionLength, scrollDiffToSeekTime, seekSnapDistance, snapTargetsFromStep } from '../../math';

class Animation {
	_it: IntersectionTrigger | undefined;
	_utils: Utils | undefined;
	killed!: boolean;
	private readonly _rAFIDs = new WeakMap<AnimeInstance, number>();
	static pluginName: PluginName;

	constructor(it: IntersectionTrigger) {
		this._registerIntersectionTrigger(it);
	}

	_registerIntersectionTrigger(intersectionTrigger: IntersectionTrigger) {
		this._it = intersectionTrigger;
		this._utils = this._it!._utils;
	}

	seekSmoothly(ins: AnimeInstance, seekTo: number, link: number | boolean, smooth: number | boolean, prevNow = 0) {
		if (this.killed) return;

		const cT = ins.currentTime;
		//Normalize the step rate to the elapsed frame time (link is defined per 60fps frame),
		//capped so background-tab time jumps do not spike the seek
		const now = performance.now();
		const dt = prevNow ? Math.min(now - prevNow, 100) : 16.7;
		const isSeekToGreater = seekTo > cT;
		let sT: number;

		if (smooth) {
			//Exponential follow: cover a fixed share of the remaining distance per time constant,
			//optionally capped by the link rate. parse() resolves `true` to a number already.
			sT = cT + (seekTo - cT) * expFollowFactor(dt, smooth as number);
			if (is.num(link)) {
				const maxStep = link * (dt / 16.7);
				sT = cT + clamp(sT - cT, -maxStep, maxStep);
			}
		} else {
			sT = isSeekToGreater ? Math.min(cT + (link as number) * (dt / 16.7), seekTo) : Math.max(cT - (link as number) * (dt / 16.7), seekTo);
		}

		ins.seek(sT);

		//the exponential follow approaches asymptotically, terminate on a sub-pixel gap and land exactly
		const hasComplete = isSeekToGreater ? sT >= seekTo : sT <= seekTo;
		if (hasComplete || Math.abs(seekTo - sT) < 0.5) {
			if (sT !== seekTo) ins.seek(seekTo);
			return;
		}

		const rAFID = requestAnimationFrame(() => this.seekSmoothly(ins, seekTo, link, smooth, now));
		this._rAFIDs.set(ins, rAFID);
	}

	seek(ins: AnimeInstance, seekTo: number, link: boolean | number, smooth: number | boolean = false) {
		if (is.num(link) || smooth) {
			const rAFID = this._rAFIDs.get(ins) || 0;

			cancelAnimationFrame(rAFID);
			this.seekSmoothly(ins, seekTo, link, smooth);
			return;
		}
		ins.seek(seekTo);
	}

	startSnapping({
		snapDistance,
		currentDis,
		snap,
		step,
		toRef = false
	}: {
		snapDistance: number;
		currentDis: number;
		snap: SnapParams;
		step: number;
		toRef?: boolean | undefined;
	}) {
		if (this.killed) return;

		const root = this._utils!.getRoot();
		const isVer = this._utils!.isVertical();
		const direction = toRef ? -1 : 1;

		//Stop the snapping as soon as the user scrolls by themselves
		let cancelled = false;
		const cancel = () => (cancelled = true);
		root.addEventListener('wheel', cancel, { passive: true, once: true });
		root.addEventListener('touchstart', cancel, { passive: true, once: true });
		root.addEventListener('keydown', cancel, { once: true });

		const snapFrame = (prevNow: number) => {
			if (this.killed || cancelled) return;

			const now = performance.now();
			const dt = prevNow ? Math.min(now - prevNow, 100) : 16.7;
			const remaining = snapDistance - currentDis;
			//Ease-out: start at the configured speed and decay as the snap target approaches
			const move = Math.min(remaining, Math.max(1, step * (dt / 16.7) * (remaining / snapDistance)));

			if (isVer) {
				root.scrollBy({
					top: move * direction,
					behavior: 'instant' as ScrollBehavior
				});
			} else {
				root.scrollBy({
					left: move * direction,
					behavior: 'instant' as ScrollBehavior
				});
			}

			if (remaining - move <= 0.5) {
				snap.onComplete(this._it as IntersectionTrigger);
				return;
			}
			currentDis += move;
			requestAnimationFrame(() => snapFrame(now));
		};
		snapFrame(0);
	}

	parseSnap({ instance, snap }: { instance: AnimeInstance; snap: SnapConfiguration | SnapParams }, update?: boolean): SnapParams {
		const parseLabels = (): number[] => {
			if (!is.inObject(instance, 'labels')) return throwError('"labels" feature is not available in the provided anime instance');
			return Object.values((instance as AnimeInstance & { labels: Record<string, number> }).labels);
		};
		const mergeOpts = (customOpts: SnapOptions) => mergeOptions(snapDefaultConfig, customOpts);
		const parseOriginalToParam = (to: number | string | number[]) =>
			is.num(to) ? snapTargetsFromStep(to, instance.duration) : parseLabels();

		let snapParams = {} as SnapParams;
		let mergedParams = {} as DeepRequired<SnapOptions>;

		if (update) {
			const { originalToParam } = snap as SnapParams;
			snapParams = { ...(snap as SnapParams) };
			originalToParam !== undefined && (snapParams.to = parseOriginalToParam(originalToParam));
		} else {
			if (is.boolean(snap)) mergedParams = mergeOpts({ to: 'labels' });
			if (is.array(snap) || is.num(snap)) mergedParams = mergeOpts({ to: snap });
			if (is.object(snap)) mergedParams = mergeOpts(snap as SnapOptions);

			snapParams = mergedParams as SnapParams;

			const { to } = mergedParams;
			if (is.string(to) && !!to) snapParams = { ...mergedParams, originalToParam: 'labels', to: parseLabels() };
			if (is.num(to)) snapParams = { ...mergedParams, originalToParam: to, to: snapTargetsFromStep(to, instance.duration) };
		}

		return snapParams;
	}

	getTIL(trigger: HTMLElement, lowerPosition: number, higherPosition: number) {
		//the intersection length is the share of the trigger size between the lower and higher positions
		const { length } = this._utils!.dirProps();
		return intersectionLength(trigger.getBoundingClientRect()[length], lowerPosition, higherPosition);
	}

	getSnapStep(snap: SnapParams | boolean) {
		return is.object(snap) ? Math.round(Math.max((snap.speed * 17) / 1000, 1)) : 0;
	}

	animateHandler(
		trigger: HTMLElement,
		{
			enter,
			leave,
			tIL,
			instance,
			snap,
			step,
			link,
			smooth
		}: {
			enter: number;
			leave: number;
			tIL: number;
			instance: AnimeInstance;
			snap: boolean | SnapParams;
			step: number;
			link: number | boolean;
			smooth: number | boolean;
		}
	) {
		if (this.killed) return;

		const { ref, refOpposite, length } = this._utils!.dirProps();
		const tB = trigger.getBoundingClientRect(), //trigger Bounds
			ids = this._utils!.getTriggerData(trigger, 'states').ids,
			rB = this._it!.rootBounds, //root Bounds, written once per observer batch / animation frame
			scrollLength = tIL + (this._it!._isREPGreater ? rB[length] : -rB[length]),
			duration = instance.duration;

		const pos = this._utils!.getPositions(tB, rB, { enter, leave, ref, refOpposite, length });
		const diff = pos[2] - pos[0]; // root enter position - trigger enter position

		//Keep the seek deterministic, the trigger may be transiently outside the band due to rounding
		const seekTo = scrollDiffToSeekTime(diff, scrollLength, duration);
		this.seek(instance, seekTo, link, smooth);

		//Snap
		if (!is.boolean(snap)) {
			const dis = 0;
			// Clear timeout
			clearTimeout(ids.snapTimeOutId);
			// Set a timeout to run after scrolling stops
			const snapTimeOutId = setTimeout(() => {
				if (this.killed || !this._it) return;

				const directionalDiff = snap.to.map(n => seekTo - n),
					diff = directionalDiff.map(n => Math.abs(n)),
					closest = Math.min(...diff),
					closestWithDirection = directionalDiff[diff.indexOf(closest)],
					snapDistance = seekSnapDistance(scrollLength, closest, duration),
					snapData = { snapDistance, currentDis: dis, snap, step };

				if (snapDistance >= snap.maxDistance || snapDistance < step) return;

				snap.onStart(this._it as IntersectionTrigger);

				if (closestWithDirection < 0) {
					this.startSnapping(snapData);
					return;
				}

				this.startSnapping({ ...snapData, toRef: true });
			}, snap.after * 1000);

			//Update the id of the Timeout
			ids.snapTimeOutId = snapTimeOutId;
		}
	}

	animate(trigger: HTMLElement, animation: AnimationParams, eventIndex: number) {
		const { instance, toggleActions, link, snap, smooth } = animation;

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
			const animateData = {
				enter,
				leave,
				tIL,
				instance,
				snap,
				link: is.boolean(link) ? link : Math.abs(link),
				smooth,
				step
			};

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
					this.seek(instance, 1 === eventIndex ? instance.duration : 0, link, smooth);
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
				instance.revert();
				this._utils!.setTriggerData(trigger, { animation: undefined }, true);
				break;
		}
	}

	parse(params: AnimeInstance | AnimationOptions): AnimationParams;
	parse(params: AnimationParams, update: boolean): AnimationParams;
	parse(params: AnimeInstance | AnimationOptions | AnimationParams, update?: boolean) {
		let mergedParams = {} as DeepRequired<AnimationOptions>,
			animationParams = {} as AnimationParams;

		if (update) {
			const { instance, snap } = params as AnimationParams;
			animationParams = { ...(params as AnimationParams) };
			!is.boolean(snap) && (animationParams.snap = this.parseSnap({ instance, snap }, true));
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

			const { toggleActions, snap, instance, link, smooth } = mergedParams;

			animationParams = {
				instance,
				toggleActions: splitStr(toggleActions),
				snap: is.num(snap) || snap ? this.parseSnap({ instance, snap }) : false,
				link,
				smooth: is.num(smooth) && (smooth as number) > 0 ? smooth : true === smooth ? defaultSmoothTimeConstant : false
			};

			//Reset anime instance (skipped on updates so resize does not jump the animation to its start)
			animationParams.instance.reset();
		}

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
				const { instance, snap, link, smooth } = anim;
				const tIL = this.getTIL(trigger, lowerPosition, higherPosition);
				const step = this.getSnapStep(snap);
				//reassign an animate handler
				this._utils!.setTriggerScrollStates(trigger, 'animate');
				this._utils!.setTriggerScrollStates(trigger, 'animate', () =>
					this.animateHandler(trigger, { enter, leave, instance, snap, link, smooth, tIL, step })
				);
			}
		});
	}

	kill() {
		this.killed = true;

		//Clear the pending snap timeouts
		this._it!.triggers.forEach(trigger => {
			const ids = this._it!._utils!.getTriggerData(trigger, 'states')?.ids;
			ids?.snapTimeOutId && clearTimeout(ids.snapTimeOutId);
		});

		this._it = this._utils = undefined;
	}
}

Animation.pluginName = 'animation';

export default Animation;
