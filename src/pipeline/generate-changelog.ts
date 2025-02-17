import { type Options as GitCliffOptions, runGitCliff } from "git-cliff";
import { ResultAsync, okAsync } from "neverthrow";
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

    if (context.options.dryRun) {
        logger.info("Dry run enabled, skipping changelog generation");
        return okAsync(undefined);
    }

    const gitCliffOptions: GitCliffOptions = {
        tag: resolveTagTemplate(context),
        prepend: context.changelog.path,
        unreleased: true,
        config: CWD_GIT_CLIFF_PATH,
        output: "-",
    };

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
