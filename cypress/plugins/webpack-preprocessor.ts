import webpack from '@cypress/webpack-preprocessor';

const webpackPreprocessor = (on, config) => {
	const defaults = webpack.defaultOptions;
	defaults.webpackOptions!.resolve = { extensions: ['.tsx', '.ts', '.js'] };

	defaults.webpackOptions?.module?.rules?.push({
		test: /\.tsx?$/,
		exclude: /node_modules/,
		use: {
			loader: 'babel-loader',
			options: {
				presets: ['@babel/preset-typescript'],
				plugins: ['istanbul']
			}
		}
	});

	on('file:preprocessor', webpack(defaults));
	return config;
};

export default webpackPreprocessor;
