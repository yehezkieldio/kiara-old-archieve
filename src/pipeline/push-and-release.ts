import { type ResultAsync, errAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";
import { executeGitCommand } from "#/libs/util";

function pushCommitAndTag(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info("Pushing changes and tags...");
    return executeGitCommand(["push"], context, "Error pushing changes")
        .andThen((result) => {
            return result.stdout === ""
                ? executeGitCommand(["push", "--tags"], context, "Error pushing tags")
                : errAsync(
                      new Error(
                          `Could not push changes. Please check the output below:\n${result.stdout}`
                      )
                  );
        })
        .map((): KiaraContext => context);
}

export function pushAndRelease(context: KiaraContext): ResultAsync<void, Error> {
    return pushCommitAndTag(context).map((): undefined => undefined);
}
