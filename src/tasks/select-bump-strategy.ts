import { ResultAsync } from "neverthrow";
import type { BumpStrategy, KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";
import { updateNewVersion } from "#/tasks/create-context";
import { getRecommendedVersion } from "#/tasks/get-recommended-bump";
import { promptManualBump } from "#/tasks/prompt-manual-bump";

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

type StrategyHandler = (context: KiaraContext) => ResultAsync<void, Error>;
type StrategyHandlers = Record<BumpStrategy, StrategyHandler>;

function getStrategyHandlers(): StrategyHandlers {
    return {
        recommended: (context: KiaraContext): ResultAsync<undefined, Error> =>
            getRecommendedVersion(context).map((version: string): undefined => {
                updateNewVersion(context, version);
                return undefined;
            }),
        manual: (context: KiaraContext): ResultAsync<undefined, Error> =>
            promptManualBump(context).map((version: string): undefined => {
                updateNewVersion(context, version);
                return undefined;
            }),
    };
}

function executeStrategy(context: KiaraContext, strategy: BumpStrategy): ResultAsync<void, Error> {
    const handlers: StrategyHandlers = getStrategyHandlers();
    return handlers[strategy](context);
}

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

export function selectBumpStrategy(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return context.options.bumpStrategy
        ? ResultAsync.fromPromise(
              Promise.resolve(context.options.bumpStrategy),
              (): Error => new Error("Failed to get bump strategy from options")
          )
              .andThen(
                  (strategy: BumpStrategy): ResultAsync<void, Error> =>
                      executeStrategy(context, strategy as BumpStrategy)
              )
              .map((): KiaraContext => context)
        : promptStrategy()
              .andThen((strategy: BumpStrategy): ResultAsync<void, Error> => executeStrategy(context, strategy))
              .map((): KiaraContext => context);
}
