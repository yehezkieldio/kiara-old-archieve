import { ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext, KiaraOptions } from "#/kiara";
import { CWD_PACKAGE_PATH } from "#/libs/constants";
import { getPackageJson, pkg } from "#/libs/pkg";

/**
 * If the name option is empty, get the name from the package.json file. Otherwise, return the name option.
 * @param options The Kiara options.
 */
function getName(options: KiaraOptions): ResultAsync<string, Error> {
    if (options.name === "") {
        return getPackageJson(CWD_PACKAGE_PATH).andThen(pkg.name);
    }

    return okAsync(options.name);
}

/**
 * Get the version from the package.json file.
 */
function getVersion(): ResultAsync<string, Error> {
    return getPackageJson(CWD_PACKAGE_PATH).andThen(pkg.version);
}

export function createContext(options: KiaraOptions): ResultAsync<KiaraContext, Error> {
    return ResultAsync.combine([getName(options), getVersion()]).map(([name, version]): KiaraContext => {
        return {
            version: {
                current: version,
                new: "",
            },
            options: {
                ...options,
                name: name,
            },
        } as KiaraContext;
    });
}

export function updateNewVersion(context: KiaraContext, newVersion: string): KiaraContext {
    return {
        ...context,
        version: {
            ...context.version,
            new: newVersion,
        },
    };
}
