import { type ResultAsync, errAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";
import { executeGitCommand, resolveCommitMessage, resolveTagTemplate } from "#/libs/util";

function stageFiles(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info("Staging files...");

    return executeGitCommand(
        ["add", "package.json", "CHANGELOG.md"],
        context,
        "Error staging files"
    ).andThen((result): ResultAsync<KiaraContext, Error> => {
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
    const commitMessage: string = resolveCommitMessage(context);

    return executeGitCommand(
        ["commit", "--no-verify", "-m", `"${commitMessage}"`],
        context,
        "Error committing changes"
    ).map(() => context);
}

function canSignGitTags(context: KiaraContext): ResultAsync<boolean, Error> {
    return executeGitCommand(
        ["config", "--get", "user.signingkey"],
        context,
        "Error checking for GPG key"
    ).map((result) => result.stdout.length > 0);
}

function createTag(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info("Creating tag...");

    const tagName: string = resolveTagTemplate(context);
    const tagMessage = `Release ${tagName}`;

    return canSignGitTags(context)
        .map((canSign: boolean): string[] => {
            const baseArgs: string[] = ["tag", "-a", tagName, "-m", `"${tagMessage}"`];
            return canSign ? [...baseArgs, "-s"] : baseArgs;
        })
        .andThen((args: string[]) =>
            executeGitCommand(args, context, "Error creating annotated tag")
        )
        .map(() => context);
}

export function createTagAndCommit(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return stageFiles(context).andThen(commitRelease).andThen(createTag);
}
