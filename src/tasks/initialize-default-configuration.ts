import { logger } from "#/libs/logger";
import { ResultAsync } from "neverthrow";

export function initializeDefaultConfiguration(): ResultAsync<void, Error> {
    logger.info("Initializing default configuration...");

    return ResultAsync.fromPromise(
        Promise.resolve(),
        (): Error => new Error("Failed to initialize default configuration"),
    );
}
