import '../../scss/core.scss';
import IntersectionTrigger from '../../../../../instrumented/core/core';

declare global {
	interface Window {
		//@ts-ignore
		__test__?: typeof IntersectionTrigger;
	}
}

window.__test__ = IntersectionTrigger;
