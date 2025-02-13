import type { ResultAsync } from "neverthrow";
import type { KiaraBumpOptions } from "#/kiara";
import { logger } from "#/libs/logger";
import { createContext } from "#/tasks/create-context";
import { verifyConditions } from "#/tasks/verify-conditions";

export function initializeBump(options: KiaraBumpOptions): ResultAsync<void, Error> {
    logger.verbose(JSON.stringify(options));

    return createContext(options).andThen(verifyConditions);
}
