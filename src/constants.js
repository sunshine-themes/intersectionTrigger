const fn = () => {};
const defaultInsOptions = {
  //Defaults for every trigger
  defaults: {
    once: false,
    onEnter: fn,
    onLeave: fn,
    onEnterBack: fn,
    onLeaveBack: fn,
    toggleClass: null,
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
  onScroll: null,
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

const classDefaultToggleActions = 'add remove add remove';

export { defaultInsOptions, triggerStates, guideDefaultParams, classDefaultToggleActions };
