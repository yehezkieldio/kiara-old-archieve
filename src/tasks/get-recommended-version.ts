import type { KiaraContext } from "#/tasks/initialize-context";
import { logger } from "#/lib/logger";
import { ResultAsync } from "neverthrow";

export function getRecommendedVersion(_context: KiaraContext): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        Promise.resolve(
            logger.info("Not Implemented"),
        ),
        error => new Error(`Failed to get recommended version: ${error}`),
    ).andThen(() => {
        return ResultAsync.fromPromise(
            Promise.resolve("1.0,0"),
            () => new Error("Failed to get recommended version"),
        );
    });
}
