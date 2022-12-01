import path from 'path';
import type webpack from 'webpack';

// type SetDefault<Obj, Defaults> = Obj & {
//     [Key in keyof Defaults]: (
//         Key extends keyof Obj
//             ? SetDefault<Obj[Key], Defaults[Key]>
//             : Defaults[Key]
//      );
// };

export const getDefaultWebpackConfig = (): webpack.Configuration => ({
	mode: 'production',
	target: 'node',

	/**
	 * This defaults to cwd, so it can yield different distributions
	 * based on cwd path (eg. on CI)
	 */
	context: '/',

	entry: {
		index: '/src/index.js',
	},

	/**
	 * Since we can't use "context", manually specify cwd/node_modules
	 */
	resolve: {
		modules: [
			path.resolve('node_modules'),
			'node_modules',
		],
	},

	resolveLoader: {
		modules: [
			path.resolve('node_modules'),
			'node_modules',
		],
	},

	module: {
		rules: [] as NonNullable<webpack.ModuleOptions['rules']>,
	},

	optimization: {
		minimize: false,

		/**
		 * Ideally, chunkIds: 'named' and moduleIds: 'named' are set
		 * but seems the config is different between Webpack 4 and 5
		 *
		 * https://webpack.js.org/migrate/5/#update-outdated-options
		 */
	},

	output: {
		filename: '[name].js',
		path: '/dist',
		libraryTarget: 'commonjs2',
		libraryExport: 'default',
	},

	plugins: [], // as NonNullable<webpack.Configuration['plugins']>,
});

// {
// 	const config =  as const;

// 	return config as SetDefault<typeof config, webpack.Configuration>;
// };
