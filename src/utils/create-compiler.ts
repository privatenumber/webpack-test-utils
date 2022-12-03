import fs from 'fs';
import webpack, { type OutputFileSystem } from 'webpack';
import type { IFs } from 'memfs';
import { Union } from 'unionfs';
import type { IFS } from 'unionfs/lib/fs.js';
import type {
	BaseConfiguration,
	BaseWebpack,
} from '../webpack-types.js';
import type { ConfigureHook } from '../types.js';
import { ConfigureCompilerPlugin } from './configure-compiler-plugin.js';
import { getDefaultWebpackConfig } from './get-default-webpack-config.js';

export function createCompiler<
	WebpackConfiguration extends BaseConfiguration,
>(
	mfs: IFs,
	configureHook?: ConfigureHook<WebpackConfiguration>,
	webpackCompiler: BaseWebpack<WebpackConfiguration> = webpack,
) {
	const config = getDefaultWebpackConfig() as WebpackConfiguration;

	if (configureHook) {
		configureHook(config);
	}

	if (!Array.isArray(config.plugins)) {
		config.plugins = [];
	}

	/**
	 * Inject memfs into the compiler before internal dependencies initialize
	 * (eg. PackFileCacheStrategy)
	 *
	 * https://github.com/webpack/webpack/blob/068ce839478317b54927d533f6fa4713cb6834da/lib/webpack.js#L69-L77
	 */
	config.plugins.unshift(new ConfigureCompilerPlugin({
		inputFileSystem: (new Union()).use(fs).use(mfs as unknown as IFS),
		outputFileSystem: mfs as unknown as OutputFileSystem,
	}));

	return webpackCompiler(config);
}
