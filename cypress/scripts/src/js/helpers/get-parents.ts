import { getParents } from '../../../../../src/helpers';
import '../../scss/get-parents.scss';

// Declare the `storedParents` property on the Window interface
declare global {
	interface Window {
		storedParents?: HTMLElement[];
	}
}

const target = document.querySelector<HTMLElement>('#target');

if (target) window.storedParents = getParents(target);
