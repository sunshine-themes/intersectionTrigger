import { defaultToggleClassParams } from '../constants';
import { is, mergeOptions, splitStr } from '../helpers';

class ToggleClass {
	constructor(it) {
		this._registerIntersectionTrigger(it);
		return this;
	}

	_registerIntersectionTrigger(intersectionTrigger) {
		this._it = intersectionTrigger;
		this._utils = this._it._utils;
	}

	toggle(trigger, toggleClass, eventIndex) {
		for (const { targets, toggleActions, classNames } of toggleClass) {
			if ('none' === toggleActions[eventIndex]) continue;
			classNames.forEach((className) => {
				if (targets) {
					targets.forEach((target) => target.classList[toggleActions[eventIndex]](className));
					return;
				}
				trigger.classList[toggleActions[eventIndex]](className);
			});
		}
	}

	parse(params) {
		let toggleClass = [];

		if (is.string(params)) {
			const mergedParams = mergeOptions(defaultToggleClassParams, {
				classNames: splitStr(params),
			});
			toggleClass.push(mergedParams);
			return toggleClass;
		}

		if (is.array(params)) {
			toggleClass = params.map((obj) => {
				const mergedParams = mergeOptions(defaultToggleClassParams, obj);
				const { targets, classNames, toggleActions } = mergedParams;

				targets && (mergedParams.targets = this._utils.parseQuery(targets, 'targets'));
				classNames && (mergedParams.classNames = splitStr(classNames));
				is.string(toggleActions) && (mergedParams.toggleActions = splitStr(toggleActions));
				return mergedParams;
			});
		}

		return toggleClass;
	}

	kill = () => {
		this._it = null;
		this._utils = null;
	};
}
ToggleClass.pluginName = 'toggleClass';

export default ToggleClass;
