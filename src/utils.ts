import { exec } from 'child_process';
import { readFile, stat } from 'fs';
import { promisify } from 'util';

export const execPromise = promisify(exec);
export const readPromise = promisify(readFile);
export const statPromise = promisify(stat);

/** Checks whether a file exists. */
export const fileExists = async (filename: string) => {
    try {
        statPromise(filename);
        return true;
    } catch (e) {
        if (e.code === 'ENOENT') {
            return false;
        }

        throw e;
    }
};

/** Reverses a string */
export const reverseString = (str: string) =>
    str
        .split('')
        .reverse()
        .join('');
