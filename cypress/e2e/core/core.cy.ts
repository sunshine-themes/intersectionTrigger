import IntersectionTrigger from '../../../src/core/core';
// import { defaultInsOptions } from '../../../instrumented/constants';

type CustomWindow = Cypress.AUTWindow & { __test__: typeof IntersectionTrigger };

describe('Core Tests', () => {
	beforeEach(() => {
		cy.visit('/core.html');
	});

	it('window should have a "__test__" property', () => {
		cy.window().should('have.property', '__test__');
	});

	it('should instantiate IntersectionTrigger with all default options', () => {
		cy.window().then(win => {
			const IT = (win as CustomWindow).__test__;
			const itInstance = new IT();
			expect(itInstance).to.be.instanceOf(IT);
			// expect(itInstance._options).to.deep.equal(defaultInsOptions);
		});
	});

	it('should add a trigger', () => {
		cy.window().then(win => {
			const IT = (win as CustomWindow).__test__;
			const itInstance = new IT();

			itInstance.add('#trigger');

			cy.get('#trigger').then($trigger => expect(itInstance.triggers[0]).to.equal($trigger[0]));
		});
	});

	it('should trigger a default event with two arguments ( trigger , intersectionTrigger )', () => {
		let itInstance: IntersectionTrigger;

		const enterCallbackSpy = cy.spy();

		cy.window().then(win => {
			const IT = (win as CustomWindow).__test__;

			itInstance = new IT({
				defaults: {
					onEnter: enterCallbackSpy
				}
			}).add('#trigger');

			cy.wait(30).then(() =>
				cy.get('#trigger').then($trigger => expect(enterCallbackSpy.calledOnceWithExactly($trigger[0], itInstance)).to.be.true)
			);
		});
	});

	it('First observer callback invoke after init, With No Intersection, should NOT trigger any event', () => {
		const callbackSpy = cy.spy();

		cy.get('#trigger').then($trigger => {
			$trigger.addClass('mt-300');
			cy.window().then(win => {
				const IT = (win as CustomWindow).__test__;
				const itInstance = new IT({
					defaults: {
						onEnter: callbackSpy,
						onLeave: callbackSpy,
						onEnterBack: callbackSpy,
						onLeaveBack: callbackSpy
					},
					rootEnter: '250px'
				}).add('#trigger');

				cy.wait(30).then(() => expect(callbackSpy.called).to.be.false);
			});
		});
	});
	it('First observer callback invoke after init, With Intersection, should trigger default enter event', () => {
		const enterCallbackSpy = cy.spy();
		const leaveCallbackSpy = cy.spy();
		const enterBackCallbackSpy = cy.spy();
		const leaveBackCallbackSpy = cy.spy();

		cy.window().then(win => {
			const IT = (win as CustomWindow).__test__;
			const itInstance = new IT({
				defaults: {
					onEnter: enterCallbackSpy,
					onLeave: leaveCallbackSpy,
					onEnterBack: enterBackCallbackSpy,
					onLeaveBack: leaveBackCallbackSpy
				},
				rootEnter: '250px'
			}).add('#trigger');

			cy.wait(30).then(() => {
				expect(enterCallbackSpy.calledOnce).to.be.true;
				expect(leaveCallbackSpy.called).to.be.false;
				expect(enterBackCallbackSpy.called).to.be.false;
				expect(leaveBackCallbackSpy.called).to.be.false;
			});
		});
	});

	it('First observer callback invoke after init, With Intersection, root boundaries are inside the trigger boundaries, should trigger default enter event', () => {
		const enterCallbackSpy = cy.spy();
		const leaveCallbackSpy = cy.spy();
		const enterBackCallbackSpy = cy.spy();
		const leaveBackCallbackSpy = cy.spy();

		cy.window().then(win => {
			const IT = (win as CustomWindow).__test__;
			const itInstance = new IT({
				defaults: {
					onEnter: enterCallbackSpy,
					onLeave: leaveCallbackSpy,
					onEnterBack: enterBackCallbackSpy,
					onLeaveBack: leaveBackCallbackSpy
				},
				rootEnter: '350px',
				rootLeave: '150px'
			}).add('#trigger');

			cy.wait(30).then(() => {
				expect(enterCallbackSpy.calledOnce).to.be.true;
				expect(leaveCallbackSpy.called).to.be.false;
				expect(enterBackCallbackSpy.called).to.be.false;
				expect(leaveBackCallbackSpy.called).to.be.false;
			});
		});
	});

	it('First observer callback invoke after init, With Intersection, trigger boundaries are inside the root boundaries, should trigger default enter event', () => {
		const enterCallbackSpy = cy.spy();
		const leaveCallbackSpy = cy.spy();
		const enterBackCallbackSpy = cy.spy();
		const leaveBackCallbackSpy = cy.spy();

		cy.window().then(win => {
			const IT = (win as CustomWindow).__test__;
			const itInstance = new IT({
				defaults: {
					onEnter: enterCallbackSpy,
					onLeave: leaveCallbackSpy,
					onEnterBack: enterBackCallbackSpy,
					onLeaveBack: leaveBackCallbackSpy
				}
			}).add('#trigger');

			cy.wait(30).then(() => {
				expect(enterCallbackSpy.calledOnce).to.be.true;
				expect(leaveCallbackSpy.called).to.be.false;
				expect(enterBackCallbackSpy.called).to.be.false;
				expect(leaveBackCallbackSpy.called).to.be.false;
			});
		});
	});

	it('First observer callback invoke after init, no intersection, trigger left the root, should trigger enter event then leave event', () => {
		const enterCallbackSpy = cy.spy();
		const leaveCallbackSpy = cy.spy();
		const enterBackCallbackSpy = cy.spy();
		const leaveBackCallbackSpy = cy.spy();

		cy.window().then(win => {
			const IT = (win as CustomWindow).__test__;
			const itInstance = new IT({
				defaults: {
					leave: '10%',
					onEnter: enterCallbackSpy,
					onLeave: leaveCallbackSpy,
					onEnterBack: enterBackCallbackSpy,
					onLeaveBack: leaveBackCallbackSpy
				},
				rootLeave: '95%'
			}).add('#trigger');

			cy.wait(30).then(() => {
				expect(enterCallbackSpy.calledOnce).to.be.true;
				expect(leaveCallbackSpy.calledAfter(enterCallbackSpy)).to.be.true;
				expect(enterBackCallbackSpy.called).to.be.false;
				expect(leaveBackCallbackSpy.called).to.be.false;
			});
		});
	});
});
