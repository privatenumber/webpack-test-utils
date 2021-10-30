import type { Compiler } from 'webpack';

type CompilerOptions = Partial<Compiler>;

export class ConfigureCompilerPlugin {
	options: CompilerOptions;

	constructor(options: CompilerOptions) {
		this.options = options;
	}

	apply(compiler: Compiler) {
		Object.assign(compiler, this.options);
	}
}
