import { execa } from "execa";
import { ResultAsync, err, ok } from "neverthrow";
import { Octokit } from "octokit";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";

export function preflightGit(context: KiaraContext): ResultAsync<void, Error> {
    return checkGitRepository().andThen((): ResultAsync<void, Error> => checkTokenScopes(context));
}

function checkGitRepository(): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--is-inside-work-tree"]),
        (error) => new Error(`Error checking for git repository: ${error}`)
    )
        .andTee(({ command }) => logger.verbose(command))
        .andThen((result) => {
            return result.stdout === "true"
                ? ok(undefined)
                : err(new Error("Could not find a git repository in the current working directory."));
        });
}

function checkTokenScopes(context: KiaraContext): ResultAsync<void, Error> {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || context.options.githubToken,
    });

    return ResultAsync.fromPromise(
        octokit.rest.users.getAuthenticated(),
        (error: unknown): Error => new Error(`Failed to verify GitHub token: ${error}`)
    )
        .andTee((response) => logger.verbose(response.url))
        .andThen((response) => {
            const scopes = response.headers["x-oauth-scopes"] as string | undefined;

            return scopes?.includes("repo")
                ? ok(undefined)
                : err(
                      new Error(
                          "The provided GitHub token does not have the required 'repo' scope. Please generate a new token with the 'repo' scope."
                      )
                  );
        });
}
