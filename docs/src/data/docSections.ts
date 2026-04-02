export interface ContentBlock {
  type: "heading" | "paragraph" | "code" | "list" | "table" | "features" | "divider";
  text?: string;
  code?: string;
  level?: number;
  language?: string;
  title?: string;
  items?: string[];
  ordered?: boolean;
  headers?: string[];
  rows?: string[][];
  features?: { icon: string; title: string; description: string }[];
}

export interface Section {
  id: string;
  title: string;
  content: ContentBlock[];
  children?: { id: string; title: string }[];
}

export const docSections: Section[] = [
  {
    id: "introduction",
    title: "Introduction",
    children: [
      { id: "why-intersectiontrigger", title: "Why IntersectionTrigger?" },
    ],
    content: [
      {
        type: "heading",
        text: "IntersectionTrigger",
        level: 1,
      },
      {
        type: "paragraph",
        text: "A zero-dependency TypeScript library that enhances the IntersectionObserver API — resolving the \"target height > root height\" limitation and unlocking scroll-based animations with a plugin architecture.",
      },
      {
        type: "heading",
        text: "Why IntersectionTrigger?",
        level: 3,
      },
      {
        type: "features",
        features: [
          { icon: "⚡", title: "Zero Dependencies", description: "No external libraries required. Tiny footprint, blazing fast." },
          { icon: "🚀", title: "Performance Optimized", description: "Built on IntersectionObserver — zero scroll events on the main thread." },
          { icon: "🎬", title: "Controlled Animations", description: "Play, pause, resume, reverse, restart animations on enter/leave." },
          { icon: "🔗", title: "Linked Animations", description: "Link any animation to the scrollbar with configurable smoothing." },
          { icon: "🎯", title: "Snapping System", description: "Snap scroll-linked animations to defined points." },
          { icon: "🧩", title: "Plugin Architecture", description: "Extend core with Animation, ToggleClass, and Guides plugins." },
          { icon: "👁", title: "Custom Roots", description: "Use any element as the intersection root, not just the viewport." },
          { icon: "📐", title: "Visual Guides", description: "Debug with visual overlays showing trigger/root positions." },
          { icon: "↔", title: "Axis Support", description: "Vertical and horizontal intersection detection." },
          { icon: "🎨", title: "ToggleClass System", description: "Rich CSS class toggling with granular control over actions." },
          { icon: "📏", title: "Resize Observation", description: "Automatic recalculation when the root resizes." },
          { icon: "♾", title: "Unlimited Triggers", description: "One instance observes and controls unlimited triggers." },
        ],
      },
    ],
  },
  {
    id: "installation",
    title: "Installation",
    content: [
      { type: "heading", text: "Installation", level: 2 },
      { type: "paragraph", text: "Install IntersectionTrigger using your preferred package manager, load it from a CDN, or download the files directly." },
      { type: "heading", text: "Package Manager", level: 4 },
      { type: "code", language: "bash", code: "npm install intersectiontrigger", title: "npm" },
      { type: "code", language: "bash", code: "yarn add intersectiontrigger", title: "Yarn" },
      { type: "heading", text: "Import Methods", level: 4 },
      { type: "paragraph", text: "IntersectionTrigger ships multiple import targets depending on which features you need." },
      { type: "heading", text: "Core Only", level: 4 },
      { type: "code", language: "js", code: "import IntersectionTrigger from 'intersectiontrigger';" },
      { type: "heading", text: "With Plugins", level: 4 },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';
import Animation from 'intersectiontrigger/animation';
import ToggleClass from 'intersectiontrigger/toggleclass';
import Guides from 'intersectiontrigger/guides';

IntersectionTrigger.registerPlugins([Animation, ToggleClass, Guides]);` },
      { type: "heading", text: "Bundle Import", level: 4 },
      { type: "code", language: "js", code: "import IntersectionTrigger from 'intersectiontrigger/bundle';" },
      { type: "heading", text: "CDN", level: 4 },
      { type: "paragraph", text: "Use IntersectionTrigger directly in the browser without a build step." },
      { type: "code", language: "html", code: `<script src="https://cdn.jsdelivr.net/npm/intersectiontrigger@latest/core/core.browser.min.js"></script>
<script>
  var it = new it_core({
    default: { enter: '20%', leave: '80%' }
  });
  it.add('.box');
</script>`, title: "IIFE / Browser Global" },
      { type: "code", language: "html", code: `<script type="module">
  import IntersectionTrigger from 'https://cdn.jsdelivr.net/npm/intersectiontrigger@latest/intersectiontrigger-bundle.browser.mjs';

  const it = new IntersectionTrigger({
    defaults: { enter: '20%', leave: '80%' }
  });
  it.add('.box');
</script>`, title: "ES Module" },
    ],
  },
  {
    id: "quick-start",
    title: "Quick Start",
    content: [
      { type: "heading", text: "Quick Start", level: 2 },
      { type: "paragraph", text: "Learn the basics of IntersectionTrigger by setting up triggers with callbacks, class toggling, and animations." },
      { type: "heading", text: "Minimal Setup", level: 4 },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';

const it = new IntersectionTrigger({
  defaults: {
    enter: '20%',
    leave: '80%'
  }
});

it.add('.card');` },
      { type: "heading", text: "Using Callbacks", level: 4 },
      { type: "code", language: "js", code: `it.add('.card', {
  onEnter(trigger, intersectionTrigger) {
    trigger.classList.add('visible');
    console.log('Entered:', trigger);
  },
  onLeave(trigger, intersectionTrigger) {
    trigger.classList.remove('visible');
    console.log('Left:', trigger);
  }
});` },
      { type: "paragraph", text: "Four lifecycle callbacks are available:" },
      {
        type: "list",
        items: [
          "**onEnter** — trigger enters the intersection zone from below.",
          "**onLeave** — trigger leaves the intersection zone upward.",
          "**onEnterBack** — trigger re-enters the intersection zone from above (scrolling back).",
          "**onLeaveBack** — trigger leaves the intersection zone downward (scrolling back).",
        ],
      },
      { type: "heading", text: "Fire Once", level: 4 },
      { type: "code", language: "js", code: `it.add('.card', {
  once: true,
  onEnter(trigger) {
    trigger.classList.add('loaded');
  }
});` },
      { type: "heading", text: "Using the ToggleClass Plugin", level: 4 },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';
import ToggleClass from 'intersectiontrigger/toggleclass';

IntersectionTrigger.registerPlugins([ToggleClass]);` },
      { type: "code", language: "js", code: `it.add('.card', {
  enter: '10%',
  leave: '90%',
  toggleClass: 'is-visible'
});` },
      { type: "heading", text: "Using the Animation Plugin", level: 4 },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';
import Animation from 'intersectiontrigger/animation';

IntersectionTrigger.registerPlugins([Animation]);` },
      { type: "paragraph", text: "Controlled Animation:" },
      { type: "code", language: "js", code: `import anime from 'animejs';

const animation = anime({
  targets: '.card',
  opacity: [0, 1],
  translateY: [40, 0],
  duration: 800,
  easing: 'easeOutCubic',
  autoplay: false
});

it.add('.card', {
  enter: '15%',
  leave: '85%',
  animation: {
    instance: animation,
    toggleActions: 'play pause reverse pause'
  }
});` },
      { type: "paragraph", text: "Scroll-Linked Animation:" },
      { type: "code", language: "js", code: `const linkedAnimation = anime({
  targets: '.progress-bar',
  width: ['0%', '100%'],
  duration: 1000,
  easing: 'linear',
  autoplay: false
});

it.add('.section', {
  enter: '0%',
  leave: '100%',
  animation: {
    instance: linkedAnimation,
    link: 1
  }
});` },
    ],
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    content: [
      { type: "heading", text: "Core Concepts", level: 2 },
      { type: "heading", text: "The IntersectionObserver API", level: 3 },
      { type: "paragraph", text: "The IntersectionObserver API provides an asynchronous way to observe changes in the intersection of a target element with an ancestor element or the viewport." },
      { type: "heading", text: "How IntersectionTrigger Enhances It", level: 3 },
      { type: "paragraph", text: "The native IntersectionObserver has a significant limitation: when a target element is taller than the root element, the observer fires its callback only once. IntersectionTrigger resolves this by layering its own position-tracking logic on top of the native observer, providing precise enter and leave positions with directional callbacks." },
      { type: "heading", text: "Intersection vs Scroll Events", level: 3 },
      { type: "paragraph", text: "A common approach to visibility detection is listening for scroll events and computing element positions manually. This has drawbacks:" },
      { type: "list", items: [
        "**Scroll events run on the main thread** — Every scroll handler blocks rendering",
        "**Frequent layout thrashing** — Reading getBoundingClientRect() forces layout recalculation",
      ] },
      { type: "paragraph", text: "IntersectionTrigger avoids these problems by relying on IntersectionObserver, which handles observation off the main thread." },
      { type: "heading", text: "Architecture: Core + Plugins", level: 3 },
      { type: "list", items: [
        "**Core** (IntersectionTrigger class) handles intersection detection, trigger management, position calculations, and lifecycle control.",
        "**Animation** — controlled and scroll-linked animations via AnimeJS.",
        "**Toggle Class** — CSS class toggling on intersection events.",
        "**Guides** — visual debugging overlays.",
      ] },
      { type: "heading", text: "Instance Lifecycle", level: 3 },
      { type: "list", ordered: true, items: [
        "**Create** — Instantiate with new IntersectionTrigger(options)",
        "**Add triggers** — Call add(trigger, options?) to register elements",
        "**Observe** — The observer watches triggers automatically",
        "**Callbacks** — Your handlers fire in response to intersection changes",
        "**Update / Kill** — Call update() to recalculate or kill() to destroy",
      ] },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';

// 1. Create
const it = new IntersectionTrigger({ root: '#scroll-container' });

// 2. Add triggers
it.add('.element', {
  onEnter: (trigger) => console.log('Entered:', trigger),
  onLeave: (trigger) => console.log('Left:', trigger),
});

// 3-4. Observation and callbacks happen automatically

// 5. Clean up when done
it.kill();` },
    ],
  },
  {
    id: "constructor",
    title: "Constructor",
    content: [
      { type: "heading", text: "Constructor", level: 2 },
      { type: "heading", text: "Signature", level: 3 },
      { type: "code", language: "ts", code: "new IntersectionTrigger(options?: IntersectionTriggerOptions)" },
      { type: "paragraph", text: "Creates a new IntersectionTrigger instance. The options argument is optional; all properties have sensible defaults." },
      { type: "heading", text: "Options", level: 3 },
      {
        type: "table",
        headers: ["Property", "Type", "Default", "Description"],
        rows: [
          ["defaults", "TriggerOptions", "{}", "Default properties inherited by every trigger added via add()."],
          ["root", "HTMLElement | string | null", "null", "The scrollable ancestor element to use as the intersection root."],
          ["rootEnter", "RootPosition", "'100%'", "The position on the root boundary that constitutes an \"enter\" intersection."],
          ["rootLeave", "RootPosition", "'0%'", "The position on the root boundary that constitutes a \"leave\" intersection."],
          ["axis", "'y' | 'x'", "'y'", "The scroll axis to observe."],
          ["name", "string", "''", "An optional name for the instance."],
          ["guides", "boolean | GuidesOptions", "false", "Enable visual debugging overlays."],
          ["onScroll", "EventHandler", "undefined", "A callback fired on every scroll event within the root element."],
        ],
      },
      { type: "heading", text: "Examples", level: 3 },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';

const it = new IntersectionTrigger();`, title: "Basic Constructor" },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger({
  root: '#scroll-container',
});`, title: "Custom Root Element" },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger({
  root: '#scroll-container',
  name: 'My Instance',
  guides: true,
});`, title: "With Guides Enabled" },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger({
  root: '#scroll-container',
  defaults: {
    enter: '25%',
    leave: '75%',
    once: true,
    onEnter: (trigger) => trigger.classList.add('visible'),
  },
});

