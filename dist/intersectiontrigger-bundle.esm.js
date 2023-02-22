/*
* IntersectionTrigger v1.1.1 
* IntersectionTrigger utilizes the most modern web technology to trigger anything by intersection. Including scroll-based animations.
* https://sunshine-themes.com/?appID=ss_app_1
*
* Copyright 2023, Sunshine. All rights reserved.
* @license: Released under the personal 'no charge' license can be viewed at http://sunshine-themes.com/?appID=ss_app_1&tab=license, Licensees of commercial or business license are granted additional rights. See http://sunshine-themes.com/?appID=ss_app_1&tab=license for details..
* @author: Sherif Magdy, sherifmagdy@sunshine-themes.com
*
* Released on: February 22, 2023
*/

import IntersectionTrigger from "./core/core.esm.js";
import ToggleClass from "./plugins/toggleclass/toggleclass.esm.js";
import Guides from "./plugins/guides/guides.esm.js";
import Animation from "./plugins/animation/animation.esm.js";
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
