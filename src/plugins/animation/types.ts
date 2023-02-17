import type IntersectionTrigger from '../../core/core';

type AnimeProps<A> = {
	reset(): void;
	reset(): A;
	kill(): null;
};
type AnimeInstance = anime.AnimeInstance | anime.AnimeTimelineInstance;
type Anime<A extends AnimeInstance> = A &
	(A extends anime.AnimeTimelineInstance ? AnimeProps<A> & { marks?: { name: string; time: number }[] } : AnimeProps<A>);
type AnimationToggleActions = 'none' | 'play' | 'resume' | 'restart' | 'reset' | 'pause' | 'complete' | 'reverse' | 'kill';
type SnapConfiguration = SnapOptions | boolean | number | number[];
type SnapParams = Required<Omit<SnapOptions, 'to'>> & { to: number[]; originalToParam?: number | number[] | string };
type AnimationParams = Required<Omit<AnimationOptions, 'snap' | 'toggleActions'>> & {
	toggleActions: AnimationToggleActions[];
	snap: SnapParams | boolean;
};
interface SnapOptions {
	to: number | number[] | string;
	after?: number;
	speed?: number;
	maxDistance?: number;
	onStart?(it: IntersectionTrigger): void;
	onComplete?(it: IntersectionTrigger): void;
}
interface AnimationOptions {
	instance: Anime<AnimeInstance>;
	toggleActions?: `${AnimationToggleActions} ${AnimationToggleActions} ${AnimationToggleActions} ${AnimationToggleActions}`;
	link?: number | boolean;
	snap?: SnapConfiguration;
}

export type { AnimeInstance, Anime, AnimationToggleActions, SnapConfiguration, SnapParams, AnimationParams, SnapOptions, AnimationOptions };
