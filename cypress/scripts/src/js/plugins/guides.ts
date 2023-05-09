import '../../scss/guides.scss';
import IntersectionTrigger from '../../../../../src/core/core';
import Guides from '../../../../../src/plugins/guides/guides';

IntersectionTrigger.registerPlugins([Guides]);

declare global {
	interface Window {
		//@ts-ignore
		__test__?: typeof IntersectionTrigger;
	}
}

window.__test__ = IntersectionTrigger;
