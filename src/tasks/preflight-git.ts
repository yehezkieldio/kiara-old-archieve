import type { Octokit } from "@octokit/core";
import { execa } from "execa";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { createOctokit } from "#/libs/github";
import { logger } from "#/libs/logger";

export function preflightGit(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return checkGitRepository(context)
        .andThen(checkUncommittedChanges)
        .andThen(checkGithubToken)
        .andThen(checkUpstreamBranch);
}

function checkGitRepository(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--is-inside-work-tree"], { cwd: process.cwd() }),
        (error: unknown): Error => new Error(`Error checking for git repository: ${error}`)
    )
        .andTee(({ command }) => logger.verbose(`Checking for git repository: ${command}`))
        .andThen((result): ResultAsync<KiaraContext, Error> => {
            return result.stdout === "true"
                ? okAsync(context)
                : errAsync(new Error("Could not find a git repository in the current working directory."));
        });
}

function checkUncommittedChanges(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["status", "--porcelain"], { cwd: process.cwd() }),
        (error) => new Error(`Error checking for uncommitted changes: ${error}`)
    )
        .andTee(({ command }): void => logger.verbose(command))
        .andThen((result): ResultAsync<KiaraContext, Error> => {
            return result.stdout === ""
                ? okAsync(context)
                : errAsync(new Error("There are uncommitted changes in the current working directory."));
        });
}

function checkGithubToken(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    const octokit: ResultAsync<Octokit, unknown> = createOctokit(context.options.token || process.env.GITHUB_TOKEN);

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
            return errAsync(new Error("The GitHub token is invalid or does not have the required permissions."));
        });
}

function checkUpstreamBranch(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]),
        (error) => new Error(`Error checking upstream branch: ${error}`)
    )
        .andTee(({ command }) => logger.verbose(`Checking upstream branch: ${command}`))
        .andThen((result) => {
            return result.stdout !== ""
                ? okAsync(context)
                : errAsync(
                      new Error("No upstream branch found. Please set an upstream branch before running this command.")
                  );
        });
}
