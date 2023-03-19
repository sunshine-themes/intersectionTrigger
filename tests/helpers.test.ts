import anime from 'animejs';
import {
	is
	// splitStr,
	// getBoundsProp,
	// getScrollValue,
	// roundFloat,
	// getParents,
	// mergeOptions,
	// throwError,
	// clamp,
	// parseValue,
	// parseString,
	// getMinMax,
	// setElProps,
	// getScrollBarWidth,
	// deepClone
} from '../src/helpers';

// Test "is" object
describe('is', () => {
	test('checks if a variable is a function', () => {
		expect(is.function(() => {})).toBe(true);
		expect(is.function('string')).toBe(false);
	});

	test('checks if a variable is a string', () => {
		expect(is.string('hello world')).toBe(true);
		expect(is.string(true)).toBe(false);
	});

	test('checks if a variable is a boolean', () => {
		expect(is.boolean(true)).toBe(true);
		expect(is.boolean('string')).toBe(false);
	});

	test('checks if a variable is an object', () => {
		expect(is.object({ key: 'value' })).toBe(true);
		expect(is.object([])).toBe(false);
		expect(is.object(null)).toBe(false);
		expect(is.object(undefined)).toBe(false);
	});

	test('checks if a variable is a number', () => {
		expect(is.num(123)).toBe(true);
		expect(is.num(1.01)).toBe(true);
		expect(is.num('123')).toBe(false);
	});

	test('checks if a variable is an array', () => {
		expect(is.array([])).toBe(true);
		expect(is.array({})).toBe(false);
	});

	test('checks if a variable is an HTMLElement', () => {
		const element = document.createElement('div');
		expect(is.element(element)).toBe(true);
		expect(is.element({})).toBe(false);
	});

	test('checks if an object is empty', () => {
		expect(is.empty({})).toBe(true);
		expect(is.empty({ key: 'value' })).toBe(false);
	});

	test('checks if a variable is a Document', () => {
		expect(is.doc(document)).toBe(true);
		expect(is.doc(document.documentElement)).toBe(false);
		expect(is.doc(window)).toBe(false);
	});

	test('checks if a variable is an Anime', () => {
		expect(is.anime(anime({}))).toBe(true);
		expect(is.anime(anime.timeline({}))).toBe(false);
	});

	test('checks if a variable is an Anime timeline', () => {
		expect(is.tl(anime.timeline({}))).toBe(true);
		expect(is.tl(anime({}))).toBe(false);
	});

	test('checks if a variable is an Anime instance', () => {
		expect(is.animeInstance(anime({}))).toBe(true);
		expect(is.animeInstance(anime.timeline({}))).toBe(true);
		expect(is.animeInstance({})).toBe(false);
	});

	test('checks if a string contains the sign "px"', () => {
		expect(is.pixel('100px')).toBe(true);
		expect(is.pixel('100%')).toBe(false);
	});

	test('checks if a string contains the sign "%"', () => {
		expect(is.percent('100%')).toBe(true);
		expect(is.percent('100px')).toBe(false);
	});

	describe('checks if an element is scrollable', () => {
		const getElements = () => {
			const trigger = document.querySelector('#trigger') as HTMLElement;
			const child = document.querySelector('#child') as HTMLElement;
			return { trigger, child };
		};

		test('The trigger should be queryable', () => {
			const trigger = document.querySelector('#trigger');
			expect(trigger).not.toBeNull();
		});
		test('The child should be queryable', () => {
			const child = document.querySelector('#child');
			expect(child).not.toBeNull();
		});

		test('The trigger should Not be scrollable', () => {
			expect(is.scrollable(getElements().trigger)).toBe(false);
		});

		test('The element should be scrollable in x-dir', () => {
			const { trigger } = getElements();
			// child.classList.add('with-scroll-x');
			// console.log(child.classList.contains('with-scroll-x'));
			console.log(IntersectionObserver);
			// console.log(getComputedStyle(trigger).getPropertyValue('height'));
			// console.log(getComputedStyle(trigger).getPropertyValue('width'));
			// console.log(trigger.getBoundingClientRect().width);

			expect(is.scrollable(trigger, 'x')).toBe(true);
		});

		// test('The element should be scrollable in y-dir', () => {
		// 	getElements().child.classList.add('with-scroll-y');
		// 	expect(is.scrollable(getElements().element, 'y')).toBe(true);
		// });
		// test('The element should be scrollable in both (x , y) dir', () => {
		// 	getElements().child.classList.add('with-scroll-y', 'with-scroll-y');
		// 	expect(is.scrollable(getElements().element)).toBe(true);
		// });
	});
});
