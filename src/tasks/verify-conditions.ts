import { ResultAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";

export function verifyConditions(context: KiaraContext): ResultAsync<void, Error> {
    logger.verbose(JSON.stringify(context));

    return ResultAsync.fromPromise(Promise.resolve(), (): Error => new Error("Failed to verify conditions"));
}
