import type IntersectionTrigger from '../core/core';
import type { PluginName } from '../core/core';
import type { DefaultToggleClassConfiguration, ToggleClassParams } from '../constants';
import type { DeepRequired } from '../utils/types';
import type Utils from '../core/utils';

import { defaultToggleClassConfig } from '../constants';
import { is, mergeOptions, splitStr } from '../helpers';

class ToggleClass {
	_it: IntersectionTrigger | undefined;
	_utils: Utils | undefined;
	static pluginName: PluginName;

	constructor(it: IntersectionTrigger) {
		this._registerIntersectionTrigger(it);
		return this;
	}

	_registerIntersectionTrigger(intersectionTrigger: IntersectionTrigger) {
		this._it = intersectionTrigger;
		this._utils = this._it._utils;
	}

	toggle(trigger: HTMLElement, toggleClass: ToggleClassParams[], eventIndex: number) {
		for (const { targets, toggleActions, classNames } of toggleClass) {
			if ('none' === toggleActions[eventIndex]) continue;
			classNames!.forEach((className) => {
				if (!targets.length) return trigger.classList[toggleActions[eventIndex]](className);

				targets.forEach((target) => target.classList[toggleActions[eventIndex]](className));
			});
		}
	}

	parse(params: DefaultToggleClassConfiguration[] | string): ToggleClassParams[] {
		let mergedParams: DeepRequired<DefaultToggleClassConfiguration>[] = [];

		if (is.string(params))
			mergedParams = [
				mergeOptions(defaultToggleClassConfig, {
					classNames: params,
				}),
			];

		if (is.array(params)) mergedParams = params.map((obj: DefaultToggleClassConfiguration) => mergeOptions(defaultToggleClassConfig, obj));

		return mergedParams.map((obj) => ({
			targets: this._utils!.parseQuery(obj.targets, 'targets'),
			toggleActions: splitStr(obj.toggleActions),
			classNames: splitStr(obj.classNames),
		}));
	}

	kill = () => {
		this._it = undefined;
		this._utils = undefined;
	};
}
ToggleClass.pluginName = 'toggleClass';

export default ToggleClass;
