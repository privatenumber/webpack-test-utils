import webpack from 'webpack';
import { DirectoryJSON } from 'memfs';
import type { IFs } from 'memfs';
import pDefer, { DeferredPromise } from 'p-defer';
import { createFsRequire, type fsRequire } from 'fs-require';
import { mfsFromJson } from './utils/mfs-from-json.js';
import type {
	BaseWatching,
	BaseWebpack,
} from './webpack-types.js';
import type {
	GetStats,
	GetConfig,
	ConfigureHook,
} from './types.js';
import { createCompiler } from './utils/create-compiler.js';

export const build = <Webpack extends BaseWebpack = typeof webpack>(
	volJson: DirectoryJSON,
	configureHook?: ConfigureHook<GetConfig<Webpack>>,
	customWebpack?: Webpack,
) => {
	const mfs = mfsFromJson(volJson);

	return new Promise<{
		stats: GetStats<Webpack>;
		fs: IFs;
		require: fsRequire;
	}>((resolve, reject) => {
		const compiler = createCompiler(mfs, configureHook, customWebpack);

		compiler.run((error, stats) => {
			if (error) {
				reject(error);
				return;
			}

			resolve({
				stats: stats as GetStats<Webpack>,
				fs: mfs,
				require: createFsRequire(mfs),
			});
		});
	});
};

export const watch = <Webpack extends BaseWebpack = typeof webpack>(
	volJson: DirectoryJSON,
	configureHook?: ConfigureHook<GetConfig<Webpack>>,
	customWebpack?: Webpack,
): {
    fs: IFs;
    require: fsRequire;
    build(force?: boolean): Promise<GetStats<Webpack>>;
    close(): Promise<void>;
} => {
	const mfs = mfsFromJson(volJson);
	const compiler = createCompiler(mfs, configureHook, customWebpack);

	let watching: BaseWatching | undefined;
	let deferred: DeferredPromise<GetStats<Webpack>> | null = null;

	return {
		fs: mfs,
		require: createFsRequire(mfs),
		async build(
			force = (customWebpack ?? webpack).version?.startsWith('4.'),
		) {
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

					deferred?.resolve(stats as GetStats<Webpack>);
					deferred = null;
				});
			} else if (force) {
				watching.invalidate();
			}

			return await deferred.promise;
		},
		close: () => new Promise<void>((resolve, reject) => {
			if (!watching) {
				resolve();
				return;
			}

			watching.close((error) => {
				if (error) {
					return reject(error);
				}
				resolve();
			});
		}),
	};
};
