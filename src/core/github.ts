import { createTokenAuth } from "@octokit/auth-token";
import { Octokit } from "@octokit/core";
import { ResultAsync, okAsync } from "neverthrow";
import { createErrorFromUnknown } from "#/utils/errors";
import { logger } from "#/utils/logger";

export const OctokitRequestHeaders = {
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
};

const cache = new Map<string, Octokit>();

/**
 * Retrieves a cached Octokit instance associated with the provided token.
 * @param token The authentication token for caching Octokit instances.
 * @returns The cached Octokit instance if available, otherwise undefined.
 */
export function getCachedOctokit(token: string): Octokit | undefined {
    return cache.get(token);
}

/**
 * Caches an Octokit instance associated with the provided token.
 * @param token The authentication token for caching Octokit instances.
 * @param octokit The Octokit instance to cache.
 */
export function cacheOctokit(token: string, octokit: Octokit): void {
    cache.set(token, octokit);
}

const KIARA_USER_AGENT = "Kiara (https://github.com/amarislabs/kiara)";

/**
 * Creates an Octokit instance with the provided token.
 * @param token The authentication token for the Octokit instance.
 */
export function createOctokit(token: string): ResultAsync<Octokit, Error> {
    /**
     * Creates an Octokit instance with default settings.
     * @param token The authentication token for the Octokit instance.
     * @returns The created Octokit instance.
     */
    function createOctokitInstance(token: string): Octokit {
        const octokitWithDefaults: typeof Octokit = Octokit.defaults({
            userAgent: KIARA_USER_AGENT,
        });

        return new octokitWithDefaults({ auth: token });
    }

    /**
     * Authenticates with GitHub using the provided token.
     * @param token The authentication token for GitHub.
     * @returns A ResultAsync containing the authenticated token or an error.
     */
    function authenticateWithGithub(token: string): ResultAsync<{ token: string }, Error> {
        return ResultAsync.fromPromise(
            createTokenAuth(token)(),
            (error: unknown): Error => createErrorFromUnknown("Failed to authenticate with GitHub", error)
        );
    }

    const cachedInstance: Octokit | undefined = getCachedOctokit(token);
    if (cachedInstance) {
        return okAsync(cachedInstance);
    }

    return authenticateWithGithub(token)
        .map((auth: { token: string }): Octokit => {
            const octokit = createOctokitInstance(auth.token);
            cacheOctokit(token, octokit);
            return octokit;
        })
        .mapErr((error: Error): Error => {
            logger.verbose(error.message);
            return error;
        });
}
