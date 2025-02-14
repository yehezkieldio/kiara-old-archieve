import type { Octokit } from "@octokit/core";
import { execa } from "execa";
import { type Err, ResultAsync, err, ok, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { createOctokit } from "#/libs/github";
import { logger } from "#/libs/logger";

export function preflightGit(context: KiaraContext): ResultAsync<void, Error> {
    return checkGitRepository()
        .andThen((): ResultAsync<void, Error> => checkUncommittedChanges(context))
        .andThen((): ResultAsync<void, Error> => checkGitStatusClean(context))
        .andThen((): ResultAsync<void, Error> => checkReleaseBranch(context))
        .andThen((): ResultAsync<void, Error> => checkGithubToken(context));
}

function checkGitRepository(): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--is-inside-work-tree"]),
        (error) => new Error(`Error checking for git repository: ${error}`)
    )
        .andTee(({ command }) => logger.verbose(`Checking for git repository: ${command}`))
        .andThen((result) => {
            return result.stdout === "true"
                ? ok(undefined)
                : err(new Error("Could not find a git repository in the current working directory."));
        });
}

function checkUncommittedChanges(context: KiaraContext): ResultAsync<void, Error> {
    if (context.config.git?.requireCleanWorkingDir === false) {
        return okAsync(undefined);
    }

    return ResultAsync.fromPromise(
        execa("git", ["status", "--porcelain"]),
        (error) => new Error(`Error checking for uncommitted changes: ${error}`)
    )
        .andTee(({ command }) => logger.verbose(command))
        .andThen((result) => {
            return result.stdout === ""
                ? ok(undefined)
                : err(new Error("There are uncommitted changes in the current working directory."));
        });
}

function checkGithubToken(context: KiaraContext): ResultAsync<undefined, Error> {
    if (!context.config.github?.release) {
        return okAsync(undefined);
    }

    const octokit: ResultAsync<Octokit, unknown> = createOctokit(
        context.options.githubToken || process.env.GITHUB_TOKEN
    );

    return octokit
        .andThen((client: Octokit): ResultAsync<undefined, Error> => {
            return ResultAsync.fromPromise(
                client.request("GET /user"),
                (error: unknown): Error => new Error(`Error checking GitHub token: ${error}`)
            )
                .andTee(({ url }) => logger.verbose(`GET ${url}`))
                .andThen(() => okAsync(undefined));
        })
        .orElse((): Err<never, Error> => {
            return err(new Error("The GitHub token is invalid or does not have the required permissions."));
        });
}

function checkReleaseBranch(context: KiaraContext): ResultAsync<void, Error> {
    if (context.config.git?.requireBranch === false) {
        return okAsync(undefined);
    }

    const releaseBranch: string | string[] = context.config.git?.branches || "master";

    return ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
        (): Error => new Error("Error checking current branch")
    )
        .andTee(({ command }): void => logger.verbose(`Checking current branch: ${command}`))
        .andThen((result) => {
            if (Array.isArray(releaseBranch)) {
                return releaseBranch.includes(result.stdout)
                    ? ok(undefined)
                    : err(
                          new Error(
                              `You are not on a valid release branch. Please checkout one of the branches: ${releaseBranch.join(", ")} before running this command.`
                          )
                      );
            }

            return result.stdout === releaseBranch
                ? ok(undefined)
                : err(
                      new Error(
                          `You are not on a valid release branch. Please checkout the branch: ${releaseBranch} before running this command.`
                      )
                  );
        });
}

function checkGitStatusClean(context: KiaraContext): ResultAsync<void, Error> {
    if (context.config.git?.requireCleanGitStatus === false) {
        return okAsync(undefined);
    }

    return ResultAsync.fromPromise(
        execa("git", ["status", "--short"]),
        (error) => new Error(`Error checking git status: ${error}`)
    )
        .andTee(({ command }): void => logger.verbose(`Checking git status: ${command}`))
        .andThen((result) => {
            return result.stdout === ""
                ? ok(undefined)
                : err(new Error("Dirty git status. Please commit or stash your changes before running this command."));
        });
}
