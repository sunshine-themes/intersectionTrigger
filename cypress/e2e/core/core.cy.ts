import type { animate } from 'animejs';
import type IntersectionTrigger from '../../../src/core/core';
import Animation from '../../../src/plugins/animation/animation';
import Guides from '../../../src/plugins/guides/guides';

const fn = () => {};
type Animate = typeof animate;
const getAnimate = (win: Cypress.AUTWindow) => (win as unknown as { __animate__?: Animate }).__animate__ as Animate;

describe('Core Tests', () => {
	it('should register Guides plugin', () => {
		cy.withIT('/core.html', IT => {
			IT.registerPlugins([Guides]);

			expect(IT.getRegisteredPlugins()).to.have.lengthOf(1);
			expect(IT.getRegisteredPlugins()[0]).to.equal(Guides);
		});
	});

	it('should instantiate IntersectionTrigger with all default options', () => {
		cy.withIT('/core.html', IT => {
			const itInstance = new IT();
			expect(itInstance).to.be.instanceOf(IT);
			expect(IT.getInstances()[0]).to.equal(itInstance);
			expect(IT.getInstanceById(itInstance.id)).to.equal(itInstance);
		});
	});

	it('should add IntersectionTrigger instances to "instances" variable', () => {
		cy.withIT('/core.html', IT => {
			const firstItInstance = new IT();
			const secondItInstance = new IT();
			const thirdItInstance = new IT();

			expect(IT.getInstances()).to.have.lengthOf(3);
			expect(IT.getInstances()[1]).to.equal(secondItInstance);
			expect(IT.getInstanceById(thirdItInstance.id)).to.equal(thirdItInstance);
		});
	});

	it('should kill a IntersectionTrigger instance', () => {
		cy.withIT('/core.html', IT => {
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
	});

	it('should kill all IntersectionTrigger instances', () => {
		cy.withIT('/core.html', IT => {
			const itInstance = new IT().add('#target');
			const secondItInstance = new IT().add('#child');

			IT.kill();

			expect(itInstance.killed).to.be.true;
			expect(itInstance.triggers).to.be.empty;
			expect(secondItInstance.killed).to.be.true;
			expect(secondItInstance.triggers).to.be.empty;

			expect(IT.getInstances()).to.be.empty;
		});
	});

	it('should add a trigger', () => {
		cy.withIT('/core.html', IT => {
			const itInstance = new IT();
			itInstance.add('#target');

			cy.get('#target').then($trigger => {
				expect(itInstance.triggers[0]).to.equal($trigger[0]);
				expect(itInstance._triggersData.has($trigger[0])).to.be.true;
			});
		});
	});
	it('should remove a trigger', () => {
		cy.withIT('/core.html', IT => {
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
	});

	it('should trigger a default event with two arguments ( trigger , intersectionTrigger )', () => {
		cy.withIT('/core.html', IT => {
			const callbacks = { enter: fn };
			const enterSpy = cy.spy(callbacks, 'enter').as('Enter');

			const itInstance = new IT({
				defaults: {
					onEnter: callbacks.enter
				}
			}).add('#target');

			cy.get('@Enter').should('have.been.calledOnce');

			cy.get('#target').then($trigger => {
				expect(enterSpy.calledOnceWithExactly($trigger[0], itInstance)).to.be.true;
			});
		});
	});

	it('should trigger enter event then leave event, and then the trigger should be removed', () => {
		cy.withIT('/core.html', IT => {
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
	});

	describe("root is document's viewport", () => {
		describe('First observer callback invoke after init', () => {
			describe('With No Intersection', () => {
				it('should NOT trigger any event', () => {
					cy.withIT('/core.html', IT => {
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
				});

				it('should trigger enter event then leave event, trigger outside the root passing the leave position ', () => {
					cy.withIT('/core.html', IT => {
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
			});
			describe('With Intersection', () => {
				it('should trigger default enter event', () => {
					cy.withIT('/core.html', IT => {
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
				});

				it('root boundaries are inside the trigger boundaries, should trigger default enter event', () => {
					cy.withIT('/core.html', IT => {
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
				});

				it('trigger boundaries are inside the root boundaries, should trigger default enter event', () => {
					cy.withIT('/core.html', IT => {
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
		});

		describe('While Scrolling, Events are invoking in right order', () => {
			describe('trigger is smaller than the root', () => {
				it('Should invoke enter, leaveBack then enter callbacks', () => {
					cy.withIT('/core.html', IT => {
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
				});
				it('Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
					cy.withIT('/core.html', IT => {
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
				});

				it('when root enter position is above leave position with default trigger positions, Should invoke (enter - leave) callbacks instantly upon entering, then (enterBack - leaveBack) instantly upon entering back', () => {
					cy.withIT('/core.html', IT => {
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

							cy.scrollTo(0, 710, { duration: 10, easing: 'linear' }); //enter

							cy.get('@Enter').should('have.been.calledOnce');
							cy.get('@Leave').should('have.been.calledAfter', callbacks.enterCallback);
							cy.get('@EnterBack').should('not.have.been.called');
							cy.get('@LeaveBack').should('not.have.been.called');

							// cy.scrollTo(0, 0, { duration: 10, easing: 'linear' }); //enterBack

							// cy.get('@EnterBack').should('have.been.calledOnce');
							// cy.get('@LeaveBack').should('have.been.calledAfter', callbacks.enterBackCallback);
							// cy.get('@Enter').should('have.been.calledOnce');
							// cy.get('@Leave').should('have.been.calledOnce');
						});
					});
				});
			});

			describe('trigger is bigger than the root', () => {
				it('Should invoke enter, leaveBack then enter callbacks', () => {
					cy.withIT('/core.html', IT => {
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
				});
				it('Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
					cy.withIT('/core.html', IT => {
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
				});
				it('when root enter position is above leave position with default trigger positions, Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
					cy.withIT('/core.html', IT => {
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
						cy.withIT('/core.html', IT => {
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
				});

				describe('trigger is bigger than the root', () => {
					it('Should invoke enter, leave, enterBack then leaveBack callbacks', () => {
						cy.withIT('/core.html', IT => {
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
	});

	describe('Regression fixes', () => {
		it('should accept a NodeList as triggers', () => {
			cy.withIT('/core.html', IT => {
				const itInstance = new IT();

				cy.document().then(doc => {
					const nodeList = doc.querySelectorAll('#target, #child');

					itInstance.add(nodeList);

					expect(itInstance.triggers).to.have.lengthOf(2);
				});
			});
		});

		it('should update the animation plugin data when the instance updates', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				const instance = animate('#target', { opacity: 0, autoplay: false, duration: 1000 });
				const itInstance = new IT().add('#target', { animation: { instance, link: true } });
				const animationPlugin = itInstance.animation as Animation;

				cy.spy(animationPlugin, 'update').as('animationUpdate');

				itInstance.update();

				cy.get('@animationUpdate').should('have.been.calledOnce');
			});
		});

		it('should release the scroll listener bookkeeping when a trigger with linked animation is removed', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				const callbacks = { enterCallback: fn };
				cy.spy(callbacks, 'enterCallback').as('Enter');

				const instance = animate('#target', { opacity: 0, autoplay: false, duration: 1000 });
				const itInstance = new IT({ defaults: { onEnter: callbacks.enterCallback } }).add('#target', {
					animation: { instance, link: true }
				});

				cy.get('@Enter').should('have.been.calledOnce');

				cy.get('#target').then(() => {
					expect(itInstance._states.runningScrollCbs, 'animate scroll state registered').to.equal(1);

					itInstance.remove('#target');

					expect(itInstance._states.runningScrollCbs, 'scroll bookkeeping released').to.equal(0);
				});
			});
		});

		it('should kill the instance from inside a callback without throwing', () => {
			cy.withIT('/core.html', IT => {
				cy.get('#target').then($trigger => {
					$trigger.addClass('mt-700');

					let itInstance: IntersectionTrigger;
					const onEnter = () => itInstance.kill();

					itInstance = new IT({ defaults: { onEnter } }).add('#target');

					cy.scrollTo(0, 41, { duration: 10, easing: 'linear' }); //enter -> kill

					cy.should(() => {
						expect(itInstance.killed, 'instance killed from callback').to.be.true;
						expect(IT.getInstances(), 'instance removed from registry').to.have.lengthOf(0);
					});

					cy.scrollTo(0, 400, { duration: 10, easing: 'linear' }); //must not throw
				});
			});
		});

		it('should snap to a "to: 0" target without throwing', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				const callbacks = { enterCallback: fn, snapStart: fn, snapComplete: fn };
				cy.spy(callbacks, 'enterCallback').as('Enter');
				cy.spy(callbacks, 'snapStart').as('snapStart');
				cy.spy(callbacks, 'snapComplete').as('snapComplete');

				cy.get('#target').then($trigger => {
					$trigger.addClass('mt-700');

					const instance = animate('#target', { opacity: 0, autoplay: false, duration: 1000 });

					new IT({
						defaults: {
							onEnter: callbacks.enterCallback,
							animation: {
								instance,
								link: true,
								snap: {
									to: 0,
									after: 0.05,
									speed: 1000,
									maxDistance: 1000,
									onStart: callbacks.snapStart,
									onComplete: callbacks.snapComplete
								}
							}
						}
					}).add('#target');

					cy.scrollTo(0, 300, { duration: 10, easing: 'linear' }); //enter

					cy.get('@Enter').should('have.been.calledOnce');

					cy.wait(2500);

					cy.get('@snapStart').should('have.been.calledOnce');
					cy.get('@snapComplete').should('have.been.calledOnce');
				});
			});
		});
	});

	describe('Performance behaviors', () => {
		it('should coalesce resize events into a single update', () => {
			cy.withIT('/core.html', IT => {
				const itInstance = new IT().add('#target');

				cy.spy(itInstance, 'update').as('updateSpy');

				cy.window().then(win => {
					for (let i = 0; i < 5; i++) win.dispatchEvent(new Event('resize'));
				});

				cy.get('@updateSpy').should('have.been.calledOnce');
			});
		});

		it('should update when a root element resizes without a window resize', () => {
			cy.withIT('/core.html', IT => {
				const itInstance = new IT({ root: '#target' }).add('#child');

				cy.spy(itInstance, 'update').as('updateSpy');

				//let the ResizeObserver deliver its initial observation before mutating
				cy.wait(100);

				cy.get('#target').then($el => {
					$el[0].style.height = '600px';
				});

				cy.get('@updateSpy').should('have.been.calledOnce');
			});
		});

		it('should drive linked animation from a nested scroller', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				const callbacks = { enterCallback: fn };
				cy.spy(callbacks, 'enterCallback').as('Enter');

				cy.get('#child').then($child => {
					$child.addClass('mb-1000'); //make #target scrollable

					//#child is inside the scrollable #target while the root is the viewport
					const instance = animate('#child', { opacity: 0, autoplay: false, duration: 1000 });

					new IT({
						defaults: { onEnter: callbacks.enterCallback, animation: { instance, link: true } }
					}).add('#child');

					cy.get('@Enter').should('have.been.calledOnce');

					cy.wrap(null).should(() => {
						expect(instance.currentTime, 'initial linked progress').to.be.greaterThan(700);
					});

					cy.get('#target').scrollTo(0, 80, { duration: 10 });

					//scrolling #target by 80px moves #child by seekTo ~= 1000 * 80 / 710 = ~113ms
					cy.wrap(null).should(() => {
						expect(instance.currentTime, 'progress follows the nested scroller').to.be.greaterThan(850);
					});
				});
			});
		});
	});
});
