import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import { peerDependencies, dependencies } from './package.json';

export default defineConfig([
	{
		input: 'src/index.ts',
		plugins: [
			nodeResolve(),
			commonjs(),
			esbuild(),
		],
		external: [
			...Object.keys(peerDependencies),
			...Object.keys(dependencies),
		],
		output: {
			format: 'cjs',
			file: 'dist/index.js',
		},
	},
	{
		input: 'src/index.ts',
		plugins: [
			dts(),
		],
		output: {
			format: 'cjs',
			file: 'dist/index.d.ts',
		},
	},
]);
