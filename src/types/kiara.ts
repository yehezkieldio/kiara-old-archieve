import type { ReleaseType } from "semver";

export type EmptyOr<T> = T | "";

/**
 * The strategy to use when bumping the version.
 *
 * - `auto`: Automatically determine the next version using conventional commits via `conventional-recommended-bump`.
 * - `manual`: Manually specify the next version, which will be used as-is.
 */
export type BumpStrategy = "auto" | "manual";

export type OptionalBumpStrategy = EmptyOr<BumpStrategy>;
export type OptionalReleaseType = EmptyOr<ReleaseType>;

export interface KiaraOptions {
    /**
     * Enable verbose logging for more detailed output.
     *
     * @cli --verbose, -v
     * @default false
     */
    verbose: boolean;

    /**
     * Enable dry-run mode to simulate the execution without making any changes.
     *
     * @cli --dry-run, -d
     * @default false
     */
    dryRun: boolean;

    /**
     * Project identifier used during the process.
     * If not specified, the current package.json name will be used.
     *
     * @cli --name, -n
     * @default ""
     */
    name: string;

    /**
     * Authentication token to use for GitHub API requests.
     * Can be a personal access token or a fine-grained personal access token.
     *
     * @cli --token, -t
     * @default ""
     */
    token: string;

    /**
     * CI mode to indicate that the process is running in a CI environment.
     * This will disable certain interactive prompts and automatically confirm them using defaults if not specified.
     *
     * @cli --ci
     * @default false
     */
    ci: boolean;

    /* -------------------------------------------------------------------------- */

    /**
     * The strategy to use when bumping the version.
     *
     * @cli --bump-strategy, -s
     * @default "manual"
     */
    bumpStrategy: OptionalBumpStrategy;

    /**
     * The release type to use when bumping the version.
     * If manual strategy is used, this value will be used as-is, and will not prompt for a release type.
     * If auto strategy is used, this value will be ignored.
     *
     * @cli --release-type, -r
     * @default ""
     */
    releaseType: OptionalReleaseType;

    /**
     * Pre-release identifier to append to the version number.
     * If release type is prerelease, this option will default to `beta` if not specified.
     *
     * @cli --pre-release-id, -p
     * @default ""
     */
    preReleaseId: string;

    /**
     * Release identifier base number to use for pre-release versions.
     * If release type is prerelease, this option will default to `0` if not specified.
     *
     * @cli --release-identifier-base
     * @default 0
     */
    releaseIdentifierBase: "next" | string;

    /* -------------------------------------------------------------------------- */

    /**
     * Skip bumping the version number in manifest files.
     *
     * @cli --skip-bump
     * @default false
     */
    skipBump: boolean;

    /**
     * Skip creating a new changelog entry.
     *
     * @cli --skip-changelog
     * @default false
     */
    skipChangelog: boolean;

    /**
     * Skip creating a new GitHub release.
     *
     * @cli --skip-release
     * @default false
     */
    skipRelease: boolean;

    /**
     * Skip creating a new git tag.
     *
     * @cli --skip-tag
     * @default false
     */
    skipTag: boolean;

    /**
     * Skip creating a new commit.
     *
     * @cli --skip-commit
     * @default false
     */
    skipCommit: boolean;

    /**
     * Skip pushing changes to the remote repository.
     * If skipCommit is enabled, this option will have no effect.
     *
     * @cli --skip-push
     * @default false
     */
    skipPush: boolean;

    /**
     * Skip pushing tag to the remote repository.
     * If skipTag is enabled, this option will have no effect.
     *
     * @cli --skip-push-tag
     * @default false
     */
    skipPushTag: boolean;

    /**
     * Skip all git and release operations, only updating version and changelog.
     * This is equivalent to setting skipTag, skipCommit, skipPush, skipPushTag,
     * and skipRelease to true.
     *
     * @cli --bump-only-with-changelog, -bc
     * @default false
     */
    bumpOnlyWithChangelog: boolean;

