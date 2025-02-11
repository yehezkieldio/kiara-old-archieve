import type { ResultAsync } from "neverthrow";
import { logger } from "#/lib/logger";
import { preflightEnvironment } from "#/lib/preflight/environment";
import { preflightGit } from "#/lib/preflight/git";
import { ok } from "neverthrow";

export function verifyConditions(): ResultAsync<void, Error> {
    return preflightEnvironment()
        .andThen(() => {
            logger.withTag("PREFLIGHT").info("Preflight environment checks passed.");
            return preflightGit();
        })
        .andThen(() => {
            logger.withTag("PREFLIGHT").info("Preflight git checks passed.");
            return ok(undefined);
        });
}
