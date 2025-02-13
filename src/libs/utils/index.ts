import { logger } from "#/libs/logger";
import { Result, ResultAsync } from "neverthrow";

/**
 * Detects the indentation of a JSON file at the specified path.
 * @param path - The path of the JSON file.
 * @returns A promise that resolves to the indentation found in the file.
 */
export async function detectJsonIndentation(path: string): Promise<string> {
    const content: string = await Bun.file(path).text();
    const match: RegExpMatchArray | null = content.match(/^[ \t]+/m);
    return match ? match[0] : "  ";
}

/**
 * Checks if a file exists at the specified path.
 * @param path - The path of the file to check.
 * @returns A ResultAsync that resolves to true if the file exists, or an Error otherwise.
 */
export function fileExists(path: string): ResultAsync<boolean, Error> {
    return ResultAsync.fromPromise(
        Bun.file(path).exists() as Promise<boolean>,
        (error: unknown): Error => new Error(`Error checking if file exists: ${error}`),
    );
}

/**
 * Wraps JSON.stringify in a Result to catch any errors that may occur.
 */
export const safeJsonStringify = Result.fromThrowable(JSON.stringify);

/**
 * Handles an error by logging the error message and exiting the process.
 * @param error - The error to handle.
 */
export function handleError(error: Error): void {
    logger.error(error.message);
    process.exit(1);
}
