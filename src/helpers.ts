import type anime from 'animejs';
import type { Anime, AnimeInstance } from './plugins/animation/types';
import type { SplitResult, DeepRequired } from './utils/types';

const is = {
	function: <T>(a: unknown): a is (...args: unknown[]) => T => typeof a === 'function',
	string: (a: unknown): a is string => 'string' === typeof a,
	boolean: (a: unknown): a is boolean => 'boolean' === typeof a,
	object: (a: unknown): a is object => !!a && 'object' === typeof a && a !== null && !(a instanceof Array),
	num: (a: unknown): a is number => typeof a === 'number',
	array: (a: unknown): a is [] => a instanceof Array,
	element: (a: unknown): a is HTMLElement => a instanceof HTMLElement,
	empty: (a: object) => Object.keys(a).length === 0,
	doc: (a: unknown): a is Document => a instanceof Document,
	anime: (a: unknown): a is Anime<anime.AnimeInstance> => is.object(a) && a.hasOwnProperty('animatables') && !a.hasOwnProperty('add'),
	tl: (a: unknown): a is Anime<anime.AnimeTimelineInstance> =>
		is.object(a) && a.hasOwnProperty('add') && is.function((a as Anime<anime.AnimeTimelineInstance>).add),
	animeInstance: (a: unknown): a is Anime<AnimeInstance> => is.anime(a) || is.tl(a),
	pixel: (a: string) => a.includes('px'),
	inObject: <O extends object>(obj: O, prop: PropertyKey): prop is keyof O => is.object(obj) && prop in obj,
	percent: (a: string) => a.includes('%'),
	scrollable: (element: HTMLElement, dir?: 'x' | 'y') =>
		dir
			? 'y' === dir
				? element.scrollHeight > element.clientHeight
				: element.scrollWidth > element.clientWidth
			: element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
};
const clamp = (a: number, min: number, max: number) => Math.min(Math.max(a, min), max);
const splitStr = <S extends string>(st: S) => st.trim().split(/\s+/) as SplitResult<S>;
const getScrollValue = (element: HTMLElement, dir: 'y' | 'x') => ('y' === dir ? element.scrollHeight : element.scrollWidth);
const roundFloat = (value: string | number, precision?: number) => {
	is.string(value) && (value = parseFloat(value));
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
};
const getParents = (element: HTMLElement) => {
	const parents: HTMLElement[] = [];
	for (let el = element.parentElement; el && !is.doc(el) && el !== document.documentElement; el = el.parentElement) {
		parents.push(el);
	}
	return parents;
};

const deepClone = <T>(obj: T) => {
	if ((!is.object(obj) && !is.array(obj)) || is.animeInstance(obj) || obj instanceof Element) return obj;

	const clone = (is.array(obj) ? [] : {}) as T;

	for (const k in obj) {
		if (obj.hasOwnProperty(k)) clone[k] = deepClone(obj[k]);
	}

	return clone;
};

const mergeOptions = <D extends C, C extends object>(defaultOptions: D, customOptions: C) => {
	const options = { ...defaultOptions } as DeepRequired<D>;
	for (const [key, value] of Object.entries(customOptions)) {
		const k = key as keyof D;
		if (is.object(options[k]) && !is.empty(options[k])) {
			if (!is.object(value)) continue;
			options[k] = mergeOptions(options[k], value) as DeepRequired<D>[keyof D];
		} else {
			options[k] = value;
		}
	}
	return options;
};

const throwError = (message?: string) => {
	throw new Error(message);
};
const getMinMax = (n1: number, n2: number) => [n1, n2].sort((a, b) => a - b);

const parseValue = (v: string) => {
	let output = { value: 0, unit: '' };
	const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(v);
	parts && (output = { value: parseFloat(parts[1]), unit: parts[2] });
	return output;
};

const parseString = (str: string) => str.split(/\s+/).map(v => parseValue(v));

const setElProps = (el: HTMLElement, props: Partial<CSSStyleDeclaration>) => {
	for (const propName in props) {
		el.style[propName] = props[propName] as string;
	}
};

const getScrollBarWidth = () => {
	const el = document.createElement('div');
	el.style.cssText = 'overflow:scroll; visibility:hidden; position:absolute;';
	document.body.appendChild(el);
	const width = el.offsetWidth - el.clientWidth;
	el.remove();
	return width;
};

export {
	is,
	splitStr,
	getScrollValue,
	roundFloat,
	getParents,
	mergeOptions,
	throwError,
	clamp,
	parseValue,
	parseString,
	getMinMax,
	setElProps,
	getScrollBarWidth,
	deepClone
};
