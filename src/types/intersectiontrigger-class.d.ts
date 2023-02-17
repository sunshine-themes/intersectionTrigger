import { IntersectionTriggerOptions, Trigger, TriggerOptions } from './core/core';
import { ToggleClassMethods } from './plugins/toggleclass';
import { AnimationMethods } from './plugins/animation';
import { GuidesMethods } from './plugins/guides';
import { IntersectionTriggerPlugin } from './shared';

declare class IntersectionTrigger {
	/**
	 * unique integer for each instance.
	 */
	readonly id: number;

	/**
	 * All the triggers added to the instance.
	 */
	readonly triggers: HTMLElement[];

	/**
	 * An IntersectionObserver instance
	 */
	readonly observer: IntersectionObserver | undefined;

	/**
	 * A DOMRect object provides information about the size of the root and its position relative to the viewport.
	 */
	readonly rootBounds: DOMRectReadOnly;

	/**
	 * if 'true' then the instance is killed using 'kill' method.
	 */
	readonly killed: boolean;

	/**
	 * Constructs a new IntersectionTrigger instance.
	 *
	 * @param options   Instance options.
	 */
	constructor(options?: IntersectionTriggerOptions);

	/**
	 * Adds new triggers to the instance.
	 *
	 * @param trigger The element that interacts by intersecting with the root
	 * @param options trigger options.
	 */
	add(trigger: Trigger, options?: TriggerOptions): this;

	/**
	 * Removes trigger from the instance, so the IntersectionTrigger instance is no longer observing it, allowing any data related to that trigger to become eligible for garbage collection.
	 *
	 * @param trigger The element to remove
	 */
	remove(trigger: Trigger): this;

	/**
	 * Updates the instance. You will probably need to use it at any mutation to the root.
	 */
	update(): void;

	/**
	 * Kills the IntersectionTrigger instance, so that the instance is eligible for garbage collection.
	 */
	kill(): void;

	/**
	 * Gets an instance by its 'id' property.
	 *
	 * @param id The id of the wanted instance.
	 */
	static getInstanceById: (id: number) => IntersectionTrigger | undefined;

	/**
	 * Registers plugins with the IntersectionTrigger’s core to add more features. You need to register a plugin only once before using it.
	 *
	 * @param plugins an array of plugins.
	 * @return number
	 */
	static registerPlugins: (plugins: IntersectionTriggerPlugin[]) => number;

	/**
	 * Gets ALL the IntersectionTrigger instances.
	 *
	 * @return IntersectionTrigger[]
	 */
	static getInstances: () => IntersectionTrigger[];

	/**
	 * Gets the registered plugins.
	 *
	 * @return IntersectionTriggerPlugin[]
	 */
	static getRegisteredPlugins: () => IntersectionTriggerPlugin[];

	/**
	 * Updates All the instances.
	 */
	static update: () => void;

	/**
	 * kills All the IntersectionTrigger instances.
	 */
	static kill: () => void;

	/**
	 * Plugins
	 */
	toggleClass: ToggleClassMethods | undefined;
	animation: AnimationMethods | undefined;
	guides: GuidesMethods | undefined;
}

export default IntersectionTrigger;
