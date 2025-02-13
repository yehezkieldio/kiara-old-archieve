import type { ResultAsync } from "neverthrow";
import { okAsync } from "neverthrow";
import { config } from "#/libs/config";
import { CWD } from "#/libs/constants";
import { logger } from "#/libs/logger";

export function initializeDefaultConfiguration(): ResultAsync<void, Error> {
    const file = "kiara.config.ts";

    return config
        .init(`${CWD}/${file}`)
        .mapErr((error) => {
            logger.error(error.message);
            return new Error("Failed to initialize default configuration");
        })
        .andThen(() => {
            logger.info(`Default ${file} created successfully at your project root.`);
            return okAsync(void 0);
        });
}
