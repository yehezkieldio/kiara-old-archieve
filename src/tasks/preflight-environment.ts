import { type Result, type ResultAsync, err, errAsync, ok, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { CWD_PACKAGE_PATH } from "#/libs/constants";
import { fileExists } from "#/libs/file";
import { logger } from "#/libs/logger";
import { getToken } from "#/libs/token";

export function preflightEnvironment(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return checkToken(context).asyncAndThen(checkPackageJson);
}

/**
 * Check if the GitHub token is set in the Kiara context or the environment variables.
 * @param context The Kiara context.
 */
function checkToken(context: KiaraContext): Result<KiaraContext, Error> {
    if (!getToken(context)) {
        return err(
            new Error(
                "GitHub token is required. Set it via the --token option or the GITHUB_TOKEN environment variable."
            )
        );
    }

    return ok(context);
}

/**
 * Check if the package.json file exists in the current working directory.
 * @param context The Kiara context.
 */
function checkPackageJson(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return fileExists(CWD_PACKAGE_PATH)
        .andTee(() => logger.verbose("Checking for package.json file: fileExists"))
        .andThen((exists) => {
            return exists ? okAsync(context) : errAsync(new Error("package.json file not found."));
        });
}
