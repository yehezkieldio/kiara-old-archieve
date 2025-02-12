import type { KiaraContext } from "#/tasks/initialize-context";
import { logger } from "#/lib/logger";
import { getIncrementChoices } from "#/lib/version/manual";
import { ResultAsync } from "neverthrow";

export function getManualVersion(context: KiaraContext): ResultAsync<string, Error> {
    const versions = getIncrementChoices({
        latestVersion: context.currentVersion,
    });

    return ResultAsync.fromPromise(
        logger.prompt("Recommended version bump", {
            type: "select",
            options: versions,
            initial: versions[0].value,
            cancel: "reject",
        }),
        error => new Error(error instanceof Error ? error.message : "Failed to select version strategy"),

    ).andThen((nextVersion) => {
        console.log("");
        return ResultAsync.fromPromise(
            Promise.resolve(
                nextVersion,
            ),
            error => new Error(`Failed to get selected version bump: ${error}`),
        );
    });
}
