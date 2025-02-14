import type { ResultAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";
import { preflightEnvironment } from "#/tasks/preflight-environment";
import { preflightGit } from "#/tasks/preflight-git";
import { selectBumpStrategy } from "#/tasks/select-bump-strategy";

export function verifyConditions(context: KiaraContext): ResultAsync<void, Error> {
    return preflightEnvironment(context)
        .andThen(preflightGit)
        .andTee(() => logger.info("All preflight checks passed successfully."))
        .andThen(selectBumpStrategy);
}
