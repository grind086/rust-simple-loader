import { join as joinPath } from 'path';
import { build, findCargoDir } from './cargo';
import { BuildConfig, LoaderContext } from './interfaces';
import { readPromise } from './utils';

const load = async (self: LoaderContext) => {
    const rootDir = await findCargoDir(self.resourcePath);

    if (!rootDir) {
        throw new Error(`Unable to find Cargo.toml`);
    }

    const buildConfig: BuildConfig = {
        rootDir,
        target: 'wasm32-unknown-unknown',
        release: !self.debug,
        gc: true
    };

    const { wasmFile, deps } = await build(self, buildConfig);
    const wasmData = await readPromise(wasmFile);

    self.addDependency(joinPath(rootDir, 'Cargo.toml'));

    for (const dep of deps) {
        self.addDependency(dep);
    }

    return wasmData;
};

module.exports = function(this: LoaderContext) {
    const cb = this.async();
    load(this).then(result => cb(undefined, result), error => cb(error));
};
