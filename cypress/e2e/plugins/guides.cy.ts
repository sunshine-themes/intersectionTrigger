import type IntersectionTrigger from '../../../src/core/core';
// import Guides from '../../../src/plugins/guides/guides';

type CustomWindow = Cypress.AUTWindow & { __test__: typeof IntersectionTrigger };

const fn = () => {};

describe('Guides Tests', () => {
	let IT: typeof IntersectionTrigger;

	beforeEach(done => {
		cy.visit('/guides.html');
		cy.window().then(win => {
			IT = (win as CustomWindow).__test__;
			done();
		});
	});

	it('guides option when true, should enable guides', () => {
		const itInstance = new IT({
			guides: true
		}).add('#target');

		cy.get('#root-enter').should('be.visible');
		cy.get('#root-leave').should('be.visible');
		cy.get('#trigger-enter').should('be.visible');
		cy.get('#trigger-enter').should('be.visible');
	});
});
