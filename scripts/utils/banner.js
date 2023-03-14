const fs = require('fs-extra');
const pkg = require('../../package.json');

const date = {
	day: new Date().getDate(),
	month: 'January February March April May June July August September October November December'.split(' ')[new Date().getMonth()],
	year: new Date().getFullYear()
};

function banner(name = null) {
	return `${`
/*
* IntersectionTrigger v${pkg.version} ${name ? `\n* @subpackage ${name}\n` : ''}
* ${pkg.description}
* ${pkg.homepage}
*
* Copyright ${date.year}, Sunshine. All rights reserved.
* @license: Released under the ${pkg.license}.
* @author: ${pkg.author}, ${pkg.maintainers[0].email}
*
* Released on: ${date.month} ${date.day}, ${date.year}
*/
`.trim()}\n`;
}

async function addBannerToFile(file, name) {
	const content = await fs.readFile(file, 'utf-8');
	await fs.writeFile(file, `${banner(name)}\n${content}`);
}

module.exports = { banner, addBannerToFile };
