import fs from 'fs';
import webpack from 'webpack';
import { ufs } from 'unionfs';
import type { IFS } from 'unionfs/lib/fs.js';
import { DirectoryJSON } from 'memfs';
import type { IFs } from 'memfs';
import pDefer, { DeferredPromise } from 'p-defer';
import { createFsRequire } from 'fs-require';
import { ConfigureCompilerPlugin } from './utils/configure-compiler-plugin.js';
import { mfsFromJson } from './utils/mfs-from-json.js';
import { getDefaultWebpackConfig } from './utils/get-default-webpack-config.js';

type Webpack = (options: webpack.Configuration) => any;
type OutputFileSystem = webpack.Compiler['outputFileSystem'];
type fsRequire = ReturnType<typeof createFsRequire>;

function createCompiler<WebpackConfig extends webpack.Configuration>(
	mfs: OutputFileSystem,
	configCallback?: (config: WebpackConfig) => void,
	customWebpack: Webpack = webpack,
) {
	const config = getDefaultWebpackConfig();

	if (configCallback) {
		configCallback(config as WebpackConfig);
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
		inputFileSystem: ufs.use(fs).use(mfs as unknown as IFS),
		outputFileSystem: mfs,
	}));

	return customWebpack(config) as webpack.Compiler;
}

export function build<WebpackConfig extends webpack.Configuration>(
	volJson: DirectoryJSON,
	configCallback?: (config: WebpackConfig) => void,
	customWebpack: Webpack = webpack,
) {
	const mfs = mfsFromJson(volJson);

	return new Promise<{
		stats: webpack.Stats;
		fs: IFs;
		require: fsRequire;
	}>((resolve, reject) => {
		const compiler = createCompiler(mfs, configCallback, customWebpack);

		compiler.run((error, stats) => {
			if (error) {
				reject(error);
				return;
			}

			resolve({
				stats: stats!,
				fs: mfs,
				require: createFsRequire(mfs),
			});
		});
	});
}

export function watch<WebpackConfig extends webpack.Configuration>(
	volJson: DirectoryJSON,
	configCallback?: (config: WebpackConfig) => void,
	customWebpack: Webpack = webpack,
): {
    fs: IFs;
    require: fsRequire;
    build(force?: boolean): Promise<webpack.Stats>;
    close(): Promise<void>;
} {
	const mfs = mfsFromJson(volJson);
	const compiler = createCompiler(mfs, configCallback, customWebpack);

	let watching: webpack.Watching;
	let deferred: DeferredPromise<webpack.Stats> | null = null;

	return {
		fs: mfs,
		require: createFsRequire(mfs),
		async build(force = webpack.version.startsWith('4.')) {
			if (deferred) {
				throw new Error('Build in progress');
			}

			deferred = pDefer();

			if (!watching) {
				watching = compiler.watch({}, async (error, stats) => {
					if (error) {
						deferred?.reject(error);
						deferred = null;
						return;
					}

					deferred?.resolve(stats);
					deferred = null;
				});
			} else if (force) {
				watching.invalidate();
			}

			return await deferred.promise;
		},
		close() {
			return new Promise<void>((resolve, reject) => {
				watching.close((error) => {
					if (error) {
						return reject(error);
					}
					resolve();
				});
			});
		},
	};
}
