import type { ResultAsync } from "neverthrow";
import { initConfigFile } from "#/libs/config";
import { CWD } from "#/libs/constants";
import { logger } from "#/libs/logger";
import { okAsync } from "neverthrow";

export function initializeDefaultConfiguration(): ResultAsync<void, Error> {
    logger.info("Initializing default configuration...");

    return initConfigFile(`${CWD}/kiara.config.ts`).mapErr((error) => {
        logger.error(error.message);
        return new Error("Failed to initialize default configuration");
    }).andThen(() => {
        logger.info("Default configuration initialized successfully.");
        return okAsync(void 0);
    });
}
