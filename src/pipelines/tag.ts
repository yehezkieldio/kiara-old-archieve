import { type ResultAsync, okAsync } from "neverthrow";
import { type GitResult, executeGit, resolveTagAnnotation, resolveTagName } from "#/core/git";
import type { KiaraContext } from "#/types/kiara";
import { color, logger } from "#/utils/logger";

/**
 * Queries whether the user can sign Git tags.
 * @param context The Kiara context.
 */
function canSignGitTags(context: KiaraContext): ResultAsync<boolean, Error> {
    return executeGit(["config", "--get", "user.signingkey"], context).map((result) => result.stdout.length > 0);
}

/**
 * Creates a Git tag for the current version.
 * @param context The Kiara context.
 */
function createTag(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.info("Dry run enabled. Skipping tag creation.");
        return okAsync(context);
    }

    const tagName: string = resolveTagName(context);
    const tagMessage: string = resolveTagAnnotation(context);

    return canSignGitTags(context)
        .map((canSign: boolean): string[] => {
            const baseArgs: string[] = ["tag", "-a", tagName, "-m", `"${tagMessage}"`];
            return canSign ? [...baseArgs, "-s"] : baseArgs;
        })
        .andThen((args: string[]): ResultAsync<GitResult, Error> => executeGit(args, context))
        .map(() => context);
}

/**
 * Rolls back the tag if it was created.
 * @param context The Kiara context.
 */
export function rollbackTag(context: KiaraContext): ResultAsync<void, Error> {
    const tag: string = resolveTagName(context);

    return executeGit(["tag", "-d", tag], context).map(() => undefined);
}

/**
 * Executes the tag pipeline to create a Git tag for the current version.
 */
export function tagPipeline(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.skipTag) {
        logger.info("Skipping Git tag creation (--skip-tag)");
        return okAsync(context);
    }

    logger.info(`Creating Git tag... ${color.dim(`(${resolveTagName(context)})`)}`);
    return createTag(context);
}
