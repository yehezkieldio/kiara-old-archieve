import type { KiaraContext } from "#/tasks/initialize-context";
import { logger } from "#/lib/logger";
import { preflightEnvironment } from "#/lib/preflight/environment";
import { preflightGit } from "#/lib/preflight/git";
import { selectVersionStrategy } from "#/tasks/select-version-strategy";
import { okAsync, ResultAsync } from "neverthrow";

const preflightLog = logger.withTag("PREFLIGHT");

export function verifyConditions(context: KiaraContext): ResultAsync<void, Error> {
    if (context.options.skipVerify) {
        preflightLog.info("Skipping preflight checks.");
        return okAsync(undefined).andThen(() => selectVersionStrategy(context));
    }

    return ResultAsync.combine([preflightEnvironment(), preflightGit()])
        .map(() => {
            preflightLog.info("Preflight checks passed.");
            return undefined;
        })
        .andThen(() => selectVersionStrategy(context));
}
