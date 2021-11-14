import webpack from 'webpack';
import { DirectoryJSON, IFs } from 'memfs';
import { createFsRequire } from 'fs-require';

declare const getDefaultWebpackConfig: () => {
    mode: "production";
    target: string;
    /**
     * This defaults to cwd, so it can yield different distributions
     * based on cwd path (eg. on CI)
     */
    context: string;
    entry: {
        index: string;
    };
    /**
     * Since we can't use "context", manually specify cwd/node_modules
     */
    resolve: {
        modules: string[];
    };
    resolveLoader: {
        modules: string[];
    };
    module: {
        rules: (webpack.RuleSetRule | "...")[];
    };
    optimization: {
        minimize: boolean;
    };
    output: {
        filename: string;
        path: string;
        libraryTarget: string;
        libraryExport: string;
    };
    plugins: (((this: webpack.Compiler, compiler: webpack.Compiler) => void) | webpack.WebpackPluginInstance)[];
};
declare type DefaultWebpackConfig = ReturnType<typeof getDefaultWebpackConfig>;

declare type Webpack = (options: webpack.Configuration) => any;
declare type fsRequire = ReturnType<typeof createFsRequire>;
declare function build<WebpackConfig extends webpack.Configuration>(volJson: DirectoryJSON, configCallback?: (config: WebpackConfig & DefaultWebpackConfig) => void, customWebpack?: Webpack): Promise<{
    stats: webpack.Stats;
    fs: IFs;
    require: fsRequire;
}>;
declare function watch<WebpackConfig extends webpack.Configuration>(volJson: DirectoryJSON, configCallback?: (config: WebpackConfig & DefaultWebpackConfig) => void, customWebpack?: Webpack): {
    fs: IFs;
    require: fsRequire;
    build(force?: boolean): Promise<webpack.Stats>;
    close(): Promise<void>;
};

export { DefaultWebpackConfig, build, watch };
