import { execa } from "execa";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";

function stageFiles(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["add", "package.json", "CHANGELOG.md"], { cwd: process.cwd() }),
        (error) => new Error(`Error checking for uncommitted changes: ${error}`)
    ).andThen((result): ResultAsync<KiaraContext, Error> => {
        return result.stdout === ""
            ? okAsync(context)
            : errAsync(new Error("There are uncommitted changes in the current working directory."));
    });
}

function commitRelease(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    const commitMessage = `chore(release): v${context.version.new}`;

    return ResultAsync.fromPromise(
        execa("git", ["commit", "--no-verify", "-m", commitMessage], { cwd: process.cwd() }),
        (error) => new Error(`Error committing changes: ${error}`)
    ).map(() => context);
}

function canSignGitTags(): ResultAsync<boolean, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["config", "--get", "user.signingkey"], { cwd: process.cwd() }),
        () => new Error("Error checking for GPG key")
    ).map((result) => result.stdout.length > 0);
}

function createTag(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    const tagName = `v${context.version.new}`;
    const tagMessage = `Release ${tagName}`;

    return canSignGitTags()
        .map((canSign) => {
            const baseArgs = ["tag", "-a", tagName, "-m", tagMessage];
            return canSign ? [...baseArgs, "-s"] : baseArgs;
        })
        .andThen((args) =>
            ResultAsync.fromPromise(
                execa("git", args, { cwd: process.cwd() }),
                (error) => new Error(`Error creating annotated tag: ${error}`)
            )
        )
        .map(() => context);
}

export function createTagAndCommit(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return stageFiles(context).andThen(commitRelease).andThen(createTag);
}
