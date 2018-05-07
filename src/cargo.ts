import { dirname, format as formatPath, join as joinPath, parse as parsePath } from 'path';
import { BuildConfig, LoaderContext } from './interfaces';
import { execPromise, fileExists, readPromise, reverseString } from './utils';

/** Parses a Cargo/rust dependency file (ex. '/target/debug/lib.d') */
const parseDependencies = (data: string, wasmFile: string) =>
    data
        .split('\n')
        .filter(str => str.startsWith(wasmFile))
        .map(str => str.slice(str.indexOf(': ') + 2))
        .map(reverseString)
        .map(str => str.split(/(?: (?!\\))+/))
        .reduce((allDeps, lineDeps) => [...allDeps, ...lineDeps], [])
        .map(reverseString)
        .map(str => str.replace(/\\ /g, ' '));

/** Find the root directory of the cargo project */
export const findCargoDir = async (startFrom: string) => {
    const parseStart = parsePath(startFrom);
    const root = parseStart.root;

    let candidate = parseStart.dir;

    while (candidate !== root) {
        if (await fileExists(joinPath(candidate, 'Cargo.toml'))) {
            return candidate;
        }

        candidate = dirname(candidate);
    }

    return null;
};

/** Builds a project using the wasm32-unknown-unknown target */
export const build = async (self: LoaderContext, { rootDir, target, release, gc }: BuildConfig) => {
    const cmd = `cargo build --message-format=json --target=${target}${release ? ' --release' : ''}`;
    const result = await execPromise(cmd, { cwd: rootDir });

    let hasError = false;
    let wasmFile;

    for (const line of result.stdout.split('\n')) {
        if (/^\s*$/.test(line)) {
            continue;
        }

        const lineData = JSON.parse(line);
        const reason = lineData.reason;

        if (reason === 'compiler-artifact') {
            wasmFile = lineData.filenames.find((filename: string) => filename.endsWith('.wasm'));
            break;
        } else if (reason === 'compiler-message') {
            const { level, rendered } = lineData.message;

            if (level === 'warning') {
                self.emitWarning(rendered);
            } else if (level === 'error') {
                self.emitError(rendered);
                hasError = true;
            }
        }
    }

    if (hasError) {
        throw new Error('Cargo build failed');
    }

    if (!wasmFile) {
        throw new Error('No wasm output');
    }

    const depFile = formatPath({ ...parsePath(wasmFile), ext: 'd' });
    const depContents = await readPromise(depFile, 'utf8');
    const deps = parseDependencies(depContents, wasmFile.replace(' ', '\\ '));

    if (gc) {
        const gcFile = formatPath({ ...parsePath(wasmFile), ext: 'gc.wasm' });
        const gcCmd = `wasm-gc ${wasmFile} ${gcFile}`;

        await execPromise(gcCmd);

        wasmFile = gcFile;
    }

    return { wasmFile, deps };
};
