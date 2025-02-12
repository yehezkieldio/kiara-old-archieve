import type { SelectOption } from "#/lib/version/manual";
import type { KiaraContext } from "#/tasks/initialize-context";
import { color, logger } from "#/lib/logger";
import { getManualVersion } from "#/tasks/get-manual-version";
import { getRecommendedVersion } from "#/tasks/get-recommended-version";
import { updateContext } from "#/tasks/initialize-context";
import { err, errAsync, ResultAsync } from "neverthrow";

export const VERSION_STRATEGY = {
    RECOMMENDED_BUMP: "recommended",
    MANUAL_BUMP: "manual",
} as const;

export type VersionStrategy = typeof VERSION_STRATEGY[keyof typeof VERSION_STRATEGY];

const strategies = [
    {
        label: "Recommended Bump",
        value: VERSION_STRATEGY.RECOMMENDED_BUMP,
        hint: "Recommended version bump based on conventional commits using the Angular preset",
    },
    {
        label: "Manual Bump",
        value: VERSION_STRATEGY.MANUAL_BUMP,
        hint: "Manually select the version bump",
    },
] as SelectOption[];

export function selectVersionStrategy(context: KiaraContext): ResultAsync<void, Error> {
    logger.info(`Current version: ${color.dim(context.currentVersion)}`);

    if (context.options.strategy) {
        switch (context.options.strategy as VersionStrategy) {
            case VERSION_STRATEGY.RECOMMENDED_BUMP:
                return getRecommendedVersion(context)
                    .map((version) => {
                        updateContext(context, version);
                        return undefined;
                    });
            case VERSION_STRATEGY.MANUAL_BUMP:
                return getManualVersion(context)
                    .map((version) => {
                        updateContext(context, version);
                        return undefined;
                    });
            default:
                return errAsync(new Error(`Invalid version strategy selected: ${context.options.strategy}`));
        }
    }

    return ResultAsync.fromPromise(
        logger.prompt("Pick a version strategy", {
            type: "select",
            options: strategies,
            initial: strategies[1].value,
            cancel: "reject",
        }),
        error => new Error(error instanceof Error ? error.message : "Failed to select version strategy"),
    ).andThen((strategy: string) => {
        console.log("");

        switch (strategy as VersionStrategy) {
            case VERSION_STRATEGY.RECOMMENDED_BUMP:
                return getRecommendedVersion(context)
                    .map((version) => {
                        updateContext(context, version);
                        return undefined;
                    });
            case VERSION_STRATEGY.MANUAL_BUMP:
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