it.add('.card');`, title: "With Default Trigger Options" },
    ],
  },
  {
    id: "callbacks",
    title: "Callbacks",
    content: [
      { type: "heading", text: "Callbacks", level: 2 },
      { type: "heading", text: "Callback Signature", level: 3 },
      { type: "code", language: "ts", code: "(trigger?: HTMLElement, it?: IntersectionTrigger) => void" },
      {
        type: "table",
        headers: ["Parameter", "Type", "Description"],
        rows: [
          ["trigger", "HTMLElement", "The DOM element that triggered the callback."],
          ["it", "IntersectionTrigger", "The IntersectionTrigger instance that owns this trigger."],
        ],
      },
      { type: "heading", text: "The Four Callbacks", level: 3 },
      { type: "paragraph", text: "**onEnter** — Fires when the trigger element enters the intersection in the forward (positive) scroll direction." },
      { type: "paragraph", text: "**onLeave** — Fires when the trigger element leaves the intersection in the forward (positive) scroll direction." },
      { type: "paragraph", text: "**onEnterBack** — Fires when the trigger element enters the intersection in the backward (negative) scroll direction." },
      { type: "paragraph", text: "**onLeaveBack** — Fires when the trigger element leaves the intersection in the backward (negative) scroll direction." },
      { type: "heading", text: "Example", level: 3 },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';

const it = new IntersectionTrigger({
  root: '#scroll-container',
});

it.add('.element', {
  onEnter: (trigger, instance) => {
    console.log('Entered while scrolling forward', trigger);
    trigger.classList.add('visible');
  },
  onLeave: (trigger, instance) => {
    console.log('Left while scrolling forward', trigger);
    trigger.classList.remove('visible');
  },
  onEnterBack: (trigger, instance) => {
    console.log('Entered while scrolling backward', trigger);
    trigger.classList.add('visible');
  },
  onLeaveBack: (trigger, instance) => {
    console.log('Left while scrolling backward', trigger);
    trigger.classList.remove('visible');
  },
});` },
      { type: "heading", text: "Setting Callbacks", level: 3 },
      { type: "paragraph", text: "Per-trigger via the add() options:" },
      { type: "code", language: "js", code: `it.add('.card', {
  onEnter: (trigger) => console.log('Card entered', trigger),
});` },
      { type: "paragraph", text: "As defaults via the constructor, applying to all triggers:" },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger({
  defaults: {
    onEnter: (trigger) => trigger.classList.add('in-view'),
    onLeave: (trigger) => trigger.classList.remove('in-view'),
  },
});

