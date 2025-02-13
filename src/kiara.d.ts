export type BumpStrategy = "recommended" | "manual";

/**
 * File configuration for Kiara.
 */
export interface KiaraConfig {
    git?: {
        /**
         * Whether to enforce releasing only on specific branches.
         * If true, the release will only proceed on branches specified in the 'branches' option.
         * If false, kiara will release on the current branch regardless of its name.
         * @default false
         */
        requireBranch?: boolean;

        /**
         * List of allowed branch names for creating releases.
         * Only used when requireBranch is true.
         * @default 'master' | ['master', 'main']
         */
        branches?: string | string[];

        /**
         * Whether to enforce a clean working directory before creating a release.
         * @default true
         */
        requireCleanWorkingDir?: boolean;

        /**
         * Whether to enforce a clean git status before creating a release.
         * @default true
         */
        requireCleanGitStatus?: boolean;

        /**
         * Whether to enforce the existence of an upstream remote branch
         * @default true
         */
        requireUpstream?: boolean;

        /**
         * Whether to stop the release if there are no commits since the last release.
         * @default true
         */
        requireCommits?: boolean;

        pushCommits?: {
            /**
             * Whether to push commits to the remote repository.
             * @default true
             */
            enabled?: boolean;

            /**
             * The commit message to use when pushing commits to the remote repository.
             * @default 'chore: release {{name}}@{{version}}'
             */
            commitMessage?: string;

            /**
             * Whether to push tags to the remote repository.
             * @default true
             */
            tags?: boolean;

            /**
             * The Custom tag name to use when pushing tags to the remote repository.
             * @default 'v{{version}}'
             */
            tagName?: string;
        };
    };

    github?: {
        /**
         * Whether to create a release on GitHub, requires a GitHub token with the 'repo' scope.
         * @default true
         */
        release?: boolean;

        /**
         * The release name to use when creating a release on GitHub.
         * If not provided, the release will use the version as the name.
         * @default 'v{{version}}'
         */
        releaseName?: string;
    };

    changelog: {
        /**
         * Whether to generate a changelog during the release.
         * @default true
         */
        enabled?: boolean;

        /**
         * The path and filename of the changelog to update.
         * @default 'CHANGELOG.md'
         */
        path?: string;
    };
}

/**
 * CLI options for Kiara.
 */
export interface KiaraBumpOptions {
    /**
     * Whether to run in verbose mode, printing additional information.
     * Availabe as a flag: --verbose or -v
     * @default false
     */
    verbose?: boolean;

    /**
     * Whether to run in dry mode, where no changes are made.
     * Availabe as a flag: --dry-run or -d
     * @default false
     */
    dryRun?: boolean;

    /**
     * The name of the project or package to release, defaults to the name in the package.json.
     * Availabe as an option: --name or -n
     * @default package.json name
     */
    name?: string;

    /**
     * Whether to run in CI mode, where no user input is required.
     * Availabe as a flag: --ci
     * @default false
     */
    ci?: boolean;

    /**
     * Whether to skip the version bump step.
     * Availabe as a flag: --skip-bump
     * @default false
     */
    skipBump?: boolean;

    /**
     * Whether to skip the changelog generation step.
     * Availabe as a flag: --skip-changelog
     * @default false
     */
    skipChangelog?: boolean;

    /**
     * Whether to skip the conditions verification step, may lead to unexpected results.
     * Availabe as a flag: --skip-verify
     * @default false
     */
    skipVerify?: boolean;

    /**
     * Whether to skip pushing changes to the remote repository.
     * Availabe as a flag: --skip-push
     * @default false
     */
    skipPush?: boolean;

    /**
     * Version bump strategy to use, either 'recommended' or 'manual'.
     * Recommended will use the recommended version bump based on the commit messages, while manual will prompt the user to select the version bump.
     * Availabe as an option: --bump-strategy or -b
     * @default 'manual'
     */
    bumpStrategy?: BumpStrategy;
}

export interface KiaraContext {
    currentVersion: string;
    nextVersion: string;
    config: KiaraConfig;
    options: KiaraBumpOptions;
}
