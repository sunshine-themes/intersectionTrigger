import type { JSAnimation, Timeline } from 'animejs';
import IntersectionTrigger from '../intersectiontrigger-class';

type AnimeInstance = JSAnimation | Timeline;

/**
 * Structural contract of anything the Animation plugin can drive — exactly the members the plugin
 * reads and writes on an instance. Accepts real animejs instances and compatible shims (e.g. scroll
 * drivers wrapping timelines). Hand-synced with the internal type in src/plugins/animation/types.ts.
 */
type AnimationPlayer = {
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

interface SnapOptions {
	/**
	 *  the locations on the animation duration to snap. Use the string "labels" to snap to all the timeline labels times (animejs timeline labels created with `.label(name)`).
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
	/**
	 * an anime instance/timeline, or any object implementing AnimationPlayer.
	 */
	instance: AnimeInstance | AnimationPlayer;

	/**
	 * Determines how to control the animation at the toggle events onEnter, onLeave, onEnterBack and onLeaveBack.
	 *
	 * @default 'play complete reverse complete'
	 */
	toggleActions?: `${AnimationToggleActions} ${AnimationToggleActions} ${AnimationToggleActions} ${AnimationToggleActions}`;

	/**
	 *  it controls the animation progress by linking it to the scrollbar movements, you can use a number as a link factor, the higher the number the faster of catching up the scrollbar.
	 *
	 * @default false
	 */
	link?: number | boolean;

	/**
	 * Snaps the animation time (currentTime property) to certain values by scrolling after the user stops scrolling, therefore, you must enable link property.
	 *
	 * @default false
	 */
	snap?: SnapConfiguration;

	/**
	 *  an exponential-follow time constant (in ms) for linked animations: the animation covers
	 *  ~63% of the remaining distance each `smooth` ms instead of tracking the scrollbar rigidly.
	 *  `true` uses the default time constant. Combine with a numeric `link` to cap the catch-up speed.
	 *
	 *  @default false
	 */
	smooth?: number | boolean;
}
interface AnimationMethods {
	/**
	 * Updates the Animation instance, which is necessary in case of changing the anime instance, e.g., adding to the timeline.
	 */
	update(): void;

	/**
	 * Kills the Animation instance, reverts the anime instance to its original values and removes the animation from the trigger
	 */
	kill(): void;
}

export { AnimeInstance, AnimationPlayer, AnimationToggleActions, SnapConfiguration, SnapOptions, AnimationOptions, AnimationMethods };
