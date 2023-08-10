import IntersectionTrigger from '../intersectiontrigger-class';
import { AnimeInstance, AnimationOptions } from '../plugins/animation';
import { GuidesOptions } from '../plugins/guides';
import { ToggleClassOptions } from '../plugins/toggleclass';

type Trigger = string | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>;
type Root = HTMLElement | null;
type EventHandler = (event?: Event) => void;
type ItCallbackFunction = (trigger?: HTMLElement, it?: IntersectionTrigger) => void;
type Position = string | ((it?: IntersectionTrigger) => string);

interface IntersectionTriggerOptions {
	/**
	 * the defaults that can be inherited by all the triggers added using add() method.
	 */
	defaults?: TriggerOptions;

	/**
	 * The scrollable element whose bounds are used as the bounding box when testing for intersection. Must be the ancestor of the triggers. Defaults to the top-level document's viewport if not specified.
	 *
	 * @default null
	 */
	root?: Root | string;

	/**
	 * it Describes a place on the root that must meet with a place on the trigger ( enter property ) in order to start the IntersectionTrigger
	 *
	 * @default '100%' the bottom of the root
	 */
	rootEnter?: Position;

	/**
	 *  it Describes a place on the root that must meet with a place on the trigger ( leave property ) in order to end the IntersectionTrigger
	 *
	 * @default '0%' the top of the root
	 */
	rootLeave?: Position;

	/**
	 * Determines your setup for scrolling, which can be a vertical or horizontal scrolling.
	 *
	 * @default 'y' vertical
	 */
	axis?: 'y' | 'x';

	/**
	 * You can give the IntersectionTrigger instance a special name, which will appear on the guides when it gets activated.
	 *
	 */
	name?: string;

	/**
	 * Adds guide lines at the enter and leave positions to visualize them, which is helpful in the development process.
	 *
	 * @default false
	 */
	guides?: boolean | GuidesOptions;

	/**
	 * A callback gets called when the root scrolling.
	 */
	onScroll?: EventHandler;
}

interface TriggerOptions {
	/**
	 * it Describes a place on the trigger that must meet with a place on the root ( rootEnterProperty ) in order to start the IntersectionTrigger.
	 *
	 * @default '0%' the top of the trigger
	 */
	enter?: Position;

	/**
	 * it Describes a place on the trigger that must meet with a place on the root ( rootLeave property ) in order to end the IntersectionTrigger.
	 *
	 * @default '100%' the bottom of the trigger
	 */
	leave?: Position;

	/**
	 * If true, the trigger will be removed from the instance as soon as the leave (or leave back) position is reached once, this causes the observer to stop observing it, therefor, the onEnter callback will invoke for one time only.
	 *
	 * @default false
	 */
	once?: boolean;

	/**
	 * A callback for when the trigger intersects with the root passing the enter position in the default viewport's positive y/x direction.
	 *
	 * @param trigger the intersecting element with the root
	 * @param it the instance
	 */
	onEnter?: ItCallbackFunction;

	/**
	 * A callback for when the trigger intersects with the root passing the leave position in the default viewport's positive y/x direction.
	 *
	 * @param trigger the intersecting element with the root
	 * @param it the instance
	 */
	onLeave?: ItCallbackFunction;

	/**
	 * A callback for when the trigger intersects with the root passing the enter position in the default viewport's negative y/x direction.
	 *
	 * @param trigger the intersecting element with the root
	 * @param it the instance
	 */
	onEnterBack?: ItCallbackFunction;

	/**
	 * A callback for when the trigger intersects with the root passing the leave position in the default viewport's negative y/x direction.
	 *
	 * @param trigger the intersecting element with the root
	 * @param it the instance
	 */
	onLeaveBack?: ItCallbackFunction;

	/**
	 * Controls whether to add or to remove a class (or classes) to an element (or multiple elements) when the onEnter , onLeave , onEnterBack , onLeaveBack events fire.
	 */
	toggleClass?: string | ToggleClassOptions[];

	/**
	 * The animation instance that should by controlled by the IntersectionTrigger instance
	 */
	animation?: AnimeInstance | AnimationOptions;
}

export { Trigger, EventHandler, TriggerOptions, Root, ItCallbackFunction, IntersectionTriggerOptions };
