import type { PackageJson } from "type-fest";
import { logger } from "#/lib/logger";
import { memoize } from "#/lib/utils";
import { ResultAsync } from "neverthrow";

function loadPackageManifest(path: string): ResultAsync<PackageJson, Error> {
    return ResultAsync.fromPromise(
        Bun.file(path).json() as Promise<PackageJson>,
        error => new Error(`Failed to load package.json: ${error}`),
    );
}

const getPackageName = memoize(() => {
    let nameInstance: ResultAsync<string, Error> | null = null;

    return (path: string): ResultAsync<string, Error> => {
        if (nameInstance) {
            logger.verbose("Using cached package name");
            return nameInstance;
        }

        nameInstance = loadPackageManifest(path)
            .andThen(pkg =>
                pkg.name
                    ? ResultAsync.fromPromise(
                            Promise.resolve(pkg.name),
                            () => new Error("Failed to get package name"),
                        )
                    : ResultAsync.fromPromise(
                            Promise.reject(new Error("Package name not found in package.json")),
                            error => error as Error,
                        ),
            );

        return nameInstance;
    };
});

const getPackageVersion = memoize(() => {
    let versionInstance: ResultAsync<string, Error> | null = null;

    return (path: string): ResultAsync<string, Error> => {
        if (versionInstance) {
            logger.verbose("Using cached package version");
            return versionInstance;
        }

        versionInstance = loadPackageManifest(path)
            .andThen(pkg =>
                pkg.version
                    ? ResultAsync.fromPromise(
                            Promise.resolve(pkg.version),
                            () => new Error("Failed to get package version"),
                        )
                    : ResultAsync.fromPromise(
                            Promise.reject(new Error("Package version not found in package.json")),
                            error => error as Error,
                        ),
            );

        return versionInstance;
    };
});

export const packageMetadata = {
    json: loadPackageManifest,
    name: getPackageName(),
    version: getPackageVersion(),
};
