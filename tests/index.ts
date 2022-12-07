import { describe, expect } from 'manten';
import { VueLoaderPlugin } from 'vue-loader';
import webpack4 from 'webpack';
import webpack5 from 'webpack5';
import { build, watch } from '#webpack-test-utils';

describe('webpack-test-utils', ({ describe, test }) => {
	test('build', async () => {
		const volume = {
			'/src/index.js': 'export default "12345"',
		};

		const built = await build(volume);

		expect<webpack4.Stats>(built.stats);
		expect(built.stats.hasErrors()).toBe(false);
		expect(built.stats.hasWarnings()).toBe(false);

		expect(built.require('/dist')).toBe('12345');
	});

	test('config defaults', async () => {
		await build(
			{},
			(config) => {
				expect<webpack4.RuleSetRule[]>(config.module!.rules).toEqual([]);
				expect<webpack4.Configuration['plugins']>(config.plugins).toEqual([]);
			},
		);
	});

	test('customize config', async () => {
		const volume = {
			'/src/index.vue': '<template>Hello world</template>',
		};

		const built = await build(
			volume,
			(config) => {
				(config.entry as webpack5.EntryObject).index = '/src/index.vue';

				config.module!.rules!.push({
					test: /\.vue$/,
					loader: 'vue-loader',
				});

				config.plugins!.push(new VueLoaderPlugin());
			},
		);

		expect(built.stats.hasErrors()).toBe(false);
		expect(built.stats.hasWarnings()).toBe(false);

		const component = built.require('/dist');

		component.ssrRender(null, (value: string) => {
			expect(value).toBe('Hello world');
		});
	});

	test('minifies', async () => {
		const built = await build(
			{
				'/src/index.js': 'const variableName = "1234"; export default variableName',
			},
			(config) => {
				config.optimization!.minimize = true;
			},
		);

		expect(built.stats.hasErrors()).toBe(false);
		expect(built.stats.hasWarnings()).toBe(false);

		const minified = built.fs.readFileSync('/dist/index.js', 'utf8');
		expect(minified).not.toMatch('variableName');
	});

	test('watch', async () => {
		const volume = {
			'/src/index.js': 'export default "12345"',
		};

		const watching = watch(volume);
		let stats = await watching.build();

		expect<webpack4.Stats>(stats);
		expect(stats.hasWarnings()).toBe(false);
		expect(stats.hasErrors()).toBe(false);

		expect(watching.require('/dist')).toBe('12345');

		await watching.fs.promises.writeFile('/src/index.js', 'export default "54321"');

		stats = await watching.build();
		expect(stats.hasWarnings()).toBe(false);
		expect(stats.hasErrors()).toBe(false);

		delete watching.require.cache[watching.require.resolve('/dist')];
		expect(watching.require('/dist')).toBe('54321');

		await watching.close();
	});

	describe('Custom Webpack', ({ describe }) => {
		describe('Webpack 4', ({ test }) => {
			test('build', async () => {
				const built = await build(
					{},
					(config) => {
						expect<webpack4.RuleSetRule[]>(config.module!.rules).toEqual([]);
						expect<webpack4.Configuration['plugins']>(config.plugins).toEqual([]);
					},
					webpack4,
				);

				expect<webpack4.Stats>(built.stats);
			});

			test('watch', async () => {
				const volume = {
					'/src/index.js': 'export default "12345"',
				};

				const watching = watch(volume, undefined, webpack4);
				let stats = await watching.build();

				expect<webpack4.Stats>(stats);
				expect(stats.hasWarnings()).toBe(false);
				expect(stats.hasErrors()).toBe(false);

				expect(watching.require('/dist')).toBe('12345');

				await watching.fs.promises.writeFile('/src/index.js', 'export default "54321"');

				stats = await watching.build();
				expect(stats.hasWarnings()).toBe(false);
				expect(stats.hasErrors()).toBe(false);

				delete watching.require.cache[watching.require.resolve('/dist')];
				expect(watching.require('/dist')).toBe('54321');

				await watching.close();
			});
		});

		describe('Webpack 5', ({ test }) => {
			test('build', async () => {
				const built = await build(
					{},
					(config) => {
						expect<webpack5.ModuleOptions['rules']>(config.module!.rules).toEqual([]);
						expect<webpack5.Configuration['plugins']>(config.plugins).toEqual([]);
					},
					webpack5,
				);

				expect<webpack5.Stats>(built.stats);
			});

			test('watch', async () => {
				const volume = {
					'/src/index.js': 'export default "12345"',
				};

				const watching = watch(volume, undefined, webpack5);
				let stats = await watching.build();

				expect<webpack5.Stats>(stats);
				expect(stats.hasWarnings()).toBe(false);
				expect(stats.hasErrors()).toBe(false);

				expect(watching.require('/dist')).toBe('12345');

				await watching.fs.promises.writeFile('/src/index.js', 'export default "54321"');

				stats = await watching.build();
				expect(stats.hasWarnings()).toBe(false);
				expect(stats.hasErrors()).toBe(false);

				delete watching.require.cache[watching.require.resolve('/dist')];
				expect(watching.require('/dist')).toBe('54321');

				await watching.close();
			});
		});
	});
});
