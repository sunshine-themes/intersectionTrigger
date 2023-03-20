import anime from 'animejs';
import {
	is,
	splitStr,
	getScrollValue
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
} from '../../src/helpers';

// Test "is" object
describe('is object helper', () => {
	it('checks if a variable is a function', () => {
		expect(is.function(() => {})).to.be.true;
		expect(is.function('string')).to.be.false;
	});

	it('checks if a variable is a string', () => {
		expect(is.string('hello world')).to.be.true;
		expect(is.string(true)).to.be.false;
	});

	it('checks if a variable is a boolean', () => {
		expect(is.boolean(true)).to.be.true;
		expect(is.boolean('string')).to.be.false;
	});

	it('checks if a variable is an object', () => {
		expect(is.object({ key: 'value' })).to.be.true;
		expect(is.object([])).to.be.false;
		expect(is.object(null)).to.be.false;
		expect(is.object(undefined)).to.be.false;
	});

	it('checks if a variable is a number', () => {
		expect(is.num(123)).to.be.true;
		expect(is.num(1.01)).to.be.true;
		expect(is.num('123')).to.be.false;
	});

	it('checks if a variable is an array', () => {
		expect(is.array([])).to.be.true;
		expect(is.array({})).to.be.false;
	});

	it('checks if a variable is an HTMLElement', () => {
		const element = document.createElement('div');
		expect(is.element(element)).to.be.true;
		expect(is.element({})).to.be.false;
	});

	it('checks if an object is empty', () => {
		expect(is.empty({})).to.be.true;
		expect(is.empty({ key: 'value' })).to.be.false;
	});

	it('checks if a variable is a Document', () => {
		expect(is.doc(document)).to.be.true;
		expect(is.doc(document.documentElement)).to.be.false;
		expect(is.doc(window)).to.be.false;
	});

	it('checks if a variable is an Anime', () => {
		expect(is.anime(anime({}))).to.be.true;
		expect(is.anime(anime.timeline({}))).to.be.false;
	});

	it('checks if a variable is an Anime timeline', () => {
		expect(is.tl(anime.timeline({}))).to.be.true;
		expect(is.tl(anime({}))).to.be.false;
	});

	it('checks if a variable is an Anime instance', () => {
		expect(is.animeInstance(anime({}))).to.be.true;
		expect(is.animeInstance(anime.timeline({}))).to.be.true;
		expect(is.animeInstance({})).to.be.false;
	});

	it('checks if a string contains the sign "px"', () => {
		expect(is.pixel('100px')).to.be.true;
		expect(is.pixel('100%')).to.be.false;
	});

	it('checks if a string contains the sign "%"', () => {
		expect(is.percent('100%')).to.be.true;
		expect(is.percent('100px')).to.be.false;
	});

	describe('checks if an element is scrollable', () => {
		beforeEach(() => {
			cy.visit('/basic/index.html');
		});

		it('The trigger should Not be scrollable', () => {
			cy.get('#trigger').then(trigger => expect(is.scrollable(trigger[0])).to.be.false);
		});

		it('The element should be scrollable in x-dir', () => {
			cy.get('#child').then(child => child.addClass('with-scroll-x'));
			cy.get('#trigger').then(trigger => expect(is.scrollable(trigger[0], 'x')).to.be.true);
		});
		it('The element should be scrollable in y-dir', () => {
			cy.get('#child').then(child => child.addClass('with-scroll-y'));
			cy.get('#trigger').then(trigger => expect(is.scrollable(trigger[0], 'y')).to.be.true);
		});
		it('The element should be scrollable in both (x , y) dir', () => {
			cy.get('#child').then(child => child.addClass('with-scroll-x with-scroll-y'));
			cy.get('#trigger').then(trigger => expect(is.scrollable(trigger[0])).to.be.true);
		});
	});
});

it('should split a string with space-separator into an array', () => {
	expect(splitStr('one two three four')).to.be.an('array').and.to.deep.equal(['one', 'two', 'three', 'four']);
	expect(splitStr(' one   two three  ')).to.deep.equal(['one', 'two', 'three']);
});

describe('should return the scroll height or width of an element', () => {
	beforeEach(() => {
		cy.visit('/basic/index.html');
	});

	it('should return the scroll height', () => {
		cy.get('#child').then(child => child.addClass('with-scroll-y'));
		cy.get('#trigger').then(trigger => {
			const el = trigger[0],
				scrollHeight = el.scrollHeight;

			expect(getScrollValue(el, 'y')).to.equal(scrollHeight);
		});
	});

	it('should return the scroll width', () => {
		cy.get('#child').then(child => child.addClass('with-scroll-x'));
		cy.get('#trigger').then(trigger => {
			const el = trigger[0],
				scrollWidth = el.scrollWidth;

			expect(getScrollValue(el, 'x')).to.equal(scrollWidth);
		});
	});

	it('should the scroll height and width to equal 0', () => {
		cy.get('#trigger').then(trigger => {
			const el = trigger[0];

			expect(getScrollValue(el, 'y')).to.equal(0);
			expect(getScrollValue(el, 'x')).to.equal(0);
		});
	});
});
