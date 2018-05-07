import { getOptions } from 'loader-utils';
import { join as joinPath } from 'path';
import { build, findCargoDir } from './cargo';
import { LoaderContext } from './interfaces';
import { readPromise } from './utils';

const load = async (self: LoaderContext) => {
    const options = {
        gc: true,
        target: 'wasm32-unknown-unknown',
        release: true,
        ...(getOptions(<any>self) || {})
    };

    const rootDir = await findCargoDir(self.resourcePath);

    if (!rootDir) {
        throw new Error(`Unable to find Cargo.toml`);
    }

    const { wasmFile, deps } = await build(self, { ...options, rootDir });
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
