import type IntersectionTrigger from '../../core/core';

/**
 * Structural subset of an animejs v4 instance (JSAnimation or Timeline) that the plugin relies on,
 * kept lightweight to avoid pulling animejs heavy class types into the public option types.
 */
type AnimeInstance = {
	currentTime: number;
	duration: number;
	paused: boolean;
	completed: boolean;
	reversed: boolean;
	labels?: Record<string, number>;
	seek(time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number): unknown;
	play(): unknown;
	pause(): unknown;
	reverse(): unknown;
	restart(): unknown;
	reset(softReset?: boolean): unknown;
	revert(): unknown;
};
type AnimationToggleActions = 'none' | 'play' | 'resume' | 'restart' | 'reset' | 'pause' | 'complete' | 'reverse' | 'kill';
type SnapConfiguration = SnapOptions | boolean | number | number[];
type SnapParams = Required<Omit<SnapOptions, 'to'>> & { to: number[]; originalToParam?: number | number[] | string };
type AnimationParams = Required<Omit<AnimationOptions, 'snap' | 'toggleActions' | 'smooth'>> & {
	toggleActions: AnimationToggleActions[];
	snap: SnapParams | boolean;
	smooth: number | boolean;
};
interface SnapOptions {
	/**
	 *  the locations on the animation duration to snap. Use the string "labels" to snap to all the timeline labels times (animejs timeline labels).
	 */
	to: number | number[] | string;

	/**
	 *  an amount of time (in seconds) used as a delay, so after:1 means that when the user stops scrolling, the snapping animation will start after 1 second.
	 *
	 * @default 1
	 */
	after?: number;

	/**
	 * the snapping animation speed
	 *
	 * @default 100
	 */
	speed?: number;

	/**
	 * 'maxDistance: 500' means that if the closest location to snap is longer than 500px, the snapping animation won't start
	 *
	 * @default 500
	 */
	maxDistance?: number;

	/**
	 * a callback called when the snapping animation starts.
	 *
	 * @param it IntersectionTrigger instance
	 */
	onStart?(it: IntersectionTrigger): void;

	/**
	 * a callback called when the snapping animation completes.
	 *
	 * @param it IntersectionTrigger instance
	 */
	onComplete?(it: IntersectionTrigger): void;
}
interface AnimationOptions {
	instance: AnimeInstance;
	toggleActions?: `${AnimationToggleActions} ${AnimationToggleActions} ${AnimationToggleActions} ${AnimationToggleActions}`;
	link?: number | boolean;
	snap?: SnapConfiguration;
	/**
	 *  an exponential-follow time constant (in ms) for linked animations: the animation covers
	 *  ~63% of the remaining distance each `smooth` ms instead of tracking the scrollbar rigidly.
	 *  `true` uses the default time constant. Combine with a numeric `link` to cap the catch-up speed.
	 *
	 * @default false
	 */
	smooth?: number | boolean;
}

export type { AnimeInstance, AnimationToggleActions, SnapConfiguration, SnapParams, AnimationParams, SnapOptions, AnimationOptions };
