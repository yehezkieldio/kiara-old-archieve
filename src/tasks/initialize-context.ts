import type { KiaraOptions } from "#/cli";
import type { KiaraConfig } from "#/types/config";
import { currentPackageJsonPath } from "#/lib/constants";
import { getLatestGitTag } from "#/lib/git";
import { logger } from "#/lib/logger";
import { packageMetadata } from "#/lib/package";
import { memoize } from "#/lib/utils";
import { loadConfig } from "c12";
import { ResultAsync } from "neverthrow";

export interface KiaraContext {
    currentVersion: string;
    nextVersion: string | null;
    name: string;
    config: KiaraConfig;
    options: KiaraOptions;
}

function loadKiaraConfig(): ResultAsync<KiaraConfig, Error> {
    return ResultAsync.fromPromise(
        loadConfig<KiaraConfig>({
            name: "kiara",
            defaults: {} as KiaraConfig,
        }),
        error => new Error(`Failed to load config: ${error}`),
    ).map(({ config }) => config);
}

function getName(options: KiaraOptions): ResultAsync<string, Error> {
    if (options.name) {
        return ResultAsync.fromPromise(
            Promise.resolve(options.name),
            () => new Error("Failed to get name from options"),
        );
    }

    return packageMetadata.name(currentPackageJsonPath)
        .map((name) => {
            return name;
        });
}

function getCurrentVersion(): ResultAsync<string, Error> {
    return packageMetadata.version(currentPackageJsonPath).orElse(() => {
        logger.verbose("Falling back to Git tag for current version");
        return getLatestGitTag();
    });
}

const createContext = memoize(() => {
    let contextInstance: ResultAsync<KiaraContext, Error> | null = null;

    return (options: KiaraOptions): ResultAsync<KiaraContext, Error> => {
        if (contextInstance) {
            return contextInstance;
        }

        contextInstance = ResultAsync.combine([
            getCurrentVersion(),
            getName(options),
            loadKiaraConfig(),
        ]).map(([currentVersion, name, config]) => {
            return {
                currentVersion,
                nextVersion: null,
                name,
                config,
                options,
            } as KiaraContext;
        });

        return contextInstance;
    };
});

export function updateContext(context: KiaraContext, nextVersion: string): KiaraContext {
    logger.verbose(`Updating context with next version: ${nextVersion}`);
    return {
        ...context,
        nextVersion,
    };
}

export const initializeContext = createContext();
