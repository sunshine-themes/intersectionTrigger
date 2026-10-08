import '../../scss/core.scss';
import { animate } from 'animejs';
import IntersectionTrigger from '../../../../../src/core/core';

declare global {
	interface Window {
		//@ts-ignore
		__test__?: typeof IntersectionTrigger;
		//@ts-ignore
		__animate__?: typeof animate;
	}
}

window.__test__ = IntersectionTrigger;
window.__animate__ = animate;
