import { ResultAsync } from "neverthrow";

/**
 * Check if a file exists.
 * @param path The path to the file.
 */
export function fileExists(path: string): ResultAsync<boolean, Error> {
    return ResultAsync.fromPromise(
        Bun.file(path).exists(),
        (error: unknown): Error => new Error(`Error checking if file exists: ${error}`)
    );
}
