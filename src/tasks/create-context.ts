import { ResultAsync } from "neverthrow";
import type { KiaraBumpOptions, KiaraConfig, KiaraContext } from "#/kiara";
import { config } from "#/libs/config";
import { CWD_PACKAGE_JSON_PATH } from "#/libs/constants";
import { manifest } from "#/libs/manifest";

function getName(options: KiaraBumpOptions): ResultAsync<string, Error> {
    if (options.name) {
        return ResultAsync.fromPromise(
            Promise.resolve(options.name),
            (): Error => new Error("Failed to get name from options")
        );
    }

    return manifest.load(CWD_PACKAGE_JSON_PATH).andThen(manifest.getName);
}

function getVersion(): ResultAsync<string, Error> {
    return manifest.load(CWD_PACKAGE_JSON_PATH).andThen(manifest.getVersion);
}

export function createContext(options: KiaraBumpOptions): ResultAsync<KiaraContext, Error> {
    return ResultAsync.combine([getVersion(), getName(options), config.load()]).map(
        ([currentVersion, name, config]: [string, string, KiaraConfig]): KiaraContext => ({
            currentVersion,
            nextVersion: options.skipBump ? currentVersion : "",
            config,
            options: {
                name: options.name ?? name,
                ...options,
            },
        })
    );
}

export function updateNextVersion(context: KiaraContext, nextVersion: string): KiaraContext {
    return {
        ...context,
        nextVersion,
    };
}
