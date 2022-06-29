// import { guideDefaultParams } from './constants';
// import { boundsMinusScrollbar, getParents, is, mergeOptions } from './helpers';

class Animation {
  constructor(params = {}) {
    this.params = params;
    return this;
  }

  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }

  refresh = () => {
    this.removeGuides();
    this.createGuides();
  };
  kill = () => {
    this._it = null;
    this._utils = null;
  };
}

export { Animation as default };
