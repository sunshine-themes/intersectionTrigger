import type { Trigger } from '../../core/types';

type ClassToggleActions = 'add' | 'remove' | 'none';
interface ToggleClassParams {
	targets: HTMLElement[];
	toggleActions: ClassToggleActions[];
	classNames: string[];
}
interface ToggleClassOptions {
	targets?: Trigger;
	toggleActions?: `${ClassToggleActions} ${ClassToggleActions} ${ClassToggleActions} ${ClassToggleActions}`;
	classNames: string;
}

export type { ClassToggleActions, ToggleClassOptions, ToggleClassParams };
