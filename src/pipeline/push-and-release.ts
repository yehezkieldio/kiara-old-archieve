import type { Octokit } from "@octokit/core";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { KiaraContext } from "#/kiara";
import { createOctokit } from "#/libs/github";
import { logger } from "#/libs/logger";
import {
    type RepositoryMetadata,
    executeGitCommand,
    extractRepositoryMetadata,
    getGitToken,
    getRepositoryUrl,
    resolveTagTemplate,
} from "#/libs/util";

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

export const OctokitRequestHeaders = {
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
};

function createGitHubRelease(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    logger.info("Creating GitHub release...");
    if (context.options.dryRun) {
        logger.verbose("Skipping GitHub release creation in dry-run mode.");
        return okAsync(context);
    }

    const octokit: ResultAsync<Octokit, unknown> = getGitToken(context).asyncAndThen(createOctokit);

    return getRepositoryUrl()
        .andThen(extractRepositoryMetadata)
        .andThen((metadata: RepositoryMetadata) => {
            const owner = metadata.owner;
            const repo = metadata.name;

            return octokit.andThen((octokit: Octokit) => {
                return ResultAsync.fromPromise(
                    octokit.request("POST /repos/{owner}/{repo}/releases", {
                        owner,
                        repo,
                        tag_name: resolveTagTemplate(context),
                        body: context.changelog.content,
                        generate_release_notes: context.changelog.content !== "",
                        headers: OctokitRequestHeaders,
                        make_latest: "true",
                        name: resolveTagTemplate(context),
                    }),
                    (): Error => new Error("error")
                );
            });
        })
        .andTee((): void => {
            logger.info("GitHub release created successfully!");
        })
        .map((): KiaraContext => context)
        .mapErr((error: unknown): Error => {
            return new Error(`Error creating GitHub release: ${error}`);
        });
}

export function pushAndRelease(context: KiaraContext): ResultAsync<void, Error> {
    return pushCommitAndTag(context)
        .andThen(createGitHubRelease)
        .map((): undefined => undefined);
}
