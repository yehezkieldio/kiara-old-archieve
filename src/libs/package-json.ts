import { type Result, ResultAsync, err, ok } from "neverthrow";

/**
 * Partial package.json file structure.
 */
export interface PackageJson {
    name: string;
    version: string;
    description: string;
    homepage: string;
}

/**
 * Get the package.json file from the provided path.
 * @param path The path to the package.json file.
 */
export function getPackageJson(path: string): ResultAsync<PackageJson, Error> {
    return ResultAsync.fromPromise(
        Bun.file(path).json(),
        (error: unknown): Error => new Error(`Failed to read package.json: ${error}`)
    );
}

/**
 * Take a package.json object and aggregate the package name.
 * @param pkg The package.json object.
 */
export function getPackageName(pkg: PackageJson): Result<string, Error> {
    return pkg.name ? ok(pkg.name) : err(new Error("Name field not found in package.json"));
}

/**
 * Take a package.json object and aggregate the version field.
 * @param pkg The package.json object.
 */
export function getPackageVersion(pkg: PackageJson): Result<string, Error> {
    return pkg.version
        ? ok(pkg.version)
        : err(new Error("Version field not found in package.json"));
}

/**
 * Take a package.json object and aggregate the description field.
 * @param pkg The package.json object.
 */
export function getPackageDescription(pkg: PackageJson): Result<string, Error> {
    return pkg.description
        ? ok(pkg.description)
        : err(new Error("Description field not found in package.json"));
}

/**
 * Update the version field in the package.json file.
 * @param path The path to the package.json file.
 * @param newVersion The new version to set in the package.json file.
 */
export function updatePackageVersion(path: string, newVersion: string): ResultAsync<string, Error> {
    const VERSION_REGEX = /^(\s*"version"\s*:\s*)"[^"]*"(.*)$/m;

    /**
     * Get the package.json file as text.
     * @param path The path to the package.json file.
     */
    function getPackageJsonAsText(path: string): ResultAsync<string, Error> {
        return ResultAsync.fromPromise(
            Bun.file(path).text(),
            (error: unknown): Error => new Error(`Failed to read package.json: ${error}`)
        );
    }

    /**
     * Match the version field in the package.json file and update it with the new version.
     * @param content The content of the package.json file.
     */
    function matchAndUpdate(content: string): Result<string, Error> {
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

    return getPackageJsonAsText(path).andThen(matchAndUpdate).andThen(writePackageJson);
}
