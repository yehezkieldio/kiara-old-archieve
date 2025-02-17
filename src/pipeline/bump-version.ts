import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { color, logger } from "#/libs/logger";

export function bumpVersion(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info(
        `Bumping version from ${color.dim(context.version.current)} to ${color.dim(context.version.new)}`
    );

    return okAsync(context);
}
