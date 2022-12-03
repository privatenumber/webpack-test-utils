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
		handler: (error?: Error) => void
	) => void;

	invalidate: () => void;
}

type BaseCompiler<Stats> = {
	run: (
		handler: (error?: Error, stats?: Stats) => void,
	) => void;

	watch: (
		watchOptions: any,
		handler: (error?: Error, stats?: Stats) => void,
	) => BaseWatching;
}

export type BaseWebpack<
	Configuration = BaseConfiguration,
	Stats = BaseStats,
> = {
	(options: Configuration): BaseCompiler<Stats>;
	version?: string;
}