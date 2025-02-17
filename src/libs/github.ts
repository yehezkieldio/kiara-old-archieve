import { createTokenAuth } from "@octokit/auth-token";
import { Octokit } from "@octokit/core";
import { ResultAsync, errAsync, okAsync } from "neverthrow";

export const octokitDefault = Octokit.defaults({
    userAgent: "Kiara (https://github.com/amarislabs/kiara)",
});

const octokitCache = new Map<string, Octokit>();

/**
 * Create an Octokit instance with the provided GitHub token.
 * @param token The authentication token.
 */
export function createOctokit(token: string): ResultAsync<Octokit, unknown> {
    const cacheKey: string = token;

    const cachedOctokit: Octokit | undefined = octokitCache.get(cacheKey);
    if (cachedOctokit) {
        return okAsync(cachedOctokit);
    }

    const octokitAuth = createTokenAuth(cacheKey);

    /**
     * Create and cache an Octokit instance.
     * @param authentication The authentication token.
     */
    function createAndCacheOctokit(authentication: { token: string }): ResultAsync<
        Octokit,
        unknown
    > {
        const octokit = new octokitDefault({ auth: authentication.token });
        octokitCache.set(cacheKey, octokit);

        return okAsync(octokit);
    }

    return ResultAsync.fromPromise(
        octokitAuth(),
        (error: unknown): Error => new Error(`Error authenticating with GitHub: ${error}`)
    )
        .andThen(createAndCacheOctokit)
        .orElse(errAsync);
}
