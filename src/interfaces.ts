/**
 * Simple configuration for the `cargo build` command.
 */
export interface BuildConfig {
    /** The directory containing Cargo.toml */
    rootDir: string;

    /** The build target to use - usually `wasm32-unknown-unknown` (MUST output .wasm files). */
    target: string;

    /** Whether or not to set the release flag */
    release: boolean;

    /** Whether or not to run wasm-gc */
    gc: boolean;
}

/**
 * A partial description of a webpack loader context. See https://webpack.js.org/api/loaders/#the-loader-context.
 */
export interface LoaderContext {
    /** The resource file. */
    resourcePath: string;

    /** A boolean flag. It is set when in debug mode. */
    debug: boolean;

    /** Tells the loader-runner that the loader intends to call back asynchronously. */
    async(): (err: Error | undefined, content?: string | Buffer) => void;

    /** Adds a file as dependency of the loader result in order to make them watchable. */
    addDependency(file: string): void;

    /** Emit a warning. */
    emitWarning(message: string): void;

    /** Emit an error. */
    emitError(message: string): void;
}
