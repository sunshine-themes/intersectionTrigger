const defaultInsOptions = {
  //Defaults for every trigger
  defaults: {
    once: false,
    onEnter: null,
    onLeave: null,
    onEnterBack: null,
    onLeaveBack: null,
  },
  enter: '0% 100%',
  leave: '100% 0%',
  name: '',
  scroller: null,
  onScroll: null,
  axis: 'y',
  // guides: false,
};

const triggerStates = {
  hasEntered: false,
  hasEnteredBack: false,
  hasLeft: true,
  hasLeftBack: true,
  hasFirstEntered: false,
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

export { defaultInsOptions, triggerStates, guideDefaultParams };
