import fs from 'fs';

const outputDir = './dist';
const createOutputDir = () => {
	if (fs.existsSync(outputDir)) {
		console.log('Directory already exists.');
		return;
	}

	fs.mkdirSync(outputDir);
};

export { outputDir, createOutputDir };
