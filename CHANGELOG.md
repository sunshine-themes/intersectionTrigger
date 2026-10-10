# Changelog

## [2.0.1](https://github.com/sunshine-themes/intersectionTrigger/compare/v2.0.0...v2.0.1) (2026-10-10)


### Bug Fixes

* **animation:** schedule timers on the instance's window, not the module realm ([b8743cf](https://github.com/sunshine-themes/intersectionTrigger/commit/b8743cf8e9729061d5458713c5d5ec0522033349))
* **build:** inject "sideEffects": false into the published dist manifest ([cb4e88e](https://github.com/sunshine-themes/intersectionTrigger/commit/cb4e88ebdc695d4d69e57db2c7572407bb800d21))
* **types:** accept structural AnimationPlayer instances in the animation option ([9706e71](https://github.com/sunshine-themes/intersectionTrigger/commit/9706e71f0acfd07e7b2cb3ea47f6b9e5a155d304))

## [2.0.0](https://github.com/sunshine-themes/intersectionTrigger/compare/v1.1.7...v2.0.0) (2026-10-08)


### ⚠ BREAKING CHANGES

* **core,animation:** the library now targets animejs v4. The peer dependency moved from `animejs ^3.2.2` to `^4.0.0` and `@types/animejs` is no longer used (v4 ships its own types). The public `AnimeInstance` type is now the v4 `JSAnimation | Timeline` union instead of the v3 `anime.AnimeInstance | anime.AnimeTimelineInstance`. The snap option's `to: 'marks'` value is renamed to `to: 'labels'` (v4 timeline labels), and the `kill` toggle action now calls v4's `revert()`. Consumers on animejs v3 should stay on 1.x.

### Features

* **core,animation:** correctness fixes, performance and scroll-linked smoothing ([bce382b](https://github.com/sunshine-themes/intersectionTrigger/commit/bce382bc08f92002a5e031e80d1ae02908cc513e))
* **math:** expose the pure math helpers through a public ./math subpath ([ce4c7d8](https://github.com/sunshine-themes/intersectionTrigger/commit/ce4c7d85db2173e696aa2839103ae6e5f7b78e22))
* **types:** export the IntersectionTrigger class as a named export ([91f1470](https://github.com/sunshine-themes/intersectionTrigger/commit/91f147075d2a4bf5aab87a4e098070db35e07bd0))


### Bug Fixes

* **types:** point the root and core exports entries at declarations ([4866888](https://github.com/sunshine-themes/intersectionTrigger/commit/4866888f7d3afb1358fcec210132937679ca2a3d))

## [1.1.7](https://github.com/sunshine-themes/intersectionTrigger/compare/v1.1.6...v1.1.7) (2026-04-02)


### Features

* add documentation website (Astro + Starlight + React + Tailwind) ([68860e2](https://github.com/sunshine-themes/intersectionTrigger/commit/68860e2fd3bf24ed4c6d4ec468c49173354e6317))


### Bug Fixes

* improve color contrast and expand navigation sections ([56dac9a](https://github.com/sunshine-themes/intersectionTrigger/commit/56dac9a8f26befe32c0832eebb4aa0e6573c066a))
* use createRequire for package.json import in banner.ts ([88d06c4](https://github.com/sunshine-themes/intersectionTrigger/commit/88d06c4d1bb05cca523c2de7e17384f510ed36fc))

## [1.1.6](https://github.com/sunshine-themes/intersectionTrigger/compare/v1.1.5...1.1.6) (2023-05-18)

## [1.1.5](https://github.com/sunshine-themes/intersectionTrigger/compare/v1.1.4...v1.1.5) (2023-05-18)


### Bug Fixes

* **core:** 'enter' & 'enterBack' events is Not triggered if root is custom element ([7170e24](https://github.com/sunshine-themes/intersectionTrigger/commit/7170e24935e17fe105ea156106f3df208acd443f))
* **core:** 'getRootRect' is now getting the root bounding correctly when the root is an element ([74103cb](https://github.com/sunshine-themes/intersectionTrigger/commit/74103cb7a9aab5d6bcc25002388008ade4de96ab))
* **guides:** fixed the root guides are not positioned correctly ([e8e2be0](https://github.com/sunshine-themes/intersectionTrigger/commit/e8e2be03224cf8aa5c338721bed3b905e642b9c7))
* **guides:** root guides is not positioned correctly if the root is custom element ([49c16e8](https://github.com/sunshine-themes/intersectionTrigger/commit/49c16e8d8da3a78b02bfd1a38da96c59f1405ece))
* **guides:** the guides are not visible when instantiated in an iframe in firefox ([f971c3b](https://github.com/sunshine-themes/intersectionTrigger/commit/f971c3b873337f0839372d4e8e03fb8af8d456a3))

## [1.1.4](https://github.com/sunshine-themes/intersectionTrigger/compare/v1.1.3...v1.1.4) (2023-05-07)


### Bug Fixes

* **core:** 'kill' static method is now killing all instances correctly ([f3c9d18](https://github.com/sunshine-themes/intersectionTrigger/commit/f3c9d186816b69891fe9f7327c16a769f1716460))
* **core:** correct 'oCbFirstInvoke' case logic ([b54f8e6](https://github.com/sunshine-themes/intersectionTrigger/commit/b54f8e61da2303936af79be94fb4db382366d5ce))
* **core:** fixing types ([390b3cd](https://github.com/sunshine-themes/intersectionTrigger/commit/390b3cde7a5f45b4ad4687a8321408bc43ffbf2d))
* **core:** when 'once' option is true, the trigger removed without raising an error ([ca5944b](https://github.com/sunshine-themes/intersectionTrigger/commit/ca5944bf10c20f6889cde3b350fd8e64e7d3b09f))
* **helpers:** refactor 'is.doc' function ([732d468](https://github.com/sunshine-themes/intersectionTrigger/commit/732d468aa9e2f43758b0d66a7bb52c18863ca2d2))
* **helpers:** replace "in" keyword with "hasOwnProperty" in "inObject" method ([75764b7](https://github.com/sunshine-themes/intersectionTrigger/commit/75764b7aee65d79e3178c5604d993aadf4a4389d))
* **helpers:** trim the string first then split it in 'splitStr' function ([da8c458](https://github.com/sunshine-themes/intersectionTrigger/commit/da8c4589840d2bd164035b982659886788eeb803))

## [1.1.3](https://github.com/sunshine-themes/intersectionTrigger/compare/v1.1.2...v1.1.3) (2023-03-13)


### Bug Fixes

* **core:** add 'NodeJS.Timeout' type to 'snapTimeOutId' property ([a18f117](https://github.com/sunshine-themes/intersectionTrigger/commit/a18f11769c955adba0a36591d25c6d558b155147))
