# rust-simple-loader

A simple loader that uses rust's `wasm32-unknown-unknown` target to compile projects to WebAssembly. This loader is meant for use in conjunction with something like [wasm-loader](https://github.com/ballercat/wasm-loader) or [file-loader](https://github.com/webpack-contrib/file-loader).

```
~$: yarn add -D rust-simple-loader
```

### Configuration

`rust-simple-loader` currently has three configuration options.

* `gc` (default: `true`): Whether or not to run [wasm-gc](https://github.com/alexcrichton/wasm-gc) on the build. Note that `wasm-gc` must be visible in your environment's path for this to work.
* `target` (default: `wasm32-unknown-unknown`): The compile target for `rustc`. This *must* be a target that outputs a `.wasm` file.
* `release` (default: `true`): Whether to use the release flag on compile. Eventually I would like to deprecate this option in favor of simply using webpack's [mode](https://webpack.js.org/concepts/mode/) option, but it isn't currently visible to loaders. Builds should be faster, but have a larger output file size with this set to false.

### Use with [wasm-loader](https://github.com/ballercat/wasm-loader)

[wasm-loader](https://github.com/ballercat/wasm-loader) will inline the compiled WebAssembly and automatically compile it for you. This is great for small modules, but can drastically increase increase file sizes for large modules. An example configuration looks something like the following:

```javascript
module: {
    rules: [
        {
            test: /\.rs/,
            use: [
                { loader: 'wasm-loader' },
                {
                    loader: 'rust-native-wasm-loader',
                    options: { gc: true }
                }
            ]
        }
    ];
}
```

And would be used like this:

```typescript
import * as loadWasm from './rust_project/rust.rs';

loadWasm().then((result: WebAssembly.ResultObject) => {
    // Do something with your module
});
```

### Use with [file-loader](https://github.com/webpack-contrib/file-loader)

[file-loader](https://github.com/webpack-contrib/file-loader) will keep your WebAssembly file separate, but that means you have to load it yourself. Luckily this is fairly straightforward. An example configuration could look like:

```javascript
const mode = 'development';

module: {
    rules: [
        {
            test: /\.rs/,
            use: [
                { loader: 'file-loader', options: { name: 'wasm/[hash].wasm' } },
                ,
                {
                    loader: 'rust-native-wasm-loader',
                    options: { gc: true }
                }
            ]
        }
    ];
}
```

And would be used like this:

```typescript
import * as wasmPath from './rust_project/rust.rs';

const imports = {};

WebAssembly.instantiateStreaming(fetch(wasmPath), imports).then((result: WebAssembly.ResultObject) => {
    // Do something with your module
});
```

One caveat of this approach is that your server must be configured to use the `application/wasm` MIME type when serving `.wasm` files.
