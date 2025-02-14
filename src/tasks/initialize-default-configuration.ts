import { join } from "node:path";
import type { ResultAsync } from "neverthrow";
import { okAsync } from "neverthrow";
import { config } from "#/libs/config";
import { CWD } from "#/libs/constants";
import { logger } from "#/libs/logger";

export function initializeDefaultConfiguration(): ResultAsync<void, Error> {
    const file = "kiara.config.ts";

    return config.init(join(CWD, file)).andThen(() => {
        logger.info(`Default ${file} created successfully at your project root.`);
        return okAsync(undefined);
    });
}
