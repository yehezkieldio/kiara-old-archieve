import { execa } from "execa";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import type { KiaraContext } from "#/kiara";

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
