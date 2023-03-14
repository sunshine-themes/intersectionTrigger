const capitalize = name => {
	return name
		.split('-')
		.map(word => {
			return word
				.split('')
				.map((char, index) => {
					if (index === 0) return char.toUpperCase();
					return char;
				})
				.join('');
		})
		.join('');
};

module.exports = { capitalize };
