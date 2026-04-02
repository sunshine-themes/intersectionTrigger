import type IntersectionTrigger from '../../src/core/core';

declare global {
	namespace Cypress {
		interface Chainable {
			withIT(url: string, callback: (IT: typeof IntersectionTrigger) => void): Chainable<void>;
		}
	}
}

Cypress.Commands.add('withIT', (url: string, callback: (IT: typeof IntersectionTrigger) => void) => {
	cy.visit(url);
	cy.window().then(win => {
		callback((win as any).__test__);
	});
});
