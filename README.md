<p align="center">
  <a href="https://sunshine-themes.com/?appID=ss_app_1" target="__blank">
    <img src="https://raw.githubusercontent.com/sherif-magdy/sunshine-assets/main/intersectiontrigger-logo-no-bg.png"/>
  </a>
</p>

<p align="center">
  <a href="https://sunshine-themes.com/?appID=ss_app_1">Overview</a> |
  <a href="https://sunshine-themes.com/?appID=ss_app_1&tab=docs">Documentation</a> |
  <a href="https://sunshine-themes.com/?appID=ss_app_1&tab=pricing">Pricing</a> |
  <a href="https://codepen.io/collection/qOpKmv">Examples</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/intersectiontrigger">
    <img alt="NPM Version" src="https://badgen.net/npm/v/intersectiontrigger" />
  </a>
  <a href="https://bundlephobia.com/result?p=intersectiontrigger">
    <img alt="minified gziped size" src="https://badgen.net/bundlephobia/minzip/intersectiontrigger" />
  </a>
  <a href="https://github.com/sunshine-themes/intersectionTrigger/actions/workflows/push-master.yml">
    <img alt="CI" src="https://github.com/sunshine-themes/intersectionTrigger/actions/workflows/push-master.yml/badge.svg?branch=master&amp;event=push">
  </a>
  <a href="https://codecov.io/gh/sunshine-themes/intersectionTrigger" > 
    <img src="https://codecov.io/gh/sunshine-themes/intersectionTrigger/branch/master/graph/badge.svg?token=IBPVH4BTBY"/> 
  </a>
</p>

# IntersectionTrigger

IntersectionTrigger utilizes the most modern web technology to trigger anything by intersection. Including scroll-based animations.

## Installation

### From NPM

```bash
npm i intersectiontrigger
```

### From Yarn

```bash
yarn add intersectiontrigger
```

And import it

```javascript
//import IntersectionTrigger
import IntersectionTrigger from 'intersectiontrigger';

//init intersectiontrigger
const itInstance = new IntersectionTrigger(...);
```

By default  IntersectionTrigger exports only the core version without any Plugins, so if you want to use any you need to import it too. After importing any plugin, you must register it.

```javascript
import IntersectionTrigger, { Animation, ToggleClass } from 'intersectiontrigger';

//Register plugins right after importing them
IntersectionTrigger.registerPlugins([Animation, ToggleClass]);
```

If you want to import IntersectionTrigger with all plugins registered, then you should import it from 'intersectiontrigger/bundle':

```javascript
//import IntersectionTrigger with all plugins registered
import IntersectionTrigger from 'intersectiontrigger/bundle';

//init IntersectionTrigger
const itInstance = new IntersectionTrigger(...);
```

[For more installation options.](https://sunshine-themes.com/?appID=ss_app_1&tab=docs)

## Features

- **Resolution of the "Target Height is greater than the Root Height" Issue**: IntersectionTrigger offers a solution to the IntersectionObserver problem where the target height exceeds that of the root.
- **Boosted Performance**: IntersectionTrigger developed with reaching the highest performance in mind, starting with the observation algorithm eliminating any scroll events, resize recalculations getting throttled, the ability of one IntersectionTrigger instance to observe and control unlimited number of triggers (theoretically) and ending with the package's size getting decreased by plugins interface coming as a solution.
- **Controlled Animations**: Control any animation by assigning it to a particular element (trigger), so you can perform actions on that animation like (play,pause,resume,reverse,complete,restart,reset,kill) when entering/leaving a specific area.
- **Linked Animations**: Link any animation to the scrollbar, so that the scrollbar acts like a timeline controller and by adding a link factor you can smooth the linked animation.
- **Snapping System**: Define certain points to snap in the linked animation like closest mark on the timeline or an array of custom points.
- **Library Agnostic**: IntersectionTrigger requires Zero JavaScript libraries, which makes it much smaller and faster.
- **Unlimited Triggers With Unlimited Animations**: Add as many triggers ( with controlled/linked animations ) as you want to one IntersectionTrigger instance, so you can use only one instance to power up your whole application.
- **Visual Guides**: IntersectionTrigger comes with Guides Plugin to visualize the enter/leave positions of both the trigger and the root, makes the development process much easier for debugging.
- **Want to discover more, [visit us](https://sunshine-themes.com/?appID=ss_app_1) ...**

## Community

The IntersectionTrigger community can be found on [GitHub Discussions](https://github.com/sunshine-themes/intersectionTrigger/discussions), where you can ask questions, voice ideas, and share your projects

## Major Roadmapped Features

- [Top Feature Requests](https://github.com/sunshine-themes/intersectionTrigger/issues?q=is%3Aissue+is%3Aopen+label%3A%22feature+request%22+sort%3Areactions-%2B1-desc+) (Add your own votes using the 👍 reaction)
- [Top Bugs 😱](https://github.com/sunshine-themes/intersectionTrigger/issues?q=is%3Aissue+is%3Aopen+-label%3A%22feature+request%22++sort%3Areactions-%2B1-desc+) (Add your own votes using the 👍 reaction)
