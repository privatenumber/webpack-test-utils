export type BaseStats = {
	readonly hash?: string;
	readonly startTime?: number;
	readonly endTime?: number;
	hasWarnings(): boolean;
	hasErrors(): boolean;
	toString(options?: any): string;
};

export type BaseConfiguration = {
	plugins?: {
		apply(compiler: any): void;
	}[];
};

export type BaseWatching = {
	close: (
		handler: () => void
	) => void;

	invalidate: () => void;
}

type CallbackFunction<T> = (error?: null | Error, result?: T) => any;

type BaseCompiler<Stats> = {
	run: (
		handler: CallbackFunction<Stats>,
	) => void;

	watch: (
		watchOptions: any,
		handler: CallbackFunction<Stats>,
	) => BaseWatching;
}

export type BaseWebpack<
	Configuration = BaseConfiguration,
	Stats = BaseStats,
> = {
	(options: Configuration): BaseCompiler<Stats>;
	version?: string;
}
