const fn = () => {};
const classDefaultToggleActions = ['add', 'remove', 'add', 'remove'];
const animationDefaultToggleActions = ['play', 'finish', 'reverse', 'finish'];

const defaultInsOptions = {
  //Defaults for every trigger
  defaults: {
    once: false,
    onEnter: fn,
    onLeave: fn,
    onEnterBack: fn,
    onLeaveBack: fn,
    toggleClass: null,
    animation: null,
  },
  enter: '0% 100%',
  leave: '100% 0%',
  axis: 'y',
  name: '',
  root: null,
  onScroll: fn,
};

const triggerStates = {
  hasEntered: false,
  hasEnteredBack: false,
  hasLeft: true,
  hasLeftBack: true,
  hasEnteredOnce: false,
  onScroll: { backup: null, animate: null },
};

const guideDefaultParams = {
  enter: {
    trigger: {
      backgroundColor: 'rgb(0, 149, 0)',
      color: '#000',
      text: 'Enter',
    },
    root: {
      backgroundColor: 'rgb(0, 149, 0)',
      color: '#000',
      text: 'Root Enter',
    },
  },
  leave: {
    trigger: {
      backgroundColor: '#ff0000',
      color: '#000',
      text: 'Leave',
    },
    root: {
      backgroundColor: '#ff0000',
      color: '#000',
      text: 'Root Leave',
    },
  },
};

const defaultToggleClassParams = {
  targets: null,
  toggleActions: classDefaultToggleActions,
  classNames: null,
};

const defaultAnimationParams = {
  instance: null,
  toggleActions: animationDefaultToggleActions,
  control: false,
};

export { defaultInsOptions, triggerStates, guideDefaultParams, defaultAnimationParams, defaultToggleClassParams };
