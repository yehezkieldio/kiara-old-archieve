import { type ResultAsync, okAsync } from "neverthrow";
import { type GitResult, executeGit, resolveTagName } from "#/core/git";
import { rollbackTag } from "#/pipelines/tag";
import type { KiaraContext } from "#/types/kiara";
import { color, logger } from "#/utils/logger";

/**
 * Pushes changes to GitHub.
 * @param context The Kiara context.
 */
function createPush(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.info("Dry run enabled. Skipping push creation.");
        return okAsync(context);
    }

    return executeGit(["push"], context)
        .andTee((): void => logger.info("Pushed changes to GitHub!"))
        .map((): KiaraContext => context);
}

/**
 * Rolls back the push.
 * @param context The Kiara context.
 */
export function rollbackPush(context: KiaraContext): ResultAsync<void, Error> {
    return executeGit(["reset", "--hard", "HEAD~1"], context)
        .andThen((): ResultAsync<GitResult, Error> => executeGit(["push", "--force"], context))
        .map((): void => undefined);
}

/**
 * Pushes tags to GitHub.
 * @param context The Kiara context.
 */
function createPushTags(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.info("Dry run enabled. Skipping tag push creation.");
        return okAsync(context);
    }

    return executeGit(["push", "--tags"], context)
        .andTee((): void => logger.info("Pushed tags to GitHub!"))
        .map((): KiaraContext => context);
}

/**
 * Rolls back the tag push.
 * @param context The Kiara context.
 */
export function rollbackPushTags(context: KiaraContext): ResultAsync<void, Error> {
    const tag: string = resolveTagName(context);

    return rollbackTag(context)
        .andThen((): ResultAsync<GitResult, Error> => executeGit(["push", "origin", `:refs/tags/${tag}`], context))
        .map((): void => undefined);
}

/**
 * Executes the push pipeline to push changes and tags to GitHub.
 */
export function pushPipeline(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.bumpOnly || context.options.bumpOnlyWithChangelog) {
        const flag = context.options.bumpOnly ? "--bump-only" : "--bump-only-with-changelog";
        logger.info(`Skipping GitHub push and tag creation ${color.dim(`(${flag})`)}`);
        return okAsync(context);
    }

    if (context.options.skipPush && context.options.skipPushTag) {
        logger.info(`Skipping GitHub push and tag creation ${color.dim("(--skip-push) and --skip-push-tag")}`);
        return okAsync(context);
    }

    if (context.options.skipPush) {
        logger.info(`Skipping GitHub push creation ${color.dim("(--skip-push)")}`);
        return createPushTags(context);
    }

    if (context.options.skipPushTag) {
        logger.info(`Skipping GitHub push tag creation ${color.dim("(--skip-push-tag)")}`);
        return createPush(context);
    }

    logger.info("Pushing changes and tags to GitHub...");
    return createPush(context).andThen(createPushTags);
}
