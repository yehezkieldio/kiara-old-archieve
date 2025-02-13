import { CWD_PACKAGE_JSON_PATH } from "#/libs/constants";
import { logger } from "#/libs/logger";
import { ok, Result, ResultAsync } from "neverthrow";

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
 * Takes an object and returns a JSON string.
 * @param obj - The object to format.
 * @returns A promise that resolves to the formatted JSON string.
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

/**
 * Takes an object and returns a formatted JSON string with an indentation that matches the package.json file.
 * @param obj - The object to format.
 * @returns A promise that resolves to the formatted JSON string.
 */
export async function formatObject(obj: unknown): Promise<string> {
    const indentation: ResultAsync<string, Error> = ResultAsync.fromPromise(
        detectJsonIndentation(CWD_PACKAGE_JSON_PATH),
        (error: unknown): Error => new Error(`Failed to detect indentation: ${error}`),
    );

    return indentation.andThen(
        (indent: string): Result<string, unknown> => safeJsonStringify(obj, null, indent).map(
            line => line.replace(/"([^"]+)":/g, "$1:"),
        ),
    ).andThen((json: string): Result<string, never> => ok(json)).match(
        (value: string): string => value,
        (error: unknown): never => {
            throw new Error(`Failed to format object: ${error}`);
        },
    );
}