it.add('.card'); // inherits the onEnter and onLeave defaults` },
    ],
  },
  {
    id: "methods",
    title: "Methods",
    content: [
      { type: "heading", text: "Methods", level: 2 },
      { type: "heading", text: "Instance Methods", level: 3 },
      { type: "heading", text: "add(trigger, options?)", level: 4 },
      { type: "paragraph", text: "Adds one or more elements as triggers to observe. Returns the IntersectionTrigger instance for chaining." },
      { type: "code", language: "ts", code: "add(trigger: string | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>, options?: TriggerOptions): this" },
      {
        type: "table",
        headers: ["Property", "Type", "Default", "Description"],
        rows: [
          ["enter", "TriggerPosition", "'0%'", "The position on the trigger element that must meet rootEnter to fire the enter callback."],
          ["leave", "TriggerPosition", "'100%'", "The position on the trigger element that must meet rootLeave to fire the leave callback."],
          ["once", "boolean", "false", "If true, the trigger is automatically removed after its first leave event."],
          ["onEnter", "ItCallbackFunction", "undefined", "Callback fired when the trigger enters in the forward direction."],
          ["onLeave", "ItCallbackFunction", "undefined", "Callback fired when the trigger leaves in the forward direction."],
          ["onEnterBack", "ItCallbackFunction", "undefined", "Callback fired when the trigger enters in the backward direction."],
          ["onLeaveBack", "ItCallbackFunction", "undefined", "Callback fired when the trigger leaves in the backward direction."],
          ["toggleClass", "string | ToggleClassOptions[]", "undefined", "CSS class toggling configuration."],
          ["animation", "AnimeInstance | AnimationOptions", "undefined", "Animation configuration."],
        ],
      },
      { type: "heading", text: "remove(trigger)", level: 4 },
      { type: "paragraph", text: "Stops observing the specified element(s) and removes them from the instance." },
      { type: "code", language: "ts", code: "remove(trigger: string | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>): this" },
      { type: "heading", text: "update()", level: 4 },
      { type: "paragraph", text: "Disconnects and recreates the internal IntersectionObserver, recalculates all positions, and re-observes all triggers." },
      { type: "code", language: "ts", code: "update(): void" },
      { type: "heading", text: "kill()", level: 4 },
      { type: "paragraph", text: "Destroys the instance completely." },
      { type: "code", language: "ts", code: "kill(): void" },
      { type: "heading", text: "Static Methods", level: 3 },
      { type: "heading", text: "IntersectionTrigger.getInstances()", level: 4 },
      { type: "code", language: "ts", code: "static getInstances(): IntersectionTrigger[]" },
      { type: "heading", text: "IntersectionTrigger.getInstanceById(id)", level: 4 },
      { type: "code", language: "ts", code: "static getInstanceById(id: number): IntersectionTrigger | undefined" },
      { type: "heading", text: "IntersectionTrigger.registerPlugins(plugins)", level: 4 },
      { type: "code", language: "ts", code: "static registerPlugins(plugins: Plugin[]): number" },
      { type: "heading", text: "IntersectionTrigger.update()", level: 4 },
      { type: "paragraph", text: "Calls update() on every active instance." },
      { type: "code", language: "ts", code: "static update(): void" },
      { type: "heading", text: "IntersectionTrigger.kill()", level: 4 },
      { type: "paragraph", text: "Kills every active instance." },
      { type: "code", language: "ts", code: "static kill(): void" },
    ],
  },
  {
    id: "custom-roots",
    title: "Custom Roots",
    content: [
      { type: "heading", text: "Custom Roots", level: 2 },
      { type: "heading", text: "What Is a Root Element?", level: 3 },
      { type: "paragraph", text: "The root is the scrollable container that defines the intersection boundary. By default, the root is null, which means the viewport is used." },
      { type: "heading", text: "Setting a Custom Root", level: 3 },
      { type: "paragraph", text: "Pass the root option to the constructor. You can provide either a CSS selector string or an HTMLElement reference." },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';

const it = new IntersectionTrigger({
  root: '#scroll-container',
});

it.add('.card', {
  onEnter: (trigger) => trigger.classList.add('visible'),
  onLeave: (trigger) => trigger.classList.remove('visible'),
});`, title: "CSS Selector String" },
      { type: "code", language: "js", code: `const container = document.querySelector('#scroll-container');

const it = new IntersectionTrigger({
  root: container,
});`, title: "Element Reference" },
      { type: "heading", text: "rootEnter and rootLeave Positioning", level: 3 },
      { type: "paragraph", text: "rootEnter and rootLeave define where on the root boundary the intersection is evaluated." },
      {
        type: "table",
        headers: ["Option", "Default", "Meaning"],
        rows: [
          ["rootEnter", "'100%'", "The bottom edge of the root (Y-axis) or right edge (X-axis)."],
          ["rootLeave", "'0%'", "The top edge of the root (Y-axis) or left edge (X-axis)."],
        ],
      },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger({
  root: '#scroll-container',
  rootEnter: '75%',
  rootLeave: '25%',
});` },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    content: [
      { type: "heading", text: "API Reference", level: 2 },
      { type: "heading", text: "TriggerOptions", level: 3 },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger();

it.add('.element', {
  enter: '20%',
  leave: '80%',
  once: false,
  onEnter: (trigger, it) => { /* ... */ },
  onLeave: (trigger, it) => { /* ... */ },
  toggleClass: 'active',
  animation: animeInstance
});` },
      {
        type: "table",
        headers: ["Property", "Type", "Default", "Description"],
        rows: [
          ["enter", "TriggerPosition", "'0%'", "Position on the trigger element that marks the enter threshold."],
          ["leave", "TriggerPosition", "'100%'", "Position on the trigger element that marks the leave threshold."],
          ["once", "boolean", "false", "If true, callbacks fire only on the first enter event."],
          ["onEnter", "ItCallbackFunction", "() => {}", "Callback fired when the trigger enters the intersection zone."],
          ["onLeave", "ItCallbackFunction", "() => {}", "Callback fired when the trigger leaves the intersection zone."],
          ["onEnterBack", "ItCallbackFunction", "() => {}", "Callback fired when the trigger re-enters from below."],
          ["onLeaveBack", "ItCallbackFunction", "() => {}", "Callback fired when the trigger leaves back downward."],
          ["toggleClass", "string | ToggleClassOptions[]", "undefined", "CSS class toggling configuration."],
          ["animation", "Anime | AnimationOptions", "undefined", "Animation configuration."],
        ],
      },
      { type: "heading", text: "Instance Properties", level: 3 },
      {
        type: "table",
        headers: ["Property", "Type", "Description"],
        rows: [
          ["id", "number", "Unique integer assigned to each instance"],
          ["triggers", "HTMLElement[]", "Array of all trigger elements"],
          ["observer", "IntersectionObserver | undefined", "The internal IntersectionObserver"],
          ["rootBounds", "DOMRectReadOnly", "The current root size and position"],
          ["killed", "boolean", "Whether the instance has been killed"],
          ["axis", "string", "Scroll axis ('y' or 'x')"],
          ["name", "string | undefined", "Optional name for the instance"],
        ],
      },
      { type: "heading", text: "Type Definitions", level: 3 },
      { type: "code", language: "ts", code: `type Trigger = string | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>;
type Root = HTMLElement | null;
type EventHandler = (event: Event) => void;
type ItCallbackFunction = (trigger: HTMLElement, it: IntersectionTrigger) => void;
type RootValue = \`\${number}\${'%' | 'px'}\`;
type TriggerValue = \`\${number}%\`;
type RootPosition = RootValue | ((it?: IntersectionTrigger) => RootValue);
type TriggerPosition = TriggerValue | ((it?: IntersectionTrigger) => TriggerValue);` },
      { type: "code", language: "ts", code: `interface IntersectionTriggerOptions {
  defaults?: TriggerOptions;
  rootEnter?: RootPosition;
  rootLeave?: RootPosition;
  axis?: string;
  name?: string;
  root?: Root | string;
  guides?: boolean | GuidesOptions;
  onScroll?: EventHandler;
}

interface TriggerOptions {
  enter?: TriggerPosition;
  leave?: TriggerPosition;
  once?: boolean;
  onEnter?: ItCallbackFunction;
  onLeave?: ItCallbackFunction;
  onEnterBack?: ItCallbackFunction;
  onLeaveBack?: ItCallbackFunction;
  toggleClass?: string | ToggleClassOptions[];
  animation?: Anime<AnimeInstance> | AnimationOptions;
}` },
    ],
  },
  {
    id: "plugins",
    title: "Plugins",
    children: [
      { id: "animation-plugin", title: "Animation Plugin" },
      { id: "toggleclass-plugin", title: "ToggleClass Plugin" },
      { id: "guides-plugin", title: "Guides Plugin" },
    ],
    content: [
      { type: "heading", text: "Plugins", level: 2 },
      { type: "heading", text: "Plugin Architecture", level: 3 },
      { type: "paragraph", text: "IntersectionTrigger uses a modular plugin architecture. The core library is lightweight and dependency-free, while optional plugins provide additional features." },
      { type: "code", language: "js", code: `import { IntersectionTrigger, Animation, ToggleClass, Guides } from 'intersectiontrigger';

IntersectionTrigger.registerPlugins([Animation, ToggleClass, Guides]);` },
      {
        type: "table",
        headers: ["Plugin", "Description"],
        rows: [
          ["Animation", "AnimeJS integration for controlled and scroll-linked animations"],
          ["ToggleClass", "Toggle CSS classes on intersection events"],
          ["Guides", "Visual debugging overlays showing trigger and root positions"],
        ],
      },
    ],
  },
  {
    id: "animation-plugin",
    title: "Animation Plugin",
    content: [
      { type: "heading", text: "Animation Plugin", level: 2 },
      { type: "paragraph", text: "The Animation plugin integrates AnimeJS with IntersectionTrigger, providing two animation modes: controlled animations that respond to intersection events, and linked animations that are driven by scroll position." },
      { type: "code", language: "js", code: `import { IntersectionTrigger, Animation } from 'intersectiontrigger';

IntersectionTrigger.registerPlugins([Animation]);`, title: "Registration" },
      {
        type: "table",
        headers: ["Property", "Type", "Default", "Description"],
        rows: [
          ["instance", "AnimeInstance", "required", "An AnimeJS instance or timeline"],
          ["toggleActions", "string", "'play complete reverse complete'", "Space-separated actions for enter/leave/enterBack/leaveBack"],
          ["link", "number | boolean", "false", "Link animation to scrollbar position"],
          ["snap", "SnapConfiguration", "false", "Snap to points after scrolling stops"],
        ],
      },
      { type: "heading", text: "Controlled Animations", level: 3 },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger();

it.add('.box', {
  animation: anime({
    targets: '.box',
    opacity: [0, 1],
    translateY: [50, 0],
    duration: 800,
    autoplay: false
  })
});` },
      { type: "heading", text: "Available Actions", level: 3 },
      {
        type: "table",
        headers: ["Action", "Description"],
        rows: [
          ["play", "Plays the animation forward"],
          ["pause", "Pauses the animation"],
          ["resume", "Resumes a paused animation"],
          ["reverse", "Reverses the animation direction"],
          ["complete", "Jumps to the end and pauses"],
          ["restart", "Restarts from the beginning"],
          ["reset", "Resets to initial state and plays"],
          ["kill", "Permanently kills the animation"],
          ["none", "No action for this event"],
        ],
      },
      { type: "heading", text: "Linked (Scroll-based) Animations", level: 3 },
      { type: "code", language: "js", code: `it.add('.box', {
  animation: {
    instance: anime({
      targets: '.box',
      rotate: '1turn',
      duration: 1000,
      autoplay: false
    }),
    link: true
  }
});` },
      { type: "heading", text: "Snapping System", level: 3 },
      { type: "code", language: "js", code: `it.add('.box', {
  animation: {
    instance: anime({
      targets: '.box',
      translateX: [0, 300],
      duration: 1000,
      autoplay: false
    }),
    link: true,
    snap: {
      to: 0.25,
      after: 0.5,
      speed: 150,
      maxDistance: 600
    }
  }
});` },
    ],
  },
  {
    id: "toggleclass-plugin",
    title: "ToggleClass Plugin",
    content: [
      { type: "heading", text: "ToggleClass Plugin", level: 2 },
      { type: "paragraph", text: "The ToggleClass plugin adds or removes CSS classes on elements when intersection events occur." },
      { type: "code", language: "js", code: `import { IntersectionTrigger, ToggleClass } from 'intersectiontrigger';

IntersectionTrigger.registerPlugins([ToggleClass]);`, title: "Registration" },
      { type: "heading", text: "String Shorthand", level: 3 },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger();

it.add('.box', {
  toggleClass: 'active visible'
});` },
      { type: "heading", text: "Array Configuration", level: 3 },
      {
        type: "table",
        headers: ["Property", "Type", "Default", "Description"],
        rows: [
          ["targets", "Trigger", "trigger element", "Element(s) to toggle classes on"],
          ["classNames", "string", "required", "Space-separated class names to toggle"],
          ["toggleActions", "string", "'add remove add remove'", "Space-separated actions for enter/leave/enterBack/leaveBack"],
        ],
      },
      { type: "code", language: "js", code: `it.add('.card', {
  toggleClass: [
    {
      targets: '.card',
      classNames: 'in-view'
    },
    {
      targets: '.card-title',
      classNames: 'highlight',
      toggleActions: 'add none remove none'
    },
    {
      targets: '.card-body',
      classNames: 'fade-in',
      toggleActions: 'add remove none none'
    }
  ]
});`, title: "Multiple Targets" },
      {
        type: "table",
        headers: ["Keyword", "Action"],
        rows: [
          ["add", "Add the class names"],
          ["remove", "Remove the class names"],
          ["none", "Do nothing"],
        ],
      },
    ],
  },
  {
    id: "guides-plugin",
    title: "Guides Plugin",
    content: [
      { type: "heading", text: "Guides Plugin", level: 2 },
      { type: "paragraph", text: "The Guides plugin renders visual overlays showing where intersection enter and leave positions are." },
      { type: "code", language: "js", code: `import { IntersectionTrigger, Guides } from 'intersectiontrigger';

IntersectionTrigger.registerPlugins([Guides]);

const it = new IntersectionTrigger({
  guides: true
});`, title: "Enabling Guides" },
      { type: "heading", text: "Configuration", level: 3 },
      { type: "code", language: "js", code: `const it = new IntersectionTrigger({
  guides: {
    enter: {
      trigger: {
        backgroundColor: '#009500',
        color: '#000',
        text: 'Enter'
      },
      root: {
        backgroundColor: '#009500',
        color: '#000',
        text: 'Root Enter'
      }
    },
    leave: {
      trigger: {
        backgroundColor: '#ff0000',
        color: '#000',
        text: 'Leave'
      },
      root: {
        backgroundColor: '#ff0000',
        color: '#000',
        text: 'Root Leave'
      }
    }
  }
});` },
      {
        type: "table",
        headers: ["Property", "Type", "Default (Enter)", "Default (Leave)", "Description"],
        rows: [
          ["backgroundColor", "string", "rgb(0, 149, 0)", "#ff0000", "Background color of the guide line"],
          ["color", "string", "#000", "#000", "Text color of the guide label"],
          ["text", "string", "Enter / Root Enter", "Leave / Root Leave", "Label displayed on the guide"],
        ],
      },
    ],
  },
  {
    id: "examples",
    title: "Examples",
    children: [
      { id: "example-basic", title: "Basic Trigger" },
      { id: "example-lazy", title: "Lazy Loading" },
      { id: "example-infinite", title: "Infinite Scroll" },
      { id: "example-controlled", title: "Controlled Animation" },
      { id: "example-linked", title: "Linked Animation" },
      { id: "example-snapping", title: "Snapping" },
    ],
    content: [
      { type: "heading", text: "Examples", level: 2 },
    ],
  },
  {
    id: "example-basic",
    title: "Basic Trigger",
    content: [
      { type: "heading", text: "Basic Trigger", level: 3 },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';

const it = new IntersectionTrigger();

it.add('.box', {
  onEnter(trigger) {
    trigger.classList.add('visible');
    console.log('Element entered:', trigger);
  },
  onLeave(trigger) {
    trigger.classList.remove('visible');
    console.log('Element left:', trigger);
  },
});` },
      { type: "code", language: "html", code: `<div class="box">Watch me!</div>` },
      { type: "code", language: "css", code: `.box {
  width: 200px;
  height: 200px;
  background: #6366f1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.box.visible {
  opacity: 1;
  transform: translateY(0);
}` },
    ],
  },
  {
    id: "example-lazy",
    title: "Lazy Loading",
    content: [
      { type: "heading", text: "Lazy Loading", level: 3 },
      { type: "paragraph", text: "IntersectionTrigger is ideal for lazy loading images using the once: true option." },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';

const it = new IntersectionTrigger();

it.add('img[data-src]', {
  once: true,
  onEnter(trigger) {
    trigger.src = trigger.dataset.src;
    trigger.classList.add('loaded');
  },
});` },
      { type: "code", language: "css", code: `.lazy-image {
  opacity: 0;
  transition: opacity 0.4s ease;
  background: #e2e8f0;
  min-height: 200px;
}

.lazy-image.loaded {
  opacity: 1;
}` },
    ],
  },
  {
    id: "example-infinite",
    title: "Infinite Scroll",
    content: [
      { type: "heading", text: "Infinite Scroll", level: 3 },
      { type: "paragraph", text: "IntersectionTrigger can power infinite scroll patterns using a sentinel element." },
      { type: "code", language: "js", code: `import IntersectionTrigger from 'intersectiontrigger';

const it = new IntersectionTrigger({
  rootEnter: '100%',
});

it.add('#sentinel', {
  onEnter() {
    loadMoreContent();
  },
});

function loadMoreContent() {
  const newItems = fetchNextPage();
  const container = document.getElementById('content-list');
  newItems.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.textContent = item.title;
    container.appendChild(el);
  });
}` },
    ],
  },
  {
    id: "example-controlled",
    title: "Controlled Animation",
    content: [
      { type: "heading", text: "Controlled Animation", level: 3 },
      { type: "paragraph", text: "The Animation plugin lets you tie anime.js animations to intersection events." },
      { type: "code", language: "js", code: `import IntersectionTrigger, { Animation } from 'intersectiontrigger';
import anime from 'animejs';

IntersectionTrigger.registerPlugins([Animation]);

const it = new IntersectionTrigger();

it.add('.element', {
  animation: anime({
    targets: '.element',
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 800,
    easing: 'easeOutCubic',
    autoplay: false,
  }),
});` },
      {
        type: "table",
        headers: ["Value", "Behavior"],
        rows: [
          ["play", "Plays the animation from its current state"],
          ["pause", "Pauses the animation"],
          ["restart", "Restarts the animation from the beginning"],
          ["reverse", "Reverses the animation"],
          ["complete", "Jumps the animation to its end state"],
          ["none", "Does nothing"],
        ],
      },
    ],
  },
  {
    id: "example-linked",
    title: "Linked Animation",
    content: [
      { type: "heading", text: "Linked Animation", level: 3 },
      { type: "paragraph", text: "Linked animations tie animation progress directly to scroll position." },
      { type: "code", language: "js", code: `import IntersectionTrigger, { Animation } from 'intersectiontrigger';
import anime from 'animejs';

IntersectionTrigger.registerPlugins([Animation]);

const it = new IntersectionTrigger();

it.add('.progress-bar', {
  animation: {
    instance: anime({
      targets: '.progress-fill',
      width: '100%',
      duration: 1000,
      easing: 'linear',
      autoplay: false,
    }),
    link: 3,
  },
});` },
      { type: "heading", text: "Link Factor", level: 4 },
      {
        type: "table",
        headers: ["Value", "Behavior"],
        rows: [
          ["true or 1", "Animation progress matches scroll progress 1:1"],
          ["A number > 1", "Animation catches up faster (smoothing is reduced)"],
          ["false", "Disables linking (falls back to controlled animation)"],
        ],
      },
    ],
  },
  {
    id: "example-snapping",
    title: "Snapping",
    content: [
      { type: "heading", text: "Snapping", level: 3 },
      { type: "paragraph", text: "Snapping adds scroll-snap behavior to linked animations." },
      { type: "code", language: "js", code: `import IntersectionTrigger, { Animation } from 'intersectiontrigger';
import anime from 'animejs';

IntersectionTrigger.registerPlugins([Animation]);

const it = new IntersectionTrigger();

it.add('.section', {
  animation: {
    instance: anime({
      targets: '.section',
      scale: [0.8, 1],
      duration: 1000,
      easing: 'linear',
      autoplay: false,
    }),
    link: true,
    snap: {
      to: [0, 0.25, 0.5, 0.75, 1],
      after: 0.5,
      speed: 200,
    },
  },
});` },
      {
        type: "table",
        headers: ["Property", "Type", "Default", "Description"],
        rows: [
          ["to", "number[]", "Required", "Array of progress values (0-1) to snap to"],
          ["after", "number", "0.5", "Seconds to wait after scrolling stops before snapping begins"],
          ["speed", "number", "200", "Snap animation speed (higher = faster)"],
          ["maxDistance", "number", "undefined", "Maximum distance from a snap point to trigger snapping (0-1 scale)"],
        ],
      },
    ],
  },
];

