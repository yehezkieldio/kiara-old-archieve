import { type ResultAsync, errAsync, okAsync } from "neverthrow";
import { fileExists } from "#/core/fs";
import { type GitResult, executeGit } from "#/core/git";
import type { KiaraContext } from "#/types/kiara";
import { CWD_GIT_CLIFF_PATH } from "#/utils/const";
import { logger } from "#/utils/logger";

/**
 * Check if the cliff.toml file exists in the current working directory.
 * @param context The Kiara context.
 */
function checkGitCliffConfig(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.verbose("Skipping cliff.toml check in dry-run mode");
        return okAsync(context);
    }

    return fileExists(CWD_GIT_CLIFF_PATH)
        .andTee((): void => logger.verbose("Checking for cliff.toml in the current working directory."))
        .andThen((exists: boolean): ResultAsync<KiaraContext, Error> => {
            return exists
                ? okAsync(context)
                : errAsync(new Error("Could not find cliff.toml in the current working directory."));
        });
}

/**
 * Check if the current working directory is a git repository.
 * @param context The Kiara context.
 */
function checkGitRepository(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return executeGit(["rev-parse", "--is-inside-work-tree"], context).andThen(
        (result: GitResult): ResultAsync<KiaraContext, Error> => {
            return context.options.dryRun
                ? okAsync(context)
                : result.stdout === "true"
                  ? okAsync(context)
                  : errAsync(new Error("Could not find a git repository in the current working directory."));
        }
    );
}

/**
 * Check if the current branch is allowed for releasing.
 * @param context The Kiara context.
 */
function checkBranch(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (!context.configuration.git.requireBranch) {
        logger.verbose("Skipping branch check as it is not required.");
        return okAsync(context);
    }

    const branches: string | string[] = context.configuration.git.branches;

    return executeGit(["rev-parse", "--abbrev-ref", "HEAD"], context).andThen(
        (result): ResultAsync<KiaraContext, Error> => {
            return context.options.dryRun
                ? okAsync(context)
                : branches.includes(result.stdout.trim())
                  ? okAsync(context)
                  : errAsync(new Error(`Current branch is not allowed for releasing. Allowed branches: ${branches}`));
        }
    );
}

/**
 * Check if there are uncommitted changes in the current working directory.
 * @param context The Kiara context.
 */
function checkUncommittedChanges(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (!context.configuration.git.requireCleanWorkingDir) {
        logger.verbose("Skipping uncommitted changes check as clean working directory is not required.");
        return okAsync(context);
    }

    return executeGit(["status", "--porcelain"], context, "Error checking for uncommitted changes").andThen(
        (result: GitResult): ResultAsync<KiaraContext, Error> => {
            return context.options.dryRun
                ? okAsync(context)
                : result.stdout === ""
                  ? okAsync(context)
                  : errAsync(new Error("There are uncommitted changes in the current working directory."));
        }
    );
}

/**
 * Check if there is an upstream branch set for the current branch.
 * @param context The Kiara context.
 */
function checkUpstreamBranch(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (!context.configuration.git.requireUpstream) {
        logger.verbose("Skipping upstream branch check as it is not required.");
        return okAsync(context);
    }

    return executeGit(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], context).andThen(
        (result: GitResult): ResultAsync<KiaraContext, Error> => {
            return context.options.dryRun
                ? okAsync(context)
                : result.stdout !== ""
                  ? okAsync(context)
                  : errAsync(
                        new Error(
                            "No upstream branch found. Please set an upstream branch before running this command."
                        )
                    );
        }
    );
}

/**
 * Executes the verify pipeline to ensure the conditions are met before creating a release.
 */
export function verifyPipeline(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return checkGitCliffConfig(context)
        .andThen(checkGitRepository)
        .andThen(checkBranch)
        .andThen(checkUncommittedChanges)
        .andThen(checkUpstreamBranch);
}
