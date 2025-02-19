import { execa } from "execa";
import { type Result, ResultAsync, err, ok, okAsync } from "neverthrow";
import type { KiaraContext } from "#/types/kiara";
import { createErrorFromUnknown } from "#/utils/errors";
import { logger } from "#/utils/logger";

const DEFAULT_ERROR_MESSAGE = "Failed to execute Git command, please use --verbose for more information.";

export interface GitResult {
    command: string;
    stdout: string;
}

/**
 * Executes a Git command in the specified context.
 * @param command The Git command to execute.
 * @param context The Kiara context.
 * @param errorMessage The error message to display on failure.
 */
export function executeGit(
    args: string[],
    context: KiaraContext,
    errorMessage?: string,
    skipDryRun = false
): ResultAsync<GitResult, Error> {
    logger.verbose(`Would execute: git ${args.join(" ")}`);

    if (context.options.dryRun && !skipDryRun) {
        return okAsync({ command: `git ${args.join(" ")}`, stdout: "" });
    }

    return ResultAsync.fromPromise(
        execa("git", args, { cwd: process.cwd() }),
        (error: unknown): Error => createErrorFromUnknown(errorMessage ?? DEFAULT_ERROR_MESSAGE, error)
    ).mapErr((error: Error): Error => {
        logger.verbose(error.message);
        return error;
    });
}

/**
 * Get the token from context or environment variables.
 * @param context The Kiara context.
 */
export function getGitToken(context: KiaraContext): Result<string, Error> {
    const token: string = context.options.token || process.env.GITHUB_TOKEN || "";

    if (!token.trim()) {
        return err(new Error("No authentication token provided. Please set a GITHUB_TOKEN or via the --token option"));
    }

    return ok(token);
}

/**
 * Substitutes placeholders in the tag template with actual values.
 * @param context The Kiara context.
 */
export function resolveTagName(context: KiaraContext): string {
    return context.configuration.git.tagName.replace("{{version}}", context.newVersion);
}

/**
 * Substitutes placeholders in the tag annotation template with actual values.
 * @param context The Kiara context.
 */
export function resolveTagAnnotation(context: KiaraContext): string {
    return context.configuration.git.tagAnnotation.replace("{{version}}", context.newVersion);
}

/**
 * Substitutes placeholders in the commit message with actual values.
 * @param context The Kiara context.
 */
export function resolveCommitMessage(context: KiaraContext): string {
    return context.configuration.git.commitMessage
        .replace("{{version}}", context.newVersion)
        .replace("{{name}}", context.options.name);
}

/**
 * Substitutes placeholders in the release title with actual values.
 * @param context The Kiara context.
 */
export function resolveReleaseTitle(context: KiaraContext): string {
    return context.configuration.github.release.title.replace("{{version}}", context.newVersion);
}

/**
 * Get a Git repository URL.
 * @param context The Kiara context.
 */
function getRepositoryUrl(context: KiaraContext): ResultAsync<string, Error> {
    return executeGit(["remote", "get-url", "origin"], context, "", true).map((result: GitResult): string =>
        result.stdout.trim()
    );
}

export interface Repository {
    owner: string;
    name: string;
}

/**
 * Extract the owner and name of a GitHub repository from a URL.
 * @param url The repository URL.
 */
function extractRepository(url: string): Result<Repository, Error> {
    const cleanUrl: string = url.trim().replace(/\.git$/, "");

    const sshMatch: RegExpMatchArray | null = cleanUrl.match(/^git@github\.com:([^/]+)\/(.+)$/);
    if (sshMatch) {
        const [, owner, name] = sshMatch;
        return ok({ owner, name });
    }

    const httpsMatch: RegExpMatchArray | null = cleanUrl.match(/^https:\/\/github\.com\/([^/]+)\/(.+)$/);
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
 * Retrieves the GitHub repository metadata using the Kiara context.
 * @param context The Kiara context.
 */
export function getRepository(context: KiaraContext): ResultAsync<Repository, Error> {
    return getRepositoryUrl(context).andThen((url: string): Result<Repository, Error> => extractRepository(url));
}
