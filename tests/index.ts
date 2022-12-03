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

	test('watch', async () => {
		const volume = {
			'/src/index.js': 'export default "12345"',
		};

		const watching = watch(volume);
		let stats = await watching.build();

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

	describe('Custom Webpack', ({ test }) => {
		test('supports Webpack 4 types', async () => {
			const built = await build(
				{},
				(config) => {
					expect<webpack4.RuleSetRule[]>(config.module!.rules).toEqual([]);
					expect<webpack4.Configuration['plugins']>(config.plugins).toEqual([]);
				},
				webpack4,
			);

			expect<webpack4.Stats>(built.stats);

			console.log(built);
		});

		test('supports Webpack 5 types', async () => {
			const built = await build(
				{},
				(config) => {
					expect<webpack5.ModuleOptions['rules']>(config.module!.rules).toEqual([]);
					expect<webpack5.Configuration['plugins']>(config.plugins).toEqual([]);
				},
				webpack5,
			);

			expect<webpack5.Stats>(built.stats);
			console.log(built);
		});

		test('watch', async () => {
			const built = await build(
				{},
				(config) => {
					expect<webpack5.ModuleOptions['rules']>(config.module!.rules).toEqual([]);
					expect<webpack5.Configuration['plugins']>(config.plugins).toEqual([]);
				},
				webpack5,
			);

			expect<webpack5.Stats>(built.stats);
			console.log(built);
		});
	});
});
