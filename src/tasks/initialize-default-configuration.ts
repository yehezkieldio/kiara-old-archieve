import type { ResultAsync } from "neverthrow";
import { initConfigFile } from "#/libs/config";
import { CWD } from "#/libs/constants";
import { logger } from "#/libs/logger";
import { okAsync } from "neverthrow";

export function initializeDefaultConfiguration(): ResultAsync<void, Error> {
    const file = "kiara.config.ts";

    return initConfigFile(`${CWD}/${file}`).mapErr((error) => {
        logger.error(error.message);
        return new Error("Failed to initialize default configuration");
    }).andThen(() => {
        logger.info(`Default ${file} created successfully at your project root.`);
        return okAsync(void 0);
    });
}
