/**
 * The type of the bump strategy.
 * - `recommended`: The recommended version bump using `conventional-recommended-bump`.
 * - `manual`: The version bump is done manually, prompting the user for the new version.
 */
export type BumpStrategy = "recommended" | "manual";

export interface KiaraOptions {
    /**
     * Whether to run in verbose mode.
     * Available as `--verbose` or `-v`.
     * @default false
     */
    verbose: boolean;

    /**
     * The name of the project/package to release, defaults to the name in the `package.json`.
     * Available as `--name` or `-n`.
     * @default package.json name
     */
    name: string;

    /**
     * The type of the bump strategy. Defaults to empty string, which means the user will be prompted for the version.
     * Available as `--bump-strategy` or `-b`.
     * @default ""
     */
    bumpStrategy: BumpStrategy;

    /**
     * The authentication token to use for releasing and pushing to the repository.
     * Available as `--token` or `-t`.
     * @default ""
     */
    token: string;
}

export interface KiaraContext {
    /**
     * The options passed to the command.
     */
    options: KiaraOptions;

    /**
     * Version information.
     */
    version: {
        /**
         * The current version of the project/package.
         */
        current: string;
        /**
         * The new version of the project/package.
         */
        new: string;
    };
}
