export default {
	filter: /.*/,
	namespace: '',
	config: {
		presets: [
			[
				'@babel/preset-env',
				{
					useBuiltIns: 'entry',
					corejs: 3.37
				}
			],
			'@babel/preset-typescript'
		]
	}
};
