import { type ResultAsync, okAsync } from "neverthrow";
import { executeGit, resolveCommitMessage } from "#/core/git";
import type { KiaraContext } from "#/types/kiara";
import { color, logger } from "#/utils/logger";

/**
 * Stages all files in the repository.
 * @param context The Kiara context.
 */
function stageFiles(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.info("Dry run enabled. Skipping staging changes.");
        return okAsync(context);
    }

    return executeGit(["add", "."], context)
        .andTee((): void => logger.info("Staged changes!"))
        .map((): KiaraContext => context);
}

/**
 * Creates a commit with the staged changes.
 * @param context The Kiara context.
 */
function createCommit(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.info("Dry run enabled. Skipping commit creation.");
        return okAsync(context);
    }

    const commitMessage: string = resolveCommitMessage(context);

    return executeGit(["commit", "-m", commitMessage], context)
        .andTee((): void => logger.info("Committed changes!"))
        .map((): KiaraContext => context);
}

/**
 * Rolls back the commit.
 * @param context The Kiara context.
 */
export function rollbackCommit(context: KiaraContext): ResultAsync<void, Error> {
    return executeGit(["reset", "--soft", "HEAD~1"], context).map((): void => undefined);
}

/**
 * Executes the commit pipeline to stage and commit changes.
 */
export function commitPipeline(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.bumpOnly || context.options.bumpOnlyWithChangelog) {
        const flag = context.options.bumpOnly ? "--bump-only" : "--bump-only-with-changelog";
        logger.info(`Skipping GitHub push creation ${color.dim(`(${flag})`)}`);
        return okAsync(context);
    }

    if (context.options.skipCommit) {
        logger.info(`Skipping GitHub push creation ${color.dim("(--skip-push)")}`);
        return okAsync(context);
    }

    logger.info(`Staging and committing changes... ${color.dim(`(${resolveCommitMessage(context)})`)}`);
    return stageFiles(context).andThen(createCommit);
}
