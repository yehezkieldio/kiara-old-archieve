import { type Result, type ResultAsync, err, errAsync, ok, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { CWD_PACKAGE_PATH } from "#/libs/constants";
import { fileExists } from "#/libs/file";
import { logger } from "#/libs/logger";

export function preflightEnvironment(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return checkToken(context).asyncAndThen(checkPackageJson);
}

function checkToken(context: KiaraContext): Result<KiaraContext, Error> {
    if (!context.options.token && !process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
        return err(new Error("GitHub token is required."));
    }

    return ok(context);
}

function checkPackageJson(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return fileExists(CWD_PACKAGE_PATH)
        .andTee(() => logger.verbose("Checking for package.json file: fileExists"))
        .andThen((exists) => {
            return exists ? okAsync(context) : errAsync(new Error("package.json file not found."));
        });
}
