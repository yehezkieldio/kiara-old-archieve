import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";

export function bumpVersion(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info(`Bumping version to ${context.version.new}`);

    return okAsync(context);
}
