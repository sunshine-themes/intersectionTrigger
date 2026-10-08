import type IntersectionTrigger from '../../src/core/core';

declare global {
	namespace Cypress {
		interface Chainable {
			withIT(url: string, callback: (IT: typeof IntersectionTrigger, win: Cypress.AUTWindow) => void): Chainable<void>;
		}
	}
}

Cypress.Commands.add('withIT', (url: string, callback: (IT: typeof IntersectionTrigger, win: Cypress.AUTWindow) => void) => {
	cy.visit(url);
	cy.window().then(win => {
		callback((win as any).__test__, win);
	});
});
