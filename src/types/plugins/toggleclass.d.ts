import { Trigger } from '../core/core';

type ClassToggleActions = 'add' | 'remove' | 'none';

interface ToggleClassOptions {
	/**
	 * The element to toggle class
	 */
	targets?: Trigger;

	/**
	 * Determines how to control the classes at the toggle events  onEnter , onLeave , onEnterBack and onLeaveBack.
	 *
	 * @default 'add remove add remove'
	 */
	toggleActions?: `${ClassToggleActions} ${ClassToggleActions} ${ClassToggleActions} ${ClassToggleActions}`;

	/**
	 * The classes to control separated by a space
	 *
	 * @example 'active red-bg d-flex'
	 */
	classNames: string;
}

interface ToggleClassMethods {
	/**
	 * Kills the ToggleClass instance
	 */
	kill(): void;
}

export { ClassToggleActions, ToggleClassOptions, ToggleClassMethods };
