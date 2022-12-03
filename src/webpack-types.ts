export type BaseStats = {
	readonly hash?: string;
	readonly startTime: any;
	readonly endTime: any;
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

export type BaseWebpack<
	// Remve extends?
	Configuration extends BaseConfiguration = BaseConfiguration,
	Stats = any,
> = (
	options: Configuration,
) => {
	run: (
		handler: (error?: Error, stats?: Stats) => void,
	) => void;

	watch: (
		watchOptions: any,
		// Would like to chang error: any to error: Error but it breaks the tests
		handler: (error?: any, stats?: Stats) => void,
	) => BaseWatching;
};