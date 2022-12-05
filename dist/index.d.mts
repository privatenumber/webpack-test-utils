import webpack from 'webpack';
import { DirectoryJSON, IFs } from 'memfs';
import { fsRequire } from 'fs-require';

type BaseStats = {
    readonly hash?: string;
    readonly startTime?: number;
    readonly endTime?: number;
    hasWarnings(): boolean;
    hasErrors(): boolean;
    toString(options?: any): string;
};
type BaseConfiguration = {
    plugins?: {
        apply(compiler: any): void;
    }[];
};
type BaseWatching = {
    close: (handler: (error?: Error) => void) => void;
    invalidate: () => void;
};
type BaseCompiler<Stats> = {
    run: (handler: (error?: Error, stats?: Stats) => void) => void;
    watch: (watchOptions: any, handler: (error?: Error, stats?: Stats) => void) => BaseWatching;
};
type BaseWebpack<Configuration = BaseConfiguration, Stats = BaseStats> = {
    (options: Configuration): BaseCompiler<Stats>;
    version?: string;
};

type UnArray<T> = T extends (Array<infer U> | ReadonlyArray<infer U>) ? U : T;
type UnwrapMultiStats<MultiStats> = MultiStats extends {
    stats: Array<infer Stats>;
} ? Stats : MultiStats;
type GetStats<Webpack> = Webpack extends BaseWebpack<any, infer Stats> ? UnwrapMultiStats<NonNullable<Stats>> : BaseStats;
type GetConfig<Webpack> = Webpack extends (options: infer Config) => any ? UnArray<Config> : never;
type ConfigureHook<Configuration extends BaseConfiguration> = (config: Configuration) => void;

declare const build: <Webpack extends BaseWebpack<BaseConfiguration, BaseStats> = typeof webpack>(volJson: DirectoryJSON, configureHook?: ConfigureHook<GetConfig<Webpack>> | undefined, customWebpack?: Webpack | undefined) => Promise<{
    stats: GetStats<Webpack>;
    fs: IFs;
    require: fsRequire;
}>;
declare const watch: <Webpack extends BaseWebpack<BaseConfiguration, BaseStats> = typeof webpack>(volJson: DirectoryJSON, configureHook?: ConfigureHook<GetConfig<Webpack>> | undefined, customWebpack?: Webpack | undefined) => {
    fs: IFs;
    require: fsRequire;
    build(force?: boolean): Promise<GetStats<Webpack>>;
    close(): Promise<void>;
};

export { build, watch };
