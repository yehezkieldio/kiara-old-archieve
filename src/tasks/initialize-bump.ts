import { ResultAsync } from "neverthrow";
import type { KiaraBumpOptions } from "#/kiara";
import { logger } from "#/libs/logger";

export function initializeBump(options: KiaraBumpOptions): ResultAsync<void, Error> {
    logger.verbose(JSON.stringify(options));

    return ResultAsync.fromPromise(Promise.resolve(), (): Error => new Error("Failed to initialize bump"));
}
