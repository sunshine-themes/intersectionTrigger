import type IntersectionTrigger from '../../../src/core/core';
import Guides from '../../../src/plugins/guides/guides';

type CustomWindow = Cypress.AUTWindow & { __test__: typeof IntersectionTrigger };

const fn = () => {};

describe('Core Tests', () => {
	let IT: typeof IntersectionTrigger;

	beforeEach(done => {
		cy.visit('/core.html');
		cy.window().then(win => {
			IT = (win as CustomWindow).__test__;
			done();
		});
	});

	it('should register Guides plugin', () => {
		IT.registerPlugins([Guides]);

		expect(IT.getRegisteredPlugins()).to.have.lengthOf(1);
		expect(IT.getRegisteredPlugins()[0]).to.equal(Guides);
	});

	it('should instantiate IntersectionTrigger with all default options', () => {
		const itInstance = new IT();
		expect(itInstance).to.be.instanceOf(IT);
		expect(IT.getInstances()[0]).to.equal(itInstance);
		expect(IT.getInstanceById(itInstance.id)).to.equal(itInstance);
	});

	it('should add IntersectionTrigger instances to "instances" variable', () => {
		const firstItInstance = new IT();
		const secondItInstance = new IT();
		const thirdItInstance = new IT();

		expect(IT.getInstances()).to.have.lengthOf(3);
		expect(IT.getInstances()[1]).to.equal(secondItInstance);
		expect(IT.getInstanceById(thirdItInstance.id)).to.equal(thirdItInstance);
	});

	it('should kill a IntersectionTrigger instance', () => {
		const itInstance = new IT().add('#target');
		const secondItInstance = new IT().add('#child');

		itInstance.kill();

		expect(itInstance.killed).to.be.true;
		expect(itInstance.triggers).to.be.empty;
		expect(secondItInstance.killed).to.be.undefined;
		expect(secondItInstance.triggers).to.have.lengthOf(1);

		expect(IT.getInstances()).to.have.lengthOf(1);
		expect(IT.getInstanceById(secondItInstance.id)).to.equal(secondItInstance);
	});

	it('should kill all IntersectionTrigger instances', () => {
		const itInstance = new IT().add('#target');
		const secondItInstance = new IT().add('#child');

		IT.kill();

		expect(itInstance.killed).to.be.true;
		expect(itInstance.triggers).to.be.empty;
		expect(secondItInstance.killed).to.be.true;
		expect(secondItInstance.triggers).to.be.empty;

		expect(IT.getInstances()).to.be.empty;
	});

	it('should add a trigger', () => {
		const itInstance = new IT();
		itInstance.add('#target');

		cy.get('#target').then($trigger => {
			expect(itInstance.triggers[0]).to.equal($trigger[0]);
			expect(itInstance._triggersData.has($trigger[0])).to.be.true;
		});
	});
	it('should remove a trigger', () => {
		const itInstance = new IT();

		itInstance.add('#target').add('#child');
		cy.get('#child')
			.as('trigger')
			.then($trigger => {
				expect(itInstance.triggers[1]).to.equal($trigger[0]);

				itInstance.remove('#target');
				expect(itInstance.triggers[0]).to.equal($trigger[0]);

				itInstance.remove('#child');
				expect(itInstance.triggers).to.be.empty;

				expect(itInstance._triggersData.has($trigger[0])).to.be.false;
			});
	});

	it('should trigger a default event with two arguments ( trigger , intersectionTrigger )', done => {
		const enterCallbackSpy = cy.spy(() => {
			cy.get('#target').then($trigger => {
				expect(enterCallbackSpy.calledOnceWithExactly($trigger[0], itInstance)).to.be.true;
				done();
			});
		});

		const itInstance = new IT({
			defaults: {
				onEnter: enterCallbackSpy
			}
		}).add('#target');
	});

	it('should trigger enter event then leave event, and then the trigger should be removed', () => {
		const callbacks = {
			enterCallback: fn,
			leaveCallback: fn,
			enterBackCallback: fn,
			leaveBackCallback: fn
		};

		cy.spy(callbacks, 'enterCallback').as('Enter');
		cy.spy(callbacks, 'leaveCallback').as('Leave');
		cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
		cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

		cy.get('#target').then($trigger => {
			$trigger.addClass('mt-700');

			const itInstance = new IT().add('#target', {
				once: true,
				onEnter: callbacks.enterCallback,
				onLeave: callbacks.leaveCallback,
				onEnterBack: callbacks.enterBackCallback,
				onLeaveBack: callbacks.leaveBackCallback
			});

			cy.scrollTo(0, 41, { duration: 10, easing: 'linear' }); //enter

			cy.get('@Enter').should('have.been.calledOnce');
			cy.get('@Leave').should('not.have.been.called');
			cy.get('@EnterBack').should('not.have.been.called');
			cy.get('@LeaveBack').should('not.have.been.called');

			cy.scrollTo(0, 1110, { duration: 10, easing: 'linear' }); //leave

			cy.get('@Leave')
				.should('have.been.calledAfter', callbacks.enterCallback)
				.then(() => {
					expect(itInstance.triggers).to.be.empty;
				});
			cy.get('@Enter').should('have.been.calledOnce');
			cy.get('@EnterBack').should('not.have.been.called');
			cy.get('@LeaveBack').should('not.have.been.called');

			cy.scrollTo(0, 20, { duration: 10, easing: 'linear' });

			cy.get('@Enter').should('have.been.calledOnce');
			cy.get('@Leave').should('have.been.calledOnce');
			cy.get('@EnterBack').should('not.have.been.called');
			cy.get('@LeaveBack').should('not.have.been.called');
		});
	});

	describe("root is document's viewport", () => {
		describe('First observer callback invoke after init', () => {
			describe('With No Intersection', () => {
				it('should NOT trigger any event', () => {
					cy.get('#target').then($trigger => {
						$trigger.addClass('mt-300');

						const callbacks = {
							enterCallback: fn,
							leaveCallback: fn,
							enterBackCallback: fn,
							leaveBackCallback: fn
						};

						cy.spy(callbacks, 'enterCallback').as('Enter');
						cy.spy(callbacks, 'leaveCallback').as('Leave');
						cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
						cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

						new IT({
							defaults: {
								onEnter: callbacks.enterCallback,
								onLeave: callbacks.leaveCallback,
								onEnterBack: callbacks.enterBackCallback,
								onLeaveBack: callbacks.leaveBackCallback
							},
							rootEnter: '250px'
						}).add('#target');

						cy.get('@Enter').should('not.have.been.called');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');
					});
				});

				it('should trigger enter event then leave event, trigger outside the root passing the leave position ', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					new IT({
						defaults: {
							leave: '10%',
							onEnter: callbacks.enterCallback,
							onLeave: callbacks.leaveCallback,
							onEnterBack: callbacks.enterBackCallback,
							onLeaveBack: callbacks.leaveBackCallback
						},
						rootLeave: '95%'
					}).add('#target');

					cy.get('@Enter').should('have.been.calledOnce');
					cy.get('@Leave').should('have.been.calledAfter', callbacks.enterCallback);
					cy.get('@EnterBack').should('not.have.been.called');
					cy.get('@LeaveBack').should('not.have.been.called');
				});
			});
			describe('With Intersection', () => {
				it('should trigger default enter event', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					new IT({
						defaults: {
							onEnter: callbacks.enterCallback,
							onLeave: callbacks.leaveCallback,
							onEnterBack: callbacks.enterBackCallback,
							onLeaveBack: callbacks.leaveBackCallback
						},
						rootEnter: '250px'
					}).add('#target');

					cy.get('@Enter').should('have.been.calledOnce');
					cy.get('@Leave').should('not.have.been.called');
					cy.get('@EnterBack').should('not.have.been.called');
					cy.get('@LeaveBack').should('not.have.been.called');
				});

				it('root boundaries are inside the trigger boundaries, should trigger default enter event', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					new IT({
						defaults: {
							onEnter: callbacks.enterCallback,
							onLeave: callbacks.leaveCallback,
							onEnterBack: callbacks.enterBackCallback,
							onLeaveBack: callbacks.leaveBackCallback
						},
						rootEnter: '350px',
						rootLeave: '150px'
					}).add('#target');

					cy.get('@Enter').should('have.been.calledOnce');
					cy.get('@Leave').should('not.have.been.called');
					cy.get('@EnterBack').should('not.have.been.called');
					cy.get('@LeaveBack').should('not.have.been.called');
				});

				it('trigger boundaries are inside the root boundaries, should trigger default enter event', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					new IT({
						defaults: {
							onEnter: callbacks.enterCallback,
							onLeave: callbacks.leaveCallback,
							onEnterBack: callbacks.enterBackCallback,
							onLeaveBack: callbacks.leaveBackCallback
						}
					}).add('#target');

					cy.get('@Enter').should('have.been.calledOnce');
					cy.get('@Leave').should('not.have.been.called');
					cy.get('@EnterBack').should('not.have.been.called');
					cy.get('@LeaveBack').should('not.have.been.called');
				});
			});
		});

		describe('While Scrolling, Events are invoking in right order', () => {
			describe('trigger is smaller than the root', () => {
				it('Should invoke enter, leaveBack then enter callbacks', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					cy.get('#target').then($trigger => {
						$trigger.addClass('mt-700');

						new IT({
							defaults: {
								onEnter: callbacks.enterCallback,
								onLeave: callbacks.leaveCallback,
								onEnterBack: callbacks.enterBackCallback,
								onLeaveBack: callbacks.leaveBackCallback
							}
						}).add('#target');

						cy.scrollTo(0, 41, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 39, { duration: 10, easing: 'linear' }); //leaveBack

						cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');

						cy.scrollTo(0, 41, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledTwice');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('have.been.calledOnce');
					});
				});
				it('Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					cy.get('#target').then($trigger => {
						$trigger.addClass('mt-700');

						new IT({
							defaults: {
								onEnter: callbacks.enterCallback,
								onLeave: callbacks.leaveCallback,
								onEnterBack: callbacks.enterBackCallback,
								onLeaveBack: callbacks.leaveBackCallback
							}
						}).add('#target');

						//Added duration to simulate a user scrolling for IntersectionObserver to work properly
						cy.scrollTo(0, 41, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 1101, { duration: 10, easing: 'linear' }); //leave

						cy.get('@Leave').should('have.been.calledAfter', callbacks.enterCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 1099, { duration: 10, easing: 'linear' }); //enterBack

						cy.get('@EnterBack').should('have.been.calledAfter', callbacks.leaveCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 39, { duration: 10, easing: 'linear' }); //leaveBack

						cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterBackCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');
						cy.get('@EnterBack').should('have.been.calledOnce');
					});
				});

				it('when root enter position is above leave position with default trigger positions, Should invoke (enter - leave) callbacks instantly upon entering, then (enterBack - leaveBack) instantly upon entering back', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					cy.get('#target').then($trigger => {
						$trigger.addClass('mt-700');

						new IT({
							defaults: {
								onEnter: callbacks.enterCallback,
								onLeave: callbacks.leaveCallback,
								onEnterBack: callbacks.enterBackCallback,
								onLeaveBack: callbacks.leaveBackCallback
							},
							rootEnter: () => '0%',
							rootLeave: () => '100%'
						}).add('#target');

						cy.scrollTo(0, 701, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledAfter', callbacks.enterCallback);
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 439, { duration: 10, easing: 'linear' }); //enterBack

						cy.get('@EnterBack').should('have.been.calledOnce');
						cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterBackCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');
					});
				});
			});

			describe('trigger is bigger than the root', () => {
				it('Should invoke enter, leaveBack then enter callbacks', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					cy.get('#target').then($trigger => {
						$trigger.addClass('mt-400');

						new IT({
							defaults: {
								onEnter: callbacks.enterCallback,
								onLeave: callbacks.leaveCallback,
								onEnterBack: callbacks.enterBackCallback,
								onLeaveBack: callbacks.leaveBackCallback
							},
							rootEnter: '300px'
						}).add('#target');

						cy.scrollTo(0, 200, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 99, { duration: 10, easing: 'linear' }); //leaveBack

						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterCallback);
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');

						cy.scrollTo(0, 200, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledTwice');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('have.been.calledOnce');
					});
				});
				it('Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					cy.get('#target').then($trigger => {
						$trigger.addClass('mt-400');

						new IT({
							defaults: {
								onEnter: callbacks.enterCallback,
								onLeave: callbacks.leaveCallback,
								onEnterBack: callbacks.enterBackCallback,
								onLeaveBack: callbacks.leaveBackCallback
							},
							rootEnter: '300px'
						}).add('#target');

						cy.scrollTo(0, 101, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 801, { duration: 10, easing: 'linear' }); //leave

						cy.get('@Leave').should('have.been.calledAfter', callbacks.enterCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 799, { duration: 10, easing: 'linear' }); //enterBack

						cy.get('@EnterBack').should('have.been.calledAfter', callbacks.leaveCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 99, { duration: 10, easing: 'linear' }); //leaveBack

						cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterBackCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');
						cy.get('@EnterBack').should('have.been.calledOnce');
					});
				});
				it('when root enter position is above leave position with default trigger positions, Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					cy.get('#target').then($trigger => {
						$trigger.addClass('mt-300');

						new IT({
							defaults: {
								onEnter: callbacks.enterCallback,
								onLeave: callbacks.leaveCallback,
								onEnterBack: callbacks.enterBackCallback,
								onLeaveBack: callbacks.leaveBackCallback
							},
							rootEnter: () => '0%',
							rootLeave: () => '200px'
						}).add('#target');

						cy.scrollTo(0, 301, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 501, { duration: 10, easing: 'linear' }); //leave

						cy.get('@Leave').should('have.been.calledAfter', callbacks.enterCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.scrollTo(0, 499, { duration: 10, easing: 'linear' }); //enterBack

						cy.get('@EnterBack').should('have.been.calledOnce');
						cy.get('@LeaveBack').should('not.have.been.called');
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');

						cy.scrollTo(0, 299, { duration: 10, easing: 'linear' }); //leaveBack

						cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterBackCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');
						cy.get('@EnterBack').should('have.been.calledOnce');
					});
				});
			});
		});
	});
	describe('root is an element', () => {
		describe('While Scrolling, Events are invoking in right order', () => {
			describe('trigger is smaller than the root', () => {
				it('Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					cy.get('#child')
						.as('child')
						.then($trigger => {
							$trigger.addClass('mt-500 mb-1000 mr-100 ml-100');

							new IT({
								defaults: {
									onEnter: callbacks.enterCallback,
									onLeave: callbacks.leaveCallback,
									onEnterBack: callbacks.enterBackCallback,
									onLeaveBack: callbacks.leaveBackCallback
								},
								root: '#target'
							}).add('#child');

							cy.get('#target').as('root').scrollTo(0, 120, { duration: 10, easing: 'linear' }); //enter

							cy.get('@Enter').should('have.been.calledOnce');
							cy.get('@Leave').should('not.have.been.called');
							cy.get('@EnterBack').should('not.have.been.called');
							cy.get('@LeaveBack').should('not.have.been.called');

							cy.get('@root').scrollTo(0, 560, { duration: 10, easing: 'linear' }); //leave

							cy.get('@Leave').should('have.been.calledAfter', callbacks.enterCallback);
							cy.get('@Enter').should('have.been.calledOnce');
							cy.get('@EnterBack').should('not.have.been.called');
							cy.get('@LeaveBack').should('not.have.been.called');

							cy.get('@root').scrollTo(0, 540, { duration: 10, easing: 'linear' }); //enterBack

							cy.get('@EnterBack').should('have.been.calledAfter', callbacks.leaveCallback);
							cy.get('@Enter').should('have.been.calledOnce');
							cy.get('@Leave').should('have.been.calledOnce');
							cy.get('@LeaveBack').should('not.have.been.called');

							cy.get('@root').scrollTo(0, 10, { duration: 10, easing: 'linear' }); //leaveBack

							cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterBackCallback);
							cy.get('@Enter').should('have.been.calledOnce');
							cy.get('@Leave').should('have.been.calledOnce');
							cy.get('@EnterBack').should('have.been.calledOnce');
						});
				});
			});

			describe('trigger is bigger than the root', () => {
				it('Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
					const callbacks = {
						enterCallback: fn,
						leaveCallback: fn,
						enterBackCallback: fn,
						leaveBackCallback: fn
					};

					cy.spy(callbacks, 'enterCallback').as('Enter');
					cy.spy(callbacks, 'leaveCallback').as('Leave');
					cy.spy(callbacks, 'enterBackCallback').as('EnterBack');
					cy.spy(callbacks, 'leaveBackCallback').as('LeaveBack');

					cy.get('#child').then($trigger => {
						$trigger.addClass('h-400 w-50 mt-400 mb-1000 mr-100 ml-100');

						new IT({
							defaults: {
								onEnter: callbacks.enterCallback,
								onLeave: callbacks.leaveCallback,
								onEnterBack: callbacks.enterBackCallback,
								onLeaveBack: callbacks.leaveBackCallback
							},
							root: '#target',
							rootEnter: '300px'
						}).add('#child');

						cy.get('#target').as('root').scrollTo(0, 120, { duration: 10, easing: 'linear' }); //enter

						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('not.have.been.called');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.get('@root').scrollTo(0, 810, { duration: 10, easing: 'linear' }); //leave

						cy.get('@Leave').should('have.been.calledAfter', callbacks.enterCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@EnterBack').should('not.have.been.called');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.get('@root').scrollTo(0, 790, { duration: 50, easing: 'linear' }); //enterBack

						cy.get('@EnterBack').should('have.been.calledAfter', callbacks.leaveCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');
						cy.get('@LeaveBack').should('not.have.been.called');

						cy.get('@root').scrollTo(0, 10, { duration: 10, easing: 'linear' }); //leaveBack

						cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterBackCallback);
						cy.get('@Enter').should('have.been.calledOnce');
						cy.get('@Leave').should('have.been.calledOnce');
						cy.get('@EnterBack').should('have.been.calledOnce');
					});
				});
			});
		});
	});
});
