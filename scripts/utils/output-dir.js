const fs = require('fs');

const outputDir = './dist';

module.exports = {
	outputDir,
	createOutputDir: () => {
		if (fs.existsSync(outputDir)) {
			console.log('Directory already exists.');
			return;
		}

		fs.mkdirSync(outputDir);
	}
};
