import { LogLevels } from "consola";
import { type ResultAsync, okAsync } from "neverthrow";
import type { KiaraContext, KiaraOptions } from "#/kiara";
import { color, logger } from "#/libs/logger";
import { validateOptions } from "#/libs/util";
import { INTERNAL } from "#/libs/util/internal";
import { bumpVersion } from "#/pipeline/bump-version";
import { createContext } from "#/pipeline/create-context";
import { createTagAndCommit } from "#/pipeline/create-tag-and-commit";
import { generateChangelog } from "#/pipeline/generate-changelog";
import { pushAndRelease } from "#/pipeline/push-and-release";
import { selectBumpStrategy } from "#/pipeline/select-bump-strategy";
import { verifyConditions } from "#/pipeline/verify-conditions";
import {
    type RollbackOperation,
    addRollbackOperation,
    createRollbackStack,
    executeRollback,
    rollbackChangelog,
    rollbackGitCommit,
    rollbackGitPush,
    rollbackGitTag,
    rollbackVersionBump,
} from "#/tasks/rollback";

function executeWithRollback<T>(
    operation: (context: T) => ResultAsync<T, Error>,
    rollbackOp: ((context: KiaraContext) => ResultAsync<void, Error>) | null,
    description: string,
    context: T,
    rollbackStack: RollbackOperation[]
): ResultAsync<T, Error> {
    return operation(context).map((result) => {
        if (rollbackOp) {
            addRollbackOperation(rollbackStack, rollbackOp, description);
        }
        return result;
    });
}

export function initializePipeline(options: KiaraOptions): ResultAsync<void, Error> {
    if (options.verbose) logger.level = LogLevels.verbose;
    const rollbackStack = createRollbackStack();
    let pipelineContext: KiaraContext;

    logger.start(`Running ${color.magenta("kiara")} version ${color.dim(INTERNAL.VERSION)}`);

    return (
        validateOptions(options)
            .asyncAndThen(createContext)
            .andThen((ctx) => {
                return verifyConditions(ctx);
            })
            .andThen(selectBumpStrategy)
            .andThen((context) =>
                executeWithRollback(
                    bumpVersion,
                    rollbackVersionBump,
                    "Version bump",
                    context,
                    rollbackStack
                )
            )
            .andThen((context) =>
                executeWithRollback(
                    generateChangelog,
                    rollbackChangelog,
                    "Changelog generation",
                    context,
                    rollbackStack
                )
            )
            // .andThen((context) =>
            //     executeWithRollback(
            //         (_context) => {
            //             return ResultAsync.fromPromise(
            //                 Promise.reject(new Error("Simulated error to test rollback")),
            //                 (error) => error as Error
            //             );
            //         },
            //         null,
            //         "Simulated error operation",
            //         context,
            //         rollbackStack
            //     )
            // )
            .andThen((context) =>
                executeWithRollback(
                    createTagAndCommit,
                    (context) => rollbackGitCommit(context).andThen(() => rollbackGitTag(context)),
                    "Tag and commit creation",
                    context,
                    rollbackStack
                )
            )
            .andThen((context) =>
                executeWithRollback(
                    pushAndRelease,
                    rollbackGitPush,
                    "Push and release",
                    context,
                    rollbackStack
                ).andTee((context) => {
                    pipelineContext = context;
                })
            )
            .andThen(() => okAsync<void, Error>(undefined)) // Convert final result to void
            .andTee(() => logger.success("Release process completed successfully!"))
            .mapErr((error: Error) => {
                logger.error(error.message);
                return executeRollback(pipelineContext, rollbackStack)
                    .map(() => {
                        process.exit(1);
                        return error;
                    })
                    .unwrapOr(error);
            })
    );
}
