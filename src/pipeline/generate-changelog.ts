import { type Options as GitCliffOptions, runGitCliff } from "git-cliff";
import { ResultAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { CWD_GIT_CLIFF_PATH } from "#/libs/const";
import { logger } from "#/libs/logger";
import {
    extractRepositoryMetadata,
    flattenMultilineText,
    getGitToken,
    getRepositoryUrl,
    resolveTagTemplate,
} from "#/libs/util";

function prepareChangelogContent(context: KiaraContext): ResultAsync<undefined, Error> {
    logger.info("Generating changelog...");

    const gitCliffOptions: GitCliffOptions = {
        tag: resolveTagTemplate(context),
        unreleased: true,
        config: CWD_GIT_CLIFF_PATH,
        output: "-",
    };

    if (!context.options.dryRun) {
        gitCliffOptions.prepend = context.changelog.path;
    }

    getGitToken(context).map((token) => {
        gitCliffOptions.githubToken = token;
    });

    getRepositoryUrl()
        .andThen(extractRepositoryMetadata)
        .map((metadata) => {
            gitCliffOptions.githubRepo = `${metadata.owner}/${metadata.name}`;
        });

    return ResultAsync.fromPromise(
        runGitCliff(gitCliffOptions, { stdio: "pipe" }),
        (error) => error
    )
        .andTee((result) => {
            logger.verbose(`Changelog content: ${flattenMultilineText(result.stdout)}`);
        })
        .map(() => {
            logger.info("Changelog generated successfully!");
            return undefined;
        })
        .mapErr((error: unknown): Error => {
            logger.error("Failed to generate changelog:", error);
            return error instanceof Error ? error : new Error("Changelog generation failed");
        });
}

export function generateChangelog(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    return prepareChangelogContent(context).map(() => context);
}
