import type IntersectionTrigger from '../../core/core';
import type { PluginName } from '../../core/types';
import type { DeepRequired } from '../../utils/types';
import type { ToggleClassParams, ToggleClassOptions } from './types';
import type Utils from '../../utils/utils';

import { defaultToggleClassConfig } from '../../constants';
import { is, mergeOptions, splitStr } from '../../helpers';

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
			const action = toggleActions[eventIndex];
			if ('none' === action) continue;
			classNames!.forEach(className => {
				if (!targets.length) return trigger.classList[action](className);
				targets.forEach(target => target.classList[action](className));
			});
		}
	}

	parse(params: ToggleClassOptions[] | string): ToggleClassParams[] {
		let mergedParams: DeepRequired<ToggleClassOptions>[] = [];

		if (is.string(params))
			mergedParams = [
				mergeOptions(defaultToggleClassConfig, {
					classNames: params
				})
			];

		if (is.array(params)) mergedParams = params.map((obj: ToggleClassOptions) => mergeOptions(defaultToggleClassConfig, obj));

		return mergedParams.map(obj => ({
			targets: this._utils!.parseQuery(obj.targets, 'targets'),
			toggleActions: splitStr(obj.toggleActions),
			classNames: splitStr(obj.classNames)
		}));
	}

	kill = () => {
		this._it = undefined;
		this._utils = undefined;
	};
}
ToggleClass.pluginName = 'toggleClass';

export default ToggleClass;
