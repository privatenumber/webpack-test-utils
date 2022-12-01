import webpack from 'webpack';
import { DirectoryJSON, IFs } from 'memfs';
import { createFsRequire } from 'fs-require';

type Webpack = (options: webpack.Configuration) => any;
type fsRequire = ReturnType<typeof createFsRequire>;
declare function build<WebpackConfig extends webpack.Configuration>(volJson: DirectoryJSON, configCallback?: (config: WebpackConfig) => void, customWebpack?: Webpack): Promise<{
    stats: webpack.Stats;
    fs: IFs;
    require: fsRequire;
}>;
declare function watch<WebpackConfig extends webpack.Configuration>(volJson: DirectoryJSON, configCallback?: (config: WebpackConfig) => void, customWebpack?: Webpack): {
    fs: IFs;
    require: fsRequire;
    build(force?: boolean): Promise<webpack.Stats>;
    close(): Promise<void>;
};

export { build, watch };
