/*
* IntersectionTrigger v1.0.3 
* IntersectionTrigger utilizes the most modern web technology to trigger anything by intersection. Including scroll-based animations.
* https://sunshine-themes.com/?appID=ss_app_1
*
* Copyright 2022, Sunshine. All rights reserved.
* @license: Released under the personal 'no charge' license can be viewed at http://sunshine-themes.com/?appID=ss_app_1&tab=license, Licensees of commercial or business license are granted additional rights. See http://sunshine-themes.com/?appID=ss_app_1&tab=license for details..
* @author: Sherif Magdy, sherifmagdy@sunshine-themes.com
*
* Released on: December 29, 2022
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
