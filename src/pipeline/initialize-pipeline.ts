import { LogLevels } from "consola";
import type { ResultAsync } from "neverthrow";
import type { KiaraOptions } from "#/kiara";
import { color, logger } from "#/libs/logger";
import { INTERNAL } from "#/libs/util/internal";
import { createContext } from "#/pipeline/create-context";
import { pushAndRelease } from "#/pipeline/push-and-release";
import { verifyConditions } from "#/pipeline/verify-conditions";

export function initializePipeline(options: KiaraOptions): ResultAsync<void, Error> {
    if (options.verbose) logger.level = LogLevels.verbose;

    logger.info(`Running ${color.magenta("kiara")} version ${color.dim(INTERNAL.VERSION)}`);
    logger.verbose(`Options: ${JSON.stringify(options)}`);

    return createContext(options)
        .andThen(verifyConditions)
        .andThen(pushAndRelease)
        .mapErr((error: Error): Error => {
            logger.error(error.message);
            process.exit(1);
        });
}
