import { defaultAnimationParams, snapDefaultParams } from '../constants';
import { clamp, is, mergeOptions, splitStr, throwError } from '../helpers';

class Animation {
  constructor(it) {
    this._registerIntersectionTrigger(it);
    return this;
  }

  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }

  animate(trigger, animation, eventIndex) {
    const { instance, toggleActions, control, snap } = animation;
    if (!instance) return;

    if (control) {
      const { animate } = this._utils.getTriggerStates(trigger, 'onScroll');
      const ids = this._utils.getTriggerStates(trigger, 'ids');
      const { enter, leave, minPosition, maxPosition } = this._utils.getTriggerData(trigger);
      const { ref, refOpposite, length } = this._utils.dirProps();
      const isVir = this._utils.isVirtical();
      const tB = trigger.getBoundingClientRect(); //trigger Bounds
      const tIL = tB[length] - (minPosition * tB[length] + (1 - maxPosition) * tB[length]); //trigger Intersection length
      const root = this._utils.getRoot();
      const duration = instance.duration;
      const seek = (t) => instance.seek(t);

      const animateHandler = (trigger) => {
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
          if (is.num(control)) {
            setTimeout(() => seek(currentTime), control * 1000);
          } else {
            seek(currentTime);
          }
        }

        //Snap
        if (snap) {
          const step = Math.round(Math.max((snap.speed * 17) / 1000, 1));
          let dis = 0;
          const startSnaping = (snapDistance, toRef = false) => {
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
            dis += step;
            if (dis >= snapDistance) {
              dis = 0;
              snap.onComplete(this._it);
              return;
            }
            requestAnimationFrame(() => startSnaping(snapDistance, toRef));
          };
          // Clear timeout
          clearTimeout(ids.snapTimeOutId);
          // Set a timeout to run after scrolling stops
          const snapTimeOutId = setTimeout(() => {
            const directionalDiff = snap.to.map((n) => currentTime - n),
              diff = directionalDiff.map((n) => Math.abs(n)),
              closest = Math.min(...diff),
              closestWithDirection = directionalDiff[diff.indexOf(closest)],
              snapDistance = (scrollLength * closest) / duration;

            if (snapDistance >= snap.maxDistance || snapDistance < step) return;

            snap.onStart(this._it);

            if (closestWithDirection < 0) {
              startSnaping(snapDistance);
              return;
            }

            startSnaping(snapDistance, true);
          }, snap.after * 1000);
          //Update the id of Timeout
          this._utils.setTriggerStates(trigger, { ids: { ...ids, snapTimeOutId } });
        }
      };

      switch (eventIndex) {
        case 0:
        case 2:
          this._it._states.oCbFirstInvoke && animateHandler(trigger); //to update the animation if the root intersects trigger at begining

          if (animate) break;
          this._utils.setTriggerScrollStates(trigger, 'animate', animateHandler);
          break;
        case 1:
        case 3:
          // Clear snaping
          clearTimeout(ids.snapTimeOutId);
          this._utils.setTriggerScrollStates(trigger, 'animate', null);
          //Reset the animation
          if (1 === eventIndex) {
            seek(duration);
            break;
          }

          seek(0);
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
          snap && this.parseSnap();

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

    this._params.snap = mergeOptions(snapDefaultParams, snapParams);
  }

  kill() {
    this._it = null;
    this._utils = null;
  }
}

export { Animation as default };
