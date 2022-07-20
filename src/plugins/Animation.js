import { defaultAnimationParams, snapDefaultParams } from '../constants';
import { clamp, is, mergeOptions, splitStr, throwError } from '../helpers';

class Animation {
  constructor(it) {
    this._registerIntersectionTrigger(it);
    this.init();
    return this;
  }
  init() {
    this._snap = {};

    const { ref, refOpposite, length } = this._utils.dirProps();
    const isVir = this._utils.isVirtical();
    const root = this._utils.getRoot();

    this.seek = (ins, t, link) => {
      if (is.num(link)) {
        setTimeout(() => ins.seek(t), link * 1000);
        return;
      }
      ins.seek(t);
    };

    this.startSnaping = ({ snapDistance, currentDis, snap, step, toRef = false }) => {
      const direction = toRef ? -1 : 1;
      if (isVir) {
        root.scrollBy({
          top: step * direction,
          behavior: 'instant',
        });
      } else {
        root.scrollBy({
          left: step * direction,
          behavior: 'instant',
        });
      }
      currentDis += step;
      if (currentDis >= snapDistance) {
        currentDis = 0;
        snap.onComplete(this._it);
        return;
      }
      requestAnimationFrame(() => this.startSnaping({ snapDistance, currentDis, snap, step, toRef }));
    };

    this.animateHandler = (trigger, { enter, leave, tIL, instance, duration, snap, step, link }) => {
      const tB = trigger.getBoundingClientRect(); //trigger Bounds
      const ids = this._utils.getTriggerStates(trigger, 'ids');
      this._it.rootBounds = this._utils.getRootRect(this._it.observer.rootMargin);
      const rB = this._it.rootBounds; //root Bounds
      const scrollLength = tIL + (this._it._isREPGreater ? rB[length] : -rB[length]);
      let currentTime = 0;

      const [tEP, tLP, rEP, rLP] = this._utils.getPositions(tB, rB, { enter, leave, ref, refOpposite, length });
      const diff = rEP - tEP;

      if (diff > 0) {
        currentTime = (duration * diff) / scrollLength;
        this.seek(instance, currentTime, link);
      }

      //Snap
      if (snap) {
        let dis = 0;
        // Clear timeout
        clearTimeout(ids.snapTimeOutId);
        // Set a timeout to run after scrolling stops
        const snapTimeOutId = setTimeout(() => {
          const directionalDiff = snap.to.map((n) => currentTime - n),
            diff = directionalDiff.map((n) => Math.abs(n)),
            closest = Math.min(...diff),
            closestWithDirection = directionalDiff[diff.indexOf(closest)],
            snapDistance = (scrollLength * closest) / duration,
            snapData = { snapDistance, currentDis: dis, snap, step };

          if (snapDistance >= snap.maxDistance || snapDistance < step) return;

          snap.onStart(this._it);

          if (closestWithDirection < 0) {
            this.startSnaping(snapData);
            return;
          }

          this.startSnaping({ ...snapData, toRef: true });
        }, snap.after * 1000);

        //Update the id of Timeout
        this._utils.setTriggerStates(trigger, { ids: { ...ids, snapTimeOutId } });
      }
    };
  }

  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }

  animate(trigger, animation, eventIndex) {
    const { instance, toggleActions, link, snap } = animation;
    if (!instance) return;

    if (link) {
      const { animate } = this._utils.getTriggerStates(trigger, 'onScroll');
      const ids = this._utils.getTriggerStates(trigger, 'ids');
      const { enter, leave, minPosition, maxPosition } = this._utils.getTriggerData(trigger);
      const { length } = this._utils.dirProps();
      const tB = trigger.getBoundingClientRect(); //trigger Bounds
      const tIL = tB[length] - (minPosition * tB[length] + (1 - maxPosition) * tB[length]); //trigger Intersection length
      const duration = instance.duration;
      let step = 0;

      snap && (step = Math.round(Math.max((snap.speed * 17) / 1000, 1)));
      const animateData = { enter, leave, tIL, instance, duration, snap, link, step };

      switch (eventIndex) {
        case 0:
        case 2:
          this._it._states.oCbFirstInvoke && this.animateHandler(trigger, animateData); //to update the animation if the root intersects trigger at begining

          if (animate) break;
          this._utils.setTriggerScrollStates(trigger, 'animate', () => this.animateHandler(trigger, animateData));
          break;
        case 1:
        case 3:
          // Clear snaping
          clearTimeout(ids.snapTimeOutId);
          this._utils.setTriggerScrollStates(trigger, 'animate', null);

          //Reset the animation
          this.seek(instance, 1 === eventIndex ? duration : 0, link);
          break;
      }

      return;
    }

    const action = toggleActions[eventIndex];
    if ('none' === action) return;

    switch (action) {
      case 'play':
        instance.reversed && instance.reverse();
        1 > instance.progress && instance[action]();
        break;
      case 'restart':
      case 'reset':
        instance.reversed && instance.reverse();
        instance[action]();
        break;
      case 'pause':
        instance[action]();
        break;
      case 'complete':
        instance.pause();
        instance.seek(instance.reversed ? 0 : instance.duration);
        break;
      case 'reverse':
        if (instance.reversed) break;
        instance[action]();
        instance.paused && instance.play();
        break;
      case 'kill':
        is.inObject(instance, 'kill') && instance.kill();
        this._utils.setTriggerData(trigger, null, { animation: { ...defaultAnimationParams } });
        break;
    }
  }

  parse(params) {
    let animation = {};

    switch (true) {
      case is.animeInstance(params):
        animation = mergeOptions(defaultAnimationParams, {
          instance: params,
        });
        break;
      case is.object(params):
        {
          this._params = mergeOptions(defaultAnimationParams, params);
          if (!is.animeInstance(this._params.instance)) throwError('Invalid anime instance');

          const { toggleActions, snap } = this._params;
          snap && (this._params.snap = this.parseSnap());

          is.string(toggleActions) && (this._params.toggleActions = splitStr(toggleActions));

          animation = this._params;
        }
        break;
    }

    //Reset anime instance
    is.inObject(animation, 'instance') && animation.instance.reset();

    return animation;
  }

  parseSnap() {
    const { instance, snap } = this._params;

    const parseSnapNum = (n) => {
      const arr = [];
      let progress = n;
      while (progress < 1) {
        arr.push(clamp(progress, 0, 1));
        progress = progress + n;
      }
      return arr.map((v) => Math.round(v * instance.duration));
    };
    const parseSnapTo = (sn) => {
      if (is.num(sn)) return parseSnapNum(sn);
      if (is.string(sn)) return parseSnapMarks(sn);
      if (is.array(sn)) return sn;
    };
    const parseSnapMarks = () => {
      if (!is.inObject(instance, 'marks')) return;

      const marks = instance.marks;
      const snapTo = marks.map((mark) => mark.time);
      return snapTo;
    };

    let snapParams = {};
    switch (true) {
      case is.boolean(snap) && snap:
        snapParams.to = parseSnapMarks(snap);
        break;
      case is.array(snap):
        snapParams.to = snap;
        break;
      case is.num(snap):
        snapParams.to = parseSnapNum(snap);
        break;
      case is.object(snap):
        snapParams = snap;
        snapParams.to = parseSnapTo(snapParams.to);
        break;
    }

    return mergeOptions(snapDefaultParams, snapParams);
  }

  update() {
    // this.init();
  }

  kill() {
    this._it = null;
    this._utils = null;
  }
}

export { Animation as default };
