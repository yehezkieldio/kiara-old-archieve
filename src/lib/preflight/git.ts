import config from "#/config";
import { token } from "#/lib/utils/git";
import { execa } from "execa";
import { err, ok, ResultAsync } from "neverthrow";
import { Octokit } from "octokit";

export function preflightGit(): ResultAsync<void, Error> {
    return checkGitRepository()
        .andThen(() => checkTokenScopes())
        .andThen(() => checkUncommittedChanges())
        .andThen(() => checkReleaseBranch());
}

function checkGitRepository(): ResultAsync<void, Error> {
    const exits = ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--is-inside-work-tree"]),
        error => new Error(`Error checking if git repository exists: ${error}`),
    );

    return exits.andThen((result) => {
        return result.stdout === "true"
            ? ok(undefined)
            : err(new Error("Could not find a git repository in the current working directory."));
    });
}

function checkTokenScopes(): ResultAsync<void, Error> {
    const octokit = new Octokit({
        auth: token,
    });

    return ResultAsync.fromPromise(
        octokit.rest.users.getAuthenticated(),
        error => new Error(`Failed to verify GitHub token: ${error}`),
    ).andThen((response) => {
        const scopes = response.headers["x-oauth-scopes"] as string | undefined;

        return scopes?.includes("repo")
            ? ok(undefined)
            : err(new Error("The provided GitHub token does not have the required 'repo' scope. Please generate a new token with the 'repo' scope."));
    });
}

function checkUncommittedChanges(): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["status", "--porcelain"]),
        error => new Error(`Error checking for uncommitted changes: ${error}`),
    ).andThen((result) => {
        return result.stdout === ""
            ? ok(undefined)
            : err(new Error("There are uncommitted changes in the current working directory."));
    });
}

function checkReleaseBranch(): ResultAsync<void, Error> {
    const releaseBranch = config.releaseBranch || "master";

    return ResultAsync.fromPromise(
        execa("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
        error => new Error(`Error checking current branch: ${error}`),
    ).andThen((result) => {
        return result.stdout === releaseBranch
            ? ok(undefined)
            : err(new Error(`You are not on the ${releaseBranch} branch. Please checkout the ${releaseBranch} branch before running this command.`));
    });
}
