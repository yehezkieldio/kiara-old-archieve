import { type Err, type Ok, ResultAsync, err, ok } from "neverthrow";
import type { PackageJson } from "pkg-types";

/**
 * Get the package.json file from the given path.
 * @param path The path to the package.json file.
 */
export function getPackageJson(path: string): ResultAsync<PackageJson, Error> {
    return ResultAsync.fromPromise(
        Bun.file(path).json() as Promise<PackageJson>,
        (error: unknown): Error => new Error(`Failed to read package.json: ${error}`)
    );
}

/**
 * Update the version field in the package.json file.
 * @param path The path to the package.json file.
 * @param newVersion The new version to set in the package.json file.
 */
export function updatePackageVersion(path: string, newVersion: string): ResultAsync<string, Error> {
    const VERSION_REGEX = /^(\s*"version"\s*:\s*)"[^"]*"(.*)$/m;

    /**
     * Match the version field in the package.json file and update it with the new version.
     * @param content The content of the package.json file.
     */
    function matchAndUpdate(content: string): Err<never, Error> | Ok<string, never> {
        if (!VERSION_REGEX.test(content)) {
            return err(new Error(`Version field not found in package.json at ${path}`));
        }

        const updatedContent = content.replace(VERSION_REGEX, `$1"${newVersion}"$2`);
        return ok(updatedContent);
    }

    /**
     * Write the updated content to the package.json file.
     * @param updatedContent The updated content of the package.json file.
     */
    function writePackageJson(updatedContent: string): ResultAsync<string, Error> {
        return ResultAsync.fromPromise(
            Bun.write(path, updatedContent),
            (error: unknown): Error => new Error(`Failed to write package.json: ${error}`)
        ).map((): string => newVersion);
    }

    return ResultAsync.fromPromise(
        Bun.file(path).text(),
        (error: unknown): Error => new Error(`Failed to read package.json: ${error}`)
    )
        .andThen(matchAndUpdate)
        .andThen(writePackageJson);
}
