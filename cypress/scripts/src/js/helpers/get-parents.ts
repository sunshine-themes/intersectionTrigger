import { getParents } from '../../../../../src/helpers';
import '../../scss/get-parents.scss';

// Declare the `__test__` property on the Window interface
declare global {
	interface Window {
		//@ts-ignore
		__test__?(element: HTMLElement): HTMLElement[];
	}
}

//@ts-ignore
window.__test__ = getParents;
