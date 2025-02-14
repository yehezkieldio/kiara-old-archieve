import { join } from "node:path";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { CWD, CWD_GIT_CLIFF_CONFIG_PATH, CWD_PACKAGE_JSON_PATH } from "#/libs/constants";
import { logger } from "#/libs/logger";
import { fileExists } from "#/libs/utils";

export function preflightEnvironment(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return checkGithubToken(context)
        .asyncAndThen(checkPackageJson)
        .andThen(checkGitCliffConfig)
        .andThen(checkKiaraConfig)
        .andTee((): void => logger.verbose("Preflight checks for the environment passed successfully."))
        .map((): KiaraContext => context);
}

function checkGithubToken(context: KiaraContext): Result<void, Error> {
    if (!context.config.github?.release) {
        return ok(undefined);
    }

    if (!context.options.githubToken && !process.env.GITHUB_TOKEN) {
        return err(new Error("Could not find a GitHub token in the environment or options!"));
    }

    logger.verbose("Found GitHub token in the environment or options.");

    return ok(undefined);
}

function checkPackageJson(): ResultAsync<void, Error> {
    return fileExists(CWD_PACKAGE_JSON_PATH)
        .andTee((): void => logger.verbose(`Found package.json at ${CWD_PACKAGE_JSON_PATH}`))
        .andThen((exists: boolean) => {
            return exists
                ? ok(undefined)
                : err(new Error("Could not find a package.json file in the current directory"));
        });
}

function checkGitCliffConfig(): ResultAsync<void, Error> {
    return fileExists(CWD_GIT_CLIFF_CONFIG_PATH)
        .andTee((): void => logger.verbose(`Found cliff.toml at ${CWD_GIT_CLIFF_CONFIG_PATH}`))
        .andThen((exists: boolean) => {
            return exists ? ok(undefined) : err(new Error("Could not find a cliff.toml file in the current directory"));
        });
}

function checkKiaraConfig(): ResultAsync<void, Error> {
    const extensions: string[] = [".js", ".ts", ".mjs", ".cjs", ".mts", ".cts", ".json"];
    const configFiles: string[] = extensions.map((ext: string): string => `kiara.config${ext}`);

    const fileChecks: ResultAsync<boolean, Error>[] = configFiles.map(
        (file: string): ResultAsync<boolean, Error> =>
            fileExists(join(CWD, file)).andTee((exists: boolean): void =>
                exists ? logger.verbose(`Found ${file} at ${join(CWD, file)}`) : undefined
            )
    );

    return ResultAsync.combine(fileChecks)
        .map((results: boolean[]): boolean => results.some((exists: boolean): boolean => exists))
        .andThen((exists: boolean) =>
            exists ? ok(undefined) : err(new Error("Could not find a kiara.config file in the current directory"))
        );
}
