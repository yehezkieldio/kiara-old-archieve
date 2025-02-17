import { execa } from "execa";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";
import { resolveCommitMessage, resolveTagTemplate } from "#/libs/util";

function stageFiles(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info("Staging files...");
    if (context.options.dryRun) {
        return okAsync(context);
    }

    return ResultAsync.fromPromise(
        execa("git", ["add", "package.json", "CHANGELOG.md"], { cwd: process.cwd() }),
        (error: unknown): Error => new Error(`Error staging files: ${error}`)
    )
        .andTee(({ command }) => {
            logger.verbose(`Staging files: ${command}`);
        })
        .andThen((result): ResultAsync<KiaraContext, Error> => {
            return result.stdout === ""
                ? okAsync(context)
                : errAsync(
                      new Error(
                          `Could not stage files. Please check the output below:\n${result.stdout}`
                      )
                  );
        });
}

function commitRelease(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info("Committing changes...");
    if (context.options.dryRun) {
        return okAsync(context);
    }

    const commitMessage: string = resolveCommitMessage(context);

    return ResultAsync.fromPromise(
        execa("git", ["commit", "--no-verify", "-m", commitMessage], { cwd: process.cwd() }),
        (error: unknown): Error => new Error(`Error committing changes: ${error}`)
    )
        .andTee(({ command }) => {
            logger.verbose(`Committing changes: ${command}`);
        })
        .map(() => context);
}

function canSignGitTags(): ResultAsync<boolean, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["config", "--get", "user.signingkey"], { cwd: process.cwd() }),
        () => new Error("Error checking for GPG key")
    ).map((result) => result.stdout.length > 0);
}

function createTag(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info("Creating annotated tag...");
    if (context.options.dryRun) {
        return okAsync(context);
    }

    const tagName: string = resolveTagTemplate(context);
    const tagMessage = `Release ${tagName}`;

    return canSignGitTags()
        .map((canSign: boolean): string[] => {
            const baseArgs: string[] = ["tag", "-a", tagName, "-m", tagMessage];
            return canSign ? [...baseArgs, "-s"] : baseArgs;
        })
        .andThen((args: string[]) =>
            ResultAsync.fromPromise(
                execa("git", args, { cwd: process.cwd() }),
                (error) => new Error(`Error creating annotated tag: ${error}`)
            )
        )
        .andTee(({ command }) => {
            logger.verbose(`Creating annotated tag: ${command}`);
        })
        .map(() => context);
}

export function createTagAndCommit(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return stageFiles(context).andThen(commitRelease).andThen(createTag);
}
