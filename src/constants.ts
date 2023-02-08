import type IntersectionTrigger from './core/core';
import type { EventHandler, Trigger } from './core/core';
import type { ToggleActions } from './core/utils';
import type anime from 'animejs';

type AnimeProps<A> = {
	reset(): void;
	reset(): A;
	kill(): null;
};
type AnimeInstance = anime.AnimeInstance | anime.AnimeTimelineInstance;
type Anime<A extends AnimeInstance> = A &
	(A extends anime.AnimeTimelineInstance ? AnimeProps<A> & { marks?: { name: string; time: number }[] } : AnimeProps<A>);

type ItCallbackFunction = (trigger: HTMLElement, it: IntersectionTrigger) => void;
type ClassToggleActions = 'add' | 'remove' | 'none';
type Root = HTMLElement | null;
type Position = string | ((it: IntersectionTrigger) => string);
type AnimationToggleActions = 'none' | 'play' | 'resume' | 'restart' | 'reset' | 'pause' | 'complete' | 'reverse' | 'kill';
type SnapConfiguration = SnapDefaultConfiguration | boolean | number | number[];
type SnapParams = Required<Omit<SnapDefaultConfiguration, 'to'>> & { to: number[]; originalToParam?: number | number[] | string };
type AnimationParams = Required<Omit<DefaultAnimationConfiguration, 'snap' | 'toggleActions'>> & {
	toggleActions: AnimationToggleActions[];
	snap: SnapParams | boolean;
};
interface SnapDefaultConfiguration {
	to: number | number[] | string;
	after?: number;
	speed?: number;
	maxDistance?: number;
	onStart?(it: IntersectionTrigger): void;
	onComplete?(it: IntersectionTrigger): void;
}
interface DefaultToggleClassConfiguration {
	targets?: Trigger;
	toggleActions?: `${ClassToggleActions} ${ClassToggleActions} ${ClassToggleActions} ${ClassToggleActions}`;
	classNames: string;
}
interface TriggerConfiguration {
	enter?: Position;
	leave?: Position;
	once?: boolean;
	onEnter?: ItCallbackFunction;
	onLeave?: ItCallbackFunction;
	onEnterBack?: ItCallbackFunction;
	onLeaveBack?: ItCallbackFunction;
	toggleClass?: string | DefaultToggleClassConfiguration[];
	animation?: Anime<AnimeInstance> | DefaultAnimationConfiguration;
}
interface DefaultConfiguration {
	defaults?: TriggerConfiguration;
	rootEnter?: Position;
	rootLeave?: Position;
	axis?: string;
	name?: string;
	root?: Root | string;
	guides?: boolean | GuideDefaultConfiguration;
	onScroll?: EventHandler;
}
interface ScrollCallbacks {
	backup?: ToggleActions;
	animate?: (trigger?: HTMLElement, time?: number) => void;
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
interface GuideProperties {
	backgroundColor?: string;
	color?: string;
	text?: string;
}
interface GuideElements {
	trigger?: GuideProperties;
	root?: GuideProperties;
}
interface GuideDefaultConfiguration {
	enter?: GuideElements;
	leave?: GuideElements;
}
interface ToggleClassParams {
	targets: HTMLElement[];
	toggleActions: ClassToggleActions[];
	classNames: string[];
}
interface DefaultAnimationConfiguration {
	instance: Anime<AnimeInstance>;
	toggleActions?: `${AnimationToggleActions} ${AnimationToggleActions} ${AnimationToggleActions} ${AnimationToggleActions}`;
	link?: number | boolean;
	snap?: SnapConfiguration;
}

const fn = () => {};
const snapDefaultConfig: SnapDefaultConfiguration = { to: 0, after: 1, speed: 100, maxDistance: 500, onStart: fn, onComplete: fn };

const defaultInsOptions: DefaultConfiguration = {
	//Defaults for every trigger
	defaults: {
		enter: '0%',
		leave: '100%',
		once: false,
		onEnter: fn,
		onLeave: fn,
		onEnterBack: fn,
		onLeaveBack: fn,
		toggleClass: undefined,
		animation: undefined,
	},
	rootEnter: '100%',
	rootLeave: '0%',
	axis: 'y',
	name: '',
	root: null,
	guides: false,
	onScroll: fn,
};

const defaultToggleClassConfig: DefaultToggleClassConfiguration = {
	targets: [],
	toggleActions: 'add remove add remove',
	classNames: '',
};

const defaultAnimationConfig: DefaultAnimationConfiguration = {
	instance: {} as Anime<AnimeInstance>,
	toggleActions: 'play complete reverse complete',
	link: false,
	snap: false,
};

const triggerStates: TriggerStates = {
	hasEntered: false,
	hasEnteredBack: false,
	hasLeft: true,
	hasLeftBack: true,
	hasEnteredOnce: false,
	onScroll: { backup: undefined, animate: undefined },
	ids: { snapTimeOutId: 0 },
};

const guideDefaultConfig: GuideDefaultConfiguration = {
	enter: {
		trigger: {
			backgroundColor: 'rgb(0, 149, 0)',
			color: '#000',
			text: 'Enter',
		},
		root: {
			backgroundColor: 'rgb(0, 149, 0)',
			color: '#000',
			text: 'Root Enter',
		},
	},
	leave: {
		trigger: {
			backgroundColor: '#ff0000',
			color: '#000',
			text: 'Leave',
		},
		root: {
			backgroundColor: '#ff0000',
			color: '#000',
			text: 'Root Leave',
		},
	},
};

export { defaultInsOptions, triggerStates, guideDefaultConfig, defaultAnimationConfig, defaultToggleClassConfig, snapDefaultConfig };

export type {
	ItCallbackFunction,
	ClassToggleActions,
	AnimationToggleActions,
	SnapDefaultConfiguration,
	TriggerConfiguration,
	DefaultConfiguration,
	TriggerStates,
	GuideDefaultConfiguration,
	DefaultToggleClassConfiguration,
	DefaultAnimationConfiguration,
	Root,
	Position,
	ScrollCallbacks,
	AnimationParams,
	ToggleClassParams,
	SnapParams,
	SnapConfiguration,
	AnimeInstance,
	Anime,
};
