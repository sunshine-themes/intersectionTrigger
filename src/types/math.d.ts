/**
 * Pure, DOM-free math shared by the IntersectionTrigger engine and exposed
 * publicly through the "./math" subpath for external scroll-linked tooling.
 */

export type Margin = { value: number; unit: string };

export interface MathPositionData {
	original: string;
	value: number;
	unit: string;
	normal: number;
	pixels?: number;
}

export interface MathRect {
	top: number;
	right: number;
	bottom: number;
	left: number;
	width: number;
	height: number;
}

/**
 * Parses a CSS-like margin string, expanding the shorthand notations to the four sides (top, right, bottom, left).
 */
export declare const parseMarginString: (rootMargins: string) => Margin[];

/**
 * Expands a rect by the parsed margins; percentage margins resolve against height (top/bottom) and width (left/right).
 */
export declare const expandRectByMargins: (
	rect: { top: number; right: number; bottom: number; left: number },
	margins: Margin[]
) => MathRect;

/**
 * Resolves a parsed position against the root length: px values as-is, percentages via their normalized value.
 */
export declare const positionPixels: (pos: Pick<MathPositionData, 'value' | 'unit' | 'normal'>, total: number) => number;

/**
 * Builds the IntersectionObserver rootMargin string for the intersection band.
 */
export declare const buildRootMarginString: ({
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
}) => string;

/**
 * Builds the IntersectionObserver thresholds: the trigger enter/leave ratios plus the inverted higher position, deduplicated.
 */
export declare const buildThreshold: (positions: { enter: number; leave: number; higher: number }[]) => number[];

/**
 * Maps the scroll distance between the root and trigger enter lines to the animation time, clamped to the duration.
 */
export declare const scrollDiffToSeekTime: (diff: number, scrollLength: number, duration: number) => number;

/**
 * Converts a time distance from a snap target to the equivalent scroll distance in px.
 */
export declare const seekSnapDistance: (scrollLength: number, closest: number, duration: number) => number;

/**
 * Builds the snap target times for a step of the duration; a step of 0 or less degenerates to the animation start.
 */
export declare const snapTargetsFromStep: (step: number, duration: number) => number[];

/**
 * The trigger size share between the lower and higher positions (negative when inverted).
 */
export declare const intersectionLength: (size: number, lowerPosition: number, higherPosition: number) => number;

/**
 * The share of the remaining distance an exponential follow covers in dt for a time constant tau.
 */
export declare const expFollowFactor: (dt: number, tau: number) => number;
