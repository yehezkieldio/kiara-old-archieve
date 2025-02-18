import { type Result, type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext, KiaraOptions } from "#/kiara";
import { CWD_PACKAGE_PATH } from "#/libs/const";
import { getPackageJson, getPackageName, getPackageVersion } from "#/libs/package-json";
import {
    type RepositoryMetadata,
    extractRepositoryMetadata,
    getGitToken,
    getRepositoryUrl,
} from "#/libs/util";
import { createDefaultContext } from "#/tasks/context";

export function createContext(options: KiaraOptions): ResultAsync<KiaraContext, Error> {
    return createDefaultContext(options)
        .andThen(enrichWithToken)
        .asyncAndThen(enrichWithVersion)
        .andThen(enrichWithPackageName)
        .andThen(enrichWithRepository);
}

/**
 * If the name option is empty, get the name from the package.json file. Otherwise, return the name option.
 * @param options The Kiara options.
 */
function getName(options: KiaraOptions): ResultAsync<string, Error> {
    if (options.name.trim() === "") {
        return getPackageJson(CWD_PACKAGE_PATH).andThen(getPackageName);
    }

    return okAsync(options.name);
}

/**
 * Get the version from the package.json file.
 */
function getVersion(): ResultAsync<string, Error> {
    return getPackageJson(CWD_PACKAGE_PATH).andThen(getPackageVersion);
}

/**
 * Enrich the context with the authentication token.
 * @param context The Kiara context.
 */
function enrichWithToken(context: KiaraContext): Result<KiaraContext, Error> {
    return getGitToken(context).map(
        (token: string): KiaraContext => ({
            ...context,
            options: {
                ...context.options,
                token,
            },
        })
    );
}

/**
 * Enrich the context with the current version.
 * @param context The Kiara context.
 */
function enrichWithVersion(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return getVersion().map(
        (version: string): KiaraContext => ({
            ...context,
            version: {
                ...context.version,
                current: version,
            },
        })
    );
}

/**
 * Enrich the context with the package name.
 * @param context The Kiara context.
 */
function enrichWithPackageName(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return getName(context.options).map(
        (name: string): KiaraContext => ({
            ...context,
            options: {
                ...context.options,
                name,
            },
        })
    );
}

/**
 * Enrich the context with the repository metadata.
 * @param context The Kiara context.
 */
function enrichWithRepository(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return getRepositoryUrl().andThen(
        (url: string): Result<KiaraContext, Error> =>
            extractRepositoryMetadata(url).map(
                (metadata: RepositoryMetadata): KiaraContext => ({
                    ...context,
                    git: {
                        ...context.git,
                        repository: metadata,
                    },
                })
            )
    );
}
