import { logger } from "#/libs/logger";
import { ResultAsync } from "neverthrow";

export function initializeBump(): ResultAsync<void, Error> {
    logger.info("Running Kiara");

    return ResultAsync.fromPromise(
        Promise.resolve(),
        (): Error => new Error("Failed to initialize bump"),
    );
}
