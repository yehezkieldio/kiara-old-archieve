/**
 * Defines the strategy for determining version bumps during release.
 *
 * @description
 * - `recommended`: Automatically determines version bump using conventional commits
 * - `manual`: Prompts user to manually specify the new version
 */
export type BumpStrategy = "recommended" | "manual";

/**
 * CLI command options.
 *
 * @interface KiaraOptions
 * @since 1.0.0
 */
export interface KiaraOptions {
    /**
     * Enables detailed logging output during execution.
     *
     * @cli --verbose, -v
     * @default false - Only log essential information.
     */
    verbose: boolean;

    /**
     * Project identifier used during the release process.
     *
     * @cli --name, -n
     * @default "" - Will use the project name from package.json.
     */
    name: string;

    /**
     * Controls how version bumps are determined.
     *
     * @cli --bump-strategy, -b
     * @default "" - Will prompt for version.
     */
    bumpStrategy: BumpStrategy;

    /**
     * Skips the version bump process and uses the current version.
     *
     * @cli --skip-bump
     * @default false
     */
    skipBump: boolean;

    /**
     * Authentication token for Git operations and releases.
     *
     * @cli --token, -t
     * @default ""
     */
    token: string;

    /**
     * Dry run mode. Does not perform any write operations.
     */
    dryRun: boolean;
}

/**
 * Runtime context maintained during the release process.
 *
 * @interface KiaraContext
 * @since 1.0.0
 */
export interface KiaraContext {
    /**
     * Active configuration options for the current execution.
     */
    options: KiaraOptions;

    /**
     * Version management information.
     */
    version: {
        /**
         * Current version of the project.
         */
        current: string;

        /**
         * New version to be released.
         */
        new: string;
    };

    /**
     * Git metadata.
     */
    git: {
        /**
         * The commit message for the release.
         * @default "chore(release): v{{version}}"
         */
        commitMessage: string;

        /**
         * The tag template for the release.
         * @default "v{{version}}"
         */
        tagTemplate: string;

        /**
         * Repository metadata.
         */
        repository: {
            /**
             * Owner of the repository.
             */
            owner: string;

            /**
             * Name of the repository.
             */
            name: string;
        };
    };

    /**
     * Changelog configuration and state.
     */
    changelog: {
        /**
         * The path to the changelog file.
         * @default "CHANGELOG.md"
         */
        path: string;
    };
}
