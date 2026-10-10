import type { animate } from 'animejs';
import Animation from '../../../src/plugins/animation/animation';

const fn = () => {};
type Animate = typeof animate;
const getAnimate = (win: Cypress.AUTWindow) => (win as unknown as { __animate__?: Animate }).__animate__ as Animate;

describe('Animation plugin', () => {
	describe('Linked animations', () => {
		it('should map the scroll position to the animation progress', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				cy.get('#target').then($trigger => {
					$trigger.addClass('mt-700');

					//at scroll 380: diff = 340px of 1060px total -> seekTo = 1000 * 340 / 1060 = ~321ms
					const instance = animate('#target', { opacity: 0, autoplay: false, duration: 1000 });

					new IT({ defaults: { animation: { instance, link: true } } }).add('#target');

					cy.scrollTo(0, 380, { duration: 10, easing: 'linear' });

					cy.wrap(null).should(() => {
						expect(instance.currentTime, 'linked progress matches scroll').to.be.greaterThan(250);
						expect(instance.currentTime, 'linked progress stays within the mapped band').to.be.lessThan(400);
					});
				});
			});
		});

		it('should follow the scroll exponentially when smooth is set', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				cy.get('#target').then($trigger => {
					$trigger.addClass('mt-700');

					const instance = animate('#target', { opacity: 0, autoplay: false, duration: 1000 });

					//tau = 300ms so the approach is slow enough to sample mid-flight
					new IT({ defaults: { animation: { instance, link: true, smooth: 300 } } }).add('#target');

					//instant jump -> the target becomes ~321ms of the animation
					cy.scrollTo(0, 380);

					cy.wait(120).then(() => {
						//a direct seek would already sit at ~321; the exponential follow must still be mid-flight
						expect(instance.currentTime, 'smoothing keeps the animation mid-flight').to.be.greaterThan(20);
						expect(instance.currentTime, 'smoothing lags behind the target').to.be.lessThan(280);
					});

					cy.wrap(null).should(() => {
						expect(instance.currentTime, 'smoothing settles at the target').to.be.greaterThan(300);
					});
				});
			});
		});
	});

	describe('Regression fixes', () => {
		it('should not reset the anime instance when the instance updates', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				const instance = animate('#target', { opacity: 0, autoplay: false, duration: 1000 });
				const itInstance = new IT().add('#target', { animation: { instance, link: true } });

				cy.spy(instance, 'reset').as('resetSpy');

				itInstance.update();

				cy.get('@resetSpy').should('not.have.been.called');
			});
		});

		it('should not start snapping after the instance is killed', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				const callbacks = { enterCallback: fn, snapStart: fn };
				cy.spy(callbacks, 'enterCallback').as('Enter');
				cy.spy(callbacks, 'snapStart').as('snapStart');

				cy.get('#target').then($trigger => {
					$trigger.addClass('mt-700');

					const instance = animate('#target', { opacity: 0, autoplay: false, duration: 1000 });

					const itInstance = new IT({
						defaults: {
							onEnter: callbacks.enterCallback,
							animation: {
								instance,
								link: true,
								snap: { to: 0, after: 0.1, speed: 1000, maxDistance: 1000, onStart: callbacks.snapStart }
							}
						}
					}).add('#target');

					cy.scrollTo(0, 300, { duration: 10, easing: 'linear' }); //enter, snap timeout armed

					cy.get('@Enter').should('have.been.calledOnce');

					cy.get('body').then(() => itInstance.kill()); //kill before the snap timeout fires

					cy.wait(500);

					cy.get('@snapStart').should('not.have.been.called');
				});
			});
		});

		it('should stop snapping when the user scrolls', () => {
			cy.withIT('/core.html', (IT, win) => {
				const animate = getAnimate(win);

				IT.registerPlugins([Animation]);

				const callbacks = { enterCallback: fn, snapComplete: fn };
				cy.spy(callbacks, 'enterCallback').as('Enter');
				cy.spy(callbacks, 'snapComplete').as('snapComplete');

				cy.get('#target').then($trigger => {
					$trigger.addClass('mt-700');

					//low speed -> the snap takes ~2s (2px steps over ~260px), so the wheel lands mid-snap
					const instance = animate('#target', { opacity: 0, autoplay: false, duration: 1000 });

					new IT({
						defaults: {
							onEnter: callbacks.enterCallback,
							animation: {
								instance,
								link: true,
								snap: { to: 0, after: 0.05, speed: 100, maxDistance: 1000, onComplete: callbacks.snapComplete }
							}
						}
					}).add('#target');

					cy.scrollTo(0, 300, { duration: 10, easing: 'linear' }); //enter, snapping starts

					cy.get('@Enter').should('have.been.calledOnce');

					cy.wait(300); //snapping is underway

					//user input — must bubble to the root element (documentElement) where the cancel listeners live
					cy.document().then(doc => doc.body.dispatchEvent(new WheelEvent('wheel', { bubbles: true })));

					cy.wait(3000); //the snap would have completed (~2.2s) without the interruption

					cy.get('@snapComplete').should('not.have.been.called');
				});
			});
		});
	});
});
