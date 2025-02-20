import { type ResultAsync, okAsync } from "neverthrow";
import { generateChangelog } from "#/core/changelog";
import { executeGit } from "#/core/git";
import type { KiaraContext } from "#/types/kiara";
import { color, logger } from "#/utils/logger";

/**
 * Rolls back the commit.
 * @param context The Kiara context.
 */
export function rollbackChangelog(context: KiaraContext): ResultAsync<void, Error> {
    return executeGit(["restore", context.configuration.changelog.path], context).map((): void => undefined);
}

/**
 * Executes the push pipeline to push changes and tags to GitHub.
 */
export function changelogPipeline(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.bumpOnly) {
        logger.info(`Skipping changelog creation ${color.dim("(--bump-only)")}`);
        return okAsync(context);
    }

    if (context.options.skipChangelog) {
        logger.info(`Skipping changelog generation ${color.dim("(--skip-changelog)")}`);
        return okAsync(context);
    }

    logger.info(`Generating changelog... ${color.dim(`(${context.configuration.changelog.path})`)}`);
    return generateChangelog(context);
}
