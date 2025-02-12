import type { KiaraContext } from "#/tasks/initialize-context";
import { logger } from "#/lib/logger";
import { preflightEnvironment } from "#/lib/preflight/environment";
import { preflightGit } from "#/lib/preflight/git";
import { selectVersionStrategy } from "#/tasks/select-version-strategy";
import { okAsync, ResultAsync } from "neverthrow";

export function verifyConditions(context: KiaraContext): ResultAsync<void, Error> {
    if (context.options.skipVerify) {
        logger.info("Skipping preflight checks.");
        return okAsync(undefined).andThen(() => selectVersionStrategy(context));
    }

    return ResultAsync.combine([preflightEnvironment(), preflightGit(context)])
        .map(() => {
            logger.info("Preflight checks passed.");
            return undefined;
        })
        .andThen(() => selectVersionStrategy(context));
}
