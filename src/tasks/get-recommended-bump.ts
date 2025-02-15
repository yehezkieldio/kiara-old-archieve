import { ResultAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";

export function getRecommendedVersion(_context: KiaraContext): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        Promise.resolve(logger.info("Not Implemented")),
        (error) => new Error(`Failed to get recommended version: ${error}`)
    ).andThen(() => {
        return ResultAsync.fromPromise(Promise.resolve("1.0,0"), () => new Error("Failed to get recommended version"));
    });
}
