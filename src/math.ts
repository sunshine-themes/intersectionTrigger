import type { ModifiedDOMRect, PositionData } from './core/types';
import { clamp, parseString, roundFloat } from './helpers';

//Pure, DOM-free math for positions, thresholds, root margins, snapping and seeking.
//Kept free of imports from classes so it can be unit tested without a browser.

export type Margin = { value: number; unit: string };

/**Parses a CSS-like margin string, expanding the shorthand notations to the four sides (top, right, bottom, left).*/
export const parseMarginString = (rootMargins: string): Margin[] => {
	const margins = parseString(rootMargins || '0px');
	margins[1] = margins[1] || margins[0];
	margins[2] = margins[2] || margins[0];
	margins[3] = margins[3] || margins[1];
	return margins;
};

/**Expands a rect by the parsed margins; percentage margins resolve against height (top/bottom) and width (left/right).*/
export const expandRectByMargins = (
	rect: { top: number; right: number; bottom: number; left: number },
	margins: Margin[]
): ModifiedDOMRect => {
	const px = margins.map((margin, i) =>
		margin.unit === 'px' ? margin.value : (margin.value * (i % 2 ? rect.right - rect.left : rect.bottom - rect.top)) / 100
	);

	const newRect: ModifiedDOMRect = {
		top: rect.top - px[0],
		right: rect.right + px[1],
		bottom: rect.bottom + px[2],
		left: rect.left - px[3],
		width: 0,
		height: 0
	};
	newRect.width = newRect.right - newRect.left;
	newRect.height = newRect.bottom - newRect.top;

	return newRect;
};

/**Resolves a parsed position against the root length: px values as-is, percentages via their normalized value.*/
export const positionPixels = (pos: Pick<PositionData, 'value' | 'unit' | 'normal'>, total: number): number =>
	'%' === pos.unit ? pos.normal * total : pos.value;

/**
 * Builds the IntersectionObserver rootMargin string for the intersection band.
 * The scroll axis gets the enter/leave lines, the cross axis is extended by extendMargin
 * so triggers beyond the root viewport still intersect.
 */
export const buildRootMarginString = ({
	isREPGreater,
	rEPpx,
	rLPpx,
	rootLength,
	isVertical,
	extendMargin
}: {
	isREPGreater: boolean;
	rEPpx: number;
	rLPpx: number;
	rootLength: number;
	isVertical: boolean;
	extendMargin: number;
}): string => {
	const fromRef = `${-1 * (isREPGreater ? rLPpx : rEPpx)}px`; //from the direction reference (top|left)
	const fromOppRef = `${(isREPGreater ? rEPpx : rLPpx) - rootLength}px`; //from its opposite (bottom|right)
	return isVertical
		? `${fromRef} ${extendMargin}px ${fromOppRef} ${extendMargin}px`
		: `${extendMargin}px ${fromOppRef} ${extendMargin}px ${fromRef}`;
};

/**Builds the IntersectionObserver thresholds: the trigger enter/leave ratios plus the inverted higher position, deduplicated.*/
export const buildThreshold = (positions: { enter: number; leave: number; higher: number }[]): number[] => {
	const threshold = [0, 1];
	positions.forEach(({ enter, leave, higher }) => threshold.push(enter, leave, roundFloat(1 - higher, 2)));
	return [...new Set(threshold)];
};

/**Maps the scroll distance between the root and trigger enter lines to the animation time, clamped to the duration.*/
export const scrollDiffToSeekTime = (diff: number, scrollLength: number, duration: number): number =>
	clamp((duration * diff) / scrollLength, 0, duration);

/**Converts a time distance from a snap target to the equivalent scroll distance in px.*/
export const seekSnapDistance = (scrollLength: number, closest: number, duration: number): number => (scrollLength * closest) / duration;

/**Builds the snap target times for a step of the duration; a step of 0 or less degenerates to the animation start.*/
export const snapTargetsFromStep = (step: number, duration: number): number[] => {
	if (step <= 0) return [0];
	const arr: number[] = [];
	let progress = 0;
	while (progress <= 1) {
		arr.push(clamp(progress, 0, 1));
		progress = progress + step;
	}
	return arr.map(v => Math.round(v * duration));
};

/**The trigger size share between the lower and higher positions (negative when inverted).*/
export const intersectionLength = (size: number, lowerPosition: number, higherPosition: number): number =>
	size * (higherPosition - lowerPosition);

/**The share of the remaining distance an exponential follow covers in dt for a time constant tau.*/
export const expFollowFactor = (dt: number, tau: number): number => 1 - Math.exp(-dt / tau);
