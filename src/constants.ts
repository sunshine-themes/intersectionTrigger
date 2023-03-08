import type { IntersectionTriggerOptions, TriggerStates } from './core/types';
import type { SnapOptions, AnimationOptions, Anime, AnimeInstance } from './plugins/animation/types';
import type { GuidesOptions } from './plugins/guides/types';
import type { ToggleClassOptions } from './plugins/toggleclass/types';

const fn = () => {};

const snapDefaultConfig: SnapOptions = { to: 0, after: 1, speed: 100, maxDistance: 500, onStart: fn, onComplete: fn };

const defaultInsOptions: IntersectionTriggerOptions = {
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
		animation: undefined
	},
	rootEnter: '100%',
	rootLeave: '0%',
	axis: 'y',
	name: '',
	root: null,
	guides: false,
	onScroll: fn
};

const defaultToggleClassConfig: ToggleClassOptions = {
	targets: [],
	toggleActions: 'add remove add remove',
	classNames: ''
};

const defaultAnimationConfig: AnimationOptions = {
	instance: {} as Anime<AnimeInstance>,
	toggleActions: 'play complete reverse complete',
	link: false,
	snap: false
};

const triggerStates: TriggerStates = {
	hasEntered: false,
	hasEnteredBack: false,
	hasLeft: true,
	hasLeftBack: true,
	hasEnteredOnce: false,
	onScroll: { backup: undefined, animate: undefined },
	ids: { snapTimeOutId: 0 }
};

const guideDefaultConfig: GuidesOptions = {
	enter: {
		trigger: {
			backgroundColor: 'rgb(0, 149, 0)',
			color: '#000',
			text: 'Enter'
		},
		root: {
			backgroundColor: 'rgb(0, 149, 0)',
			color: '#000',
			text: 'Root Enter'
		}
	},
	leave: {
		trigger: {
			backgroundColor: '#ff0000',
			color: '#000',
			text: 'Leave'
		},
		root: {
			backgroundColor: '#ff0000',
			color: '#000',
			text: 'Root Leave'
		}
	}
};

export { defaultInsOptions, triggerStates, guideDefaultConfig, defaultAnimationConfig, defaultToggleClassConfig, snapDefaultConfig };
