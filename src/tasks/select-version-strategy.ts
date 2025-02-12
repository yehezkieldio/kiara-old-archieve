import type { KiaraContext } from "#/tasks/initialize-context";
import { color, logger } from "#/lib/logger";
import { getManualVersion } from "#/tasks/get-manual-version";
import { getRecommendedVersion } from "#/tasks/get-recommended-version";
import { updateContext } from "#/tasks/initialize-context";
import { err, ResultAsync } from "neverthrow";

export function selectVersionStrategy(context: KiaraContext): ResultAsync<void, Error> {
    logger.info(`Current version: ${color.dim(context.currentVersion)}`);

    const strategies = ["conventional-recommended-bump", "conventional-manual-bump"];
    type VersionStrategy = typeof strategies[number];

    return ResultAsync.fromPromise(
        logger.prompt("Pick a version strategy", {
            type: "select",
            options: strategies,
            initial: strategies[1],
            cancel: "reject",
        }),
        error => new Error(error instanceof Error ? error.message : "Failed to select version strategy"),
    ).andThen((strategy: VersionStrategy) => {
        console.log("");

        switch (strategy) {
            case "conventional-recommended-bump":
                return getRecommendedVersion(context)
                    .map((version) => {
                        updateContext(context, version);
                        return undefined;
                    });
            case "conventional-manual-bump":
                return getManualVersion(context)
                    .map((version) => {
                        updateContext(context, version);
                        return undefined;
                    });
            default:
                return err(new Error(`Invalid version strategy selected: ${strategy}`));
        }
    });
}
