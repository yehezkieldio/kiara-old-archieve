import { ResultAsync, okAsync } from "neverthrow";
import type { BumpStrategy, KiaraContext } from "#/kiara";
import { color, logger } from "#/libs/logger";
import { updateNewVersion } from "#/tasks/context";
import { getManualVersion, getRecommendedVersion } from "#/tasks/version";

export function selectBumpStrategy(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.skipBump) {
        logger.info(
            `Skipping version bump. Using current version ${color.dim(context.version.current)}.`
        );
        return okAsync(context);
    }

    return context.options.bumpStrategy
        ? ResultAsync.fromPromise(
              Promise.resolve(context.options.bumpStrategy),
              (): Error => new Error("Failed to get bump strategy from options")
          ).andThen(
              (strategy: BumpStrategy): ResultAsync<KiaraContext, Error> =>
                  executeStrategy(context, strategy as BumpStrategy)
          )
        : promptStrategy().andThen(
              (strategy: BumpStrategy): ResultAsync<KiaraContext, Error> =>
                  executeStrategy(context, strategy)
          );
}

interface BumpSelectOption {
    label: string;
    value: BumpStrategy;
    hint?: string;
}

const strategies: BumpSelectOption[] = [
    {
        label: "Recommended Bump",
        value: "recommended",
        hint: "Recommended version bump based on conventional commits using the Angular preset",
    },
    {
        label: "Manual Bump",
        value: "manual",
        hint: "Manually select the version bump",
    },
];

type StrategyHandler = (context: KiaraContext) => ResultAsync<KiaraContext, Error>;
type StrategyHandlers = Record<BumpStrategy, StrategyHandler>;

/**
 * The strategy handlers for the version bump
 */
function getStrategyHandlers(): StrategyHandlers {
    return {
        recommended: (context: KiaraContext): ResultAsync<KiaraContext, Error> =>
            getRecommendedVersion(context).map((version: string) => {
                return updateNewVersion(context, version);
            }),
        manual: (context: KiaraContext): ResultAsync<KiaraContext, Error> =>
            getManualVersion(context).map((version: string) => {
                return updateNewVersion(context, version);
            }),
    };
}

/**
 * Execute the selected version bump strategy
 * @param context The Kiara context
 * @param strategy The selected version bump strategy
 */
function executeStrategy(
    context: KiaraContext,
    strategy: BumpStrategy
): ResultAsync<KiaraContext, Error> {
    const handlers: StrategyHandlers = getStrategyHandlers();
    return handlers[strategy](context);
}

/**
 * Prompt the user to select the version bump strategy
 */
function promptStrategy(): ResultAsync<BumpStrategy, Error> {
    return ResultAsync.fromPromise(
        logger.prompt("Pick a version strategy", {
            type: "select",
            options: strategies,
            initial: strategies[1].value,
            cancel: "reject",
        }),
        (error: unknown): Error =>
            new Error(error instanceof Error ? error.message : "Failed to select version strategy")
    );
}
