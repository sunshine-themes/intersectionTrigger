import IntersectionTrigger from '../intersectiontrigger-class';

type AnimeInstance = anime.AnimeInstance | anime.AnimeTimelineInstance;
type AnimationToggleActions = 'none' | 'play' | 'resume' | 'restart' | 'reset' | 'pause' | 'complete' | 'reverse' | 'kill';
type SnapConfiguration = SnapOptions | boolean | number | number[];

interface SnapOptions {
	/**
	 *  the locations on the animation duration to snap
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
	 * an anime instance or timeline.
	 */
	instance: AnimeInstance;

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
}
interface AnimationMethods {
	/**
	 * Updates the Animation instance, which is necessary in case of changing the anime instance, e.g., adding to the timeline.
	 */
	update(): void;

	/**
	 * Kills the Animation instance and the anime instance if the 'kill' method is available
	 */
	kill(): void;
}

export { AnimeInstance, AnimationToggleActions, SnapConfiguration, SnapOptions, AnimationOptions, AnimationMethods };
