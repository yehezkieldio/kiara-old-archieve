import { execa } from "execa";
import { ResultAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";

function pushCommitAndTag(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["push"], { cwd: process.cwd() }),
        (error) => new Error(`Error pushing changes: ${error}`)
    )
        .andThen(() =>
            ResultAsync.fromPromise(
                execa("git", ["push", "--tags"], { cwd: process.cwd() }),
                (error) => new Error(`Error pushing tags: ${error}`)
            )
        )
        .map(() => context);
}

export function pushAndPublishRelease(context: KiaraContext): ResultAsync<void, Error> {
    return pushCommitAndTag(context).map(() => {
        logger.log("Release pushed successfully");
    });
}
