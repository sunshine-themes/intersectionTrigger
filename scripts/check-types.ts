import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

//Consumer-fixture smoke test: stages a fake install of the built package in a temp dir and compiles
//a fixture that imports every public entry by package name, with moduleResolution "bundler" (what
//bundler-based consumers use). Catches exports-map gaps (missing "types" conditions, TS7016) and
//drift of the published declarations — neither `npm run build` nor the Cypress suite surfaces them.

const consumerFixture = `
import IntersectionTrigger, { Animation, Guides, ToggleClass } from 'intersectiontrigger';
import { expFollowFactor, parseMarginString } from 'intersectiontrigger/math';
import type { AnimeInstance, AnimationOptions, AnimationPlayer, MathRect } from 'intersectiontrigger/types';
import type { JSAnimation } from 'animejs';

declare const animeInstance: AnimeInstance;
//AnimeInstance must stay the real animejs union — "progress"/"then" exist on the animejs classes
//but not on a hand-rolled structural subset, so these two lines fail if the type regresses
const progress = animeInstance.progress;
const resolved = animeInstance.then;

//AnimationOptions.instance accepts the animejs union OR a structural AnimationPlayer — each union
//member gets its own tripwire so a regression on either side fails here
const options: AnimationOptions = { instance: {} as JSAnimation, smooth: 100 };
const facadePlayer: AnimationPlayer = {
	currentTime: 0,
	duration: 0,
	paused: true,
	completed: false,
	reversed: false,
	seek: () => {},
	play: () => {},
	pause: () => {},
	reverse: () => {},
	restart: () => {},
	reset: () => {},
	revert: () => {}
};
const playerOptions: AnimationOptions = { instance: facadePlayer, smooth: 100 };
const realPlayer: AnimationPlayer = {} as JSAnimation;
const rect: MathRect = { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
const margin = parseMarginString('10% 20px');
const follow = expFollowFactor(16.7, 100);

export { IntersectionTrigger, Animation, Guides, ToggleClass, progress, resolved, options, playerOptions, realPlayer, rect, margin, follow };
`;

async function checkTypes() {
	const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'intersectiontrigger-typecheck-'));
	try {
		await fs.outputFile(path.join(fixtureDir, 'consumer.ts'), consumerFixture);
		await fs.outputJson(path.join(fixtureDir, 'tsconfig.json'), {
			compilerOptions: {
				strict: true,
				noEmit: true,
				skipLibCheck: true,
				target: 'es2020',
				module: 'esnext',
				moduleResolution: 'bundler'
			},
			include: ['consumer.ts']
		});

		const nodeModules = path.join(fixtureDir, 'node_modules');
		await fs.copy('./dist', path.join(nodeModules, 'intersectiontrigger'));
		await fs.copy('./node_modules/animejs', path.join(nodeModules, 'animejs'));

		const tsc = path.resolve('./node_modules/typescript/bin/tsc');
		const { status } = spawnSync(process.execPath, [tsc, '-p', fixtureDir], { stdio: 'inherit' });
		if (status !== 0) {
			throw new Error(`published-types check failed (tsc exit code ${status}) — see the errors above`);
		}
	} finally {
		await fs.remove(fixtureDir);
	}
}

checkTypes().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
