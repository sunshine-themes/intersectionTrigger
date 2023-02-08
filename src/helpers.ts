import type anime from 'animejs';
import { Anime, AnimeInstance } from './constants';
import type { DeepRequired } from './utils/types';

type SplitResult<S extends string> = S extends `${infer A} ${infer B} ${infer C} ${infer D}` ? [A, B, C, D] : string[];

const is = {
	function: (a: unknown): a is Function => 'function' === typeof a,
	string: (a: unknown): a is string => 'string' === typeof a,
	boolean: (a: unknown): a is boolean => 'boolean' === typeof a,
	object: (a: unknown): a is object => !!a && 'object' === typeof a && a !== null && !(a instanceof Array),
	num: (a: unknown): a is number => typeof a === 'number',
	array: (a: unknown): a is [] => a instanceof Array,
	element: (a: unknown): a is HTMLElement => a instanceof HTMLElement,
	empty: (a: object) => Object.keys(a).length === 0,
	doc: (a: unknown): a is Document => is.element(a) && a.nodeType === 9,
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
			: element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth,
};
const clamp = (a: number, min: number, max: number) => Math.min(Math.max(a, min), max);
const splitStr = <S extends string>(st: S) => st.split(/\s+/) as SplitResult<S>;
const getBoundsProp = (element: HTMLElement, prop: 'height' | 'width') => element && element.getBoundingClientRect()[prop];
const getScrollValue = (element: HTMLElement, dir: 'y' | 'x') => ('y' === dir ? element.scrollHeight : element.scrollWidth);
const roundFloat = (value: string | number, precision?: number) => {
	is.string(value) && (value = parseFloat(value));
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
};
const getParents = (element: HTMLElement) => {
	let parents: HTMLElement[] = [];
	for (let el = element.parentElement; el && !is.doc(el) && el !== document.documentElement; el = el.parentElement) {
		parents.push(el);
	}
	return parents;
};

const mergeOptions = <D extends C, C extends object>(defaultOptions: D, customOptions: C) => {
	const options = { ...defaultOptions } as DeepRequired<D>;
	for (const [key, value] of Object.entries(customOptions)) {
		if (is.object(options[key]) && !is.empty(options[key])) {
			if (!is.object(value)) continue;
			options[key] = mergeOptions(options[key], value);
		} else {
			options[key] = value;
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

const parseString = (str: string) => str.split(/\s+/).map((v) => parseValue(v));

const setElProps = (el: HTMLElement, props: Partial<CSSStyleDeclaration>) => {
	for (const propName in props) {
		el.style[propName] = props[propName] as string;
	}
};

const getScrollBarWidth = () => {
	let el = document.createElement('div');
	el.style.cssText = 'overflow:scroll; visibility:hidden; position:absolute;';
	document.body.appendChild(el);
	let width = el.offsetWidth - el.clientWidth;
	el.remove();
	return width;
};

export {
	is,
	splitStr,
	getBoundsProp,
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
};
