import { execa } from "execa";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import type { BumpStrategy, KiaraContext, KiaraOptions, ReleaseType } from "#/kiara";

/**
 * Check if a file exists.
 * @param path The path to the file.
 */
export function fileExists(path: string): ResultAsync<boolean, Error> {
    return ResultAsync.fromPromise(
        Bun.file(path).exists(),
        (error: unknown): Error => new Error(`Error checking if file exists: ${error}`)
    );
}

/**
 * Get the token from context or environment variables.
 * @param context The Kiara context.
 */
export function getGitToken(context: KiaraContext): Result<string, Error> {
    const token: string = context.options.token || process.env.GITHUB_TOKEN || "";

    if (!token.trim()) {
        return err(
            new Error(
                "No authentication token provided. Please set a GITHUB_TOKEN or via the --token option"
            )
        );
    }

    return ok(token);
}

/**
 * Substitutes placeholders in the tag template with actual values.
 * @param context The Kiara context.
 */
export function resolveTagTemplate(context: KiaraContext): string {
    return context.git.tagTemplate.replace("{{version}}", context.version.new);
}

/**
 * Substitutes placeholders in the commit message with actual values.
 * @param context The Kiara context.
 */
export function resolveCommitMessage(context: KiaraContext): string {
    return context.git.commitMessage
        .replace("{{version}}", context.version.new)
        .replace("{{name}}", context.options.name);
}

/**
 * Get a Git repository URL.
 */
export function getRepositoryUrl(): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
        execa("git", ["remote", "get-url", "origin"], { cwd: process.cwd() }),
        (error: unknown): Error => new Error(`Error getting repository URL: ${error}`)
    ).map((result): string => result.stdout.trim());
}

export interface RepositoryMetadata {
    owner: string;
    name: string;
}

/**
 * Extract the owner and name of a GitHub repository from a URL.
 * @param url The repository URL.
 */
export function extractRepositoryMetadata(url: string): Result<RepositoryMetadata, Error> {
    const cleanUrl: string = url.trim().replace(/\.git$/, "");

    const sshMatch: RegExpMatchArray | null = cleanUrl.match(/^git@github\.com:([^/]+)\/(.+)$/);
    if (sshMatch) {
        const [, owner, name] = sshMatch;
        return ok({ owner, name });
    }

    const httpsMatch: RegExpMatchArray | null = cleanUrl.match(
        /^https:\/\/github\.com\/([^/]+)\/(.+)$/
    );
    if (httpsMatch) {
        const [, owner, name] = httpsMatch;
        return ok({ owner, name });
    }

    return err(
        new Error(
            "Invalid repository URL format. Expected SSH (git@github.com:owner/repo) or HTTPS (https://github.com/owner/repo)"
        )
    );
}

/**
 * Validate the release type.
 * @param releaseType The release type to validate.
 */
function validateReleaseType(releaseType: string): Result<ReleaseType, Error> {
    const validTypes = new Set(["major", "minor", "patch"]);

    if (!releaseType) return ok("" as ReleaseType);
    if (!validTypes.has(releaseType)) {
        return err(new Error("Invalid release type. Must be one of: major, minor, patch"));
    }

    return ok(releaseType as ReleaseType);
}

/**
 * Validate the bump strategy.
 * @param strategy The bump strategy.
 */
function validateBumpStrategy(strategy: string): Result<BumpStrategy, Error> {
    const validStrategies = new Set(["recommended", "manual"]);

    if (!strategy || strategy === "") return ok("" as BumpStrategy);
    if (!validStrategies.has(strategy)) {
        return err(new Error("Invalid bump strategy. Must be one of: recommended, manual"));
    }

    return ok(strategy as BumpStrategy);
}

/**
 * Validate the strategy and release type pair.
 * @param strategy The bump strategy
 * @param releaseType The release type
 */
function validateStrategyReleaseTypePair(
    strategy: BumpStrategy,
    releaseType: ReleaseType
): Result<ReleaseType, Error> {
    if (strategy === "recommended") {
        return ok("" as ReleaseType);
    }
    return ok(releaseType);
}

/**
 * Validates the options provided.
 * @param options The options to validate.
 */
export function validateOptions(options: KiaraOptions): Result<KiaraOptions, Error> {
    return validateBumpStrategy(options.bumpStrategy).andThen(
        (validStrategy: BumpStrategy): Result<KiaraOptions, Error> =>
            validateReleaseType(options.releaseType).andThen((validType: ReleaseType) =>
                validateStrategyReleaseTypePair(validStrategy, validType).map(() => ({
                    ...options,
                    bumpStrategy: validStrategy,
                    releaseType: validType,
                }))
            )
    );
}

export function flattenMultilineText(text: string): string {
    return text
        .split("\n")
        .map((line: string): string => line.trim())
        .filter((line: string): boolean => line.length > 0)
        .join("\\n");
}
