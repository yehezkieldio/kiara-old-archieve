import type { KiaraContext } from "#/tasks/initialize-context";
import { logger } from "#/lib/logger";
import { preflightEnvironment } from "#/lib/preflight/environment";
import { preflightGit } from "#/lib/preflight/git";
import { selectVersionStrategy } from "#/tasks/select-version-strategy";
import { okAsync, ResultAsync } from "neverthrow";

export function verifyConditions(context: KiaraContext): ResultAsync<void, Error> {
    if (context.options.skipVerify) {
        return okAsync(undefined)
            .andTee(() => logger.warn("Skipping preflight checks due to --skip-verify flag, this may cause unexpected behavior."))
            .andThen(() => selectVersionStrategy(context));
    }

    return ResultAsync.combine([preflightEnvironment(), preflightGit(context)])
        .andTee(() => logger.info("Preflight checks passed."))
        .andThen(() => selectVersionStrategy(context));
}
