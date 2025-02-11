import config from "#/config";
import { token } from "#/lib/utils/git";
import { execa } from "execa";
import { err, ok, ResultAsync } from "neverthrow";
import { Octokit } from "octokit";

export function preflightGit(): ResultAsync<void, Error> {
    return checkGitRepository()
        .andThen(() => checkTokenScopes())
        .andThen(() => checkUncommittedChanges())
        .andThen(() => checkReleaseBranch())
        .andThen(() => checkLatestCommit());
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

function checkLatestCommit(): ResultAsync<void, Error> {
    const releaseBranch = config.releaseBranch || "master";

    const current = ResultAsync.fromPromise(
        execa("git", ["rev-parse", "HEAD"]),
        error => new Error(`Error checking current commit: ${error}`),
    ).map(result => result.stdout.slice(0, 7));

    const latest = ResultAsync.fromPromise(
        execa("git", ["rev-parse", `${releaseBranch}`]),
        error => new Error(`Error checking latest commit: ${error}`),
    ).map(result => result.stdout.slice(0, 7));

    return ResultAsync.combine([current, latest]).andThen(([currentCommit, latestCommit]) => {
        return currentCommit === latestCommit
            ? ok(undefined)
            : err(new Error(`The current commit (${currentCommit}) is not the latest commit on the remote branch (${latestCommit}). Please pull the latest changes before running this command.`));
    });
}
