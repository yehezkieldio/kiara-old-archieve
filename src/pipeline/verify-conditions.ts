import type { Octokit } from "@octokit/core";
import { execa } from "execa";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { CWD_GIT_CLIFF_PATH } from "#/libs/const";
import { createOctokit } from "#/libs/github";
import { logger } from "#/libs/logger";
import { fileExists, getGitToken } from "#/libs/util";

export function verifyConditions(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return preflightEnvironment(context)
        .andThen(preflightGit)
        .andTee(() => {
            logger.info("All preflight checks passed.");
        });
}

function preflightEnvironment(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return okAsync(context).andThen(checkGitCliffConfig);
}

/**
 * Check if the cliff.toml file exists in the current working directory.
 * @param context The Kiara context.
 */
function checkGitCliffConfig(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return fileExists(CWD_GIT_CLIFF_PATH)
        .andTee(() => logger.verbose("Checking for cliff.toml in the current working directory."))
        .andThen((exists) => {
            return exists
                ? okAsync(context)
                : errAsync(
                      new Error("Could not find cliff.toml in the current working directory.")
                  );
        });
}

function preflightGit(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return checkGitRepository(context)
        .andThen(checkUncommittedChanges)
        .andThen(checkGithubToken)
        .andThen(checkUpstreamBranch);
}

/**
 * Check if the current working directory is a git repository.
 * @param context The Kiara context.
 */
function checkGitRepository(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--is-inside-work-tree"], { cwd: process.cwd() }),
        (error: unknown): Error => new Error(`Error checking for git repository: ${error}`)
    )
        .andTee(({ command }): void => logger.verbose(`Checking for git repository: ${command}`))
        .andThen((result): ResultAsync<KiaraContext, Error> => {
            return result.stdout === "true"
                ? okAsync(context)
                : errAsync(
                      new Error("Could not find a git repository in the current working directory.")
                  );
        });
}

/**
 * Check if there are uncommitted changes in the current working directory.
 * @param context The Kiara context.
 */
function checkUncommittedChanges(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["status", "--porcelain"], { cwd: process.cwd() }),
        (error) => new Error(`Error checking for uncommitted changes: ${error}`)
    )
        .andTee(({ command }): void =>
            logger.verbose(`Checking for uncommitted changes: ${command}`)
        )
        .andThen((result): ResultAsync<KiaraContext, Error> => {
            return result.stdout === ""
                ? okAsync(context)
                : errAsync(
                      new Error("There are uncommitted changes in the current working directory.")
                  );
        });
}

/**
 * Check if the GitHub token is valid and has the required permissions.
 * @param context The Kiara context.
 */
function checkGithubToken(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    const octokit: ResultAsync<Octokit, unknown> = getGitToken(context).asyncAndThen(createOctokit);

    return octokit
        .andThen((client: Octokit): ResultAsync<KiaraContext, Error> => {
            return ResultAsync.fromPromise(
                client.request("GET /user"),
                (error: unknown): Error => new Error(`Error checking GitHub token: ${error}`)
            )
                .andTee(({ url }) => logger.verbose(`Checking token with GitHub API: ${url}`))
                .andThen((): ResultAsync<KiaraContext, never> => okAsync(context));
        })
        .orElse((): ResultAsync<never, Error> => {
            return errAsync(
                new Error("The GitHub token is invalid or does not have the required permissions.")
            );
        });
}

/**
 * Check if there is an upstream branch set for the current branch.
 * @param context The Kiara context.
 */
function checkUpstreamBranch(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]),
        (error) => new Error(`Error checking upstream branch: ${error}`)
    )
        .andTee(({ command }): void => logger.verbose(`Checking upstream branch: ${command}`))
        .andThen((result): ResultAsync<KiaraContext, Error> => {
            return result.stdout !== ""
                ? okAsync(context)
                : errAsync(
                      new Error(
                          "No upstream branch found. Please set an upstream branch before running this command."
                      )
                  );
        });
}
