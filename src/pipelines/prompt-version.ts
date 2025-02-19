import { ResultAsync, okAsync } from "neverthrow";
import { updateVersionInContext } from "#/core/context";
import { generateAutomaticVersion, generateManualVersion } from "#/core/versioning";
import type { BumpStrategy, KiaraContext } from "#/types/kiara";
import type { PromptSelectChoice } from "#/types/select";
import { createErrorFromUnknown } from "#/utils/errors";
import { logger } from "#/utils/logger";

/**
 * The available version bump strategies.
 */
const strategies: PromptSelectChoice[] = [
    {
        label: "Automatic Bump",
        value: "auto",
        hint: "Automatically determine the version bump using conventional commits",
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
 * Retrieves the strategy handlers for version bumping.
 */
function getStrategyHandlers(): StrategyHandlers {
    return {
        auto: (context: KiaraContext): ResultAsync<KiaraContext, Error> =>
            generateAutomaticVersion(context).andThen((version: string) => {
                return updateVersionInContext(context, version);
            }),
        manual: (context: KiaraContext): ResultAsync<KiaraContext, Error> =>
            generateManualVersion(context).andThen((version: string) => {
                return updateVersionInContext(context, version);
            }),
    };
}

/**
 * Execute the selected version bump strategy
 * @param context The Kiara context
 * @param strategy The selected version bump strategy
 */
function executeStrategy(context: KiaraContext, strategy: BumpStrategy): ResultAsync<KiaraContext, Error> {
    const handlers: StrategyHandlers = getStrategyHandlers();
    return handlers[strategy](context);
}

/**
 * Selects the version bump strategy to use.
 * @param context The Kiara context
 */
function selectBumpStrategy(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return context.options.bumpStrategy
        ? ResultAsync.fromPromise(
              Promise.resolve(context.options.bumpStrategy),
              (): Error => new Error("Failed to get bump strategy from options")
          ).andThen(
              (strategy: BumpStrategy): ResultAsync<KiaraContext, Error> =>
                  executeStrategy(context, strategy as BumpStrategy)
          )
        : promptStrategy().andThen(
              (strategy: BumpStrategy): ResultAsync<KiaraContext, Error> => executeStrategy(context, strategy)
          );
}

/**
 * Prompts the user to select a version bump strategy.
 */
function promptStrategy(): ResultAsync<BumpStrategy, Error> {
    return ResultAsync.fromPromise(
        logger.prompt("Pick a version strategy", {
            type: "select",
            options: strategies,
            initial: strategies[1].value,
            cancel: "reject",
        }) as Promise<BumpStrategy>,
        (error: unknown): Error => createErrorFromUnknown("Failed to prompt for version strategy", error)
    );
}

/**
 * Executes the prompt version pipeline.
 */
export function promptVersionPipeline(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.skipBump) {
        return okAsync(context);
    }

    return selectBumpStrategy(context);
}
