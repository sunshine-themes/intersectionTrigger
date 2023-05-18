import type IntersectionTrigger from '../../../src/core/core';
import Guides from '../../../src/plugins/guides/guides';

type CustomWindow = Cypress.AUTWindow & { __test__: typeof IntersectionTrigger };

describe('Guides Tests', () => {
	let IT: typeof IntersectionTrigger;
	const guideThickness = 2;

	beforeEach(done => {
		cy.visit('/guides.html');
		cy.window().then(win => {
			IT = (win as CustomWindow).__test__;
			done();
		});
	});

	const checkGuidesVisibility = () => {
		cy.get('#root-enter').should('be.visible');
		cy.get('#root-leave').should('be.visible');
		cy.get('#trigger-enter').should('be.visible');
		cy.get('#trigger-leave').should('be.visible');
		cy.contains('#root-enter span', 'Root Enter').should('be.visible');
		cy.contains('#root-leave span', 'Root Leave').should('be.visible');
		cy.contains('#trigger-enter span', 'Enter').should('be.visible');
		cy.contains('#trigger-leave span', 'Leave').should('be.visible');
	};
	const checkRootGuidesPosition = (enterPosition: number, leavePosition: number, root: string) => {
		cy.get(root).then($root => {
			const rootBounds = $root[0].getBoundingClientRect();

			cy.get('#root-enter').then($guide => {
				const guideBounds = $guide[0].getBoundingClientRect();
				const rootEnterPosition = rootBounds.top + $root.height()! * enterPosition;

				expect(guideBounds.top).to.be.within(rootEnterPosition - guideThickness, rootEnterPosition);
			});
			cy.get('#root-leave').then($guide => {
				const guideBounds = $guide[0].getBoundingClientRect();
				const rootLeavePosition = rootBounds.top + $root.height()! * leavePosition;

				expect(guideBounds.top).to.be.within(rootLeavePosition - guideThickness, rootLeavePosition);
			});
		});
	};
	const checkTriggerGuidesPosition = (enterPosition: number, leavePosition: number, trigger: string) => {
		cy.get(trigger).then($trigger => {
			const triggerBounds = $trigger[0].getBoundingClientRect();

			cy.get('#trigger-enter').then($guide => {
				const guideBounds = $guide[0].getBoundingClientRect();
				const triggerEnterPosition = triggerBounds.top + $trigger.height()! * enterPosition;

				expect(guideBounds.top).to.be.within(triggerEnterPosition - guideThickness, triggerEnterPosition);
			});
			cy.get('#trigger-leave').then($guide => {
				const guideBounds = $guide[0].getBoundingClientRect();
				const triggerLeavePosition = triggerBounds.top + $trigger.height()! * leavePosition;

				expect(guideBounds.top).to.be.within(triggerLeavePosition - guideThickness, triggerLeavePosition);
			});
		});
	};

	it('guides option when true, should enable guides', () => {
		const itInstance = new IT({
			guides: true
		}).add('#target');

		checkGuidesVisibility();
		expect(itInstance.guides).to.be.instanceOf(IT.getRegisteredPlugins()[0]);
	});

	it('should enable guides when guides option is an empty object', () => {
		const itInstance = new IT({
			guides: {}
		}).add('#target');

		checkGuidesVisibility();
	});

	it('should kill guides', () => {
		const itInstance = new IT({
			guides: true
		}).add('#target');

		expect(itInstance.guides!._guides).to.not.be.empty;

		itInstance.guides!.kill();

		cy.get('#root-enter').should('not.exist');
		cy.get('#root-leave').should('not.exist');
		cy.get('#trigger-enter').should('not.exist');
		cy.get('#trigger-leave').should('not.exist');

		expect(itInstance.guides).to.be.undefined;
	});

	it('should enable guides when guides option is an object', () => {
		const itInstance = new IT({
			guides: {
				enter: {
					root: {
						backgroundColor: 'black',
						color: 'white'
					}
				}
			}
		}).add('#target');

		checkGuidesVisibility();
	});

	it('the enter root guide color should be "rgb(0,0,0)", and the trigger leave one should have "Trigger Leave" text', () => {
		const itInstance = new IT({
			guides: {
				enter: {
					root: {
						backgroundColor: 'rgb(0,0,0)'
					}
				},
				leave: {
					trigger: {
						text: 'Trigger Leave'
					}
				}
			}
		}).add('#target');

		cy.get('#root-enter').should('have.css', 'background-color', 'rgb(0, 0, 0)');
		cy.get('#root-enter span').should('have.css', 'background-color', 'rgb(0, 0, 0)');
		cy.get('#trigger-leave span').should('contain.text', 'Trigger Leave');
	});

	it('should guides be visible when switching the guides position', () => {
		const itInstance = new IT({
			guides: true,
			rootEnter: '0%',
			rootLeave: '100%'
		}).add('#target', {
			enter: '100%',
			leave: '0%'
		});

		checkGuidesVisibility();
	});

	it('the root enter guide should be at 10% from the top of the viewport, and the leave one should be at 298px', () => {
		const itInstance = new IT({
			guides: true,
			rootEnter: '10%',
			rootLeave: '300px'
		}).add('#target');

		cy.window().then(win => {
			cy.get('#root-enter').should('have.css', 'top', `${win.innerHeight * 0.1}px`);
			cy.get('#root-leave').should('have.css', 'top', '298px'); // 298px taking the thickness in consideration
		});
	});

	it("at init, the trigger enter guide should be at 10% from the top of the trigger's height, and the leave one should be at 60%", () => {
		const itInstance = new IT({
			guides: true
		}).add('#target', {
			enter: () => '10%',
			leave: () => '60%'
		});

		checkTriggerGuidesPosition(0.1, 0.6, '#target');
	});

	it("While scrolling, the trigger enter guide should be at 10% from the top of the trigger's height, and the leave one should be at 60%", () => {
		const itInstance = new IT({
			guides: true
		}).add('#target', {
			enter: () => '10%',
			leave: () => '60%'
		});

		cy.scrollTo(0, 200);

		checkTriggerGuidesPosition(0.1, 0.6, '#target');
	});

	describe('Root is an Element', () => {
		describe('At Initiation', () => {
			it("the root enter guide should be at 30% from the top of the root's height, and the leave one should be at 70%", () => {
				cy.document().then(doc => {
					const itInstance = new IT({
						guides: true,
						root: doc.querySelector<HTMLElement>('#target'),
						rootEnter: '30%',
						rootLeave: '70%'
					}).add('#child');

					checkRootGuidesPosition(0.3, 0.7, '#target');
				});
			});
			it("the trigger enter guide should be at 90% from the top of the trigger's height, and the leave one should be at 70%", () => {
				cy.document().then(doc => {
					const itInstance = new IT({
						guides: true,
						root: doc.querySelector<HTMLElement>('#target')
					}).add('#child', {
						enter: '90%',
						leave: '70%'
					});

					checkTriggerGuidesPosition(0.9, 0.7, '#child');
				});
			});
		});
		describe('While Scrolling', () => {
			it("the root enter guide should be at 30% from the top of the root's height, and the leave one should be at 70%", () => {
				cy.document().then(doc => {
					const itInstance = new IT({
						guides: true,
						root: doc.querySelector<HTMLElement>('#target'),
						rootEnter: '30%',
						rootLeave: '70%'
					}).add('#child');

					cy.scrollTo(0, 200);
					checkRootGuidesPosition(0.3, 0.7, '#target');
				});
			});
			it("the trigger enter guide should be at 90% from the top of the trigger's height, and the leave one should be at 70%", () => {
				cy.document().then(doc => {
					const itInstance = new IT({
						guides: true,
						root: doc.querySelector<HTMLElement>('#target')
					}).add('#child', {
						enter: '90%',
						leave: '70%'
					});

					cy.scrollTo(0, 200);
					checkTriggerGuidesPosition(0.9, 0.7, '#child');

					cy.get('#target').scrollTo(0, 200);
					checkTriggerGuidesPosition(0.9, 0.7, '#child');
				});
			});
		});
	});
});
