import type {
	BaseStats,
	BaseConfiguration,
	BaseWebpack,
} from './webpack-types.js';

type UnArray<T> = T extends (Array<infer U> | ReadonlyArray<infer U>) ? U : T;

type UnwrapMultiStats<MultiStats> = MultiStats extends { stats: Array<infer Stats> }
	? Stats
	: MultiStats;

export type GetStats<Webpack> = Webpack extends BaseWebpack<any, infer Stats>
	? UnwrapMultiStats<NonNullable<Stats>>
	: BaseStats

export type GetConfig<Webpack> = Webpack extends (options: infer Config) => any
	? UnArray<Config>
	: never

export type ConfigureHook<Configuration extends BaseConfiguration> = (
	config: Configuration,
) => void;
