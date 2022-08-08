/*
* IntersectionTrigger v1.0.0 
* IntersectionTrigger is a robust JavaScript toolset that turns developers into animation superheroes. Build high-performance animations that work in **every** major browser.
* https://sunshine-themes.com
*
* Copyright 2022, Sunshine. All rights reserved.
* @license: Released under the Standard 'no charge' license: https://sunshine-themes.com/standard-license License.
* @author: Sherif Magdy, sherifmagdy@sunshine-themes.com
*
* Released on: August 8, 2022
*/

import IntersectionTrigger from "./core/core.esm.js";
import ToggleClass from "./plugins/toggleclass.esm.js";
import Guides from "./plugins/guides.esm.js";
import Animation from "./plugins/animation.esm.js";
const plugins = [
  ToggleClass,
  Guides,
  Animation
];
IntersectionTrigger.registerPlugins(plugins);
var temp_intersectiontrigger_bundle_default = IntersectionTrigger;
export {
  temp_intersectiontrigger_bundle_default as default
};
