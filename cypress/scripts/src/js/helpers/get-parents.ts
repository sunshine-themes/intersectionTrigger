import { getParents } from '../../../../../instrumented/helpers';
import '../../scss/get-parents.scss';

// Declare the `__test__` property on the Window interface
declare global {
	interface Window {
		__test__?(element: HTMLElement): HTMLElement[];
	}
}

window.__test__ = getParents;
