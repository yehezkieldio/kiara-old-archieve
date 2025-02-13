import { ResultAsync, okAsync } from "neverthrow";
import type { PackageJson } from "pkg-types";
import { detectJsonIndentation, safeJsonStringify } from "#/libs/utils";

function loadPackageJson(path: string): ResultAsync<PackageJson, Error> {
    return ResultAsync.fromPromise(
        Bun.file(path, { type: "application/json" }).json() as Promise<PackageJson>,
        (error: unknown): Error => new Error(`Failed to load package.json: ${error}`)
    );
}

function getPackageName(pkg: PackageJson): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(Promise.resolve(pkg.name ?? ""), (): Error => new Error("Package name not found"));
}

function getPackageDescription(pkg: PackageJson): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        Promise.resolve(pkg.description ?? ""),
        (): Error => new Error("Package description not found")
    );
}

function getPackageVersion(pkg: PackageJson): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        Promise.resolve(pkg.version ?? ""),
        (): Error => new Error("Package version not found")
    );
}

function updatePackageVersion(path: string, version: string): ResultAsync<void, Error> {
    const indentation: ResultAsync<string, Error> = ResultAsync.fromPromise(
        detectJsonIndentation(path),
        (error: unknown): Error => new Error(`Failed to detect indentation: ${error}`)
    );

    return indentation.andThen(
        (indent: string): ResultAsync<undefined, Error> =>
            loadPackageJson(path).andThen((pkg: PackageJson): ResultAsync<undefined, Error> => {
                const updatedPkg = { ...pkg, version };

                return ResultAsync.fromPromise(
                    Bun.file(path)
                        .text()
                        .then((originalContent: string): Promise<number> => {
                            const endsWithNewline: boolean = originalContent.endsWith("\n");
                            const formatted: string =
                                safeJsonStringify(updatedPkg, null, indent) + (endsWithNewline ? "\n" : "");

                            return Bun.write(path, formatted);
                        }),
                    (error: unknown): Error => new Error(`Failed to write package.json: ${error}`)
                ).andThen((): ResultAsync<undefined, never> => okAsync(undefined));
            })
    );
}

export const manifest = {
    load: loadPackageJson,
    getName: getPackageName,
    getDescription: getPackageDescription,
    getVersion: getPackageVersion,
    updateVersion: updatePackageVersion,
};
