import anime from 'animejs';
import {
	is,
	splitStr,
	roundFloat,
	mergeOptions,
	throwError,
	clamp,
	parseValue,
	parseString,
	getMinMax,
	setElProps,
	getScrollBarWidth,
	deepClone
} from '../../../instrumented/helpers';

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

	describe('inObject function', () => {
		it('should return true if the property is in the object', () => {
			const obj = {
				name: 'John',
				age: 30
			};
			expect(is.inObject(obj, 'name')).to.be.true;
			expect(is.inObject(obj, 'age')).to.be.true;
		});

		it('should return false if the property is not in the object', () => {
			const obj = {
				name: 'John',
				age: 30
			};
			expect(is.inObject(obj, 'email')).to.be.false;
			expect(is.inObject(obj, 'address')).to.be.false;
		});

		it('should return true if the property is a symbol key of the object', () => {
			const key = Symbol('key');
			const obj = {
				[key]: 'value'
			};
			expect(is.inObject(obj, key)).to.be.true;
		});

		it('should return false if the property is a symbol key not in the object', () => {
			const key1 = Symbol('key1');
			const key2 = Symbol('key2');
			const obj = {
				[key1]: 'value'
			};
			expect(is.inObject(obj, key2)).to.be.false;
		});

		it('should return false if the property is inherited from the object prototype', () => {
			const obj = {
				name: 'John'
			};
			expect(is.inObject(obj, 'hasOwnProperty')).to.be.false;
		});

		it('should return true if the property is an own property of the object', () => {
			const obj = {
				name: 'John'
			};
			expect(is.inObject(obj, 'name')).to.be.true;
		});
	});

	describe('checks if an element is scrollable', () => {
		beforeEach(() => {
			cy.visit('/basic.html');
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

describe('clamp function', () => {
	it('should return the value when it is within the range', () => {
		expect(clamp(5, 0, 10)).to.equal(5);
	});

	it('should return the minimum value when the input is lower than the range', () => {
		expect(clamp(-5, 0, 10)).to.equal(0);
	});

	it('should return the maximum value when the input is higher than the range', () => {
		expect(clamp(15, 0, 10)).to.equal(10);
	});

	it('should return the minimum value when the input is equal to the minimum value', () => {
		expect(clamp(0, 0, 10)).to.equal(0);
	});

	it('should return the maximum value when the input is equal to the maximum value', () => {
		expect(clamp(10, 0, 10)).to.equal(10);
	});
});

it('should split a string with space-separator into an array', () => {
	expect(splitStr('one two three four')).to.be.an('array').and.to.deep.equal(['one', 'two', 'three', 'four']);
	expect(splitStr(' one   two three  ')).to.deep.equal(['one', 'two', 'three']);
});

describe('roundFloat', () => {
	it('should round a float to the nearest integer by default', () => {
		expect(roundFloat(3.14)).to.equal(3);
		expect(roundFloat(3.75)).to.equal(4);
		expect(roundFloat(3.5)).to.equal(4);
	});

	it('should round a float to a specified precision', () => {
		expect(roundFloat(3.14159, 2)).to.equal(3.14);
		expect(roundFloat(3.14159, 3)).to.equal(3.142);
		expect(roundFloat(3.14159, 4)).to.equal(3.1416);
	});

	it('should convert a string to a float before rounding', () => {
		expect(roundFloat('3.14')).to.equal(3);
		expect(roundFloat('3.75')).to.equal(4);
		expect(roundFloat('3.5')).to.equal(4);
	});

	it('should return NaN if given a non-numeric input', () => {
		expect(roundFloat('not a number')).to.be.NaN;
	});
});

describe('getParents', () => {
	beforeEach(() => {
		cy.visit('/get-parents.html');
	});

	it('window should have a "__test__" property', () => {
		cy.window().should('have.property', '__test__');
	});

	it('should return an array of parent elements up to the document element', () => {
		cy.window().then(win => {
			const getParents = (win as Cypress.AUTWindow & { __test__(element: HTMLElement): HTMLElement[] }).__test__;
			cy.document()
				.get('#target')
				.then($target => {
					const targetElement = $target[0];

					const parents = getParents(targetElement);
					expect(parents).to.have.lengthOf(3);
				});
		});
	});
});

describe('deepClone', () => {
	it('should clone an object', () => {
		const obj = { foo: 'bar', baz: { qux: 42, ba: true, obj: { fo: false } } };
		const clone = deepClone(obj);
		expect(clone).to.deep.equal(obj);
		expect(clone).to.not.equal(obj);
	});

	it('should clone an array', () => {
		const arr = [1, 2, 3];
		const clone = deepClone(arr);
		expect(clone).to.deep.equal(arr);
		expect(clone).to.not.equal(arr);
	});

	it('should not clone an Anime.js instance', () => {
		const animeInstance = anime({});
		const clone = deepClone(animeInstance);
		expect(clone).to.equal(animeInstance);
	});

	it('should not clone an Element', () => {
		const el = document.createElement('div');
		const clone = deepClone(el);
		expect(clone).to.equal(el);
	});
});

describe('mergeOptions', () => {
	it('should merge two objects', () => {
		const defaultOptions = { foo: 'bar', baz: { qux: 42, ba: true, obj: { fo: false } } };
		const customOptions = { foo: 'baz', baz: { qux: 99, obj: {} } };

		const merged = mergeOptions(defaultOptions, customOptions);
		expect(merged).to.deep.equal({ foo: 'baz', baz: { qux: 99, ba: true, obj: { fo: false } } });
	});
});

describe('throwError', () => {
	it('should throw an error with the specified message', () => {
		expect(() => throwError('foo')).to.throw('foo');
	});

	it('should throw an error without a message', () => {
		expect(() => throwError()).to.throw();
	});
});

describe('getMinMax', () => {
	it('should return the minimum and maximum values', () => {
		const result = getMinMax(3, 1);
		expect(result).to.deep.equal([1, 3]);
	});

	it('should return the values in ascending order if they are equal', () => {
		const result = getMinMax(2, 2);
		expect(result).to.deep.equal([2, 2]);
	});
});

describe('parseValue', () => {
	it('should parse a value with a unit', () => {
		const result = parseValue('10px');
		expect(result).to.deep.equal({ value: 10, unit: 'px' });
	});

	it('should return { value: 0, unit: "" } if the input is a value without a unit', () => {
		const result = parseValue('5');
		expect(result).to.deep.equal({ value: 0, unit: '' });
	});

	it('should return { value: 0, unit: "" } if the input is not a number with a unit', () => {
		const result = parseValue('foo');
		expect(result).to.deep.equal({ value: 0, unit: '' });
	});
});

describe('parseString', () => {
	it('should parse a string with values', () => {
		const result = parseString('10px 5%');
		expect(result).to.deep.equal([
			{ value: 10, unit: 'px' },
			{ value: 5, unit: '%' }
		]);
	});

	it('should return [{ value: 0, unit: "" }] if the input is an empty string', () => {
		const result = parseString('');
		expect(result).to.deep.equal([{ value: 0, unit: '' }]);
	});
});

describe('setElProps', () => {
	it('should set style properties on an element', () => {
		const el = document.createElement('div');
		setElProps(el, { backgroundColor: 'red', fontSize: '12px' });
		expect(el.style.backgroundColor).to.equal('red');
		expect(el.style.fontSize).to.equal('12px');
	});
});

describe('getScrollBarWidth function', () => {
	it('should return a number', () => {
		const result = getScrollBarWidth();
		expect(result).to.be.a('number');
	});

	it('should return a non-negative value', () => {
		const result = getScrollBarWidth();
		expect(result).to.be.at.least(0);
	});

	it('should return the correct width of the scrollbar', () => {
		// create a div with overflow
		const div = document.createElement('div');
		div.style.cssText = 'overflow:scroll; visibility:hidden; position:absolute;';
		document.body.appendChild(div);

		// calculate the expected scrollbar width
		const expectedWidth = div.offsetWidth - div.clientWidth;

		// remove the div
		document.body.removeChild(div);

		// check if the function returns the expected width
		const result = getScrollBarWidth();
		expect(result).to.equal(expectedWidth);
	});
});
