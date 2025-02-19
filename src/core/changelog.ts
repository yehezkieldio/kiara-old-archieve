import { type Options as GitCliffOptions, runGitCliff } from "git-cliff";
import { ResultAsync, okAsync } from "neverthrow";
import { updateChangelogInContext } from "#/core/context";
import { createFileIfNotExists } from "#/core/fs";
import { type Repository, getGitToken, getRepository, resolveTagName } from "#/core/git";
import type { KiaraContext } from "#/types/kiara";
import { flattenMultilineText } from "#/utils";
import { CWD_GIT_CLIFF_PATH } from "#/utils/const";
import { createErrorFromUnknown } from "#/utils/errors";
import { logger } from "#/utils/logger";

/**
 * Creates the initial Git Cliff options for changelog generation
 * @param context The Kiara context
 */
function createGitCliffOptions(context: KiaraContext): GitCliffOptions {
    return {
        tag: resolveTagName(context),
        unreleased: true,
        config: CWD_GIT_CLIFF_PATH,
        output: "-",
    };
}

/**
 * Enhances Git Cliff options with specific configuration
 * @param options The base Git Cliff options
 * @param context The Kiara context
 */
function enhanceGitCliffOptions(options: GitCliffOptions, context: KiaraContext): ResultAsync<GitCliffOptions, Error> {
    /**
     * Adds the GitHub repository to the Git Cliff options
     * @param withToken The Git Cliff options with the GitHub token
     */
    function addGithubRepo(withToken: Partial<GitCliffOptions>): ResultAsync<GitCliffOptions, Error> {
        if (context.configuration.git.repository === "auto") {
            return getRepository(context).map(
                (repository: Repository): GitCliffOptions => ({
                    ...withToken,
                    githubRepo: `${repository.owner}/${repository.name}`,
                })
            );
        }

        return okAsync({
            ...withToken,
            githubRepo: context.configuration.git.repository,
        });
    }

    return getGitToken(context)
        .map((token: string): GitCliffOptions => ({ ...options, githubToken: token }))
        .asyncAndThen(addGithubRepo)
        .andThen((gitCliffOptions: GitCliffOptions): ResultAsync<GitCliffOptions, Error> => {
            if (!context.options.dryRun) {
                gitCliffOptions.prepend = context.configuration.changelog.path;
            }
            return okAsync(gitCliffOptions);
        });
}

/**
 * Executes Git Cliff with the provided options
 * @param options The Git Cliff options
 */
function executeGitCliff(options: GitCliffOptions): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        runGitCliff(options, { stdio: "pipe" }),
        (error: unknown): Error => createErrorFromUnknown("Failed to generate changelog", error)
    ).map(({ stdout }) => stdout);
}

/**
 * Generates a changelog using Git Cliff
 * @param context The Kiara context
 */
export function generateChangelog(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.info("Dry run enabled. Skipping generation of changelog");
        return okAsync(context);
    }

    /**
     * Handles the creation of the changelog file
     */
    function handleFileCreation(): ResultAsync<boolean, Error> {
        return context.options.dryRun
            ? okAsync(true)
            : createFileIfNotExists(context.configuration.changelog.path).mapErr((error: Error): Error => {
                  logger.error("Error creating changelog file:", error);
                  return error;
              });
    }

    return handleFileCreation()
        .mapErr((error: Error): Error => {
            logger.error("Error creating changelog file:", error);
            return error;
        })
        .andThen(
            (): ResultAsync<GitCliffOptions, Error> => enhanceGitCliffOptions(createGitCliffOptions(context), context)
        )
        .andThen(executeGitCliff)
        .andTee((content: string): void => {
            logger.verbose(`Changelog content: ${flattenMultilineText(content)}`);
        })
        .andThen((content: string): ResultAsync<KiaraContext, Error> => {
            logger.info("Changelog generated successfully!");
            return updateChangelogInContext(context, content);
        })
        .mapErr((error: unknown): Error => {
            logger.error("Failed to generate changelog:", error);
            return error instanceof Error ? error : new Error("Changelog generation failed");
        });
}
