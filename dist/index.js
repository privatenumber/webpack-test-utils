'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var webpack = require('webpack');
var unionfs = require('unionfs');
var fsRequire = require('fs-require');
var path = require('path');
var memfs = require('memfs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var webpack__default = /*#__PURE__*/_interopDefaultLegacy(webpack);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

function pDefer() {
	const deferred = {};

	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

	return deferred;
}

class ConfigureCompilerPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    Object.assign(compiler, this.options);
  }
}

const mfsFromJson = (volJson) => {
  const mfs = memfs.createFsFromVolume(memfs.Volume.fromJSON(volJson));
  Object.assign(mfs, {
    join: path__default["default"].join
  });
  return mfs;
};

const getDefaultWebpackConfig = () => ({
  mode: "production",
  target: "node",
  context: "/",
  entry: {
    index: "/src/index.js"
  },
  resolve: {
    modules: [
      path__default["default"].resolve("node_modules"),
      "node_modules"
    ]
  },
  resolveLoader: {
    modules: [
      path__default["default"].resolve("node_modules"),
      "node_modules"
    ]
  },
  module: {
    rules: []
  },
  optimization: {
    minimize: false
  },
  output: {
    filename: "[name].js",
    path: "/dist",
    libraryTarget: "commonjs2",
    libraryExport: "default"
  },
  plugins: []
});

function createCompiler(mfs, configCallback, customWebpack = webpack__default["default"]) {
  const config = getDefaultWebpackConfig();
  if (configCallback) {
    configCallback(config);
  }
  if (!Array.isArray(config.plugins)) {
    config.plugins = [];
  }
  config.plugins.unshift(new ConfigureCompilerPlugin({
    inputFileSystem: unionfs.ufs.use(fs__default["default"]).use(mfs),
    outputFileSystem: mfs
  }));
  return customWebpack(config);
}
function build(volJson, configCallback, customWebpack = webpack__default["default"]) {
  const mfs = mfsFromJson(volJson);
  return new Promise((resolve, reject) => {
    const compiler = createCompiler(mfs, configCallback, customWebpack);
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({
        stats,
        fs: mfs,
        require: fsRequire.createFsRequire(mfs)
      });
    });
  });
}
function watch(volJson, configCallback, customWebpack = webpack__default["default"]) {
  const mfs = mfsFromJson(volJson);
  const compiler = createCompiler(mfs, configCallback, customWebpack);
  let watching;
  let deferred = null;
  return {
    fs: mfs,
    require: fsRequire.createFsRequire(mfs),
    async build(force = webpack__default["default"].version.startsWith("4.")) {
      if (deferred) {
        throw new Error("Build in progress");
      }
      deferred = pDefer();
      if (!watching) {
        watching = compiler.watch({}, async (error, stats) => {
          if (error) {
            deferred == null ? void 0 : deferred.reject(error);
            deferred = null;
            return;
          }
          deferred == null ? void 0 : deferred.resolve(stats);
          deferred = null;
        });
      } else if (force) {
        watching.invalidate();
      }
      return await deferred.promise;
    },
    close() {
      return new Promise((resolve, reject) => {
        watching.close((error) => {
          if (error) {
            return reject(error);
          }
          resolve();
        });
      });
    }
  };
}

exports.build = build;
exports.watch = watch;
