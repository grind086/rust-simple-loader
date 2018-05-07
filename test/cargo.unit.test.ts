/// <reference types="jest" />

import { parseDependencies } from '../src/cargo';

describe('parseDependencies - unix style', () => {
    it('should only return dependencies of the wasm file', () => {
        const wasmFile = '/path/to/project/target/wasm32-unknown-unknown/lib.wasm';
        const depsFile = [
            String.raw`/path/to/project/target/wasm32-unknown-unknown/lib.wasm: /path/to/project/src/lib.rs /path/to/project/src/some_module.rs`,
            String.raw`/path/to/project/target/wasm32-unknown-unknown/lib.dll: /path/to/project/src/lib.rs /path/to/project/src/some_module.rs`
        ].join('\n');

        const deps = parseDependencies(depsFile, wasmFile);

        expect(deps.includes(wasmFile)).toBe(false);
        expect(deps.includes('/path/to/project/src/lib.rs')).toBe(true);
        expect(deps.includes('/path/to/project/src/some_module.rs')).toBe(true);
    });

    it('should handle spaces in paths', () => {
        const wasmFile = String.raw`/path/to/project\ with\ spaces/target/wasm32-unknown-unknown/lib.wasm`;
        const depsFile = [
            String.raw`/path/to/project\ with\ spaces/target/wasm32-unknown-unknown/lib.wasm: /path/to/project\ with\ spaces/src/lib.rs /path/to/project\ with\ spaces/src/some_module.rs`
        ].join('\n');

        const deps = parseDependencies(depsFile, wasmFile);

        expect(deps.includes(wasmFile)).toBe(false);
        expect(deps.includes('/path/to/project with spaces/src/lib.rs')).toBe(true);
        expect(deps.includes('/path/to/project with spaces/src/some_module.rs')).toBe(true);
    });
});

describe('parseDependencies - windows style', () => {
    it('should only return dependencies of the wasm file', () => {
        const wasmFile = String.raw`C:\path\to\project\target\wasm32-unknown-unknown\lib.wasm`;
        const depsFile = [
            String.raw`C:\path\to\project\target\wasm32-unknown-unknown\lib.wasm: C:\path\to\project\src\lib.rs C:\path\to\project\src\some_module.rs`,
            String.raw`C:\path\to\project\target\wasm32-unknown-unknown\lib.dll: C:\path\to\project\src\other_lib.rs C:\path\to\project\src\some_other_module.rs`
        ].join('\n');

        const deps = parseDependencies(depsFile, wasmFile);

        expect(deps.includes(wasmFile)).toBe(false);
        expect(deps.includes(String.raw`C:\path\to\project\src\lib.rs`)).toBe(true);
        expect(deps.includes(String.raw`C:\path\to\project\src\some_module.rs`)).toBe(true);
    });

    it('should handle spaces in paths', () => {
        const wasmFile = String.raw`C:\path\to\project\ with\ spaces\target\wasm32-unknown-unknown\lib.wasm`;
        const depsFile = [
            String.raw`C:\path\to\project\ with\ spaces\target\wasm32-unknown-unknown\lib.wasm: C:\path\to\project\ with\ spaces\src\lib.rs C:\path\to\project\ with\ spaces\src\some_module.rs`
        ].join('\n');

        const deps = parseDependencies(depsFile, wasmFile);

        expect(deps.includes(wasmFile)).toBe(false);
        expect(deps.includes(String.raw`C:\path\to\project with spaces\src\lib.rs`)).toBe(true);
        expect(deps.includes(String.raw`C:\path\to\project with spaces\src\some_module.rs`)).toBe(true);
    });
});
