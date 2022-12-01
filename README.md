# webpack-test-utils <a href="https://npm.im/webpack-test-utils"><img src="https://badgen.net/npm/v/webpack-test-utils"></a> <!-- <a href="https://npm.im/webpack-test-utils"><img src="https://badgen.net/npm/dm/webpack-test-utils"></a> --><a href="https://packagephobia.now.sh/result?p=webpack-test-utils"><img src="https://packagephobia.now.sh/badge?p=webpack-test-utils"></a>

Utility functions to test Webpack loaders/plugins

### Features
- **In-memory builds** Uses an in-memory file-system for faster builds that don't pollute your disk
- **TypeScript support** Get type hints and develop with confidence
- **Sensible defaults** Builds in production-mode by default with minification disabled
- **Webpack 4 & 5 support** Both versions are supported

## 🚀 Install
```bash
npm i -D webpack-test-utils
```

## 👨‍🏫 Usage

### Build
```js
import { build } from 'webpack-test-utils'

test('build', async () => {
    // Create in-memory file-system
    const volume = {
        '/src/index.js': 'export default "12345"'
    }

    // Run Webpack build
    const built = await build(volume)

    // Verify successful build
    expect(built.stats.hasErrors()).toBe(false)
    expect(built.stats.hasWarnings()).toBe(false)

    // Run the code to verify result
    expect(built.require('/dist/index.js')).toBe('12345')
})
```

### Watch
```js
import { watch } from 'webpack-test-utils'

test('watch', async () => {
    // Create in-memory file-system
    const volume = {
        '/src/index.js': 'export default "12345"'
    }

    // Create Webpack watcher
    const watching = watch(volume)

    // Create build
    let stats = await watching.build()

    // Verify result
    expect(stats.hasWarnings()).toBe(false)
    expect(watching.require('/dist')).toBe('12345')

    // Update source code
    watching.fs.writeFileSync('/src/index.js', 'export default "54321"')

    // Rebuild
    stats = await watching.build()

    expect(stats.hasWarnings()).toBe(false)

    // Delete cache and re-require to validate changed result
    delete watching.require.cache[watching.require.resolve('/dist')]
    expect(watching.require('/dist')).toBe('54321')

    // Close watcher
    await watching.close()
})
```


## ⚙️ API

### build(volume, configHook)

Returns: `Promise<WebpackStats>`

Run a single Webpack build.
#### volume

Type: `{ [filePath: string]: string }`

Required

An object where the key is the absolute path, and the value is the content of the path.

#### configHook

Type: `(config: WebpackConfiguration) => void`

A function that receives the Webpack configuration object so that it can be mutated before running the build.


### watch(volume, configHook)

Returns: `Promise<WebpackStats>`

Run a single Webpack build.
#### volume

Type: `{ [filePath: string]: string }`

Required

An object where the key is the absolute path, and the value is the content of the path.

#### configHook

Type: `(config: WebpackConfiguration) => void`

A function that receives the Webpack configuration object so that it can be mutated before running the build.



### Default Webpack configuration

See [`src/utils/get-default-webpack-config.ts`](/src/utils/get-default-webpack-config.ts).
