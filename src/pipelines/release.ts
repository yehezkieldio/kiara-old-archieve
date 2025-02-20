import type { Octokit } from "@octokit/core";
import type { RequestParameters } from "@octokit/core/types";
import { ResultAsync, okAsync } from "neverthrow";
import { removeHeaderFromChangelog } from "#/core/cliff-toml";
import { type Repository, getGitToken, getRepository, resolveReleaseTitle, resolveTagName } from "#/core/git";
import { OctokitRequestHeaders, createOctokit } from "#/core/github";
import type { KiaraContext } from "#/types/kiara";
import { flattenMultilineText } from "#/utils";
import { createErrorFromUnknown } from "#/utils/errors";
import { color, logger } from "#/utils/logger";

/**
 * Parameters for creating a GitHub release.
 */
interface ReleaseParams extends RequestParameters {
    owner: string;
    repo: string;
    tag_name: string;
    name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
    generate_release_notes: boolean;
    make_latest: "true" | "false";
    headers: typeof OctokitRequestHeaders;
}

/**
 * Creates release parameters from context and repository information.
 */
function createReleaseParams(context: KiaraContext, repository: Repository, content: string): ReleaseParams {
    const { githubDraft, githubPrerelease, githubLatest } = context.options;

    return {
        owner: repository.owner,
        repo: repository.name,
        tag_name: resolveTagName(context),
        name: resolveReleaseTitle(context),
        body: content,
        draft: githubDraft,
        prerelease: githubPrerelease,
        generate_release_notes: content === "",
        make_latest: String(githubLatest) as "true" | "false",
        headers: OctokitRequestHeaders,
    };
}

/**
 * Creates a GitHub release for the current version.
 */
function createGitHubRelease(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.dryRun) {
        logger.info(`Skipping GitHub release creation ${color.dim("(--dry-run)")}`);
        logger.verbose("Would create GitHub release with:");
        logger.verbose(`- Title: ${resolveReleaseTitle(context)}`);
        logger.verbose(`- Tag: ${resolveTagName(context)}`);
        logger.verbose(`- Draft: ${context.options.githubDraft}`);
        logger.verbose(`- Prerelease: ${context.options.githubPrerelease}`);
        logger.verbose(`- Latest: ${context.options.githubLatest}`);
        return okAsync(context);
    }

    /**
     * Resolves the repository to use for the release.
     * @param context The Kiara context.
     */
    function resolveRepository(context: KiaraContext): ResultAsync<Repository, Error> {
        if (context.configuration.git.repository === "auto") {
            return getRepository(context);
        }
        const [owner, name] = context.configuration.git.repository.split("/");
        return okAsync({ owner, name });
    }

    /**
     * Publishes a release to GitHub.
     * @param repository The repository to publish the release to.
     * @param content The release content.
     */
    function publishRelease(repository: Repository, content: string): ResultAsync<void, Error> {
        return getGitToken(context)
            .asyncAndThen(createOctokit)
            .andThen((octokit: Octokit): ResultAsync<void, Error> => {
                const params: ReleaseParams = createReleaseParams(context, repository, content);
                logger.verbose(`Creating GitHub release with params: ${flattenMultilineText(JSON.stringify(params))}`);

                return ResultAsync.fromPromise(
                    octokit.request("POST /repos/{owner}/{repo}/releases", params),
                    (error: unknown): Error => createErrorFromUnknown("Failed to create GitHub release", error)
                ).map((): void => undefined);
            })
            .andTee((): void => {
                logger.info("GitHub release created successfully!");
            });
    }

    return resolveRepository(context)
        .andThen(
            (repository: Repository): ResultAsync<[Repository, string], Error> =>
                removeHeaderFromChangelog(context.changelogContent).map((content: string): [Repository, string] => [
                    repository,
                    content,
                ])
        )
        .andThen(
            ([repository, content]: [Repository, string]): ResultAsync<void, Error> =>
                publishRelease(repository, content)
        )
        .map((): KiaraContext => context)
        .mapErr((error: Error): Error => {
            logger.error("Failed to create GitHub release:", error);
            return new Error(
                "Failed to create GitHub release. Please ensure you have the required permissions and, if using a fine-grained PAT for an organization, that it was created in the organization settings."
            );
        });
}

/**
 * Executes the release pipeline to create a GitHub release.
 */
export function releasePipeline(context: KiaraContext): ResultAsync<KiaraContext, Error> {
    if (context.options.bumpOnly || context.options.bumpOnlyWithChangelog) {
        const flag = context.options.bumpOnly ? "--bump-only" : "--bump-only-with-changelog";
        logger.info(`Skipping GitHub release creation ${color.dim(`(${flag})`)}`);
        return okAsync(context);
    }

    if (context.options.skipRelease) {
        logger.info(`Skipping GitHub release creation ${color.dim("(--skip-release)")}`);
        return okAsync(context);
    }

    if (!context.configuration.github.release.enabled) {
        logger.info(`Skipping GitHub release creation ${color.dim("(disabled in config)")}`);
        return okAsync(context);
    }

    logger.info("Creating GitHub release...");
    return createGitHubRelease(context);
}