    /**
     * Skip all git, release, and changelog operations, only updating version.
     * This is equivalent to setting skipTag, skipCommit, skipPush, skipPushTag,
     * skipRelease, and skipChangelog to true.
     *
     * @cli --bump-only, -b
     * @default false
     */
    bumpOnly: boolean;

    /* -------------------------------------------------------------------------- */

    /**
     * Whether to create a GitHub release draft.
     *
     * @cli --github-draft
     * @default false
     */
    githubDraft: boolean;

    /**
     * Whether to create a GitHub release prerelease.
     * If prerelease is enabled, this will be set to true.
     *
     * @cli --github-prerelease
     * @default false
     */
    githubPrerelease: boolean;

    /**
     * Whether to create a latest release.
     *
     * @cli --github-latest
     * @default true
     */
    githubLatest: boolean;
}

/**
 * GitHub repository identifier in the format `owner/repo`.
 */
export type GitHubRepository = `${string}/${string}`;

export interface KiaraConfiguration {
    /**
     * Configuration options for changelog file.
     */
    changelog: {
        /**
         * Enable or disable changelog generation.
         *
         * @default true
         */
        enabled: boolean;

        /**
         * Path to the changelog file.
         *
         * @default "CHANGELOG.md"
         */
        path: string;
    };

    /* -------------------------------------------------------------------------- */

    /**
     * Git configuration options.
     */
    git: {
        /**
         * The owner and repository name on GitHub.
         * This should be in the format owner/repo.
         * If not specified, the repository will be auto-detected.
         *
         * @default "auto"
         */
        repository: "auto" | GitHubRepository;

        /**
         * Whether to enforce releasing from a specific branch.
         * If enabled, the release process will only run on the specified branch.
         * If disabled, the release process will run on the current branch.
         *
         * @default false
         */
        requireBranch: boolean;

        /**
         * Branches from which the release process is allowed to run.
         * Depends on requireBranch being enabled, otherwise this option will have no effect.
         *
         * @default ["main", "master"]
         */
        branches: string | string[];

        /**
         * Whether to enforce a clean working directory before releasing.
         * If enabled, the release process will only run if the working directory is clean.
         *
         * @default true
         */
        requireCleanWorkingDir: boolean;

        /**
         * Whether to enforce an existing upstream repository.
         * If enabled, the release process will only run if an upstream repository is configured.
         *
         * @default false
         */
        requireUpstream: boolean;

        /**
         * Release commit message template.
         * Default is "chore(release): {{name}}@{{version}}" for example "chore(release): kiara@1.0.0".
         *
         * @default "chore(release): {{name}}@{{version}}"
         */
        commitMessage: string;

        /**
         * Tag name template.
         * Default is "v{{version}}" for example "v1.0.0".
         *
         * @default "v{{version}}"
         */
        tagName: string;

        /**
         * Tag annotation template.
         * Default is "Release {{version}}" for example "Release 1.0.0".
         *
         * @default "Release {{version}}"
         */
        tagAnnotation: string;
    };

    /* -------------------------------------------------------------------------- */

    /**
     * GitHub configuration options.
     */
    github: {
        release: {
            /**
             * Whether to create a GitHub release.
             *
             * @default true
             */
            enabled: boolean;

            /**
             * The title of the GitHub release.
             *
             * @default "Release v{{version}}"
             */
            title: string;
        };
    };
}

export interface KiaraContext {
    /**
     * CLI command options.
     */
    options: KiaraOptions;

    /**
     * File configuration options.
     */
    configuration: KiaraConfiguration;

    /**
     * The current version number of the project.
     */
    currentVersion: string;

    /**
     * The new version number of the project.
     */
    newVersion: string;

    /**
     * The release type of the new version.
     */
    releaseType: OptionalReleaseType;

    /**
     * The changelog content for the new version.
     */
    changelogContent: string;
}
