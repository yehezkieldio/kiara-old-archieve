import { type Options as GitCliffOptions, runGitCliff } from "git-cliff";
import { ResultAsync, errAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { logger } from "#/libs/logger";

export function _generateChangelog(context: KiaraContext) {
    const gitCliffOptions: GitCliffOptions = {
        tag: `v${context.version.new}`,
        prepend: "./CHANGELOG.md",
        unreleased: true,
        config: "./cliff.toml",
        output: "-",
    };

    return ResultAsync.fromPromise(runGitCliff(gitCliffOptions, { stdio: "pipe" }), (error) => error).andTee(
        (result) => {
            logger.info(result);
        }
    );
}

export function generateChangelog(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return _generateChangelog(context)
        .map(() => context)
        .orElse((error) => {
            logger.error("Failed to generate changelog:", error);
            return errAsync(new Error("Changelog generation failed"));
        });
}
