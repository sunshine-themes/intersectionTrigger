import { defaultAnimationParams, snapDefaultParams } from '../constants';
import { clamp, is, mergeOptions, splitStr, throwError } from '../helpers';

class Animation {
  constructor(it) {
    this._registerIntersectionTrigger(it);
    this.setUtils();
    return this;
  }
  _registerIntersectionTrigger(intersectionTrigger) {
    this._it = intersectionTrigger;
    this._utils = this._it._utils;
  }

  setUtils() {
    const { ref, refOpposite, length } = this._utils.dirProps();
    const isVir = this._utils.isVirtical();
    const root = this._utils.getRoot();

    let rAFIDs = new WeakMap();
    this.seekSmoothly = (ins, seekTo, link, isSeekToGreater) => {
      if (this.killed) return;

      const cT = ins.currentTime;
      const sT = isSeekToGreater ? Math.min(cT + link, seekTo) : Math.max(cT - link, seekTo);
      ins.seek(sT);
      const hasComplete = isSeekToGreater ? sT >= seekTo : sT <= seekTo;
      if (hasComplete) return;

      const rAFID = requestAnimationFrame(() => this.seekSmoothly(ins, seekTo, link, isSeekToGreater));
      rAFIDs.set(ins, rAFID);
    };

    this.seek = (ins, seekTo, link) => {
      if (is.num(link)) {
        const cT = ins.currentTime;
        const isSeekToGreater = seekTo > cT;
        const rAFID = (rAFIDs.has(ins) && rAFIDs.get(ins)) || 0;

        cancelAnimationFrame(rAFID);
        this.seekSmoothly(ins, seekTo, link, isSeekToGreater);
        return;
      }
      ins.seek(seekTo);
    };

    this.startSnaping = ({ snapDistance, currentDis, snap, step, toRef = false }) => {
      if (this.killed) return;

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

    this.parseSnap = ({ instance, snap }, update = false) => {
      const parseNum = (n) => {
        const arr = [];
        let progress = n;
        while (progress < 1) {
          arr.push(clamp(progress, 0, 1));
          progress = progress + n;
        }
        return arr.map((v) => Math.round(v * instance.duration));
      };
      const parseTo = (sn) => {
        if (is.num(sn)) return parseNum(sn);
        if (is.string(sn)) return parseMarks(sn);
        if (is.array(sn)) return sn;
      };
      const parseMarks = () => {
        if (!is.inObject(instance, 'marks')) return;
        return instance.marks.map((mark) => mark.time);
      };

      const getTo = (params, to) => (update ? params.toOriginal : to);

      let snapParams = {};
      switch (true) {
        case is.boolean(snap) && snap:
          !update && (snapParams.toOriginal = 'marks');
          snapParams.to = parseMarks(getTo(snapParams, snap));
          break;
        case is.array(snap):
          !update && (snapParams.toOriginal = snap);
          snapParams.to = getTo(snapParams, snap);
          break;
        case is.num(snap):
          !update && (snapParams.toOriginal = snap);
          snapParams.to = parseNum(getTo(snapParams, snap));
          break;
        case is.object(snap):
          snapParams = snap;
          !update && (snapParams.toOriginal = snapParams.to);
          snapParams.to = parseTo(getTo(snapParams, snapParams.to));
          break;
      }

      return mergeOptions(snapDefaultParams, snapParams);
    };

    this.getTIL = (trigger, minPosition, maxPosition) => {
      const tB = trigger.getBoundingClientRect();
      return tB[length] - (minPosition * tB[length] + (1 - maxPosition) * tB[length]);
    };
    this.getSnapStep = (snap) => snap && Math.round(Math.max((snap.speed * 17) / 1000, 1));

    this.animateHandler = (trigger, { enter, leave, tIL, instance, snap, step, link }) => {
      if (this.killed) return;

      const tB = trigger.getBoundingClientRect(); //trigger Bounds
      const ids = this._utils.getTriggerStates(trigger, 'ids');
      this._it.rootBounds = this._utils.getRootRect(this._it.observer.rootMargin);
      const rB = this._it.rootBounds; //root Bounds
      const scrollLength = tIL + (this._it._isREPGreater ? rB[length] : -rB[length]);
      const duration = instance.duration;
      let seekTo = 0;

      const [tEP, tLP, rEP, rLP] = this._utils.getPositions(tB, rB, { enter, leave, ref, refOpposite, length });
      const diff = rEP - tEP;

      if (diff > 0) {
        seekTo = (duration * diff) / scrollLength;
        this.seek(instance, seekTo, link);
      }

      //Snap
      if (snap) {
        let dis = 0;
        // Clear timeout
        clearTimeout(ids.snapTimeOutId);
        // Set a timeout to run after scrolling stops
        const snapTimeOutId = setTimeout(() => {
          const directionalDiff = snap.to.map((n) => seekTo - n),
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

  animate(trigger, animation, eventIndex) {
    const { instance, toggleActions, link, snap } = animation;
    if (!instance) return;

    if (link) {
      const { animate } = this._utils.getTriggerStates(trigger, 'onScroll');
      const ids = this._utils.getTriggerStates(trigger, 'ids');
      const { enter, leave, minPosition, maxPosition } = this._utils.getTriggerData(trigger);
      const tIL = this.getTIL(trigger, minPosition, maxPosition); //trigger Intersection length
      const step = this.getSnapStep(snap) || 0;
      const animateData = { enter, leave, tIL, instance, snap, link: is.boolean(link) ? link : Math.abs(link), step };

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
          this.seek(instance, 1 === eventIndex ? instance.duration : 0, link);
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
      case 'resume':
        1 > instance.progress && 0 < instance.progress && instance.play();
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

  parse(params, update = false) {
    let animation = {};

    switch (true) {
      case is.animeInstance(params):
        animation = mergeOptions(defaultAnimationParams, {
          instance: params,
        });
        break;
      case is.object(params):
        {
          animation = mergeOptions(defaultAnimationParams, params);
          const { toggleActions, snap, instance } = animation;

          snap && (animation.snap = this.parseSnap({ instance, snap }, update));
          is.string(toggleActions) && (animation.toggleActions = splitStr(toggleActions));
        }
        break;
    }

    !is.animeInstance(animation.instance) && throwError('Invalid anime instance');

    //Reset anime instance
    is.inObject(animation, 'instance') && animation.instance.reset();

    return animation;
  }

  update() {
    this._it.triggers.forEach((trigger) => {
      //update the animation data
      let { enter, leave, minPosition, maxPosition, animation } = this._utils.getTriggerData(trigger);
      animation = this.parse(animation, true); //parsed animation data
      this._utils.setTriggerData(trigger, null, { animation });

      //update the animation handler data
      const { animate } = this._utils.getTriggerStates(trigger, 'onScroll');
      if (animate) {
        const { instance, snap, link } = animation;
        const tIL = this.getTIL(trigger, minPosition, maxPosition);
        const step = this.getSnapStep(snap) || 0;
        //reassign an animate handler
        this._utils.setTriggerScrollStates(trigger, 'animate', null);
        this._utils.setTriggerScrollStates(trigger, 'animate', () =>
          this.animateHandler(trigger, { enter, leave, instance, snap, link, tIL, step })
        );
      }
    });
  }

  kill() {
    this.killed = true;

    this._it = null;
    this._utils = null;
  }
}

Animation.pluginName = 'animation';

export default Animation;
