import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";
import { preflightEnvironment } from "#/tasks/preflight-environment";
import { preflightGit } from "#/tasks/preflight-git";

export function verifyConditions(context: KiaraContext): ResultAsync<void, Error> {
    return preflightEnvironment(context)
        .andThen((): ResultAsync<void, Error> => preflightGit(context))
        .andTee((): void => logger.info("All preflight checks passed."))
        .andThen((): ResultAsync<undefined, never> => okAsync(undefined));
}
