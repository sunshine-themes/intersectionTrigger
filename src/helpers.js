const is = {
	function: (a) => 'function' === typeof a,
	string: (a) => 'string' === typeof a,
	boolean: (a) => 'boolean' === typeof a,
	object: (a) => a && 'object' === typeof a && !(a instanceof Array),
	inObject: (obj, prop) => is.object(obj) && prop in obj,
	num: (a) => typeof a === 'number',
	percent: (a) => a && a.includes('%'),
	pixel: (a) => a && a.includes('px'),
	array: (a) => a instanceof Array,
	element: (a) => a instanceof HTMLElement || a instanceof Element,
	doc: (a) => a && a.nodeType === 9,
	scrollable: (element, dir = null) =>
		dir
			? 'y' === dir
				? element.scrollHeight > element.clientHeight
				: element.scrollWidth > element.clientWidth
			: element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth,
	anime: (a) => is.object(a) && a.hasOwnProperty('animatables') && !a.hasOwnProperty('add'),
	tl: (a) => is.object(a) && a.hasOwnProperty('add') && is.function(a.add),
	animeInstance: (a) => is.anime(a) || is.tl(a),
};
const clamp = (a, min, max) => Math.min(Math.max(a, min), max);
const splitStr = (st) => st.split(/\s+/);
const getBoundsProp = (element, prop) => element && element.getBoundingClientRect()[prop];
const getScrollValue = (element, dir) => ('y' === dir ? element.scrollHeight : element.scrollWidth);
const roundFloat = (value, precision) => {
	is.string(value) && (value = parseFloat(value));
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
};
const getParents = (element) => {
	let parents = [];
	for (
		element = element.parentNode;
		element && element !== document && element !== document.documentElement;
		element = element.parentNode
	) {
		parents.push(element);
	}
	return parents;
};
const mergeOptions = (def, custom) => {
	const defaultOptions = def;
	const options = custom;
	Object.entries(defaultOptions).forEach(([k, v]) => {
		if (is.object(v)) {
			mergeOptions(v, (options[k] = options[k] || {}));
		} else if (!(k in options)) {
			options[k] = v;
		}
	});
	return options;
};
const throwError = (message) => {
	throw new Error(message);
};
const getMinMax = (n1, n2) => [n1, n2].sort((a, b) => a - b);

const parseValue = (v) => {
	const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(v);
	return { value: parseFloat(parts[1]), unit: parts[2] };
};

const parseString = (string) => {
	return string.split(/\s+/).map((v) => parseValue(v));
};

const setElProps = (el, props) => {
	for (const propName in props) {
		el.style[propName] = props[propName];
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
