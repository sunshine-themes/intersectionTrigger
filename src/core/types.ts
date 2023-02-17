import type IntersectionTrigger from './core';
import type Guides from '../plugins/guides/guides';
import type ToggleClass from '../plugins/toggleclass/toggleclass';
import type Animation from '../plugins/animation/animation';
import type { DeepRequired } from '../utils/types';
import type { GuidesOptions } from '../plugins/guides/types';
import type { ToggleClassParams, ToggleClassOptions } from '../plugins/toggleclass/types';
import type { AnimationParams, Anime, AnimeInstance, AnimationOptions } from '../plugins/animation/types';

type Trigger = string | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>;
type Root = HTMLElement | null;
type Plugin = { pluginName: PluginName } & (Animation | ToggleClass | Guides);
type PluginName = 'animation' | 'toggleClass' | 'guides';
type EventHandler = (event: Event) => void;
type ModifiedDOMRect = Omit<DOMRect, 'x' | 'y' | 'toJSON'>;
type PositionsData = {
	tEP: PositionData;
	rEP: PositionData;
	tLP: PositionData;
	rLP: PositionData;
};
type DirectionProps = { ref: 'top' | 'left'; length: 'height' | 'width'; refOpposite: 'bottom' | 'right' };
type ToggleActions = (trigger: HTMLElement) => boolean;
type ItCallbackFunction = (trigger: HTMLElement, it: IntersectionTrigger) => void;
type Position = string | ((it: IntersectionTrigger) => string);
interface TriggerData extends DeepRequired<Omit<TriggerOptions, 'enter' | 'leave' | 'toggleClass' | 'animation'>> {
	enter: number;
	leave: number;
	minPosition: number;
	maxPosition: number;
	states: TriggerStates;
	toggleClass?: ToggleClassParams[];
	animation?: AnimationParams;
}
interface ObserverConfiguration {
	root: Root;
	rootMargin: string;
	threshold: number[];
}

interface PositionData {
	original: string;
	value: number;
	unit: string;
	normal: number;
	pixeled?: number;
}

interface TriggerOptions {
	enter?: Position;
	leave?: Position;
	once?: boolean;
	onEnter?: ItCallbackFunction;
	onLeave?: ItCallbackFunction;
	onEnterBack?: ItCallbackFunction;
	onLeaveBack?: ItCallbackFunction;
	toggleClass?: string | ToggleClassOptions[];
	animation?: Anime<AnimeInstance> | AnimationOptions;
}
interface IntersectionTriggerOptions {
	defaults?: TriggerOptions;
	rootEnter?: Position;
	rootLeave?: Position;
	axis?: string;
	name?: string;
	root?: Root | string;
	guides?: boolean | GuidesOptions;
	onScroll?: EventHandler;
}
interface ScrollCallbacks {
	backup?: ToggleActions;
	animate?: (trigger?: HTMLElement) => void;
}
interface TriggerStates {
	hasEntered: boolean;
	hasEnteredBack: boolean;
	hasLeft: boolean;
	hasLeftBack: boolean;
	hasEnteredOnce: boolean;
	hasEnteredFromOneSide?: boolean;
	onScroll: ScrollCallbacks;
	ids: { snapTimeOutId: number };
}

export type {
	Trigger,
	TriggerData,
	Plugin,
	PluginName,
	EventHandler,
	TriggerOptions,
	PositionData,
	PositionsData,
	ModifiedDOMRect,
	ToggleActions,
	DirectionProps,
	Root,
	ItCallbackFunction,
	IntersectionTriggerOptions,
	TriggerStates,
	Position,
	ScrollCallbacks,
	ObserverConfiguration,
};