import '../../scss/core.scss';
import IntersectionTrigger from '../../../../../src/core/core';

declare global {
	interface Window {
		//@ts-ignore
		__test__?: typeof IntersectionTrigger;
	}
}

window.__test__ = IntersectionTrigger;