// Navigation structure for sidebar
export interface NavItem {
  id: string;
  title: string;
  children?: NavItem[];
}

export const navStructure: NavItem[] = [
  { id: "introduction", title: "Introduction" },
  { id: "installation", title: "Installation" },
  { id: "quick-start", title: "Quick Start" },
  { id: "core-concepts", title: "Core Concepts" },
  { id: "constructor", title: "Constructor" },
  { id: "callbacks", title: "Callbacks" },
  { id: "methods", title: "Methods" },
  { id: "custom-roots", title: "Custom Roots" },
  { id: "api-reference", title: "API Reference" },
  {
    id: "plugins",
    title: "Plugins",
    children: [
      { id: "animation-plugin", title: "Animation" },
      { id: "toggleclass-plugin", title: "ToggleClass" },
      { id: "guides-plugin", title: "Guides" },
    ],
  },
  {
    id: "examples",
    title: "Examples",
    children: [
      { id: "example-basic", title: "Basic Trigger" },
      { id: "example-lazy", title: "Lazy Loading" },
      { id: "example-infinite", title: "Infinite Scroll" },
      { id: "example-controlled", title: "Controlled Animation" },
      { id: "example-linked", title: "Linked Animation" },
      { id: "example-snapping", title: "Snapping" },
    ],
  },
];
