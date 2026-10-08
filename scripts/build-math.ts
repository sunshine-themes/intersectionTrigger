import fs from 'fs-extra';
import { build } from 'esbuild';
import { buildConfig } from './build-config';
import { outputDir } from './utils/output-dir';

async function buildMath() {
	//esm only, like the other outputs; the d.ts lands at the dist root so the "./math" exports condition can point at it
	//(dist/types/math.d.ts is the separate copy serving the root entry's `export * from './types/math'`)
	await build(buildConfig({ data: { entryPath: 'math', outPath: 'math', name: 'math' } }));
	await fs.copy('./src/types/math.d.ts', `./${outputDir}/math.d.ts`);
}

export default buildMath;
