import { describe, expect } from 'manten';
import { VueLoaderPlugin } from 'vue-loader';
import type webpack from 'webpack';
import { build, watch } from '../src/index';

describe('webpack-test-utils', ({ test }) => {
	test('build', async () => {
		const volume = {
			'/src/index.js': 'export default "12345"',
		};

		const built = await build(volume);

		expect(built.stats.hasErrors()).toBe(false);
		expect(built.stats.hasWarnings()).toBe(false);

		expect(built.require('/dist')).toBe('12345');
	});

	test('config defaults', async () => {
		await build({}, (config) => {
			expect<webpack.ModuleOptions['rules']>(config.module.rules).toEqual([]);
			expect<webpack.Configuration['plugins']>(config.plugins).toEqual([]);
		});
	});

	test('customize config', async () => {
		const volume = {
			'/src/index.vue': '<template>Hello world</template>',
		};

		const built = await build(volume, (config) => {
			config.entry.index = '/src/index.vue';

			config.module.rules.push({
				test: /\.vue$/,
				loader: 'vue-loader',
			});

			config.plugins.push(new VueLoaderPlugin());
		});

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
});
